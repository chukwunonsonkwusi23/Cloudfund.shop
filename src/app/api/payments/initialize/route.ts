import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getPaymentAdmin, getPaystackSecret } from "../../../../lib/paystack";

export const runtime = "nodejs";

type CheckoutPayload = {
  email?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  items?: { productId: string; quantity: number }[];
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin");
    if (origin && origin !== request.nextUrl.origin) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const body = (await request.json()) as CheckoutPayload;
    const email = body.email?.trim().toLowerCase() ?? "";
    const fullName = body.fullName?.trim() ?? "";
    const phone = body.phone?.trim() ?? "";
    const address = body.address?.trim() ?? "";
    const items = body.items;
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (fullName.length < 2 || fullName.length > 120 || phone.length < 7 || phone.length > 30 || address.length < 8 || address.length > 500) {
      return NextResponse.json({ error: "Enter your name, phone number, and full delivery address." }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return NextResponse.json({ error: "Your cart is empty or too large." }, { status: 400 });
    }
    const requested = new Map<string, number>();
    for (const item of items) {
      if (!uuidPattern.test(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        return NextResponse.json({ error: "The cart contains an invalid item or quantity." }, { status: 400 });
      }
      requested.set(item.productId, (requested.get(item.productId) ?? 0) + item.quantity);
    }
    if (Array.from(requested.values()).some((quantity) => quantity > 20)) {
      return NextResponse.json({ error: "The requested quantity is too high." }, { status: 400 });
    }

    const admin = getPaymentAdmin();
    const { data: products, error: productError } = await admin
      .from("products")
      .select("id, vendor_id, name, store_name, price, stock, vendor_status")
      .in("id", Array.from(requested.keys()));
    if (productError) throw productError;
    if (!products || products.length !== requested.size || products.some((product) => product.vendor_status !== "approved")) {
      return NextResponse.json({ error: "One or more products are no longer available." }, { status: 409 });
    }

    const { data: commissionSetting, error: settingError } = await admin
      .from("marketplace_commission_settings")
      .select("rate_bps")
      .eq("setting_key", "default")
      .single();
    if (settingError) throw settingError;
    const commissionRateBps = Number(commissionSetting.rate_bps);
    if (!Number.isInteger(commissionRateBps) || commissionRateBps < 0 || commissionRateBps > 5000) {
      throw new Error("Marketplace commission settings are invalid.");
    }

    const orderItems = products.map((product) => {
      const quantity = requested.get(product.id)!;
      if (quantity > product.stock) throw new Error(`${product.name} does not have enough stock.`);
      const price = Number(product.price);
      if (!Number.isFinite(price) || price < 0 || Math.round(price * 100) > 2_000_000_000) {
        throw new Error("A product has an invalid price.");
      }
      const unitPriceKobo = Math.round(price * 100);
      const lineTotalKobo = unitPriceKobo * quantity;
      const commissionAmountKobo = Math.round(lineTotalKobo * commissionRateBps / 10000);
      return {
        product_id: product.id,
        vendor_id: product.vendor_id,
        product_name: product.name,
        store_name: product.store_name,
        quantity,
        unit_price_kobo: unitPriceKobo,
        line_total_kobo: lineTotalKobo,
        commission_rate_bps: commissionRateBps,
        commission_amount_kobo: commissionAmountKobo,
        vendor_proceeds_kobo: lineTotalKobo - commissionAmountKobo,
      };
    });
    const amountKobo = orderItems.reduce((sum, item) => sum + item.line_total_kobo, 0);
    if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
      return NextResponse.json({ error: "The cart total is invalid." }, { status: 400 });
    }

    const reference = `cf_${randomUUID().replaceAll("-", "")}`;
    const { data: order, error: orderError } = await admin
      .from("marketplace_orders")
      .insert({
        reference,
        email,
        customer_name: fullName,
        phone,
        delivery_address: address,
        amount_kobo: amountKobo,
        currency: "NGN",
        status: "pending",
      })
      .select("id")
      .single();
    if (orderError) throw orderError;

    const { error: itemsError } = await admin
      .from("marketplace_order_items")
      .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
    if (itemsError) {
      await admin.from("marketplace_orders").delete().eq("id", order.id);
      throw itemsError;
    }

    const callbackUrl = new URL("/checkout/callback", request.nextUrl.origin).toString();
    const paymentResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getPaystackSecret()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: amountKobo,
        currency: "NGN",
        reference,
        callback_url: callbackUrl,
        metadata: { order_id: order.id, customer_name: fullName, phone },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const payment = await paymentResponse.json();
    const checkoutUrl = payment.data?.authorization_url;
    let isPaystackCheckout = false;
    if (checkoutUrl) {
      const parsedCheckoutUrl = new URL(checkoutUrl);
      isPaystackCheckout = parsedCheckoutUrl.protocol === "https:" && parsedCheckoutUrl.hostname === "checkout.paystack.com";
    }
    if (!paymentResponse.ok || !payment.status || !checkoutUrl || !isPaystackCheckout) {
      await admin.from("marketplace_orders").update({ status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ authorizationUrl: checkoutUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    const status = /does not have enough stock|invalid price/i.test(message) ? 409 : 500;
    return NextResponse.json({ error: status === 409 ? message : "Checkout could not be started. Please try again." }, { status });
  }
}
