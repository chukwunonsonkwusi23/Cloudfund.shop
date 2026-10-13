"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Alert, Box, Button, CircularProgress, Container, Typography } from "@mui/material";

type PaymentState = "checking" | "paid" | "pending" | "failed" | "error";

export default function CheckoutCallbackPage() {
  const [state, setState] = useState<PaymentState>("checking");
  const [message, setMessage] = useState("");
  const [reference, setReference] = useState("");

  useEffect(() => {
    setReference(new URLSearchParams(window.location.search).get("reference") ?? "");
  }, []);

  const verify = useCallback(async () => {
    if (!reference) {
      setState("error");
      setMessage("No payment reference was returned. Please contact support before trying to pay again.");
      return;
    }
    setState("checking");
    setMessage("");
    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Payment verification failed.");
      if (result.status === "paid") {
        setState("paid");
        window.localStorage.removeItem("cloudfund-cart");
      } else if (result.status === "failed") {
        setState("failed");
      } else {
        setState("pending");
      }
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "We could not confirm payment yet.");
    }
  }, [reference]);

  useEffect(() => {
    if (reference) void verify();
  }, [reference, verify]);

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 12 } }}>
      <Box sx={{ p: { xs: 3, sm: 5 }, border: "1px solid #e3e7e1", borderRadius: 3, textAlign: "center", background: "#fff" }}>
        {state === "checking" && <CircularProgress sx={{ color: "#203c35" }} />}
        <Typography variant="h4" component="h1" sx={{ mt: state === "checking" ? 2 : 0, mb: 2, color: "#203c35", fontWeight: 700 }}>
          {state === "paid" ? "Payment confirmed" : state === "failed" ? "Payment not completed" : state === "checking" ? "Confirming your payment" : state === "pending" ? "Payment is processing" : "Payment status unavailable"}
        </Typography>
        {state === "paid" ? (
          <Alert severity="success" sx={{ textAlign: "left" }}>Your payment was verified with Paystack. Keep this reference for tracking: {reference}</Alert>
        ) : state === "failed" ? (
          <Alert severity="warning" sx={{ textAlign: "left" }}>Paystack reports that this payment did not complete. You can return to the marketplace and try again.</Alert>
        ) : state === "pending" ? (
          <Alert severity="info" sx={{ textAlign: "left" }}>Paystack has not confirmed this payment yet. Wait a moment, then check again before starting another payment.</Alert>
        ) : state === "error" ? (
          <Alert severity="error" sx={{ textAlign: "left" }}>{message}</Alert>
        ) : (
          <Typography color="text.secondary">We are checking the transaction directly with Paystack.</Typography>
        )}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, flexWrap: "wrap", mt: 3 }}>
          {(state === "pending" || state === "error") && <Button variant="outlined" onClick={() => void verify()}>Check payment again</Button>}
          {state === "paid" && <Button component={Link} href={`/track-order?reference=${encodeURIComponent(reference)}`} variant="outlined">Track this order</Button>}
          <Button component={Link} href="/marketplace" variant="contained" sx={{ background: "#203c35", "&:hover": { background: "#172e28" } }}>
            Return to marketplace
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
