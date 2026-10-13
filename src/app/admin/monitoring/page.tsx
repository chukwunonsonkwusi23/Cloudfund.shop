"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import MainLayouts from "../../../../layouts/MainLayouts";
import {
  getAllActivityLogs,
  getAllProductsForAdmin,
  getAllVendors,
  MarketActivity,
  MarketVendor,
  subscribeToAdminSession,
  setVendorStatus,
} from "../../../lib/supabase-marketplace";

export default function MonitoringDashboardPage() {
  const [activities, setActivities] = useState<MarketActivity[]>([]);
  const [vendors, setVendors] = useState<MarketVendor[]>([]);
  const [vendorCount, setVendorCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [updatingVendorId, setUpdatingVendorId] = useState("");
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToAdminSession((isAdmin, sessionError) => {
      setLoading(true);
      setError(sessionError ?? "");
      if (!isAdmin) {
        setAuthorized(false);
        if (!sessionError) {
          setError("Sign in with an owner account to view monitoring data.");
        }
        setLoading(false);
        return;
      }

      Promise.all([
          getAllVendors(),
          getAllProductsForAdmin(),
          getAllActivityLogs(),
        ])
        .then(([vendors, products, activityLogs]) => {
        setAuthorized(true);
        setVendors(vendors);
        setVendorCount(vendors.length);
        setProductCount(products.length);
        setActivities(activityLogs);
        })
        .catch((loadError) => {
          setAuthorized(false);
          setError(loadError instanceof Error ? loadError.message : "Unable to load monitoring data.");
        })
        .finally(() => setLoading(false));
    });
  }, []);

  const reviewVendor = async (vendor: MarketVendor) => {
    const status = vendor.status === "approved" ? "suspended" : "approved";
    setUpdatingVendorId(vendor.id);
    setError("");

    try {
      await setVendorStatus(vendor, status);
      setVendors((current) =>
        current.map((item) =>
          item.id === vendor.id ? { ...item, status } : item
        )
      );
      setActivities(await getAllActivityLogs());
    } catch (reviewError) {
      setError(
        reviewError instanceof Error
          ? reviewError.message
          : "Unable to update this vendor."
      );
    } finally {
      setUpdatingVendorId("");
    }
  };

  return (
    <MainLayouts>
      <Box sx={{ minHeight: "100vh", py: { xs: 4, md: 6 }, background: "#f7f4ef" }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Box>
              <Typography component="p" variant="overline" sx={{ display: "block", color: "#a94438", fontWeight: 800, letterSpacing: "0.12em", mb: 1 }}>
                Owner monitoring
              </Typography>
              <Typography component="h1" variant="h3" sx={{ color: "#203c35", fontWeight: 750, letterSpacing: "-0.025em" }}>
                Activity dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Review vendors and monitor marketplace activity in one place.
              </Typography>
            </Box>

            {loading ? <Alert severity="info">Checking owner access...</Alert> : null}
            {error ? <Alert severity="warning">{error}</Alert> : null}
            {!loading && !authorized ? (
              <Button
                component={Link}
                href="/admin/login"
                variant="contained"
                sx={{ alignSelf: "flex-start", background: "#203c35" }}
              >
                Owner sign in
              </Button>
            ) : null}

            {authorized ? <Grid container spacing={2.5}>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.07)", border: "1px solid #e2e7e1" }}>
                  <CardContent sx={{ px: 3, py: 2.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>Vendors</Typography>
                    <Typography variant="h3" sx={{ color: "#203c35", fontWeight: 750, mt: 0.5 }}>{vendorCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.07)", border: "1px solid #e2e7e1" }}>
                  <CardContent sx={{ px: 3, py: 2.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>Products</Typography>
                    <Typography variant="h3" sx={{ color: "#203c35", fontWeight: 750, mt: 0.5 }}>{productCount}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.07)", border: "1px solid #e2e7e1" }}>
                  <CardContent sx={{ px: 3, py: 2.5 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.08em" }}>Recent logs</Typography>
                    <Typography variant="h3" sx={{ color: "#203c35", fontWeight: 750, mt: 0.5 }}>{activities.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid> : null}

            {authorized ? <Button component={Link} href="/admin/orders" variant="contained" sx={{ alignSelf: "flex-start", background: "#203c35", "&:hover": { background: "#172e28" } }}>
              Manage order tracking
            </Button> : null}
            {authorized ? <Button component={Link} href="/admin/commissions" variant="outlined" sx={{ alignSelf: "flex-start", borderColor: "#203c35", color: "#203c35" }}>
              View marketplace commissions
            </Button> : null}

            {authorized ? <Card sx={{ borderRadius: 2.5, boxShadow: "0 12px 36px rgba(32, 60, 53, 0.08)", border: "1px solid #e2e7e1" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography component="h2" variant="h5" sx={{ color: "#203c35", fontWeight: 750 }}>
                      Vendor applications
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Review new shops before they can publish products.
                    </Typography>
                  </Box>
                  <Chip
                    label={`${vendors.filter((vendor) => vendor.status === "pending").length} awaiting review`}
                    sx={{ background: "#edf1e9", color: "#203c35", fontWeight: 650 }}
                  />
                </Stack>

                <Stack divider={<Box sx={{ borderBottom: "1px solid #e3e7e1" }} />}>
                  {vendors.length === 0 ? (
                    <Alert severity="info">No vendor applications yet.</Alert>
                  ) : vendors.map((vendor) => (
                    <Stack
                      key={vendor.id}
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "stretch", sm: "center" }}
                      spacing={1.5}
                      sx={{ py: 2 }}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography sx={{ color: "#203c35", fontWeight: 750 }}>{vendor.storeName}</Typography>
                          <Chip
                            size="small"
                            label={vendor.status}
                            color={vendor.status === "approved" ? "success" : vendor.status === "pending" ? "warning" : "default"}
                            sx={{ textTransform: "capitalize", fontWeight: 650 }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {vendor.fullName} · {vendor.email}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "block", color: "#738078", mt: 1 }}>
                          Applied {vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : "date unavailable"}
                        </Typography>
                      </Box>
                      <Button
                        disabled={updatingVendorId === vendor.id}
                        onClick={() => reviewVendor(vendor)}
                        variant={vendor.status === "approved" ? "outlined" : "contained"}
                        sx={vendor.status === "approved"
                          ? { borderColor: "#a94438", color: "#a94438", whiteSpace: "nowrap" }
                          : { background: "#203c35", color: "#fff", whiteSpace: "nowrap", "&:hover": { background: "#172e28" } }}
                      >
                        {updatingVendorId === vendor.id
                          ? "Saving..."
                          : vendor.status === "approved"
                            ? "Suspend shop"
                            : "Approve shop"}
                      </Button>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card> : null}

            {authorized ? <Card sx={{ borderRadius: 2.5, boxShadow: "0 10px 30px rgba(32, 60, 53, 0.06)", border: "1px solid #e2e7e1" }}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Typography component="h2" variant="h5" sx={{ mb: 2.5, color: "#203c35", fontWeight: 750 }}>Website activity feed</Typography>
                <Stack spacing={1.5}>
                  {activities.map((activity) => (
                    <Box key={activity.id} sx={{ p: 2, background: "#f7f8f5", borderRadius: 2, border: "1px solid #dfe4dc" }}>
                      <Typography variant="body2" sx={{ color: "#203c35", fontWeight: 750 }}>{activity.actor}</Typography>
                      <Typography variant="body2" sx={{ color: "#4c5853", mt: 0.5 }}>{activity.description}</Typography>
                      <Typography variant="caption" sx={{ display: "block", color: "#738078", mt: 1 }}>
                        {activity.type} • {new Date(activity.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card> : null}
          </Stack>
        </Container>
      </Box>
    </MainLayouts>
  );
}
