"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MainLayouts from "../../../../layouts/MainLayouts";
import { getSupabaseClient } from "../../../lib/supabase";

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function initializeReset() {
      try {
        const client = getSupabaseClient();
        const { data, error } = await client.auth.getSession();

        if (error) {
          throw error;
        }

        if (!data.session) {
          if (!active) return;
          setStatus("error");
          setMessage("This password reset link is invalid or has expired.");
          return;
        }

        if (active) setStatus("ready");
      } catch (error) {
        if (!active) return;
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to initialize the password reset."
        );
      }
    }

    void initializeReset();

    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("The passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Your password must contain at least 8 characters.");
      return;
    }

    try {
      const client = getSupabaseClient();
      const { data, error } = await client.auth.getSession();

      if (error) throw error;
      if (!data.session) {
        throw new Error("The password reset session has expired.");
      }

      const { error: updateError } = await client.auth.updateUser({ password });
      if (updateError) throw updateError;

      setStatus("success");
      setMessage("Password updated successfully. Redirecting you to sign in...");
      router.push("/admin/login");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update your password."
      );
    }
  };

  const resetType = searchParams.get("type");
  const accessToken = searchParams.get("access_token");

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "100vh", background: "#f1f4ef", py: 8 }}>
        <Container maxWidth="sm">
          <Card
            sx={{
              border: "1px solid #dfe4dc",
              borderRadius: 1,
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="overline"
                    sx={{ color: "#bf5538", fontWeight: 700 }}
                  >
                    Marketplace administration
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ color: "#203c35", fontWeight: 700 }}
                  >
                    Reset owner password
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter your new password to complete the reset.
                  </Typography>
                </Box>

                {resetType !== "reset" || !accessToken ? (
                  <Alert severity="warning">
                    This password reset link is missing or invalid.
                  </Alert>
                ) : null}

                {status === "loading" ? (
                  <Alert severity="info">Checking the reset link...</Alert>
                ) : null}

                {message && status !== "loading" ? (
                  <Alert severity={status === "error" ? "error" : "success"}>
                    {message}
                  </Alert>
                ) : null}

                {status === "ready" ? (
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Stack spacing={2}>
                      <TextField
                        required
                        fullWidth
                        label="New password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                      />
                      <TextField
                        required
                        fullWidth
                        label="Confirm new password"
                        type="password"
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        sx={{
                          background: "#203c35",
                          color: "#fff",
                          py: 1.4,
                        }}
                      >
                        Update password
                      </Button>
                    </Stack>
                  </Box>
                ) : null}

                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Link href="/admin/login" style={{ color: "#bf5538" }}>
                    Back to sign in
                  </Link>
                  <Link href="/" style={{ color: "#bf5538" }}>
                    Return home
                  </Link>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayouts>
  );
}
