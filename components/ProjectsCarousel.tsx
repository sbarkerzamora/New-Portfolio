"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
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

  if (!items.length) {
    return null;
  }

  const current = items[index % items.length];

  const handlePrev = () => setIndex((prev) => (prev - 1 + items.length) % items.length);
  const handleNext = () => setIndex((prev) => (prev + 1) % items.length);

  return (
    <div className={styles.carousel}>
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

