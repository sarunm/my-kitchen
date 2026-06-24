import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "🍲 ลองแล แกงใต้ - Kitchen Order Tracker",
  description:
    "Track food delivery orders from Grab, Line-Man, and Shopee at ลองแล แกงใต้",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
