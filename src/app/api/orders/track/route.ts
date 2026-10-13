import { NextRequest, NextResponse } from "next/server";
import { getPaymentAdmin } from "../../../../lib/paystack";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { reference?: string; email?: string };
    const reference = body.reference?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    if (!/^cf_[a-f0-9]{32}$/i.test(reference) || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter the order reference and checkout email." }, { status: 400 });
    }

    const admin = getPaymentAdmin();
    const { data: order, error } = await admin
      .from("marketplace_orders")
      .select("id, reference, amount_kobo, currency, status, fulfillment_status, carrier, tracking_number, estimated_delivery, created_at, paid_at")
      .eq("reference", reference)
      .eq("email", email)
      .eq("status", "paid")
      .maybeSingle();
    if (error) throw error;
    if (!order) {
      return NextResponse.json({ error: "We couldn't find a paid order with those details." }, { status: 404 });
    }

    const [{ data: items, error: itemsError }, { data: events, error: eventsError }] = await Promise.all([
      admin.from("marketplace_order_items")
        .select("product_name, store_name, quantity, unit_price_kobo, line_total_kobo")
        .eq("order_id", order.id),
      admin.from("marketplace_order_tracking_events")
        .select("status, note, carrier, tracking_number, created_at")
        .eq("order_id", order.id)
        .order("created_at", { ascending: true }),
    ]);
    if (itemsError) throw itemsError;
    if (eventsError) throw eventsError;

    return NextResponse.json({
      order: {
        reference: order.reference,
        amountKobo: Number(order.amount_kobo),
        currency: order.currency,
        fulfillmentStatus: order.fulfillment_status,
        carrier: order.carrier,
        trackingNumber: order.tracking_number,
        estimatedDelivery: order.estimated_delivery,
        createdAt: order.created_at,
        paidAt: order.paid_at,
        items: (items ?? []).map((item) => ({
          name: item.product_name,
          store: item.store_name,
          quantity: item.quantity,
          lineTotalKobo: Number(item.line_total_kobo),
        })),
        events: events ?? [],
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Order tracking is temporarily unavailable." }, { status: 500 });
  }
}
