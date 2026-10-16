import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Container, Grid, Typography } from "@mui/material";
import Link from "next/link";

const shoppingSteps = [
  {
    number: "01",
    title: "Explore approved shops",
    description: "Browse products from shops approved to sell on Cloudfund, and compare items across the marketplace.",
  },
  {
    number: "02",
    title: "Check out in one place",
    description: "Add products to your bag and provide your delivery details when you are ready to order.",
  },
  {
    number: "03",
    title: "Follow your order",
    description: "After checkout, use Track an order with your order reference and email to see the latest status.",
  },
];

export default function ValueProposition() {
  return (
    <>
      <Box component="section" aria-labelledby="shopping-guide-title" sx={{ borderTop: "1px solid #e4e9e6", backgroundColor: "#fff" }}>
        <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
          <Box sx={{ maxWidth: 680, mb: 4 }}>
            <Typography component="p" variant="overline" sx={{ color: "#078b68", fontWeight: 700, letterSpacing: 1.5, mb: 1 }}>
              Shopping on Cloudfund
            </Typography>
            <Typography id="shopping-guide-title" component="h2" sx={{ color: "#26343a", fontSize: { xs: 32, md: 42 }, lineHeight: 1.15, fontWeight: 500, mb: 2 }}>
              A simpler way to shop independent.
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {shoppingSteps.map((step) => (
              <Grid item xs={12} md={4} key={step.number}>
                <Box component="article" sx={{ height: "100%", p: { xs: 2.5, md: 3 }, border: "1px solid #e5ebe8", borderRadius: 2, backgroundColor: "#f8faf8" }}>
                  <Typography sx={{ color: "#078b68", fontSize: 13, fontWeight: 800, letterSpacing: 1.2, mb: 2 }}>{step.number}</Typography>
                  <Typography component="h3" sx={{ color: "#26343a", fontSize: 21, fontWeight: 700, mb: 1 }}>{step.title}</Typography>
                  <Typography sx={{ color: "#5e696d", fontSize: 15, lineHeight: 1.75 }}>{step.description}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button component={Link} href="/track-order" endIcon={<ArrowForwardIcon />} sx={{ mt: 3, color: "#078b68", fontWeight: 700, textTransform: "none" }}>
            Track an order
          </Button>
        </Container>
      </Box>

      <Box component="section" sx={{ backgroundColor: "#f3f6f4", textAlign: "center" }}>
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 6 } }}>
          <Typography component="h2" sx={{ color: "#26343a", fontSize: { xs: 30, md: 38 }, lineHeight: 1.2, fontWeight: 500, mb: 1.5 }}>
            Have a shop to share?
          </Typography>
          <Typography sx={{ color: "#687479", fontSize: 16, lineHeight: 1.7, mb: 3 }}>
            Apply to bring your products to Cloudfund shoppers.
          </Typography>
          <Button component={Link} href="/vendor/register" variant="contained" sx={{ px: 3.5, py: 1.3, borderRadius: 20, backgroundColor: "#00a57a", textTransform: "none", fontSize: 16, boxShadow: "none", "&:hover": { backgroundColor: "#008d68", boxShadow: "none" } }}>
            Register your store
          </Button>
        </Container>
      </Box>
    </>
  );
}
