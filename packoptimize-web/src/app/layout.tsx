import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
    template: "%s | PackOptimize",
  },
  description:
    "Reduce DIM weight, avoid carrier surcharges, and save 15–40% on every shipment with AI-powered 3D bin-packing optimization.",
  keywords: [
    "bin packing",
    "shipping optimization",
    "DIM weight reduction",
    "3D packing",
    "carrier surcharge",
    "FedEx",
    "UPS",
    "USPS",
    "warehouse optimization",
    "packaging software",
  ],
  authors: [{ name: "PackOptimize" }],
  creator: "PackOptimize",
  metadataBase: new URL("https://packoptimize.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://packoptimize.com",
    siteName: "PackOptimize",
    title: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
    description:
      "Reduce DIM weight, avoid carrier surcharges, and save 15–40% on every shipment.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PackOptimize — 3D Bin-Packing for Smarter Shipping",
    description:
      "Reduce DIM weight, avoid carrier surcharges, and save 15–40% on every shipment.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
