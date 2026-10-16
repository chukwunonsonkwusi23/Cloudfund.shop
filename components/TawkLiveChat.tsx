"use client";

import Script from "next/script";

type TawkLiveChatProps = {
  propertyId: string;
  widgetId: string;
};

export default function TawkLiveChat({ propertyId, widgetId }: TawkLiveChatProps) {
  if (!propertyId || !widgetId) return null;

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.Tawk_API = window.Tawk_API || {}; window.Tawk_API.customStyle = { visibility: { desktop: { position: "br", xOffset: 24, yOffset: 24 }, mobile: { position: "br", xOffset: 16, yOffset: 122 } } };`,
        }}
      />
      <Script
        id="tawk-live-chat"
        src={`https://embed.tawk.to/${encodeURIComponent(propertyId)}/${encodeURIComponent(widgetId)}`}
        strategy="afterInteractive"
      />
    </>
  );
}
