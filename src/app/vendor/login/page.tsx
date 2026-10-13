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
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import MainLayouts from "../../../../layouts/MainLayouts";
import { loginVendor } from "../../../lib/supabase-marketplace";

export default function VendorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await loginVendor(email, password);
      router.push("/vendor/dashboard");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #f7f8f5 0%, #edf1e9 100%)", py: 8 }}>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 4, boxShadow: "0 25px 70px rgba(0, 0, 0, 0.08)" }}>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="overline" sx={{ color: "#bf5538", fontWeight: 700 }}>
                    Vendor portal
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Sign in to your vendor dashboard
                  </Typography>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      fullWidth
                    />
                    <Button type="submit" disabled={submitting} variant="contained" sx={{ background: "#203c35", color: "#fff", py: 1.5, borderRadius: 1, "&:hover": { background: "#172e28" } }}>
                      {submitting ? "Signing in..." : "Login"}
                    </Button>
                  </Stack>
                </form>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Need an account?
                  </Typography>
                  <Button component={Link} href="/vendor/register" sx={{ color: "#203c35" }}>
                    Create vendor account
                  </Button>
                </Stack>

              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayouts>
  );
}
