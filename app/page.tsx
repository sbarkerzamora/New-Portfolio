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
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import Image from "next/image";
import gsap from "gsap";

// Dynamic import para ColorBends (solo cliente, no SSR)
const ColorBends = dynamic(() => import("@/components/ColorBends"), {
  ssr: false,
  loading: () => null,
});

function HomeContent() {
  const { openCalendar } = useCalModal();
  const chatRef = React.useRef<{ triggerContact: () => void } | null>(null);
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [currentModel, setCurrentModel] = React.useState<string>("");
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  // Entrance animations for all content using GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header animation
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.5,
          ease: "power1.out",
        });
      }
      
      // Avatar animation
      if (avatarRef.current) {
        gsap.from(avatarRef.current, {
          opacity: 0,
          scale: 0.85,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.15,
        });
      }
      
      // Title animation
      const titleElement = document.querySelector(`.${styles.headerTitle}`);
      if (titleElement) {
        gsap.from(titleElement, {
          opacity: 0,
          x: -10,
          duration: 0.5,
          ease: "power1.out",
          delay: 0.2,
        });
      }
      
      // Right section (status + info button) animation
      const rightSection = document.querySelector(`.${styles.headerRightSection}`);
      if (rightSection) {
        gsap.from(rightSection, {
          opacity: 0,
          x: 10,
          duration: 0.5,
          ease: "power1.out",
          delay: 0.25,
        });
      }
      
      // Footer animation
      if (footerRef.current) {
        gsap.from(footerRef.current, {
          opacity: 0,
          y: 12,
          duration: 0.6,
          ease: "power1.out",
          delay: 0.3,
        });
      }
      
      // Main content animation
      const mainContent = document.querySelector(`.${styles.mainContent}`);
      if (mainContent) {
        gsap.from(mainContent, {
          opacity: 0,
          y: 20,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.1,
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
      {/* ColorBends background */}
      <div className={styles.background}>
        <ColorBends
          colors={["#10b981", "#34d399", "#6ee7b7"]}
          rotation={30}
          speed={0.5}
          scale={1.0}
          frequency={2.0}
          warpStrength={1.4}
          mouseInfluence={0.9}
          parallax={0.7}
          noise={0.05}
          transparent={true}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
        {/* Fallback gradient mientras carga */}
        <div className={styles.backgroundFallback} />
      </div>

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
          <span className={styles.decryptedTextParent}>
            <DecryptedText
              text="Stephan Barker"
              animateOn="view"
              revealDirection="center"
              speed={80}
              maxIterations={15}
              className={styles.decryptedText}
            />
          </span>
        </div>
        {/* Connection status and info button - positioned together */}
        <div className={styles.headerRightSection}>
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
            aria-label={`Estado: ${connectionStatus === "connected" ? "Conectado" : connectionStatus === "connecting" ? "Conectando" : connectionStatus === "error" ? "Error" : "En espera"}`}
            title={connectionStatus === "connected" ? "Conectado" : connectionStatus === "connecting" ? "Conectando" : connectionStatus === "error" ? "Error" : "En espera"}
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Sobre"
            onClick={() => setIsInfoOpen(true)}
            className={styles.headerInfoButton}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
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
