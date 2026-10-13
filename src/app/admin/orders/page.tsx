"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, Card, CardContent, Chip, Container, Stack, TextField, Typography } from "@mui/material";
import MainLayouts from "../../../../layouts/MainLayouts";
import { getSupabaseClient } from "../../../lib/supabase";
import { subscribeToAdminSession } from "../../../lib/supabase-marketplace";

type AdminOrder = {
  id: string;
  reference: string;
  email: string;
  customer_name: string;
  phone: string;
  delivery_address: string;
  amount_kobo: number | string;
  currency: string;
  fulfillment_status: "processing" | "shipped" | "delivered";
  carrier: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  created_at: string;
  marketplace_order_items: { product_name: string; store_name: string; quantity: number; line_total_kobo: number | string }[];
};

type ShipmentForm = {
  carrier: string;
  trackingNumber: string;
  estimatedDelivery: string;
  note: string;
};

const money = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" });

export default function AdminOrdersPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [shipmentForms, setShipmentForms] = useState<Record<string, ShipmentForm>>({});

  const requestOrders = useCallback(async () => {
    const { data: { session } } = await getSupabaseClient().auth.getSession();
    if (!session?.access_token) throw new Error("Your owner session has expired. Please sign in again.");
    const response = await fetch("/api/admin/orders", { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Could not load orders.");
    const loaded = result.orders as AdminOrder[];
    setOrders(loaded);
    setShipmentForms(Object.fromEntries(loaded.map((order) => [order.id, {
      carrier: order.carrier ?? "",
      trackingNumber: order.tracking_number ?? "",
      estimatedDelivery: order.estimated_delivery ?? "",
      note: "",
    }])));
  }, []);

  useEffect(() => {
    return subscribeToAdminSession((isAdmin, sessionError) => {
      setAuthorized(isAdmin);
      setError(sessionError ?? "");
      if (!isAdmin) {
        setLoading(false);
        return;
      }
      void requestOrders()
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load orders."))
        .finally(() => setLoading(false));
    });
  }, [requestOrders]);

  const updateTracking = async (order: AdminOrder) => {
    const nextStatus = order.fulfillment_status === "processing" ? "shipped" : "delivered";
    const form = shipmentForms[order.id];
    setUpdatingId(order.id);
    setError("");
    try {
      const { data: { session } } = await getSupabaseClient().auth.getSession();
      if (!session?.access_token) throw new Error("Your owner session has expired. Please sign in again.");
      const response = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ orderId: order.id, status: nextStatus, ...form }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update this order.");
      await requestOrders();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update this order.");
    } finally {
      setUpdatingId("");
    }
  };

  const updateForm = (orderId: string, field: keyof ShipmentForm, value: string) => {
    setShipmentForms((current) => ({ ...current, [orderId]: { ...current[orderId], [field]: value } }));
  };

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "70vh", py: { xs: 4, md: 7 }, background: "#f7f4ef" }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography variant="overline" sx={{ color: "#a94438", fontWeight: 800, letterSpacing: "0.12em" }}>Owner tools</Typography>
              <Typography component="h1" variant="h3" sx={{ color: "#203c35", fontWeight: 750 }}>Order fulfillment</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Update paid orders as they are shipped and delivered. Buyers can see these updates on the tracking page.</Typography>
            </Box>

            <Button component={Link} href="/admin/monitoring" sx={{ alignSelf: "flex-start", color: "#203c35", px: 0 }}>← Back to owner monitoring</Button>
            {loading && <Alert severity="info">Loading orders…</Alert>}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !authorized && <Button component={Link} href="/admin/login" variant="contained" sx={{ alignSelf: "flex-start", background: "#203c35" }}>Owner sign in</Button>}
            {authorized && !loading && orders.length === 0 && <Alert severity="info">No paid orders to fulfill yet.</Alert>}

            {authorized && orders.map((order) => {
              const form = shipmentForms[order.id] ?? { carrier: "", trackingNumber: "", estimatedDelivery: "", note: "" };
              const nextStatus = order.fulfillment_status === "processing" ? "shipped" : order.fulfillment_status === "shipped" ? "delivered" : "";
              return <Card key={order.id} sx={{ border: "1px solid #e2e7e1", borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32,60,53,.05)" }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack spacing={2.5}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography variant="h6" sx={{ color: "#203c35", fontWeight: 750 }}>Order {order.reference}</Typography>
                        <Typography variant="body2" color="text.secondary">Placed {new Date(order.created_at).toLocaleString()}</Typography>
                      </Box>
                      <Chip label={order.fulfillment_status} sx={{ alignSelf: "flex-start", textTransform: "capitalize", fontWeight: 700 }} color={order.fulfillment_status === "delivered" ? "success" : order.fulfillment_status === "shipped" ? "info" : "default"} />
                    </Stack>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 0.5 }}>Deliver to</Typography>
                        <Typography>{order.customer_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{order.email} · {order.phone}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>{order.delivery_address}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 0.5 }}>Items · {money.format(Number(order.amount_kobo) / 100)}</Typography>
                        {order.marketplace_order_items.map((item, index) => <Typography key={`${item.product_name}-${index}`} variant="body2" color="text.secondary">{item.product_name} × {item.quantity} · {item.store_name}</Typography>)}
                      </Box>
                    </Box>

                    {nextStatus ? <>
                      <Typography variant="subtitle1" sx={{ color: "#203c35", fontWeight: 750 }}>Shipment update</Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                        <TextField label="Delivery carrier (optional)" value={form.carrier} onChange={(event) => updateForm(order.id, "carrier", event.target.value)} size="small" />
                        <TextField label="Tracking number (optional)" value={form.trackingNumber} onChange={(event) => updateForm(order.id, "trackingNumber", event.target.value)} size="small" />
                        {nextStatus === "shipped" && <TextField label="Estimated delivery" type="date" value={form.estimatedDelivery} onChange={(event) => updateForm(order.id, "estimatedDelivery", event.target.value)} size="small" InputLabelProps={{ shrink: true }} />}
                        <TextField label="Update message (optional)" value={form.note} onChange={(event) => updateForm(order.id, "note", event.target.value)} size="small" />
                      </Box>
                      <Button disabled={updatingId === order.id} onClick={() => void updateTracking(order)} variant="contained" sx={{ alignSelf: "flex-start", background: "#203c35", "&:hover": { background: "#172e28" } }}>
                        {updatingId === order.id ? "Saving…" : `Mark as ${nextStatus}`}
                      </Button>
                    </> : <Alert severity="success">This order is marked delivered.</Alert>}
                  </Stack>
                </CardContent>
              </Card>;
            })}
          </Stack>
        </Container>
      </Box>
    </MainLayouts>
  );
}
