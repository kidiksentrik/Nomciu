import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Feedy - Pet Feeding Tracker",
  description: "Sleek, minimal, mobile-first Pet Feeding Tracker PWA for roommates and families",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Feedy",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0D0E13",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-nomciu-bg text-nomciu-charcoal min-h-screen flex flex-col font-sans overflow-x-hidden selection:bg-nomciu-peach/30 selection:text-nomciu-peach">
        {children}
      </body>
    </html>
  );
}
