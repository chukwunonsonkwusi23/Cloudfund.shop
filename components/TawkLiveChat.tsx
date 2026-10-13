"use client";

import { useEffect } from "react";

type TawkLiveChatProps = {
  propertyId: string;
  widgetId: string;
};

export default function TawkLiveChat({ propertyId, widgetId }: TawkLiveChatProps) {
  useEffect(() => {
    if (!propertyId || !widgetId) return;

    // Shift the launcher left so it does not cover the fixed shopping bag button.
    const tawkWindow = window as typeof window & {
      Tawk_API?: {
        customStyle?: {
          visibility: {
            desktop: { position: string; xOffset: number; yOffset: number };
            mobile: { position: string; xOffset: number; yOffset: number };
          };
        };
      };
      Tawk_LoadStart?: Date;
    };

    tawkWindow.Tawk_API = tawkWindow.Tawk_API || {};
    tawkWindow.Tawk_API.customStyle = {
      visibility: {
        desktop: { position: "br", xOffset: 72, yOffset: 0 },
        mobile: { position: "br", xOffset: 72, yOffset: 0 },
      },
    };
    tawkWindow.Tawk_LoadStart = new Date();

    if (document.getElementById("tawk-live-chat")) return;

    const script = document.createElement("script");
    script.id = "tawk-live-chat";
    script.async = true;
    script.src = `https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.head.appendChild(script);
  }, [propertyId, widgetId]);

  return null;
}
