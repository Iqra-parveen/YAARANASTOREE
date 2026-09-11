import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/lib/context/auth-context";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "YAARANA — Shopping asisy yaar ki dukan",
  description: "YAARANA is a premium streetwear shop — T-shirts, hoodies, trousers and jackets.",
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
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
