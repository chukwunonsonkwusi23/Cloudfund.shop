# Paystack checkout setup

1. Run the latest `supabase/payments.sql` in the Supabase SQL editor. It creates the order tables and tracking history used by checkout and order tracking. If you applied an earlier version, run the updated script again to add the tracking fields and function.
2. Add `SUPABASE_SERVICE_ROLE_KEY` and `PAYSTACK_SECRET_KEY` to the server environment. Keep both private; do not use a `NEXT_PUBLIC_` prefix. Start with a Paystack test secret key.
3. In the Paystack dashboard, enable the payment channels you want to accept and set the webhook URL to `https://your-domain/api/payments/webhook` for the live site (or your reachable test URL). Subscribe to `charge.success`.
4. Set `PAYSTACK_SECRET_KEY` to the live key only after completing a test checkout and verifying the webhook and callback flow.

The browser is redirected to Paystack-hosted checkout, so card details are entered on Paystack and never sent to this app. The server prices the order from approved Supabase products, verifies the returned transaction status, amount, currency, and reference, and validates Paystack webhook signatures. A callback visit alone never marks an order as paid.

Checkout records a pending order and validates stock at initialization. Inventory reservation/decrement still needs to be added before relying on this for high-volume sales.

## Order tracking

Buyers can track a paid order at `/track-order` using the order reference shown after payment and their checkout email. The marketplace owner can update paid orders from `/admin/orders` (also linked from the owner monitoring page). Updates move from processing to shipped to delivered and are saved as a timestamped history. The tracking API checks both the reference and checkout email; only a signed-in marketplace owner can view delivery details and post shipment updates.

## Marketplace commission

The default commission is **5%** (500 basis points). Checkout snapshots this rate on each order item, deducts it from seller proceeds in the ledger, and records it as earned only when the owner marks the order delivered. The buyer's checkout total is unchanged. View earned commission and seller proceeds pending payout at `/admin/commissions`.

Paystack currently settles the full checkout payment to the marketplace account. This commission ledger records the marketplace's earned share and the remaining amount owed to sellers; it does not automatically transfer vendor proceeds. Pay sellers separately, then use **Record payout** in `/admin/commissions` to mark the proceeds paid. Paystack processing fees are not included in this commission calculation. To change the default rate for future checkouts, update `rate_bps` in `public.marketplace_commission_settings` (for example, `800` means 8%); existing order items keep their snapshotted rate.
