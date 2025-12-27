"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import styles from "./ProjectsCarousel.module.css";

type Project = {
  nombre: string;
  descripcion: string;
  categoria?: string;
  imagen?: string;
  enlace?: string;
};

interface ProjectsCarouselProps {
  projects: Project[];
  ctaLabel?: string;
}

/**
 * ProjectsCarousel
 *
 * Carousel de cards horizontales para mostrar proyectos destacados.
 * - Usa diseño inspirado en card-06 (imagen izquierda, texto derecha).
 * - Navegación con botones prev/next.
 * - Animación de transición simple.
 */
export default function ProjectsCarousel({ projects, ctaLabel = "Explorar más" }: ProjectsCarouselProps) {
  const items = useMemo(() => projects ?? [], [projects]);
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!items.length) {
    return null;
  }

  const current = items[index % items.length];

  const handlePrev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);
  const handleNext = () => setIndex((prev) => (prev + 1) % items.length);

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
  };

  return (
    <div 
      ref={carouselRef}
      className={styles.carousel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={styles.controls}>
        <Button variant="ghost" size="icon" onClick={handlePrev} aria-label="Proyecto anterior">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <span className={styles.counter}>
          {index + 1} / {items.length}
        </span>
        <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Siguiente proyecto">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <Card className={styles.projectCard}>
        <CardContent className={styles.imageContainer}>
          {current.imagen ? (
            <img src={current.imagen} alt={current.nombre} className={styles.image} loading="lazy" />
          ) : (
            <div className={styles.imagePlaceholder}>Sin imagen</div>
          )}
        </CardContent>

        <div className={styles.textColumn}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.title}>{current.nombre}</CardTitle>
            <CardDescription className={styles.description}>{current.descripcion}</CardDescription>
            {current.categoria && <p className={styles.category}>{current.categoria}</p>}
          </CardHeader>
          <CardFooter className={styles.cardFooter}>
            <Button
              variant="ghost"
              className={styles.exploreButton}
              type="button"
              onClick={() => {
                if (current.enlace) {
                  window.open(current.enlace, "_blank", "noreferrer");
                }
              }}
              disabled={!current.enlace}
            >
              {ctaLabel}
              <ExternalLink className={styles.externalIcon} />
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}

