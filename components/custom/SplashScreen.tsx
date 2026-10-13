"use client";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

function Splashscreen({ children }: any) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShow(false);
    }, 900);
  }, []);
  return show ? (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        background: "#203c35",
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        color: "#d9ef78",
        position: "fixed",
        top: 0,
      }}
    >
      <Box
        component="img"
        src="/cloudfund.png"
        alt="Cloudfund Inc."
        sx={{ width: "min(64vw, 220px)", height: "auto" }}
      />
    </Box>
  ) : (
    <>{children}</>
  );
}

export default Splashscreen;
