"use client";

/**
 * AboutSection Component
 * 
 * A full-height section showcasing the profile with image and experience timeline.
 * Supports dark/light themes with animated entrance effects.
 * 
 * Features:
 * - Animated background effect
 * - Profile image with overlay
 * - Experience timeline
 * - Multi-language support (ES/EN)
 * - Respects prefers-reduced-motion
 * 
 * @module components/AboutSection
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./AboutSection.module.css";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/translations";
import PixelBlast from "./PixelBlast";
import { cn } from "@/lib/utils";

export default function AboutSection() {
  const { t, language } = useLanguage();
  
  // Get translated experience data
  const timeline = useMemo(() => {
    return translations[language].experience.slice(0, 3);
  }, [language]);

  const [enableBlast, setEnableBlast] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -5%" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  // Toggle heavy background for mobile / reduced motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 900;
    if (prefersReducedMotion || isSmall) {
      setEnableBlast(false);
      return;
    }
    setEnableBlast(true);
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="about-title"
      id="acerca-de"
    >
      {enableBlast && (
        <div className={styles.pixelBlast}>
          <PixelBlast
            variant="circle"
            pixelSize={7}
            color="#B19EEF"
            patternScale={2.6}
            patternDensity={1}
            pixelSizeJitter={0.4}
            enableRipples
            rippleSpeed={0.35}
            rippleThickness={0.12}
            rippleIntensityScale={1.3}
            liquid
            liquidStrength={0.1}
            liquidRadius={1.1}
            liquidWobbleSpeed={4.2}
            speed={0.5}
            edgeFade={0.3}
            transparent
            autoPauseOffscreen
          />
        </div>
      )}
      <div className={styles.backgroundGlow} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.mediaColumn}>
          <div
            ref={mediaRef}
            className={cn(
              styles.mediaFrame,
              isVisible ? styles.visible : styles.hidden
            )}
            role="img"
            aria-label={t("about.portrait")}
            style={{ transitionDelay: isVisible ? "60ms" : "0ms" }}
          >
            <div className={styles.mediaOverlay} />
            <div className={styles.noise} aria-hidden="true" />
            <div className={styles.mediaImage} />
          </div>
        </div>

        <div
          ref={contentRef}
          className={cn(
            styles.contentColumn,
            isVisible ? styles.visible : styles.hidden
          )}
          style={{ transitionDelay: isVisible ? "140ms" : "0ms" }}
        >
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowSlash}>//</span>
            <span>{t("about.eyebrow")}</span>
            <span className={styles.eyebrowSlash}>//</span>
          </div>

          <h2 id="about-title" className={styles.title}>
            {t("profile.title")}
          </h2>

          <p className={styles.lead}>{t("profile.summary")}</p>
          <p className={styles.bodyText}>{t("profile.focus")}</p>

          <div
            ref={timelineRef}
            className={cn(styles.timeline, isVisible ? styles.visible : styles.hidden)}
            style={{ transitionDelay: isVisible ? "220ms" : "0ms" }}
          >
            <h3 className={styles.cardTitle}>{t("about.experienceTitle")}</h3>
            <ul className={styles.timelineList}>
              {timeline.map((exp, index) => (
                <li key={`${exp.company}-${exp.period}-${index}`} className={styles.timelineItem}>
                  <div className={styles.timelineDot} aria-hidden="true" />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineMeta}>
                      <span className={styles.timelineRole}>{exp.role}</span>
                      <span className={styles.timelinePeriod}>{exp.period}</span>
                    </div>
                    <div className={styles.timelineCompany}>{exp.company}</div>
                    <p className={styles.timelineDescription}>{exp.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
