"use client";

/**
 * SettingsButton Component
 * 
 * A minimalist floating action button in the bottom-right corner.
 * Opens the settings drawer to change theme and language.
 * 
 * Features:
 * - Globe icon (as user requested)
 * - Subtle hover animation
 * - Fixed position above the footer
 * - Respects prefers-reduced-motion
 * - Hides when scrolling, shows when scroll stops
 * 
 * @module components/SettingsButton
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Globe } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import SettingsDrawer from "./SettingsDrawer";
import styles from "./SettingsButton.module.css";

export default function SettingsButton() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useLanguage();

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const isScrolling = Math.abs(currentScrollY - lastScrollY) > 1;

          if (isScrolling) {
            // Hide button when scrolling
            setIsVisible(false);
            
            // Clear existing timeout
            if (scrollTimeoutRef.current) {
              clearTimeout(scrollTimeoutRef.current);
            }
            
            // Show button after scroll stops (500ms delay)
            scrollTimeoutRef.current = setTimeout(() => {
              setIsVisible(true);
            }, 500);
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <button
        onClick={openDrawer}
        className={`${styles.floatingButton} ${isVisible ? styles.visible : styles.hidden}`}
        aria-label={t("settings.title")}
        title={t("settings.title")}
      >
        <Globe className={styles.icon} />
      </button>

      <SettingsDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
}

