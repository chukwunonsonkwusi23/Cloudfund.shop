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
import { registerVendor } from "../../../lib/supabase-marketplace";

export default function VendorRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    storeName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);

    try {
      const registration = await registerVendor(form);
      if (registration.needsEmailConfirmation) {
        setNotice("Check your email to confirm your account, then sign in to continue.");
        return;
      }
      router.push("/vendor/dashboard");
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Unable to create the vendor account."
      );
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
                    New vendor
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Create your vendor account
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    New shops are reviewed before product listings go live.
                  </Typography>
                </Box>

                {error ? <Alert severity="error">{error}</Alert> : null}
                {notice ? <Alert severity="success">{notice}</Alert> : null}

                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      label="Full name"
                      value={form.fullName}
                      onChange={(event) => handleChange("fullName", event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Store name"
                      value={form.storeName}
                      onChange={(event) => handleChange("storeName", event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Business email"
                      type="email"
                      value={form.email}
                      onChange={(event) => handleChange("email", event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={form.password}
                      onChange={(event) => handleChange("password", event.target.value)}
                      fullWidth
                    />
                    <Button type="submit" disabled={submitting} variant="contained" sx={{ background: "#203c35", color: "#fff", py: 1.5, borderRadius: 1, "&:hover": { background: "#172e28" } }}>
                      {submitting ? "Creating account..." : "Create account"}
                    </Button>
                  </Stack>
                </form>

                <Button component={Link} href="/vendor/login" sx={{ color: "#203c35" }}>
                  Already have an account? Login
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayouts>
  );
}
