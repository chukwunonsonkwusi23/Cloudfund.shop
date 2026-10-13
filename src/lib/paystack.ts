import { createClient } from "@supabase/supabase-js";

export type PaystackTransaction = {
  status: boolean;
  message: string;
  data?: {
    authorization_url?: string;
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
  };
};

export function getPaymentAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Payment setup is incomplete. Configure the Supabase server key.");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getPaystackSecret() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Payment setup is incomplete. Configure PAYSTACK_SECRET_KEY.");
  return secret;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${getPaystackSecret()}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }
  );
  const result = (await response.json()) as PaystackTransaction;
  if (!response.ok || !result.status || !result.data) {
    throw new Error("Paystack could not verify this payment.");
  }
  return result.data;
}
