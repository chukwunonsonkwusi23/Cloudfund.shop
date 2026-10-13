"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import MainLayouts from "../../../../layouts/MainLayouts";
import { getSupabaseClient } from "../../../lib/supabase";
import { subscribeToAdminSession } from "../../../lib/supabase-marketplace";

type CommissionRecord = {
  id: string;
  store_name: string;
  gross_amount_kobo: number | string;
  commission_rate_bps: number;
  commission_amount_kobo: number | string;
  vendor_proceeds_kobo: number | string;
  earned_at: string;
  payout_status: "pending" | "paid";
  marketplace_orders: { reference: string } | { reference: string }[] | null;
};

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export default function AdminCommissionsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commissionRateBps, setCommissionRateBps] = useState(500);
  const [records, setRecords] = useState<CommissionRecord[]>([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadCommissions = useCallback(async () => {
    const { data: { session } } = await getSupabaseClient().auth.getSession();
    if (!session?.access_token) throw new Error("Your owner session has expired. Sign in again.");
    const response = await fetch("/api/admin/commissions", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Could not load commission records.");
    setRecords(result.commissions as CommissionRecord[]);
    setCommissionRateBps(Number(result.rateBps));
  }, []);

  const recordSellerPayout = async (commissionId: string) => {
    if (!window.confirm("Only continue after you have actually paid this seller outside the website. Record this seller proceeds as paid?")) return;
    setUpdatingId(commissionId);
    setError("");
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession();
      if (!session?.access_token) throw new Error("Your owner session has expired. Sign in again.");
      const response = await fetch("/api/admin/commissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ commissionId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not record payout.");
      await loadCommissions();
    } catch (payoutError) {
      setError(payoutError instanceof Error ? payoutError.message : "Could not record payout.");
    } finally {
      setUpdatingId("");
    }
  };

  useEffect(() => {
    return subscribeToAdminSession((isAdmin, sessionError) => {
      setAuthorized(isAdmin);
      setError(sessionError ?? "");
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      void loadCommissions()
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load commission records."))
        .finally(() => setLoading(false));
    });
  }, [loadCommissions]);

  const earnedCommission = records.reduce((total, record) => total + Number(record.commission_amount_kobo), 0);
  const vendorPayoutsDue = records
    .filter((record) => record.payout_status === "pending")
    .reduce((total, record) => total + Number(record.vendor_proceeds_kobo), 0);
  const completedSales = records.reduce((total, record) => total + Number(record.gross_amount_kobo), 0);

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "70vh", py: { xs: 4, md: 7 }, background: "#f7f4ef" }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" sx={{ color: "#a94438", fontWeight: 800, letterSpacing: "0.12em" }}>Owner finances</Typography>
              <Typography component="h1" variant="h3" sx={{ color: "#203c35", fontWeight: 750 }}>Marketplace commissions</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                The current commission is {commissionRateBps / 100}%, deducted from seller proceeds and earned when an order is marked delivered.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button component={Link} href="/admin/orders" sx={{ color: "#203c35", px: 0 }}>Order fulfillment</Button>
              <Button component={Link} href="/admin/monitoring" sx={{ color: "#203c35", px: 0 }}>Owner monitoring</Button>
            </Stack>

            {loading && <Alert severity="info">Loading commission records…</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !authorized && <Button component={Link} href="/admin/login" variant="contained" sx={{ alignSelf: "flex-start", background: "#203c35" }}>Owner sign in</Button>}

            {authorized && <>
              <Grid container spacing={2.5}>
                {[
                  { label: "Commission earned", value: money.format(earnedCommission / 100) },
                  { label: "Seller proceeds pending payout", value: money.format(vendorPayoutsDue / 100) },
                  { label: "Delivered sales", value: money.format(completedSales / 100) },
                ].map((item) => <Grid key={item.label} item xs={12} md={4}>
                  <Card sx={{ border: "1px solid #e2e7e1", borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32,60,53,.05)" }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>{item.label}</Typography>
                      <Typography variant="h4" sx={{ color: "#203c35", fontWeight: 750, mt: 0.5 }}>{item.value}</Typography>
                    </CardContent>
                  </Card>
                </Grid>)}
              </Grid>

              <Card sx={{ border: "1px solid #e2e7e1", borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32,60,53,.05)" }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography variant="h5" sx={{ color: "#203c35", fontWeight: 750, mb: 2 }}>Completed orders</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Summary totals cover the latest 500 commission records shown below.</Typography>
                  {records.length === 0 ? <Alert severity="info">No commissions have been earned yet. A commission is recorded after a paid order is marked delivered.</Alert> :
                    <Stack divider={<Box sx={{ borderBottom: "1px solid #e5e9e5" }} />}>
                      {records.map((record) => {
                        const relatedOrder = Array.isArray(record.marketplace_orders) ? record.marketplace_orders[0] : record.marketplace_orders;
                        return <Stack key={record.id} direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} sx={{ py: 2 }}>
                          <Box>
                            <Typography sx={{ color: "#203c35", fontWeight: 750 }}>{record.store_name}</Typography>
                            <Typography variant="body2" color="text.secondary">Order {relatedOrder?.reference ?? "unavailable"} · {new Date(record.earned_at).toLocaleString()}</Typography>
                            <Typography variant="caption" color="text.secondary">Sale {money.format(Number(record.gross_amount_kobo) / 100)} · {record.commission_rate_bps / 100}% commission</Typography>
                          </Box>
                          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                            <Box>
                              <Typography variant="caption" color="text.secondary">Commission</Typography>
                              <Typography sx={{ fontWeight: 750 }}>{money.format(Number(record.commission_amount_kobo) / 100)}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="text.secondary">Seller proceeds</Typography>
                              <Typography sx={{ fontWeight: 750 }}>{money.format(Number(record.vendor_proceeds_kobo) / 100)}</Typography>
                            </Box>
                            <Chip size="small" label={record.payout_status === "pending" ? "Seller payout due" : "Seller paid"} color={record.payout_status === "pending" ? "warning" : "success"} />
                            {record.payout_status === "pending" && <Button size="small" disabled={updatingId === record.id} onClick={() => void recordSellerPayout(record.id)}>
                              {updatingId === record.id ? "Saving…" : "Record payout"}
                            </Button>}
                          </Stack>
                        </Stack>;
                      })}
                    </Stack>}
                </CardContent>
              </Card>
            </>}
          </Stack>
        </Container>
      </Box>
    </MainLayouts>
  );
}
