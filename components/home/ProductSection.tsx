import { Box, Button, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ProductComponent from "../ProductComponent";

function ProductSection({
  mobile,
  data,
  title,
  subtitle,
  showMore = true,
  link,
}: {
  mobile?: boolean;
  data: any[];
  title: string;
  subtitle: string;
  showMore?: boolean;
  link: string;
}) {
  const scrollRef: any = useRef(null);

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (scrollRef.current && data?.length > 6) {
        if (
          scrollRef.current.scrollLeft + scrollRef.current.clientWidth >=
          scrollRef.current.scrollWidth
        ) {
          scrollRef.current.scrollLeft = 0;
        } else {
          scrollRef.current.scrollBy({ left: 2, behavior: "smooth" });
        }
      }
    }, 10);

    return () => clearInterval(scrollInterval);
  }, []);
  return (
    <div
      style={{
        minHeight: "60vh",

        padding: mobile ? "60px 0px" : "30px   0px",
        color: "#000",
      }}
    >
      <div
        className="innersection"
        style={{
          // textAlign: "center",
          borderColor: "#ddd",
          borderWidth: 0.4,
          borderStyle: "solid",
          padding: 15,
        }}
      >
        <div>
          <div>
            {" "}
            <Typography variant="h5" fontWeight={600}>
              {title}
            </Typography>
            <Typography color={"gray"} fontWeight={200}>
              {subtitle}
            </Typography>
          </div>
        </div>
        <div>
          <Box
            sx={{
              marginTop: 2,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Grid container spacing={2}>
              {data?.map((cur: any, i) => (
                <Grid item md={3} xs={12} key={i} sm={12}>
                  <ProductComponent {...cur} />
                </Grid>
              ))}
            </Grid>
          </Box>
        </div>
        {showMore && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 15,
            }}
          >
            <Link href={link}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: "#000",
                  fontWeight: "Bold",
                  fontSize: 12,
                }}
              >
                VIEW ALL PRODUCTS
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSection;
