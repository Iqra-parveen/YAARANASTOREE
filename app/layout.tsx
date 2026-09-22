import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/lib/context/auth-context";
import { WishlistProvider } from "@/lib/context/wishlist-context";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  adjustFontFallback: false,
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://yaarana.com"),
  title: {
    default: "YAARANA — Shopping asisy yaar ki dukan",
    template: "%s | YAARANA",
  },
  description: "YAARANA is a premium streetwear brand built on brotherhood — elevated cuts, heavyweight fabrics, everyday luxury.",
  keywords: ["streetwear", "fashion", "Pakistan clothing", "hoodies", "t-shirts", "YAARANA"],
  openGraph: {
    title: "YAARANA — Premium Streetwear",
    description: "Elevated cuts, heavyweight fabrics, everyday luxury. Built on brotherhood.",
    type: "website",
    locale: "en_PK",
    siteName: "YAARANA",
  },
  twitter: {
    card: "summary_large_image",
    title: "YAARANA — Premium Streetwear",
    description: "Elevated cuts, heavyweight fabrics, everyday luxury. Built on brotherhood.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FCFAF3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${inter.variable}`}>
      <body>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
