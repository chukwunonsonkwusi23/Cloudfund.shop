import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import NextLink from "next/link";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Shop products", href: "/marketplace" },
  { label: "Track an order", href: "/track-order" },
  { label: "Register your store", href: "/vendor/register" },
  { label: "Vendor login", href: "/vendor/login" },
];

export default function MarketplaceFooter() {
  return (
    <Box component="footer" sx={{ backgroundColor: "#fff", color: "#2d383d", borderTop: "1px solid #e5e9e7" }}>
      <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }}>
          <Grid item xs={12} md={6}>
            <NextLink href="/" aria-label="Cloudfund home" style={{ textDecoration: "none" }}>
              <Typography component="span" sx={{ color: "#27323a", fontSize: 30, fontWeight: 400, lineHeight: 1 }}>
                Cloudfund
              </Typography>
            </NextLink>
            <Typography variant="body2" sx={{ maxWidth: 500, mt: 2, color: "#687479", lineHeight: 1.8 }}>
              Discover products from independent shops, place orders in one marketplace, and follow your order online.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3} sx={{ textAlign: "left" }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: "#26343a", textAlign: "left", fontSize: 16 }}>
              Explore
            </Typography>
            <Box component="nav" aria-label="Footer navigation" sx={{ textAlign: "left" }}>
              {footerLinks.map((link) => (
                <Link
                  component={NextLink}
                  href={link.href}
                  key={link.label}
                  underline="hover"
                  color="inherit"
                  sx={{ display: "block", mb: 1.25, fontSize: "0.9rem", color: "#526067" }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: "#26343a", fontSize: 16 }}>
              For Vendors
            </Typography>
            <Link component={NextLink} href="/vendor/register" underline="hover" color="inherit" sx={{ display: "block", mb: 1.25, fontSize: "0.9rem", color: "#526067" }}>
              Register your store
            </Link>
            <Link component={NextLink} href="/vendor/login" underline="hover" color="inherit" sx={{ display: "block", mb: 1.25, fontSize: "0.9rem", color: "#526067" }}>
              Vendor dashboard access
            </Link>
          </Grid>
        </Grid>

        <Box
          sx={{
            mt: { xs: 4, md: 6 },
            pt: 3,
            borderTop: "1px solid #e5e9e7",
            display: { xs: "flex", sm: "flex-row" },
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            gap: 2,
            color: "#687479",
            fontSize: "0.8rem",
          }}
        >
          <Typography component="span">© {new Date().getFullYear()} Cloudfund. All rights reserved.</Typography>
          <Button component={NextLink} href="/vendor/register" variant="text" size="small" sx={{ color: "#078b68", px: 0, textTransform: "none", fontWeight: 700 }}>
            Register your store
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
