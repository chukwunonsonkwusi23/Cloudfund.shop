import MenuIcon from "@mui/icons-material/Menu";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
  Breadcrumbs,
  Drawer,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Typography,
} from "@mui/material";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { database } from "../firebase";
import { useIsMobile } from "../hooks/useIsMobile";
import ProductComponent2 from "./ProductComponent2";

function MenuContent() {
  const [data, setData] = useState([]);
  const [sort, setSort] = useState("All");
  const [sortedData, setSortedData] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadData = () => {
    get(ref(database, "product/"))
      .then((res) => {
        const products = res.val();
        if (!products) {
          setData([]);
          return;
        }

        const data = Object.keys(products);

        console.log(data);
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

  const [tab, setTab] = useState("Auntychy's Special Suya Spices");

  const filterData = () => {
    const res = data?.filter(
      (cur: { category: string; menu: string }) => cur.menu === tab
    );
    setSortedData(res);
  };

  useEffect(() => {
    filterData();
  }, [tab, data]);

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
      style={{ color: "#F57F17" }}
      underline="hover"
      color="inherit"
      href="/material-ui/getting-started/installation/"
    >
      Menu
    </Link>,
  ];

  const menuItems = [
    "Auntychy's Special Suya Spices",
    "Auntychy's Rice Dishes",
    "Auntychy's Main Soups",
    "Auntychy's Specials",
    "Add-ons",
    "Drinks",
    "Bulk Orders I",
    "Bulk Orders II",
    "Bulk Order III",
  ];

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open);
  };

  return (
    <div style={{ minHeight: "100vh", padding: mobile ? "0px" : "30px 0px" }}>
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
              Menu
            </Typography>
            {mobile && (
              <IconButton
                onClick={toggleDrawer(true)}
                edge="start"
                color="inherit"
                aria-label="menu"
              >
                <MenuIcon />
              </IconButton>
            )}
          </div>
        </div>
      </div>

      <div className="innersection" style={{ marginTop: 80 }}>
        <Grid container spacing={1}>
          {/* Mobile Drawer */}
          {mobile ? (
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              <div style={{ width: 300, padding: "20px", marginTop: 80 }}>
                {menuItems.map((cur, i) => (
                  <MenuItem
                    onClick={() => {
                      setTab(cur);
                      setDrawerOpen(false);
                    }}
                    key={i}
                    sx={{
                      ":hover": { background: "var(--primary)" },
                      borderRadius: 2,
                      background: cur === tab ? "var(--primary)" : "",
                      color: cur === tab ? "#fff" : "#000",
                      marginBottom: 1,
                    }}
                    value={cur}
                  >
                    {cur}
                  </MenuItem>
                ))}
              </div>
            </Drawer>
          ) : (
            // Desktop View
            <Grid item xs={12} sm={12} md={4}>
              {menuItems.map((cur, i) => (
                <MenuItem
                  onClick={() => setTab(cur)}
                  key={i}
                  sx={{
                    ":hover": { background: "var(--primary)" },
                    borderRadius: 2,
                    background: cur === tab ? "var(--primary)" : "",
                    color: cur === tab ? "#fff" : "#000",
                    marginBottom: 1,
                  }}
                  value={cur}
                >
                  {cur}
                </MenuItem>
              ))}
            </Grid>
          )}

          <Grid item xs={12} sm={12} md={8}>
            <div>
              <Grid container spacing={2}>
                {sortedData?.length > 0 ? (
                  sortedData?.find((cur: any) => cur.category === "Menu") && (
                    <>
                      {[...sortedData]?.map((cur: any, i) => (
                        <Grid item md={6} xs={12} sm={12} key={i}>
                          <ProductComponent2 {...cur} />
                        </Grid>
                      ))}
                    </>
                  )
                ) : (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                      padding: 15,
                    }}
                  >
                    <Typography>No Product Found</Typography>
                  </div>
                )}
              </Grid>
            </div>
          </Grid>
        </Grid>
      </div>
    </div>
  );
}

export default MenuContent;
