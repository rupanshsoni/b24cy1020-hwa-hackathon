import type { Metadata } from "next";
import { StoreProvider } from "@/store/StoreContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";

export const metadata: Metadata = {
  title: "PawVault — Five puzzles. One calm workday.",
  description:
    "A weighted, chew-proof, modular 5-in-1 dog enrichment vault that keeps dogs calm and busy for 4–6 hours. Platinum-cured food-grade silicone, five staged puzzles, and optional voice-guided Smart audio.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navbar />
          {children}
          <Footer />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
