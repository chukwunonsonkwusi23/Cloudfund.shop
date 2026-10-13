import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getPaymentAdmin } from "../../../../lib/paystack";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !url || !anonKey) {
      return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
    }

    const authClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });

    const admin = getPaymentAdmin();
    const { data: owner, error: ownerError } = await admin
      .from("marketplace_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownerError) throw ownerError;
    if (!owner) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

    const [{ data: commissions, error }, { data: setting, error: settingError }] = await Promise.all([
      admin
      .from("marketplace_commissions")
      .select("id, order_id, vendor_id, store_name, gross_amount_kobo, commission_rate_bps, commission_amount_kobo, vendor_proceeds_kobo, earned_at, payout_status, paid_at, marketplace_orders(reference)")
      .order("earned_at", { ascending: false })
      .limit(500),
      admin.from("marketplace_commission_settings").select("rate_bps").eq("setting_key", "default").single(),
    ]);
    if (error) throw error;
    if (settingError) throw settingError;
    return NextResponse.json({ commissions: commissions ?? [], rateBps: setting.rate_bps }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Could not load commission records." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization") ?? "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!token || !url || !anonKey) {
      return NextResponse.json({ error: "Owner access is required." }, { status: 401 });
    }

    const authClient = createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Owner access is required." }, { status: 401 });

    const admin = getPaymentAdmin();
    const { data: owner, error: ownerError } = await admin
      .from("marketplace_admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (ownerError) throw ownerError;
    if (!owner) return NextResponse.json({ error: "Owner access is required." }, { status: 403 });

    const body = (await request.json()) as { commissionId?: string };
    if (!body.commissionId || !/^[0-9a-f-]{36}$/i.test(body.commissionId)) {
      return NextResponse.json({ error: "Invalid commission record." }, { status: 400 });
    }
    const { data: updated, error } = await admin
      .from("marketplace_commissions")
      .update({ payout_status: "paid", paid_at: new Date().toISOString(), paid_by: user.id })
      .eq("id", body.commissionId)
      .eq("payout_status", "pending")
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!updated) return NextResponse.json({ error: "This seller proceeds record is already paid or was not found." }, { status: 409 });
    return NextResponse.json({ updated: true });
  } catch {
    return NextResponse.json({ error: "Could not record the seller payout." }, { status: 500 });
  }
}
