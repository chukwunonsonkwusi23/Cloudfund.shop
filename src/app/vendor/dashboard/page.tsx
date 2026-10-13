"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MainLayouts from "../../../../layouts/MainLayouts";
import {
  getProductImageValidationError,
  addProductToVendor,
  getVendorActivities,
  getVendorProducts,
  logoutVendor,
  MarketActivity,
  MarketProduct,
  MarketVendor,
  subscribeToVendorSession,
} from "../../../lib/supabase-marketplace";
import { currencyFormatter } from "../../../../utility";

export default function VendorDashboardPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<MarketVendor | null>(null);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [activities, setActivities] = useState<MarketActivity[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
  });

  useEffect(() => {
    return subscribeToVendorSession((currentVendor, sessionError) => {
      if (!currentVendor) {
        if (sessionError) setError(sessionError);
        router.replace("/vendor/login");
        return;
      }

      setVendor(currentVendor);
      Promise.all([
        getVendorProducts(currentVendor.id),
        getVendorActivities(currentVendor.id),
      ])
        .then(([vendorProducts, vendorActivities]) => {
          setProducts(vendorProducts);
          setActivities(vendorActivities);
        })
        .catch((loadError) => {
          setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
        });
    });
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!vendor) {
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      await addProductToVendor(vendor, {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        imageFile,
      });
      setForm({ name: "", category: "", description: "", price: "", stock: "" });
      setImageFile(null);
      const [vendorProducts, vendorActivities] = await Promise.all([
        getVendorProducts(vendor.id),
        getVendorActivities(vendor.id),
      ]);
      setProducts(vendorProducts);
      setActivities(vendorActivities);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to publish product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelection = (file: File | null) => {
    setError("");
    if (!file) {
      setImageFile(null);
      return;
    }

    const validationError = getProductImageValidationError(file);
    if (validationError) {
      setImageFile(null);
      setError(validationError);
      return;
    }
    setImageFile(file);
  };

  const handleLogout = async () => {
    await logoutVendor();
    router.push("/vendor/login");
  };

  if (!vendor) {
    return null;
  }

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "100vh", py: { xs: 4, md: 6 }, background: "#f7f4ef" }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2} sx={{ mb: { xs: 3, md: 4 } }}>
            <Box>
              <Typography component="p" variant="overline" sx={{ display: "block", color: "#a94438", fontWeight: 800, letterSpacing: "0.12em", mb: 1 }}>
                Vendor dashboard
              </Typography>
              <Typography component="h1" variant="h3" sx={{ color: "#203c35", fontWeight: 750, letterSpacing: "-0.025em" }}>
                {vendor.storeName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Manage your products and track your shop activity.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={handleLogout} sx={{ borderColor: "#203c35", color: "#203c35", borderRadius: 2, px: 2.5, textTransform: "none", fontWeight: 650 }}>
              Log out
            </Button>
          </Stack>

          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.07)", border: "1px solid #e2e7e1" }}>
                <CardContent sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>Products</Typography>
                  <Typography variant="h3" sx={{ color: "#203c35", fontWeight: 750, mt: 0.5 }}>{products.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.07)", border: "1px solid #e2e7e1" }}>
                <CardContent sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>Owner</Typography>
                  <Typography variant="h5" sx={{ color: "#203c35", fontWeight: 700, mt: 0.5 }}>{vendor.fullName}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.07)", border: "1px solid #e2e7e1" }}>
                <CardContent sx={{ px: 3, py: 2.5 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>Email</Typography>
                  <Typography variant="body1" sx={{ color: "#203c35", fontWeight: 650, mt: 0.5, overflowWrap: "anywhere" }}>{vendor.email}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {vendor.status === "pending" ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              Your shop is being reviewed. You can prepare your store, but product publishing unlocks after owner approval.
            </Alert>
          ) : null}
          {vendor.status === "suspended" ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Your shop is paused and cannot publish products. Contact the marketplace owner for more information.
            </Alert>
          ) : null}

          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Card sx={{ borderRadius: 2.5, boxShadow: "0 12px 36px rgba(32, 60, 53, 0.08)", border: "1px solid #e2e7e1" }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography component="h2" variant="h5" sx={{ mb: 2.5, color: "#203c35", fontWeight: 750 }}>Add new product</Typography>
                  {error ? <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert> : null}
                  {vendor.status === "approved" ? <form onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                      <TextField required label="Product name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} fullWidth />
                      <TextField required label="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} fullWidth />
                      <TextField required label="Description" multiline minRows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} fullWidth />
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField required label="Price" type="number" inputProps={{ min: 0, step: "0.01" }} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} fullWidth />
                        <TextField required label="Stock" type="number" inputProps={{ min: 0, step: 1 }} value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} fullWidth />
                      </Stack>
                      <Button component="label" variant="outlined" sx={{ borderColor: "#d0c5b4", color: "#333" }}>
                        {imageFile ? imageFile.name : "Choose product photo"}
                        <input
                          hidden
                          accept="image/jpeg,image/png,image/webp"
                          type="file"
                          onChange={(event) => handleImageSelection(event.target.files?.[0] ?? null)}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        JPG, PNG, or WebP · maximum 5 MB
                      </Typography>
                      <Button type="submit" disabled={submitting} variant="contained" sx={{ background: "#203c35", color: "#fff", borderRadius: 1, py: 1.4, "&:hover": { background: "#172e28" } }}>
                        {submitting ? "Uploading and publishing..." : "Publish product"}
                      </Button>
                    </Stack>
                  </form> : null}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={7}>
              <Card sx={{ borderRadius: 2.5, boxShadow: "0 12px 36px rgba(32, 60, 53, 0.08)", border: "1px solid #e2e7e1" }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography component="h2" variant="h5" sx={{ mb: 2.5, color: "#203c35", fontWeight: 750 }}>Your products</Typography>
                  <Stack spacing={2}>
                    {products.length === 0 ? (
                      <Alert severity="info">You have not published any products yet.</Alert>
                    ) : (
                      products.map((product) => (
                        <Box key={product.id} sx={{ p: { xs: 2, sm: 2.5 }, border: "1px solid #e2e7e1", borderRadius: 2, background: "#fff" }}>
                          <Stack direction="row" justifyContent="space-between" spacing={2}>
                            <Box>
                              <Typography variant="h6" sx={{ color: "#203c35", fontWeight: 750 }}>{product.name}</Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>{product.category}</Typography>
                            </Box>
                            <Typography variant="h6" sx={{ color: "#203c35", fontWeight: 750, whiteSpace: "nowrap" }}>
                              {currencyFormatter(product.price, { currency: "NGN" })}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ display: "block", mt: 1.5, color: "#4c5853" }}>{product.description}</Typography>
                          <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#738078" }}>Stock: {product.stock}</Typography>
                        </Box>
                      ))
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.06)", border: "1px solid #e2e7e1" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography component="h2" variant="h5" sx={{ mb: 2.5, color: "#203c35", fontWeight: 750 }}>Recent activity</Typography>
                <Stack spacing={1.5}>
                  {activities.length === 0 ? (
                    <Alert severity="info">No activity recorded yet.</Alert>
                  ) : (
                    activities.map((activity) => (
                      <Box key={activity.id} sx={{ p: 2, background: "#f7f8f5", borderRadius: 2, border: "1px solid #dfe4dc" }}>
                        <Typography variant="body2" sx={{ color: "#203c35", fontWeight: 750 }}>{activity.type}</Typography>
                        <Typography variant="body2" sx={{ color: "#4c5853", mt: 0.5 }}>{activity.description}</Typography>
                        <Typography variant="caption" sx={{ display: "block", color: "#738078", mt: 1 }}>
                          {new Date(activity.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>
    </MainLayouts>
  );
}
