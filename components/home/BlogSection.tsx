"use client";

import FastfoodIcon from "@mui/icons-material/Fastfood"; // Import the food icon
import { Button, Grid, Typography } from "@mui/material";
import { get, ref } from "firebase/database";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { database } from "../../firebase";
import BlogComponent from "../Blogs/BlogsComponent";

function BlogSection({ mobile }: { mobile?: boolean }) {
  const scrollRef: any = useRef(null);
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
  useEffect(() => {
    const scrollInterval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 2, behavior: "smooth" });
      }
    }, 50);

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div
      style={{
        // minHeight: "60vh",
        background: "#f0f0f0",
        padding: mobile ? "60px 0px" : "40px 0px",
        color: "#000",
      }}
    >
      <div className="innersection">
        <Typography
          variant="h5"
          fontWeight={750}
          style={{
            color: "#873e36",
            marginBottom: 15,
            display: "flex",
            alignItems: "center",
          }} // Align text and icon vertically
        >
          <FastfoodIcon
            style={{ fontSize: 30, marginRight: 8, color: "#873e36" }} // Style the icon
          />
          LATEST BLOGS
        </Typography>
        <Grid container spacing={2}>
          {[...data]?.splice(0, 4)?.map((cur, index) => (
            <Grid item xs={12} md={3} key={index}>
              <BlogComponent {...cur} />
            </Grid>
          ))}
        </Grid>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",

            marginTop: 10,
          }}
        >
          <Link
            href={"/blogs"}
            style={{
              textDecoration: "none",
            }}
          >
            {" "}
            <Button
              variant="outlined"
              size="large"
              sx={{
                color: "#000",
                // borderRadius: 5,

                fontWeight: "750",
                fontSize: 12,
              }}
            >
              VIEW ALL
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BlogSection;
