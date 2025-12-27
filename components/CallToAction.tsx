"use client";

import React from "react";
import { useCalModal } from "@/contexts/CalModalContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import styles from "./CallToAction.module.css";

export default function CallToAction() {
  const { openCalendar } = useCalModal();
  const { t } = useLanguage();
  const { theme } = useTheme();

  const handleClick = () => {
    openCalendar();
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Get CTA text based on language
  const ctaText = t("cta.marqueeText") || "Agenda una llamada ✦ Agenda una llamada";

  return (
    <section className={cn(styles.section, theme === "light" && styles.sectionLight)} aria-labelledby="cta-title">
      <div className={styles.container}>
        <div className={styles.meta}>
          <h2 id="cta-title" className={cn(styles.title, theme === "light" && styles.titleLight)}>
            {t("cta.title")}
          </h2>
          <p className={cn(styles.subtitle, theme === "light" && styles.subtitleLight)}>
            {t("cta.subtitle")}
          </p>
          <span className={cn(styles.caption, theme === "light" && styles.captionLight)}>
            {t("cta.caption")}
          </span>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className={styles.pill}
          aria-label={t("cta.buttonAriaLabel")}
        >
          <div className={styles.pillSurface}>
            <div className={styles.marquee} aria-hidden="true">
              <div className={styles.marqueeTrack}>
                {[...Array(4)].map((_, idx) => (
                  <span className={styles.marqueeText} key={idx}>
                    {ctaText}
                  </span>
                ))}
              </div>
            </div>
            <span className={styles.srOnly}>{t("cta.buttonText")}</span>
          </div>
        </button>
      </div>
    </section>
  );
}

