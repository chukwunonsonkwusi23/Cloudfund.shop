"use client";

import { Grid, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const data = [
  {
    name: "SUYA CHICKEN WINGS",
    imgSrc: "/images/Wings Suya.jpg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },

  {
    name: "EGUSI SOUP",
    imgSrc: "/images/Egusi.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
  {
    name: "BITTER LEAF SOUP",
    imgSrc: "/images/Bitterleaf soup.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
  {
    name: "SEAFOOD OKRA",
    imgSrc: "/images/image7.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
  {
    name: "FRIED RICE",
    imgSrc: "/images/image4.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
  {
    name: "EFO-RIRO",
    imgSrc: "/images/image5.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
  {
    name: "PEPPER SOUP",
    imgSrc: "/images/image6.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
  {
    name: "ZOBO (Hibiscus Tea)",
    imgSrc: "/images/Zobo.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
  {
    name: "ABACHA (African Salad)",
    imgSrc: "/images/African Salad.jpeg",
    link: "https://app.mulle.ee/qr/AuntyChy's-Menu/menu",
  },
];

const HeroSection = () => {
  const router = useRouter();
  return (
    <div
      className="innersection"
      style={{
        minHeight: "34vh",
        display: "flex",
        alignItems: "center",
        paddingTop: 80,
        paddingBottom: 60,
      }}
    >
      <Grid container spacing={2}>
        {data?.map((cur, i) => (
          <Grid item xs={4} md={1.3} key={i}>
            <div
              onClick={() => {
                router.push(cur.link);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              <img
                src={cur.imgSrc}
                style={{
                  height: 110,
                  width: 110,
                  // objectFit: "contain",
                  borderRadius: 120,
                  marginBottom: 8,
                }}
              />
              <Typography fontWeight={"700"} align="center">
                {cur.name}
              </Typography>
            </div>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default HeroSection;
