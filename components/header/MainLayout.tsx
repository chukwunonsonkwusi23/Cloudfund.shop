import LockIcon from "@/components/icon/lock.svg";

import { ChevronRight, ExpandMore, Menu } from "@mui/icons-material";
import {
  Avatar,
  Box,
  GlobalStyles,
  Grow,
  Hidden,
  IconButton,
  LinearProgress,
  ListItemButton,
  Popper,
  Typography,
} from "@mui/material";
import { FC, ReactNode, useState } from "react";

interface Props {
  loading?: boolean;
  children: ReactNode;
  title: string;
  icon: ReactNode;
}

const styles = (
  <GlobalStyles
    styles={{
      ".header": {
        display: "flex",
        padding: "15px 3vw",
        alignItems: "center",
        background: "#fff",
        borderBottom: "1px solid #eee",
      },
      ".layout-spinner": {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 10vw",
        flex: 1,
      },
      ".content": {
        padding: "25px 3vw",
        position: "relative",
      },
    }}
  />
);

const MainLayout: FC<Props> = ({
  children,
  icon,
  title = "Untitled",
  loading,
}) => {
  const [focused, setFocused] = useState(false);

  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [showChangePAssword, setShowChangePAssword] = useState(false);

  return (
    <>
      {styles}

      <div className="header">
        <Hidden mdUp implementation="css">
          <IconButton onClick={() => {}}>
            <Menu />
          </IconButton>
        </Hidden>
        {icon}
        <Typography ml={1} variant="h6" fontWeight={400} color={"#101928"}>
          {title}
        </Typography>
        {loading && (
          <div className="layout-spinner">
            <Typography variant="body2" color="#aaa" mb={1}>
              Loading content...
            </Typography>
            <LinearProgress variant="indeterminate" sx={{ width: "100%" }} />
          </div>
        )}
        <Box
          ml="auto"
          className="flex"
          onMouseEnter={(e) => {
            setAnchor(e.currentTarget);
            setFocused(true);
          }}
          onMouseLeave={() => {
            setAnchor(null);
            setFocused(false);
          }}
        >
          <Avatar alt="" sx={{ background: "var(--primary)" }} />

          <ExpandMore sx={{ fontSize: 36, color: "var(--grey)" }} />
        </Box>
      </div>

      <Popper
        open={focused}
        anchorEl={anchor}
        placement="bottom-start"
        transition
        onMouseEnter={() => setFocused(true)}
        onMouseLeave={() => setFocused(false)}
        sx={{ zIndex: 1200 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Box>
              <Box
                height={20}
                width={20}
                marginLeft={28}
                bgcolor={"#fff"}
                sx={{
                  clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
                }}
              />
              <Box
                bgcolor={"#fff"}
                px={3}
                py={2}
                className="shadow"
                borderRadius={2}
              >
                <Typography className="text" fontWeight={200} mb={1}>
                  Account settings
                </Typography>

                <ListItemButton
                  sx={{ px: 0 }}
                  onClick={() => setShowChangePAssword(true)}
                >
                  <LockIcon height={40} width={40} />
                  <Typography ml={2} mr={3}>
                    Change Password
                  </Typography>
                  <ChevronRight />
                </ListItemButton>
              </Box>
            </Box>
          </Grow>
        )}
      </Popper>

      <div className="content">
        <div className="section-inner">{children}</div>
      </div>
    </>
  );
};
export default MainLayout;
