"use client";

import { useEffect } from "react";

type TawkApi = {
  customStyle?: {
    visibility: {
      desktop: { position: "br"; xOffset: number; yOffset: number };
      mobile: { position: "br"; xOffset: number; yOffset: number };
    };
  };
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
  }
}

type TawkLiveChatProps = {
  propertyId: string;
  widgetId: string;
};

export default function TawkLiveChat({ propertyId, widgetId }: TawkLiveChatProps) {
  useEffect(() => {
    if (!propertyId || !widgetId || document.getElementById("tawk-live-chat")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_API.customStyle = {
      visibility: {
        desktop: { position: "br", xOffset: 24, yOffset: 24 },
        mobile: { position: "br", xOffset: 24, yOffset: 100 },
      },
    };

    const script = document.createElement("script");
    script.id = "tawk-live-chat";
    script.src = `https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`;
    script.async = true;
    document.body.appendChild(script);
  }, [propertyId, widgetId]);

  return null;
}
