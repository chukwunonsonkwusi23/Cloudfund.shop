"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-inter), "Inter", Arial, sans-serif',
    fontWeightRegular: 400,
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 5,
          padding: 0,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          paddingTop: 40,
        },
      },
      defaultProps: {
        fontWeight: 700,
      },
    },
    // MuiTypography: {
    //   styleOverrides: {
    //     fontFamily: "revert-layer",
    //   },
    // },

    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          "&:hover": {
            color: "gray",
          },
        },
        contained: {
          textTransform: "capitalize",
        },
        outlined: {
          textTransform: "capitalize",
          color: "#000",
          fontWeight: 300,
          fontSize: 13,
        },

        text: {
          textTransform: "capitalize",
          color: "#000",
          fontWeight: 300,
          fontSize: 13,
        },
      },
    },
  },

  palette: {
    mode: "light",
    primary: {
      main: "#203c35",
      contrastText: "#fff",
    },

    secondary: {
      main: "#d9ef78",
      contrastText: "#203c35",
    },
  },
});

export default theme;
