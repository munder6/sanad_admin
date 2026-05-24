import type { Metadata } from "next";
import { IBM_Plex_Mono, Tajawal } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "سَنَد · لوحة المشرف العام",
  description: "Sanad Super Admin Dashboard",
};

const arabicFont = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
  variable: "--font-arabic",
  fallback: ["Segoe UI", "Arial", "sans-serif"],
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${arabicFont.variable} ${monoFont.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
