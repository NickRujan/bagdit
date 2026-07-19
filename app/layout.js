import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "./globals.css";
import Effects from "./components/Effects";
import ServiceWorker from "./components/ServiceWorker";
import { SITE } from "../lib/config";

export const metadata = {
  metadataBase: new URL(SITE.url),
  applicationName: "Bagdit",
  title: {
    default: "Bagdit — free experiences, paid in video",
    template: "%s · Bagdit",
  },
  description:
    "Local businesses trade free meals, stays, and activities + cash for short videos by real customers. Businesses only pay for videos they approve.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Bagdit",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
      { url: "/icons/apple-touch-icon-167.png", sizes: "167x167" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152" },
    ],
  },
  openGraph: {
    siteName: "Bagdit",
    type: "website",
    images: ["/og/og-home.png"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = {
  themeColor: "#070F22",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <ServiceWorker />
        {children}
      </body>
    </html>
  );
}
