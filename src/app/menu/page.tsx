"use client";
import { Link } from "@mui/material";
import ShopContent from "../../../components/ShopContent";
import MainLayouts from "../../../layouts/MainLayouts";
import MenuContent from "../../../components/MenuContent";

function Shop() {
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
        color: "#F57F17",
      }}
      underline="hover"
      key={1}
      color="inherit"
      href="/material-ui/getting-started/installation/"
    >
      Shop
    </Link>,
  ];
  return (
    <MainLayouts>
      <div
        style={{
          position: "relative",
        }}
      >
        <div
          style={{
            marginTop: 140,
          }}
        ></div>
        {/* <Header title="Shop" breadcrumbs={breadcrumbs} /> */}
        <MenuContent />
      </div>
    </MainLayouts>
  );
}
export default Shop;
