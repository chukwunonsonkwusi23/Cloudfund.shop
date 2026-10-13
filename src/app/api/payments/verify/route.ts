import { NextRequest, NextResponse } from "next/server";
import { getPaymentAdmin, verifyPaystackTransaction } from "../../../../lib/paystack";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }
    const { reference } = (await request.json()) as { reference?: string };
    if (typeof reference !== "string" || !/^cf_[a-f0-9]{32}$/i.test(reference)) {
      return NextResponse.json({ error: "Invalid payment reference." }, { status: 400 });
    }
    const admin = getPaymentAdmin();
    const { data: order, error } = await admin
      .from("marketplace_orders")
      .select("id, amount_kobo, currency, status")
      .eq("reference", reference)
      .maybeSingle();
    if (error) throw error;
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.status === "paid") return NextResponse.json({ status: "paid" });

    const payment = await verifyPaystackTransaction(reference);
    const isPaid = payment.reference === reference
      && payment.status === "success"
      && payment.amount === Number(order.amount_kobo)
      && payment.currency === order.currency;
    if (isPaid) {
      const { error: updateError } = await admin
        .from("marketplace_orders")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", order.id)
        .neq("status", "paid");
      if (updateError) throw updateError;
      return NextResponse.json({ status: "paid" });
    }

    if (payment.status === "failed" || payment.status === "abandoned") {
      await admin.from("marketplace_orders").update({ status: "failed" }).eq("id", order.id).neq("status", "paid");
      return NextResponse.json({ status: "failed" });
    }
    return NextResponse.json({ status: "pending" });
  } catch {
    return NextResponse.json({ error: "We could not confirm payment yet. Please try again shortly." }, { status: 503 });
  }
}
