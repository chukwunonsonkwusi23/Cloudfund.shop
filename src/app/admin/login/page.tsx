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
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import MainLayouts from "../../../../layouts/MainLayouts";
import { loginMarketplaceAdmin } from "../../../lib/supabase-marketplace";

export default function AdminLoginPage() {
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
      await loginMarketplaceAdmin(email, password);
      router.push("/admin/monitoring");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "100vh", background: "#f1f4ef", py: 8 }}>
        <Container maxWidth="sm">
          <Card sx={{ border: "1px solid #dfe4dc", borderRadius: 1, boxShadow: "none" }}>
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="overline" sx={{ color: "#bf5538", fontWeight: 700 }}>
                    Marketplace administration
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#203c35", fontWeight: 700 }}>
                    Owner sign in
                  </Typography>
                </Box>
                {error ? <Alert severity="error">{error}</Alert> : null}
                <form onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField
                      required
                      label="Owner email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      required
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      fullWidth
                    />
                    <Button
                      type="submit"
                      disabled={submitting}
                      variant="contained"
                      sx={{ background: "#203c35", color: "#fff", py: 1.4 }}
                    >
                      {submitting ? "Signing in..." : "Sign in"}
                    </Button>
                  </Stack>
                </form>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayouts>
  );
}
