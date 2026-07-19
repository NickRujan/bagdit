import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "./globals.css";
import Effects from "./components/Effects";
import { SITE } from "../lib/config";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Bagdit — free experiences, paid in video",
    template: "%s · Bagdit",
  },
  description:
    "Local businesses trade free meals, stays, and activities + cash for short videos by real customers. Businesses only pay for videos they approve.",
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "Bagdit",
    type: "website",
    images: ["/og/og-home.png"],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Effects />
        {children}
      </body>
    </html>
  );
}
