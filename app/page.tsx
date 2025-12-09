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
 * - Compact footer
 * - Same background gradient as before
 * 
 * @module app/page
 */

import React from "react";
import { Menu, Info, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import MinimalChat from "@/components/MinimalChat";
import DecryptedText from "@/components/DecryptedText";
import styles from "./page.module.css";

export default function Home() {
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
        <MinimalChat />
      </main>

      {/* Compact footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <span className={styles.footerName}>© {new Date().getFullYear()} Stephan Barker</span>
          <a
            href="mailto:contacto@stephanbarker.com"
            className={styles.footerLink}
            aria-label="Contacto por email"
          >
            <Link2 className="h-4 w-4" />
            contacto@stephanbarker.com
          </a>
        </div>
      </footer>
    </div>
  );
}
