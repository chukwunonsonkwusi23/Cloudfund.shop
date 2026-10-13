"use client";

import { FormEvent, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, TextField, Typography } from "@mui/material";
import MainLayouts from "../../../layouts/MainLayouts";

type TrackingEvent = {
  status: string;
  note: string;
  carrier: string | null;
  tracking_number: string | null;
  created_at: string;
};

type TrackedOrder = {
  reference: string;
  amountKobo: number;
  currency: string;
  fulfillmentStatus: "processing" | "shipped" | "delivered";
  carrier: string | null;
  trackingNumber: string | null;
  estimatedDelivery: string | null;
  createdAt: string;
  paidAt: string | null;
  items: { name: string; store: string; quantity: number; lineTotalKobo: number }[];
  events: TrackingEvent[];
};

const stageLabels = ["Order placed", "Shipped", "Delivered"];
const stageForStatus = { processing: 0, shipped: 1, delivered: 2 };
const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export default function TrackOrderPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const queryReference = new URLSearchParams(window.location.search).get("reference");
    if (queryReference) setReference(queryReference);
  }, []);

  const trackOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not find this order.");
      setOrder(result.order as TrackedOrder);
    } catch (trackError) {
      setError(trackError instanceof Error ? trackError.message : "Order tracking is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "70vh", py: { xs: 5, md: 8 }, background: "#f7f8f5" }}>
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" sx={{ color: "#738078", fontWeight: 700, letterSpacing: 1.4 }}>Marketplace orders</Typography>
              <Typography component="h1" variant="h3" sx={{ color: "#203c35", fontWeight: 750 }}>Track your order</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Enter the order reference from your payment confirmation and the email address used at checkout.</Typography>
            </Box>

            <Card sx={{ border: "1px solid #e2e7e1", borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32,60,53,.05)" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Box component="form" onSubmit={trackOrder}>
                  <Stack spacing={2}>
                    <TextField label="Order reference" value={reference} onChange={(event) => setReference(event.target.value)} required fullWidth autoComplete="off" />
                    <TextField label="Checkout email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required fullWidth autoComplete="email" />
                    {error && <Alert severity="error">{error}</Alert>}
                    <Button type="submit" disabled={loading || !reference.trim() || !email.trim()} variant="contained" sx={{ alignSelf: "flex-start", background: "#203c35", px: 3, "&:hover": { background: "#172e28" } }}>
                      {loading ? "Looking up order…" : "Track order"}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {order && <Card sx={{ border: "1px solid #e2e7e1", borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32,60,53,.05)" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={3}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                    <Box>
                      <Typography variant="h5" sx={{ color: "#203c35", fontWeight: 750 }}>Order status</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Reference: {order.reference}</Typography>
                    </Box>
                    <Chip label={order.fulfillmentStatus} color={order.fulfillmentStatus === "delivered" ? "success" : order.fulfillmentStatus === "shipped" ? "info" : "default"} sx={{ textTransform: "capitalize", fontWeight: 700 }} />
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    {stageLabels.map((label, index) => {
                      const current = stageForStatus[order.fulfillmentStatus];
                      const complete = current >= index;
                      return <Box key={label} sx={{ flex: 1, display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: 1.5, background: complete ? "#e9f3ed" : "#f4f5f3" }}>
                        <Box sx={{ width: 24, height: 24, borderRadius: "50%", display: "grid", placeItems: "center", color: complete ? "#fff" : "#687479", background: complete ? "#26734d" : "#dfe4df", fontSize: 12, fontWeight: 700 }}>{complete ? "✓" : index + 1}</Box>
                        <Typography variant="body2" sx={{ color: complete ? "#203c35" : "#738078", fontWeight: 650 }}>{label}</Typography>
                      </Box>;
                    })}
                  </Stack>

                  {order.fulfillmentStatus === "processing" && <Alert severity="info">Your payment is confirmed. The seller is preparing your order.</Alert>}
                  {order.carrier && <Typography><strong>Delivery carrier:</strong> {order.carrier}</Typography>}
                  {order.trackingNumber && <Typography><strong>Tracking number:</strong> {order.trackingNumber}</Typography>}
                  {order.estimatedDelivery && <Typography><strong>Estimated delivery:</strong> {new Date(`${order.estimatedDelivery}T00:00:00`).toLocaleDateString()}</Typography>}

                  <Box>
                    <Typography variant="h6" sx={{ color: "#203c35", fontWeight: 700, mb: 1 }}>Items</Typography>
                    <Stack divider={<Box sx={{ borderBottom: "1px solid #e7ebe7" }} />}>
                      {order.items.map((item, index) => <Stack key={`${item.name}-${index}`} direction="row" justifyContent="space-between" spacing={2} sx={{ py: 1.25 }}>
                        <Box>
                          <Typography sx={{ fontWeight: 650 }}>{item.name} × {item.quantity}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.store}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 650, whiteSpace: "nowrap" }}>{money.format(item.lineTotalKobo / 100)}</Typography>
                      </Stack>)}
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" sx={{ pt: 1.5 }}>
                      <Typography sx={{ fontWeight: 750 }}>Total paid</Typography>
                      <Typography sx={{ fontWeight: 750 }}>{money.format(order.amountKobo / 100)}</Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ color: "#203c35", fontWeight: 700, mb: 1 }}>Updates</Typography>
                    <Stack spacing={1.5}>
                      <Box sx={{ borderLeft: "2px solid #26734d", pl: 2, py: 0.25 }}>
                        <Typography sx={{ fontWeight: 650 }}>Payment confirmed · Order processing</Typography>
                        <Typography variant="caption" color="text.secondary">{order.paidAt ? new Date(order.paidAt).toLocaleString() : new Date(order.createdAt).toLocaleString()}</Typography>
                      </Box>
                      {order.events.map((event, index) => <Box key={`${event.created_at}-${index}`} sx={{ borderLeft: "2px solid #26734d", pl: 2, py: 0.25 }}>
                        <Typography sx={{ fontWeight: 650, textTransform: "capitalize" }}>{event.note}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(event.created_at).toLocaleString()}</Typography>
                      </Box>)}
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>}
          </Stack>
        </Container>
      </Box>
    </MainLayouts>
  );
}
