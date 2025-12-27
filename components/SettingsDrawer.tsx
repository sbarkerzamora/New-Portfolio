"use client";

/**
 * SettingsDrawer Component
 * 
 * A minimalist drawer that slides up from the bottom of the screen.
 * Allows users to toggle theme (dark/light) and language (es/en).
 * 
 * Features:
 * - Smooth slide-up animation
 * - Backdrop with blur effect
 * - Keyboard accessible (Escape to close)
 * - Respects prefers-reduced-motion
 * 
 * @module components/SettingsDrawer
 */

import React, { useEffect, useRef, useCallback } from "react";
import { X, Sun, Moon, Globe } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import styles from "./SettingsDrawer.module.css";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap and focus first element when opened
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        }
      });
    }
  }, [isOpen]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className={styles.backdrop} 
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="settings-title"
    >
      <div 
        ref={drawerRef}
        className={cn(styles.drawer, isOpen && styles.drawerOpen)}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="settings-title" className={styles.title}>
            {t("settings.title")}
          </h2>
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className={styles.closeButton}
            aria-label={t("ui.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Theme toggle */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              {t("settings.theme")}
            </label>
            <div className={styles.toggleGroup}>
              <button
                onClick={() => setTheme("light")}
                className={cn(
                  styles.toggleButton,
                  theme === "light" && styles.toggleButtonActive
                )}
                aria-pressed={theme === "light"}
              >
                <Sun className="h-4 w-4" />
                <span>{t("settings.themeLight")}</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={cn(
                  styles.toggleButton,
                  theme === "dark" && styles.toggleButtonActive
                )}
                aria-pressed={theme === "dark"}
              >
                <Moon className="h-4 w-4" />
                <span>{t("settings.themeDark")}</span>
              </button>
            </div>
          </div>

          {/* Language toggle */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              <Globe className="h-4 w-4" />
              {t("settings.language")}
            </label>
            <div className={styles.toggleGroup}>
              <button
                onClick={() => setLanguage("es")}
                className={cn(
                  styles.toggleButton,
                  language === "es" && styles.toggleButtonActive
                )}
                aria-pressed={language === "es"}
              >
                <span>🇪🇸</span>
                <span>{t("settings.languageEs")}</span>
              </button>
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  styles.toggleButton,
                  language === "en" && styles.toggleButtonActive
                )}
                aria-pressed={language === "en"}
              >
                <span>🇬🇧</span>
                <span>{t("settings.languageEn")}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Handle indicator */}
        <div className={styles.handleIndicator} aria-hidden="true" />
      </div>
    </div>
  );
}

