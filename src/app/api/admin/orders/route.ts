import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPaymentAdmin } from "../../../../lib/paystack";

export const runtime = "nodejs";

async function getAdminContext(request: NextRequest) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !anonKey) return null;

  const authClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: { user }, error: authError } = await authClient.auth.getUser(token);
  if (authError || !user) return null;

  const admin = getPaymentAdmin();
  const { data, error } = await admin.from("marketplace_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return data ? { user, admin } : null;
}

export async function GET(request: NextRequest) {
  try {
    const context = await getAdminContext(request);
    if (!context) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });

    const { data, error } = await context.admin
      .from("marketplace_orders")
      .select("id, reference, email, customer_name, phone, delivery_address, amount_kobo, currency, status, fulfillment_status, carrier, tracking_number, estimated_delivery, created_at, paid_at, marketplace_order_items(product_name, store_name, quantity, line_total_kobo)")
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ orders: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load orders." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const context = await getAdminContext(request);
    if (!context) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });

    const body = (await request.json()) as {
      orderId?: string;
      status?: string;
      carrier?: string;
      trackingNumber?: string;
      estimatedDelivery?: string;
      note?: string;
    };
    if (!body.orderId || !/^[0-9a-f-]{36}$/i.test(body.orderId)
      || !["shipped", "delivered"].includes(body.status ?? "")
      || (body.carrier?.length ?? 0) > 100
      || (body.trackingNumber?.length ?? 0) > 120
      || (body.note?.length ?? 0) > 300) {
      return NextResponse.json({ error: "Check the shipment details and try again." }, { status: 400 });
    }
    const eta = body.estimatedDelivery?.trim() ?? "";
    if (eta && !/^\d{4}-\d{2}-\d{2}$/.test(eta)) {
      return NextResponse.json({ error: "Enter a valid estimated delivery date." }, { status: 400 });
    }

    const { error } = await context.admin.rpc("update_marketplace_order_tracking", {
      p_order_id: body.orderId,
      p_status: body.status,
      p_carrier: body.carrier?.trim() ?? "",
      p_tracking_number: body.trackingNumber?.trim() ?? "",
      p_estimated_delivery: eta || null,
      p_note: body.note?.trim() ?? "",
      p_actor_uid: context.user.id,
    });
    if (error) {
      return NextResponse.json({ error: error.message || "This order could not be updated." }, { status: 409 });
    }
    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Could not update this order." }, { status: 500 });
  }
}
