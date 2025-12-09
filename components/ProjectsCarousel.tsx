"use client";

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

      <Card className="w-full max-w-full py-0 sm:flex-row sm:gap-0 overflow-hidden bg-card/70 border-border/60 shadow-2xl">
        <CardContent className={`${styles.imageContainer} sm:min-w-[14rem]`}>
          {current.imagen ? (
            // Se usa <img> para soportar rutas dinámicas desde profile.json
            <img src={current.imagen} alt={current.nombre} className={styles.image} loading="lazy" />
          ) : (
            <div className={styles.imagePlaceholder}>Sin imagen</div>
          )}
        </CardContent>

        <div className={styles.textColumn}>
          <CardHeader className="pt-6">
            <CardTitle className={styles.title}>{current.nombre}</CardTitle>
            <CardDescription className={styles.description}>{current.descripcion}</CardDescription>
            {current.categoria && <p className={styles.category}>{current.categoria}</p>}
          </CardHeader>
          <CardFooter className="gap-3 py-6">
            <Button
              variant="ghost"
              className="bg-transparent bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-400 hover:to-pink-400 focus-visible:ring-pink-600/20"
              type="button"
              onClick={() => {
                if (current.enlace) {
                  window.open(current.enlace, "_blank", "noreferrer");
                }
              }}
              disabled={!current.enlace}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {ctaLabel}
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}

