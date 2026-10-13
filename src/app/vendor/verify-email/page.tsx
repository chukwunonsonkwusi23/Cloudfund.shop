"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import { Alert, Box, Button, Card, CardContent, Container, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import MainLayouts from "../../../../layouts/MainLayouts";

type VerificationState = "loading" | "confirmed" | "error";

export default function VendorEmailVerificationPage() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your email address…");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setMessage("This confirmation link is missing information. Please request a new one.");
      return;
    }

    let active = true;
    const verifyEmail = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (!supabaseUrl) throw new Error("Supabase is not configured.");

        const response = await fetch(`${supabaseUrl}/auth/v1/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify({ token, type: "signup" }),
        });
        const result = await response.json() as { message?: string; error?: string };

        if (!response.ok) throw new Error(result.message || result.error || "Email verification failed.");
        if (!active) return;

        setState("confirmed");
        setMessage("Your vendor email address is confirmed. You can now sign in.");
      } catch (verificationError) {
        if (!active) return;

        setState("error");
        setMessage(
          verificationError instanceof Error
            ? verificationError.message
            : "We could not confirm your email address. Please try again."
        );
      }
    };

    void verifyEmail();

    return () => {
      active = false;
    };
  }, [searchParams]);

  const isConfirmed = state === "confirmed";
  const isError = state === "error";

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #f7f8f5 0%, #edf1e9 100%)", px: 2, py: 8 }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 4, boxShadow: "0 25px 70px rgba(0, 0, 0, 0.08)" }}>
            <CardContent sx={{ p: { xs: 3, md: 5 } }}>
              <Stack spacing={3} alignItems="center" textAlign="center">
                <Box
                  sx={{
                    width: 84,
                    height: 84,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    backgroundColor: isConfirmed ? "#e9f5ec" : isError ? "#fff0ed" : "#edf2ed",
                    color: isConfirmed ? "#16815d" : isError ? "#bf5538" : "#203c35",
                  }}
                >
                  {isConfirmed ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 48 }} />
                  ) : isError ? (
                    <ErrorOutlineRoundedIcon sx={{ fontSize: 48 }} />
                  ) : (
                    <EmailOutlinedIcon sx={{ fontSize: 48 }} />
                  )}
                </Box>

                <Box>
                  <Typography variant="overline" sx={{ color: isConfirmed ? "#16815d" : "#bf5538", fontWeight: 800 }}>
                    {isConfirmed ? "Email confirmed" : isError ? "Confirmation failed" : "Confirming email"}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1, fontWeight: 700 }}>
                    {isConfirmed ? "Your vendor account is ready." : isError ? "We could not verify your account." : "Checking your confirmation link…"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                    {message}
                  </Typography>
                </Box>

                {isConfirmed ? (
                  <Box sx={{ width: "100%" }}>
                    <Alert severity="success">
                      Your email has been verified. Your vendor profile is now ready for review.
                    </Alert>
                  </Box>
                ) : null}

                {isError ? (
                  <Box sx={{ width: "100%" }}>
                    <Alert severity="error">
                      The link may have expired or already been used. Please register again or request a new confirmation email.
                    </Alert>
                  </Box>
                ) : null}

                {isConfirmed ? (
                  <Button
                    component={Link}
                    href="/vendor/login"
                    variant="contained"
                    sx={{ width: "100%", background: "#203c35", px: 3, py: 1.5, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                  >
                    Go back and login
                  </Button>
                ) : null}

                <Button component={Link} href="/vendor/register" sx={{ color: "#203c35", textTransform: "none", fontWeight: 700 }}>
                  Return to vendor registration
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayouts>
  );
}
