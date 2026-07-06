import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono-loaded",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://brief.pharel.cloud";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Portail de brief client — Pharel Happi",
  description:
    "Confiez-nous les informations et fichiers de votre projet en 4 étapes guidées : votre dossier est constitué en direct et transmis à l'agence dès l'envoi.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Portail de brief client — Pharel Happi",
    description:
      "Un parcours guidé en 4 étapes pour rassembler tout ce dont l'agence a besoin pour créer votre site.",
    url: siteUrl,
    siteName: "Pharel Happi",
    locale: "fr_FR",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="min-h-[100dvh] antialiased">{children}</body>
    </html>
  );
}
