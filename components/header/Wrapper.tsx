"use client";

import { ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import theme from "../../theme";

function Wrapper({ children, isResident }: any) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider />
      {children}
    </ThemeProvider>
  );
}
export default Wrapper;
