import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPaymentAdmin, getPaystackSecret, verifyPaystackTransaction } from "../../../../lib/paystack";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const expected = createHmac("sha512", getPaystackSecret()).update(rawBody).digest("hex");
  const suppliedBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody) as { event?: string; data?: { reference?: string } };
    const reference = event.data?.reference;
    if (event.event !== "charge.success" || !reference || !/^cf_[a-f0-9]{32}$/i.test(reference)) {
      return NextResponse.json({ received: true });
    }

    const admin = getPaymentAdmin();
    const { data: order, error } = await admin
      .from("marketplace_orders")
      .select("id, amount_kobo, currency, status")
      .eq("reference", reference)
      .maybeSingle();
    if (error) throw error;
    if (!order || order.status === "paid") return NextResponse.json({ received: true });

    const payment = await verifyPaystackTransaction(reference);
    if (payment.reference === reference && payment.status === "success" && payment.amount === Number(order.amount_kobo) && payment.currency === order.currency) {
      const { error: updateError } = await admin
        .from("marketplace_orders")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", order.id)
        .neq("status", "paid");
      if (updateError) throw updateError;
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
