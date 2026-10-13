"use client";

import Script from "next/script";

type TawkLiveChatProps = {
  propertyId: string;
  widgetId: string;
};

export default function TawkLiveChat({ propertyId, widgetId }: TawkLiveChatProps) {
  if (!propertyId || !widgetId) return null;

  return (
    <Script
      id="tawk-live-chat"
      src={`https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`}
      strategy="afterInteractive"
    />
  );
}
