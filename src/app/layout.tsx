import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Swarlabs",
    template: "%s | Swarlabs"
  },
  description: "AI-powered text-to-speech platform with high-quality Indian language support",
  icons: {
    icon: [
      { url: "/logo-light.svg", media: "(prefers-color-scheme: light)", type: "image/svg+xml", sizes: "38x38" },
      { url: "/logo-dark.svg", media: "(prefers-color-scheme: dark)", type: "image/svg+xml", sizes: "38x38" },
    ],
    shortcut: [
      { url: "/logo-light.svg", media: "(prefers-color-scheme: light)", type: "image/svg+xml", sizes: "38x38" },
      { url: "/logo-dark.svg", media: "(prefers-color-scheme: dark)", type: "image/svg+xml", sizes: "38x38" },
    ],
    apple: "/logo-light.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
