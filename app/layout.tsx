import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nomciu - Pet Feeding Tracker",
  description: "Sleek, minimal, mobile-first Pet Feeding Tracker PWA for roommates and families",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nomciu",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FAF6F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-nomciu-bg text-nomciu-charcoal min-h-screen flex flex-col font-sans selection:bg-nomciu-peach-light selection:text-nomciu-peach-dark">
        {children}
      </body>
    </html>
  );
}
