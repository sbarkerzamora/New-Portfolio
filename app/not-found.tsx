"use client";

/**
 * 404 Not Found Page
 * 
 * Custom 404 page with animated Shuffle text component
 * and theme-aware styling matching the site's design system.
 * 
 * Features:
 * - Infinite loop animation on main text using Shuffle component
 * - ColorBends animated background (same as homepage)
 * - Glassmorphism effects matching site design
 * - Theme-aware colors and styling
 * - Multi-language support (ES/EN)
 * - Very large 404 text with Neue Metana font
 * 
 * @module app/not-found
 */

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Shuffle from "@/components/Shuffle";
import ColorBends from "@/components/ColorBends";
import styles from "./not-found.module.css";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

export default function NotFound() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Theme-aware colors for ColorBends background (matching homepage)
  const backgroundColors = theme === "light" 
    ? ["#a78bfa", "#c4b5fd", "#ddd6fe"] // Light purple tones for light theme
    : ["#10b981", "#34d399", "#6ee7b7"]; // Green tones for dark theme

  return (
    <div className={cn(styles.container, theme === "light" && styles.containerLight)}>
      {/* ColorBends animated background - matching homepage */}
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
      
      {/* Main content with glassmorphism */}
      <div className={styles.content}>
        <div className={styles.contentCard}>
          {/* Animated 404 text with infinite loop - VERY LARGE */}
          <div className={styles.titleWrapper}>
            <Shuffle
              text={t("notFound.title")}
              tag="h1"
              className={cn(
                styles.shuffleText,
                theme === "light" && styles.shuffleTextLight
              )}
              shuffleDirection="right"
              duration={0.5}
              animationMode="evenodd"
              shuffleTimes={2}
              ease="power3.out"
              stagger={0.04}
              threshold={0}
              rootMargin="0px"
              triggerOnce={false}
              triggerOnHover={false}
              loop={true}
              loopDelay={1.5}
              respectReducedMotion={true}
            />
          </div>

          {/* Small 404 above subtitle with shuffle effect */}
          <div className={styles.small404Wrapper}>
            <span 
              className={cn(
                styles.small404Text,
                theme === "light" && styles.small404TextLight
              )}
              aria-label="404"
            >
              <Shuffle
                text="404"
                tag="span"
                className={styles.small404ShuffleInner}
                shuffleDirection="right"
                duration={0.4}
                animationMode="evenodd"
                shuffleTimes={2}
                ease="power3.out"
                stagger={0.03}
                threshold={0}
                rootMargin="0px"
                triggerOnce={false}
                triggerOnHover={false}
                loop={true}
                loopDelay={2}
                respectReducedMotion={true}
              />
              {/* Fallback text that's always visible */}
              <span className={styles.small404Fallback} aria-hidden="true">404</span>
            </span>
          </div>

          {/* Subtitle */}
          <h2 className={cn(
            styles.subtitle,
            theme === "light" && styles.subtitleLight
          )}>
            {t("notFound.subtitle")}
          </h2>

          {/* Description */}
          <p className={cn(
            styles.description,
            theme === "light" && styles.descriptionLight
          )}>
            {t("notFound.description")}
          </p>

          {/* Back to home button */}
          <Link href="/">
            <Button
              variant="default"
              size="lg"
              className={cn(
                styles.backButton,
                theme === "light" && styles.backButtonLight
              )}
            >
              <ArrowLeft className="h-5 w-5 mr-2" weight="bold" />
              {t("notFound.backHome")}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

