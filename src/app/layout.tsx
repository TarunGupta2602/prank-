import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Windows Security Alert — Er#USA00dd7",
  description: "Microsoft Defender has detected a critical threat on this device",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'><rect fill='%23f25022' width='8' height='8'/><rect fill='%237fba00' x='10' width='8' height='8'/><rect fill='%2300a4ef' y='10' width='8' height='8'/><rect fill='%23ffb900' x='10' y='10' width='8' height='8'/></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#c50f1f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
