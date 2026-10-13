"use client";

import { ThemeProvider } from "@mui/material";
import { SnackbarProvider } from "notistack";
import MarketplaceChatWidget from "../MarketplaceChatWidget";
import TawkLiveChat from "../TawkLiveChat";
import theme from "../../theme";

const tawkPropertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const tawkWidgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

function Wrapper({ children, isResident }: any) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider />
      {children}
      {tawkPropertyId && tawkWidgetId ? (
        <TawkLiveChat propertyId={tawkPropertyId} widgetId={tawkWidgetId} />
      ) : (
        <MarketplaceChatWidget />
      )}
    </ThemeProvider>
  );
}
export default Wrapper;
