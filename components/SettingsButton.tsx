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
 * 
 * @module components/SettingsButton
 */

import React, { useState, useCallback } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SettingsDrawer from "./SettingsDrawer";
import styles from "./SettingsButton.module.css";

export default function SettingsButton() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useLanguage();

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <>
      <button
        onClick={openDrawer}
        className={styles.floatingButton}
        aria-label={t("settings.title")}
        title={t("settings.title")}
      >
        <Globe className={styles.icon} />
      </button>

      <SettingsDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
    </>
  );
}

