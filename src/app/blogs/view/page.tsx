"use client";

import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { Box, ButtonBase, Divider, Grid, Typography } from "@mui/material";
import { get, ref } from "firebase/database";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Wrapper from "../../../../components/custom/Wrapper";
import { database } from "../../../../firebase";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import MainLayouts from "../../../../layouts/MainLayouts";

interface STATEPROPS {
  tags: [];
  title: string;
  description: string | any;
  date: string | undefined | any;
  img: string;
}

type Props = {
  params: string | undefined | any;
  searchParams: { [key: string]: string | string[] | undefined };
};

// export async function generateMetadata(
//   params: any,
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   // read route params
//   const id = params;
//   console.log(id, "id");
//   // fetch data   const res = (await client.get(`/news/${id}`)).data

//   const res = await fetch(
//     `https://minofempbackend.onrender.com/api/news/${id}}`
//   ).then((res) => res.json());

//   return {
//     title: res.data?.News[0]?.title,
//     openGraph: {
//       images: ["/public/news.png", res.data?.News[0]?.img[0]],
//     },
//   };
// }

function Page() {
  const mobile = useIsMobile();
  const router = useRouter();
  const query = useSearchParams();
  const id = query.get("id");

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const [loading, setLoading] = useState(false);
  const [singleNews, setSingleNews] = useState<STATEPROPS>();
  const [data, setDate] = useState<any>();
  const loadData = () => {
    setLoading(true);
    get(ref(database, "blogs/" + id))
      .then((res) => {
        const data = res.val();
        setDate(data);
      })
      .catch((error: any) => {
        console.error("Error fetching data:", error);
      });
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);
  return (
    <MainLayouts mobile={mobile}>
      <section
        style={{
          paddingTop: 160,
          background: "#f7f7f7",
          color: "#000",
        }}
      >
        <div className="innersection">
          <Box>
            <Grid container spacing={{ xs: 2, md: 10 }}>
              <Grid item xs={12} md={3}>
                <Box
                  sx={{
                    display: { xs: "flex", md: "block" },
                    justifyContent: { xs: "space-between" },
                    flexDirection: { xs: "row", md: "column" },
                    alignItems: { xs: "center" },
                  }}
                >
                  <div>
                    <Wrapper mb={10} ai="center" gap={5}>
                      <Typography fontWeight={600}>TAGS</Typography>
                    </Wrapper>
                    <Divider
                      style={{
                        background: "#204392",
                        marginBottom: 13,
                        width: "100%",
                      }}
                    />
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                      }}
                    >
                      <div
                        style={{
                          padding: 1,
                          paddingLeft: 10,
                          paddingRight: 10,
                          background: "#d7d7d7",
                          paddingTop: 3,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginBottom: 10,
                        }}
                      >
                        <Typography>{data?.type}</Typography>
                      </div>
                    </div>
                    <Divider
                      style={{
                        background: "#204392",
                        marginBottom: 13,
                        marginTop: 20,
                        width: "100%",
                      }}
                    />
                    <ButtonBase
                      onClick={() => {
                        router.back();
                      }}
                    >
                      <Wrapper ai="center">
                        <ArrowBackIosIcon
                          style={{
                            fontSize: 18,
                            color: "#059244",
                            marginBottom: 5,
                          }}
                        />
                        <Typography>Back to Blogs</Typography>
                      </Wrapper>
                    </ButtonBase>
                  </div>
                </Box>
              </Grid>
              <Grid item xs={12} md={9}>
                <Box
                  sx={{
                    paddingLeft: { md: 15 },
                    marginBottom: 30,
                  }}
                >
                  <header>
                    <Typography mb={1.5} variant="h5">
                      {singleNews?.title}
                    </Typography>
                    <Typography mb={2}>
                      Published:{" "}
                      {new Date(data?.createdAt).toLocaleDateString()}
                    </Typography>
                  </header>
                  <div style={{ marginBottom: 50 }}>
                    <img
                      src={data?.img}
                      onClick={() => handleClickOpen()}
                      style={{
                        height: mobile ? 300 : 500,
                        width: "100%",
                        objectFit: "cover",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: data?.description }}
                    style={{ fontSize: 18 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </div>
      </section>
    </MainLayouts>
  );
}

export default Page;
