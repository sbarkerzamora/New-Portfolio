"use client";

import React from "react";
import { useCalModal } from "@/contexts/CalModalContext";
import styles from "./CallToAction.module.css";

const CTA_TEXT = "Agenda una llamada ✦ Agenda una llamada";

export default function CallToAction() {
  const { openCalendar } = useCalModal();

  const handleClick = () => {
    openCalendar();
    const hero = document.getElementById("hero");
    if (hero) {
      hero.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <div className={styles.container}>
        <div className={styles.meta}>
          <span id="cta-title" className={styles.title}>
            Veamos si encajamos con una llamada de 15 min
          </span>
          <span className={styles.caption}>Haz clic para abrir el chat y agendar</span>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className={styles.pill}
          aria-label="Abrir el chat para agendar una llamada"
        >
          <div className={styles.pillSurface}>
            <div className={styles.marquee} aria-hidden="true">
              <div className={styles.marqueeTrack}>
                {[...Array(4)].map((_, idx) => (
                  <span className={styles.marqueeText} key={idx}>
                    {CTA_TEXT}
                  </span>
                ))}
              </div>
            </div>
            <span className={styles.srOnly}>Agenda una llamada</span>
          </div>
        </button>
      </div>
    </section>
  );
}
