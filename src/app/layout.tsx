import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Splashscreen from "../../components/custom/SplashScreen";
import Wrapper from "../../components/header/Wrapper";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
import NextTopLoader from "nextjs-toploader";
export const metadata: Metadata = {
  title: "Cloudfund | Buy · Sell · Shop",
  description: "Discover, buy, and sell products from independent shops on Cloudfund.",
  icons: {
    apple: "/cloudfund.png",
  },
  openGraph: {
    title: "Cloudfund | Buy · Sell · Shop",
    description: "Discover, buy, and sell products from independent shops on Cloudfund.",
    images: ["/cloudfund.png"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${inter.variable}`}>
        <AppRouterCacheProvider>
          <Splashscreen>
            <NextTopLoader
              color="var(--primary)"
              initialPosition={0.08}
              crawlSpeed={200}
              height={6}
              crawl={true}
              // showSpinner={true}
              easing="ease"
              speed={200}
              shadow="0 0 10px #fff,0 0 5px var(--primary)"
            />
            <Wrapper>{children}</Wrapper>
          </Splashscreen>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
