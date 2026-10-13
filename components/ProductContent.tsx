"use client";
import {
  Facebook,
  Instagram,
  Star,
  Twitter,
  WhatsApp,
} from "@mui/icons-material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Box,
  Breadcrumbs,
  Button,
  Divider,
  Grid,
  Link,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useIsMobile } from "../hooks/useIsMobile";
import { currencyFormatter } from "../utility";
import Wrapper from "./Wrapper";

function ProductContent({ data }: { data?: any }) {
  const mobile = useIsMobile();
  const [value, setValue] = React.useState<number | null>(2);
  const [quantity, setQauntity] = useState(1);

  const [formData, setFormData] = useState<any>({ rating: "", content: "" });
  const loading = !data;
  const router = useRouter();
  const [showMore, setShowMore] = useState(3);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="w-full max-w-3xl animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-neutral-200" />
          <div className="h-12 w-full rounded bg-neutral-200" />
          <div className="grid grid-cols-2 gap-6">
            <div className="aspect-square rounded bg-neutral-200" />
            <div className="space-y-4 rounded bg-neutral-100 p-6">
              <div className="h-5 w-3/4 rounded bg-neutral-200" />
              <div className="h-4 w-full rounded bg-neutral-200" />
              <div className="h-4 w-2/3 rounded bg-neutral-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    <Link
      key={0}
      style={{
        color: "#000",
      }}
      underline="hover"
      color="inherit"
      href="/"
    >
      Home
    </Link>,
    <Link
      style={{
        color: "#000",
      }}
      underline="hover"
      key={1}
      color="inherit"
      href="/shop"
    >
      Shop
    </Link>,
    <Link
      style={{
        color: "#F57F17",
      }}
      underline="hover"
      key={1}
      color="inherit"
      href=""
    >
      {data?.name}
    </Link>,
  ];
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        px: { xs: 1.5, sm: 2, md: 3 },
        py: { xs: 2.5, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 900, mx: "auto" }}>
        <Box>
          <Breadcrumbs
            separator={
              <NavigateNextIcon
                style={{
                  color: "#000",
                }}
                fontSize="small"
              />
            }
            aria-label="breadcrumb"
          >
            {breadcrumbs}
          </Breadcrumbs>
        </Box>
        <Box sx={{ mt: { xs: 2.5, md: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={data?.img ?? "/img/image.png"}
                alt={data?.title ?? "Product image"}
                sx={{
                  display: "block",
                  width: "100%",
                  height: { xs: 220, sm: 260, md: 340 },
                  maxHeight: 340,
                  objectFit: "cover",
                  borderRadius: 1.5,
                  backgroundColor: "#eef0ed",
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ px: { xs: 0, md: 0.5 }, py: { xs: 0, md: 0.5 } }}>
                <Typography variant="h6" fontWeight={"600"}>
                  {data?.title}
                </Typography>
                <div
                  style={{
                    marginTop: 8,
                  }}
                >
                  {new Array(5).fill(undefined).map((item, index) => (
                    <Star
                      key={index}
                      style={{
                        fontSize: 22,
                        color: "#f90",
                      }}
                    />
                  ))}
                </div>
                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  <Divider />
                  <Typography mt={1.5}>
                    Categories:{" "}
                    <span
                      style={{
                        fontWeight: "600",
                      }}
                    >
                      {data?.category?.toUpperCase()}
                    </span>
                  </Typography>
                  <Wrapper ai="center" gap={5} mt={3} mb={2}>
                    <Typography variant="body2">Visit our social page:</Typography>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                      }}
                    >
                      <Instagram
                        style={{
                          fontSize: 18,
                        }}
                      />
                      <WhatsApp
                        style={{
                          fontSize: 18,
                        }}
                      />
                      <Facebook
                        style={{
                          fontSize: 18,
                        }}
                      />
                      <Twitter
                        style={{
                          fontSize: 18,
                        }}
                      />
                    </div>
                  </Wrapper>
                  <Divider />
                  <Typography mt={2} mb={2} variant="body2">
                    Price(incl. of all taxes)
                  </Typography>
                  <Typography
                    mb={2}
                    variant="h5"
                    fontWeight={"600"}
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    {currencyFormatter(Number(data?.price ?? 0), {
                      currency: data?.currency ?? "NGN",
                    })}
                  </Typography>
                  <Wrapper
                    ai="center"
                    // jc="space-between"
                    fw="wrap"
                    gap={mobile ? 15 : 30}
                    mt={30}
                    mb={30}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <a href={`https://${data?.product_url ?? ""}`} target="_blank" rel="noreferrer">
                        <Button
                          variant="contained"
                          size="large"
                          style={{
                            background: "black",
                            color: "#fff",
                            padding: "12px 30px",
                          }}
                        >
                          Buy Now
                        </Button>
                      </a>
                    </div>

                    <Button
                      size="large"
                      onClick={() => {
                        // handleAddToCart();
                      }}
                      variant="outlined"
                      style={{
                        // borderRadius: 30,
                        padding: "12px 40px",
                      }}
                    >
                      Call For Order
                    </Button>
                  </Wrapper>
                  <Divider />
                  <Typography mt={3}>
                    Free global shipping on all orders
                  </Typography>
                  <Typography>Guaranteed Safe Checkout:</Typography>
                </div>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box sx={{ mt: { xs: 5, md: 8 } }}>
          <Typography mb={3} variant="h6" fontWeight={"600"}>
            Description
          </Typography>
          <Typography>{data?.description}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
export default ProductContent;
