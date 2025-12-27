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
 * - Multi-language support (ES/EN)
 * 
 * @module app/page
 */

import React, { useEffect, useRef } from "react";
import { Info, Calendar, Download } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MinimalChat from "@/components/MinimalChat";
import DecryptedText from "@/components/DecryptedText";
import InfoModal from "@/components/InfoModal";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import { CalModalProvider, useCalModal } from "@/contexts/CalModalContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
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
  const { t } = useLanguage();
  const { theme } = useTheme();
  
  // Theme-aware colors for ColorBends background
  const backgroundColors = theme === "light" 
    ? ["#a78bfa", "#c4b5fd", "#ddd6fe"] // Light purple tones for light theme
    : ["#10b981", "#34d399", "#6ee7b7"]; // Green tones for dark theme
  const chatRef = React.useRef<{ triggerContact: () => void } | null>(null);
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [currentModel, setCurrentModel] = React.useState<string>("");
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);

  // Entrance animations for avatar and footer using GSAP
  useEffect(() => {
    // Small delay to ensure DOM is ready and prevent hydration issues
    let ctx: gsap.Context | null = null;
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        if (avatarRef.current) {
          // Reset any inline styles first
          gsap.set(avatarRef.current, { clearProps: "all" });
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
          // Reset any inline styles first, then animate
          gsap.set(headerRef.current, { clearProps: "all" });
          gsap.from(headerRef.current, {
            opacity: 0,
            y: -10,
            duration: 0.5,
            ease: "power1.out",
          });
        }
        if (footerRef.current) {
          // Reset any inline styles first
          gsap.set(footerRef.current, { clearProps: "all" });
          gsap.from(footerRef.current, {
            opacity: 0,
            y: 12,
            duration: 0.6,
            ease: "power1.out",
            delay: 0.25,
          });
        }
      });
    }, 100); // Small delay to ensure hydration is complete

    return () => {
      clearTimeout(timer);
      if (ctx) {
        ctx.revert();
      }
    };
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

  // Get connection status text based on current language
  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return t("ui.connected");
      case "connecting":
        return t("ui.connecting");
      case "error":
        return t("ui.error");
      default:
        return t("ui.idle");
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* ColorBends animated background */}
      <div className={cn(styles.background, theme === "light" && styles.backgroundLight)}>
        <ColorBends
          colors={backgroundColors}
          rotation={30}
          speed={0.3}
          scale={1.0}
          frequency={1.5}
          warpStrength={1.2}
          mouseInfluence={0.5}
          parallax={0.4}
          noise={0.05}
          transparent={false}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Hero Section - First viewport with chat */}
      <div className={styles.heroSection}>
        {/* Animated header */}
        <header ref={headerRef} className={cn(styles.header, "animate-in fade-in-0 duration-500")}>
          {/* Left section - Avatar */}
          <div className={styles.headerLeft}>
            <div ref={avatarRef} className={styles.headerAvatarWrap} aria-label="Avatar">
              <Image
                src="/assets/images/avatar.png"
                alt="Stephan Barker"
                width={36}
                height={36}
                className={styles.headerAvatar}
                priority
              />
            </div>
          </div>

          {/* Center section - Title */}
          <div className={styles.headerCenter}>
            <span className={styles.headerTitle}>Stephan Barker</span>
          </div>

          {/* Right section - Connection status + Info button */}
          <div className={styles.headerRight}>
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
              title={getStatusText(connectionStatus)}
              aria-label={`${t("ui.idle").split(" ")[0]}: ${connectionStatus}`}
            />
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("ui.info")}
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

      </div>

      {/* Services Section - Second viewport */}
      <ServicesSection />

      {/* About Section - Third viewport */}
      <AboutSection />

      {/* Fixed footer - visible on all sections */}
      <footer ref={footerRef} className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerName}>© {new Date().getFullYear()} Stephan Barker</span>
          <div className={styles.footerActions}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownloadCV}
              className={styles.bookingButton}
              aria-label={t("ui.downloadCV")}
              title={t("ui.downloadCV")}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={openCalendar}
              className={styles.bookingButton}
              aria-label={t("ui.bookAppointment")}
              title={t("ui.bookAppointment")}
            >
              <Calendar className="h-4 w-4" />
            </Button>
            <a
              href="mailto:hi@stephanbarker.com"
              className={styles.footerLink}
              aria-label={t("ui.contact")}
            >
              hi@stephanbarker.com
            </a>
          </div>
        </div>
      </footer>

      <InfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        repoUrl="https://github.com/sbarkerzamora/New-Portfolio.git"
        projectName={t("infoModal.projectName")}
        summary={t("infoModal.summary")}
        highlights={[
          t("infoModal.highlights.0") || "Stack listo para producción: Next.js, TypeScript, diseño responsive.",
          t("infoModal.highlights.1") || "Componentes listos: chat minimalista, modal de booking y CV generado.",
          t("infoModal.highlights.2") || "Fácil de adaptar: textos y enlaces configurables desde props.",
        ]}
      />
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
