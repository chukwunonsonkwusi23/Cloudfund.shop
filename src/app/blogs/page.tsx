"use client";

import { Box, Grid, Typography } from "@mui/material";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import BlogComponent from "../../../components/Blogs/BlogsComponent";
import { database } from "../../../firebase";
import { useIsMobile } from "../../../hooks/useIsMobile";
import MainLayouts from "../../../layouts/MainLayouts";

function Page() {
  const mobile = useIsMobile();
  const [data, setData] = useState<any[]>([]);
  const loadData = () => {
    get(ref(database, "blogs/")).then((res) => {
      const blogs = res.val();
      if (!blogs) {
        setData([]);
        return;
      }

      const array = Object.keys(blogs).map((cur) => {
        return { ...blogs[cur], id: cur };
      });
      setData(array);
    });
  };
  useEffect(() => {
    loadData();
  }, []);
  return (
    <MainLayouts mobile={mobile}>
      <section
        style={{
          background: "#D3D3D3",
          color: "#000",
          padding: mobile ? "60px 0px" : "130px 0px",
        }}
      >
        <div className="innersection">
          <header
            style={{ color: "#000", minHeight: mobile ? "100%" : "50vh" }}
          >
            <Grid container spacing={6}>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    // paddingLeft: { xs: 0, md: 15 },
                    padding: { xs: "100px 0px" },
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    height: "100%",
                  }}
                >
                  <Typography lineHeight={2} variant="h4">
                    {" "}
                    Blogs
                  </Typography>
                  {/* <h1 style={{ fontSize: 40, fontWeight: 600 }}></h1> */}
                  <Typography style={{ fontSize: 23 }}>
                    {
                      "   Keep up to date with Blogs and update in and around the Aunty chy`s food community Creation & Food Enviroment"
                    }
                  </Typography>
                </Box>
              </Grid>
              {!mobile && (
                <Grid item xs={12} md={6}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <img
                      src={"/img/home-bg.jpg"}
                      alt="banner image"
                      style={{
                        height: 300,

                        // objectFit: "contain",
                        borderTopRightRadius: 100,
                        borderBottomLeftRadius: 100,
                      }}
                    />
                  </div>
                </Grid>
              )}
            </Grid>
          </header>
          <Box
            sx={{
              color: "#fff",
              minHeight: "40vh",

              marginTop: 5,
            }}
          >
            <Grid container spacing={2}>
              {data?.map((cur, index) => (
                <Grid item xs={12} md={3} key={index}>
                  <BlogComponent {...cur} />
                </Grid>
              ))}
            </Grid>
            {/* <NewsComponent newss={newss} is_loading={is_loading} /> */}
          </Box>
        </div>
      </section>
    </MainLayouts>
  );
}

export default Page;
