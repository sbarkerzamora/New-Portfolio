"use client";

/**
 * Home Page Component
 * 
 * Main page featuring a minimalistic chat interface integrated
 * with the background. Includes animated header and compact footer.
 * 
 * Features:
 * - Animated header with fade-in effect
 * - Minimalistic chat component (no card borders)
 * - Compact footer with Cal.com booking button
 * - Same background gradient as before
 * 
 * @module app/page
 */

import React from "react";
import { Menu, Info, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MinimalChat from "@/components/MinimalChat";
import DecryptedText from "@/components/DecryptedText";
import { CalModalProvider, useCalModal } from "@/contexts/CalModalContext";
import styles from "./page.module.css";

function HomeContent() {
  const { openCalendar } = useCalModal();
  const chatRef = React.useRef<{ triggerContact: () => void } | null>(null);

  /**
   * Handles CV download
   * Downloads the dynamically generated PDF from the API
   */
  const handleDownloadCV = async () => {
    try {
      const response = await fetch("/api/cv");
      if (!response.ok) {
        throw new Error("Error generating CV");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Stephan-Barker-CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CV:", error);
      // Could show a toast notification here
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Background gradient - same as before */}
      <div
        className={styles.background}
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
        }}
      />

      {/* Animated header */}
      <header className={cn(styles.header, "animate-in fade-in-0 duration-500")}>
        <Button variant="ghost" size="icon" aria-label="Menú">
          <Menu className="h-5 w-5" />
        </Button>
        <div className={styles.headerTitle}>
          <DecryptedText
            text="Stephan Barker"
            animateOn="view"
            revealDirection="center"
            speed={80}
            maxIterations={15}
            className={styles.decryptedText}
          />
        </div>
        <Button variant="ghost" size="icon" aria-label="Sobre">
          <Info className="h-5 w-5" />
        </Button>
      </header>

      {/* Main content - centered chat */}
      <main className={styles.mainContent}>
        <MinimalChat onContactRequest={() => openCalendar()} />
      </main>

      {/* Compact footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerName}>© {new Date().getFullYear()} Stephan Barker</span>
          <div className={styles.footerActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadCV}
              className={styles.bookingButton}
              aria-label="Descargar CV"
            >
              <Download className="h-4 w-4" />
              Descargar CV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openCalendar}
              className={styles.bookingButton}
              aria-label="Reservar una cita"
            >
              <Calendar className="h-4 w-4" />
              Reservar una cita
            </Button>
            <a
              href="mailto:hi@stephanbarker.com"
              className={styles.footerLink}
              aria-label="Contacto por email"
            >
              hi@stephanbarker.com
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function Home() {
  return (
    <CalModalProvider>
      <HomeContent />
    </CalModalProvider>
  );
}
