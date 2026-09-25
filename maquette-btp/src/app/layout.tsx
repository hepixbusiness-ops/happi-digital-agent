import type { Metadata, Viewport } from "next";
import { Big_Shoulders, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { MotionProvider } from "@/components/MotionProvider";
import { entreprise } from "@/lib/entreprise";
import "./globals.css";

const display = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display-loaded",
  adjustFontFallback: false,
  display: "swap",
});

const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-loaded",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-loaded",
  display: "swap",
});

const titre = `${entreprise.nom} · ${entreprise.activite} à ${entreprise.ville}`;

export const metadata: Metadata = {
  metadataBase: new URL(entreprise.siteUrl),
  title: titre,
  description: entreprise.promesse,
  alternates: { canonical: "./" },
  openGraph: {
    title: titre,
    description: entreprise.promesse,
    url: entreprise.siteUrl,
    siteName: entreprise.nom,
    locale: "fr_CM",
    type: "website",
  },
  // Une maquette ne doit jamais être indexée : elle porte le nom d'une vraie entreprise
  // qui n'a encore rien validé.
  robots: entreprise.maquette ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f1113",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-[100dvh]">
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
