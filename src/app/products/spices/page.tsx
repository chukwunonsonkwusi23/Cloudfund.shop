"use client";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import ProductSection from "../../../../components/home/ProductSection";
import Header from "../../../../components/navs/Header";
import { database } from "../../../../firebase";
import { useIsMobile } from "../../../../hooks/useIsMobile";

function Page() {
  const [data, setData] = useState([]);
  const [sort, setSort] = useState("All");
  const [sortedData, setSortedData] = useState([]);

  const loadData = () => {
    get(ref(database, "product/"))
      .then((res) => {
        const products = res.val();
        if (!products) {
          setData([]);
          return;
        }

        const data = Object.keys(products);

        const array: any = data?.map((cur) => {
          return {
            ...products[cur],
            id: cur,
          };
        });

        setData(array);
      })
      .catch((error: any) => {
        alert(error);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const filterData = () => {
    if (sort === "All") {
      setSortedData(data);
    } else {
      const res = data?.filter((cur: { category: string }) =>
        cur.category?.toLowerCase().includes(sort?.toLowerCase())
      );
      setSortedData(res);
    }
  };

  useEffect(() => {
    filterData();
  }, [sort, data]);

  const mobile = useIsMobile();

  const breadcrumbs = [
    <Link
      key={0}
      style={{ color: "#000" }}
      underline="hover"
      color="inherit"
      href="/"
    >
      Home
    </Link>,
    <Link
      key={1}
      style={{ color: "#000" }}
      underline="hover"
      color="inherit"
      href="/products"
    >
      Products
    </Link>,
    <Link
      key={1}
      style={{ color: "#F57F17" }}
      underline="hover"
      color="inherit"
      // href="/material-ui/getting-started/installation/"
    >
      Spices
    </Link>,
  ];

  return (
    <div>
      <Header />
      <div style={{ minHeight: "100vh", padding: "30px 0px", marginTop: 180 }}>
        <div className="innersection">
          <div style={{ marginBottom: 50 }}>
            <Breadcrumbs
              separator={
                <NavigateNextIcon style={{ color: "#000" }} fontSize="small" />
              }
              aria-label="breadcrumb"
            >
              {breadcrumbs}
            </Breadcrumbs>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginTop: 25,
                justifyContent: "space-between",
              }}
            >
              <Typography fontWeight={600} variant="h4">
                Spices
              </Typography>
            </div>
          </div>
        </div>

        <div>
          {sortedData?.find((cur: any) => cur.category === "Spices") && (
            <ProductSection
              link=""
              mobile={mobile}
              data={sortedData?.filter(
                (item: { category: string; foodType: string }) =>
                  item.category === "Spices"
              )}
              showMore={false}
              title="Spices"
              subtitle="Your best choice"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
