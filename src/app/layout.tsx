import type { Metadata } from "next";
import { Fraunces, Figtree } from "next/font/google";
import { StoreProvider } from "@/store/StoreContext";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PawVault: Five puzzles. One calm workday.",
  description:
    "A weighted, chew-proof, modular 5-in-1 dog enrichment vault that keeps dogs calm and busy for 4 to 6 hours. Platinum-cured food-grade silicone, five staged puzzles, and optional voice-guided Smart audio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${figtree.variable}`}>
      <body>
        <StoreProvider>
          <SmoothScrollProvider>
            <Navbar />
            {children}
            <Footer />
            <CartDrawer />
          </SmoothScrollProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
