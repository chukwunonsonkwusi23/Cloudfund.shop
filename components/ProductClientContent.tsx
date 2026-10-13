"use client";
import { Link } from "@mui/material";
import MainLayouts from "../layouts/MainLayouts";
import ProductContent from "./ProductContent";

function ProductClientContent({ data }: { data: any }) {
  const breadcrumbs = [
    <Link
      key={0}
      style={{
        color: "#fff",
      }}
      underline="hover"
      color="inherit"
      href="/"
    >
      Home
    </Link>,
    <Link
      style={{
        color: "#Fff",
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
      href="/material-ui/getting-started/installation/"
    >
      {data?.title}
    </Link>,
  ];
  return (
    <MainLayouts>
      {" "}
      <div
        style={{
          position: "relative",
        }}
      >
        {/* <Header title="Food Details" breadcrumbs={breadcrumbs} /> */}
        <ProductContent data={data} />
        {/* <RelatedProducts /> */}
      </div>
    </MainLayouts>
  );
}
export default ProductClientContent;
