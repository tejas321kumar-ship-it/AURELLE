import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { AnnouncementBar, Footer, Navbar } from "@/components/chrome";
import { CartDrawer } from "@/components/cart-drawer";
import { Providers } from "@/components/providers";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "AURELLE — Fine Handcrafted Jewellery",
  description:
    "Handcrafted 22k & 18k fine jewellery from our Jaipur atelier. BIS hallmarked, fully insured, shipped across India via Shiprocket with secure Razorpay payments.",
};

export const viewport: Viewport = {
  themeColor: "#14110d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="bg-ink font-sans text-ivory antialiased">
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <div className="grain" aria-hidden="true" />
        </Providers>
      </body>
    </html>
  );
}
