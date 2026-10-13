"use client";
import Menu from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Slide,
  SwipeableDrawer,
  Toolbar,
  useScrollTrigger,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cloneElement, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Heade.module.css";

function HideOnScroll(props: any) {
  const { children } = props;

  const trigger = useScrollTrigger({});

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}

interface Props {
  watchScroll?: boolean;
}

function Header({ watchScroll }: Props) {
  const route = usePathname();

  const routes = [
    {
      href: "/",
      label: "Home",
      active: route === "/",
    },
    {
      href: "/marketplace",
      label: "Shop",
      active: route.startsWith("/marketplace"),
    },
    {
      href: "/track-order",
      label: "Track order",
      active: route.startsWith("/track-order"),
    },
    {
      href: "/vendor/login",
      label: "Vendor Login",
      active: route.startsWith("/vendor/login"),
    },
  ];

  function ElevationScroll(props: any) {
    const { children } = props;
    const trigger = useScrollTrigger({
      disableHysteresis: true,
      threshold: 100,
    });
    return cloneElement(
      children,

      watchScroll
        ? {
            className: [styles.toolbar, trigger ? styles.scrolled : ""].join(
              " "
            ),
          }
        : {
            className: [
              styles.toolbar,
              trigger ? styles.scrolled : "",
              styles.noScroll,
            ].join(" "),
          }
    );
  }

  const [showDrawer, setShowDrawer] = useState(false);
  const [open, setOpen] = useState(false);
  return (
    <Box className={styles.root}>
      <HideOnScroll>
        <AppBar
          position="relative"
          color="inherit"
          elevation={0}
          className={styles.appBar}
          sx={{ backgroundColor: "#fff", borderBottom: "1px solid #e8ece9" }}
        >
          <ToastContainer />
          <ElevationScroll>
            <Toolbar>
              <Box
                display={"flex"}
                className="section-inner"
                flex={1}
                p={{ xs: 1, md: 2 }}
                alignItems={"center"}
              >
                <Link href="/" className={styles.brand} aria-label="Cloudfund home">
                  <Box component="span" sx={{ color: "#27323a", fontSize: 30, fontWeight: 400, lineHeight: 1, letterSpacing: 0 }}>
                    Cloudfund
                  </Box>
                </Link>
                <SwipeableDrawer
                  anchor={"top"}
                  open={showDrawer}
                  onClose={() => setShowDrawer(false)}
                  onOpen={() => setShowDrawer(true)}
                >
                  <List
                    style={{
                      marginTop: 80,
                    }}
                    onClick={() => setShowDrawer(false)}
                    onKeyDown={() => setShowDrawer(false)}
                  >
                    {routes.map((cur) => (
                      <Link href={cur.href!} key={cur.label}>
                        <ListItem
                          sx={{
                            background: cur.active ? "#1D4C14" : "#fff",
                          }}
                        >
                          <ListItemButton>
                            <span
                              style={{
                                fontWeight: 500,
                                color: !cur.active ? "#1D4C14" : "#fff",
                              }}
                            >
                              {cur.label?.toUpperCase()}
                            </span>
                          </ListItemButton>
                        </ListItem>
                      </Link>
                    ))}
                  </List>
                  <Box p={1}>
                    <Button
                      component={Link}
                      href="/marketplace"
                      variant="contained"
                      fullWidth
                      onClick={() => setShowDrawer(false)}
                      sx={{ background: "#203c35", py: 1.25 }}
                    >
                      Open your shop
                    </Button>
                  </Box>
                </SwipeableDrawer>

                <Box sx={{ display: { xs: "none", md: "flex" } }}>
                  <nav className={styles.nav} aria-label="Main navigation">
                    {routes.map((cur) => (
                      <Link
                        style={{ fontWeight: 500 }}
                        key={cur.label}
                        href={cur.href!}
                        className={[
                          styles.item,
                          cur.active ? styles.active : "",
                        ].join(" ")}
                      >
                        {cur.label?.toUpperCase()}
                      </Link>
                    ))}
                  </nav>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                  <Link href="/vendor/register">
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        borderRadius: 20,
                        px: 2.5,
                        py: 1,
                        background: "#00a57a",
                        color: "#ffffff",
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "none",
                        "&:hover": { background: "#008d68", boxShadow: "none" },
                      }}
                    >
                      Shop now
                    </Button>
                  </Link>
                </Box>
                <Box sx={{ display: { xs: "inline-flex", md: "none" } }}>
                  <IconButton onClick={() => setShowDrawer(true)}>
                    <Menu fontSize="large" />
                  </IconButton>
                </Box>
              </Box>
            </Toolbar>
          </ElevationScroll>
        </AppBar>
      </HideOnScroll>
    </Box>
  );
}

export default Header;
