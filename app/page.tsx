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

import React, { useEffect, useRef } from "react";
import { Info, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MinimalChat from "@/components/MinimalChat";
import DecryptedText from "@/components/DecryptedText";
import InfoModal from "@/components/InfoModal";
import { CalModalProvider, useCalModal } from "@/contexts/CalModalContext";
import styles from "./page.module.css";
import Image from "next/image";
import gsap from "gsap";

function HomeContent() {
  const { openCalendar } = useCalModal();
  const chatRef = React.useRef<{ triggerContact: () => void } | null>(null);
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [currentModel, setCurrentModel] = React.useState<string>("");
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  // Entrance animations for avatar and footer using GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (avatarRef.current) {
        gsap.from(avatarRef.current, {
          opacity: 0,
          scale: 0.85,
          y: -12,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.15,
        });
      }
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.5,
          ease: "power1.out",
        });
      }
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.6,
          ease: "power1.out",
          delay: 0.25,
        });
      }
    });

    return () => ctx.revert();
  }, []);

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
      <header ref={headerRef} className={cn(styles.header, "animate-in fade-in-0 duration-500")}>
        <div ref={avatarRef} className={styles.headerAvatarWrap} aria-label="Avatar">
          <Image
            src="/assets/images/avatar.png"
            alt="Stephan Barker"
            width={48}
            height={48}
            className={styles.headerAvatar}
            priority
          />
        </div>
        {/* Title for desktop */}
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
        {/* Connection status for mobile - shown in header center */}
        <div className={styles.headerConnectionStatus}>
          <span
            className={cn(
              styles.headerStatusDot,
              connectionStatus === "connected"
                ? styles.headerStatusConnected
                : connectionStatus === "connecting"
                ? styles.headerStatusConnecting
                : connectionStatus === "error"
                ? styles.headerStatusError
                : styles.headerStatusIdle
            )}
            aria-label={`Estado: ${connectionStatus}`}
          />
          <span className={styles.headerStatusLabel}>
            {connectionStatus === "connected" && "Conectado"}
            {connectionStatus === "connecting" && "Conectando"}
            {connectionStatus === "error" && "Error"}
            {connectionStatus === "idle" && "En espera"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Sobre"
          onClick={() => setIsInfoOpen(true)}
          className={styles.headerInfoButton}
        >
          <Info className="h-5 w-5" />
        </Button>
      </header>

      {/* Main content - centered chat */}
      <main className={styles.mainContent}>
        <MinimalChat 
          onContactRequest={() => openCalendar()} 
          onConnectionStatusChange={(status, model) => {
            setConnectionStatus(status);
            if (model) setCurrentModel(model);
          }}
        />
      </main>

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        repoUrl="https://github.com/sbarkerzamora/New-Portfolio.git"
        projectName="Portfolio de Stephan Barker"
        summary="Código abierto, minimalista y listo para reutilizar. Usa Next.js + TypeScript con animaciones suaves, chat embebido y flujos listos para booking y descarga de CV."
        highlights={[
          "Stack listo para producción: Next.js, TypeScript, diseño responsive.",
          "Componentes listos: chat minimalista, modal de booking y CV generado.",
          "Fácil de adaptar: textos y enlaces configurables desde props.",
        ]}
      />

      {/* Compact footer */}
      <footer ref={footerRef} className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerName}>© {new Date().getFullYear()} Stephan Barker</span>
          <div className={styles.footerActions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadCV}
              className={styles.bookingButton}
              aria-label="Descargar CV"
              title="Descargar CV"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openCalendar}
              className={styles.bookingButton}
              aria-label="Reservar una cita"
              title="Reservar una cita"
            >
              <Calendar className="h-4 w-4" />
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
