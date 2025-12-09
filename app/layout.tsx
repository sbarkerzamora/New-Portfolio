import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const neueMetana = localFont({
  src: "../assets/fonts/NeueMetanaNext-SemiBold.otf",
  variable: "--font-neue-metana",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Stephan Barker | Asesor Digital",
  description:
    "Interfaz de chat para conocer el perfil profesional de Stephan Barker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} ${neueMetana.variable}`}>
        {children}
      </body>
    </html>
  );
}
