import type { Metadata } from "next";
import { Caveat, Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "Lista de regalos",
  description: "Elige un regalo para el bebé y apártalo en tu bolsa.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${outfit.variable} ${fraunces.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
