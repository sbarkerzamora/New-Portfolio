import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Providers from "@/components/Providers";
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
  icons: {
    icon: "/assets/images/avatar.png",
    shortcut: "/assets/images/avatar.png",
    apple: "/assets/images/avatar.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <head>
        {/* Script to prevent flash of incorrect theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme-preference');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  }
                  var lang = localStorage.getItem('language-preference');
                  if (lang === 'en') {
                    document.documentElement.lang = 'en';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${neueMetana.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
