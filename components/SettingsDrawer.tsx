"use client";

/**
 * SettingsDrawer Component
 * 
 * A minimalist drawer that slides up from the bottom of the screen.
 * Allows users to toggle theme (dark/light) and language (es/en).
 * 
 * Features:
 * - Smooth slide-up/down animations
 * - Backdrop with blur effect
 * - Save button with visual feedback
 * - Keyboard accessible (Escape to close)
 * - Respects prefers-reduced-motion
 * 
 * @module components/SettingsDrawer
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import { X, Sun, Moon, Globe, Gear, Check } from "@phosphor-icons/react";
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
  const [isClosing, setIsClosing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 350); // Match animation duration (0.35s)
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isClosing) {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isClosing, handleClose]);

  // Focus trap and focus first element when opened
  useEffect(() => {
    if (isOpen && !isClosing && firstFocusableRef.current) {
      requestAnimationFrame(() => {
        if (firstFocusableRef.current) {
          firstFocusableRef.current.focus();
        }
      });
    }
  }, [isOpen, isClosing]);

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
    if (e.target === e.currentTarget && !isClosing) {
      handleClose();
    }
  }, [handleClose, isClosing]);

  // Handle save with visual feedback
  const handleSave = useCallback(() => {
    setShowSaved(true);
    setTimeout(() => {
      setShowSaved(false);
      handleClose();
    }, 600);
  }, [handleClose]);

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={cn(
        styles.backdrop,
        isOpen && !isClosing && styles.backdropOpen,
        isClosing && styles.backdropClosing
      )} 
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="settings-title"
    >
      <div 
        ref={drawerRef}
        className={cn(
          styles.drawer,
          isOpen && !isClosing && styles.drawerOpen,
          isClosing && styles.drawerClosing
        )}
      >
        {/* Handle indicator */}
        <div className={styles.handleIndicator} aria-hidden="true" />
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.titleIcon}>
              <Gear />
            </div>
            <h2 id="settings-title" className={styles.title}>
              {t("settings.title")}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={handleSave}
              className={cn(styles.iconButton, styles.saveButton)}
              aria-label={t("ui.save")}
              title={t("ui.save")}
            >
              {showSaved ? <Check /> : <Check />}
            </button>
            <button
              ref={firstFocusableRef}
              onClick={handleClose}
              className={styles.iconButton}
              aria-label={t("ui.close")}
            >
              <X />
            </button>
          </div>
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
                <Sun />
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
                <Moon />
                <span>{t("settings.themeDark")}</span>
              </button>
            </div>
          </div>

          {/* Language toggle */}
          <div className={styles.settingGroup}>
            <label className={styles.settingLabel}>
              <Globe />
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

        {/* Footer */}
        <div className={styles.footer}>
          <p className={styles.footerText}>
            {t("settings.autoSave")}
          </p>
        </div>
      </div>
    </div>
  );
}
