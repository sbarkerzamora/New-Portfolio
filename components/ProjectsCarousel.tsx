"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap() + 1);
    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  if (!items.length) {
    return null;
  }

  return (
    <div className={styles.carousel}>
      <Carousel setApi={setApi} className={styles.carouselWrapper}>
        <div className={styles.controls}>
          <CarouselPrevious 
            className={styles.navButton}
            aria-label="Proyecto anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </CarouselPrevious>
          <span className={styles.counter}>
            {current} / {items.length}
          </span>
          <CarouselNext 
            className={styles.navButton}
            aria-label="Siguiente proyecto"
          >
            <ChevronRight className="h-5 w-5" />
          </CarouselNext>
        </div>

        <CarouselContent className={styles.carouselContent}>
          {items.map((project) => (
            <CarouselItem key={project.nombre} className={styles.carouselItem}>
              <Card className={styles.projectCard}>
                <CardContent className={styles.imageContainer}>
                  {project.imagen ? (
                    <img src={project.imagen} alt={project.nombre} className={styles.image} loading="lazy" />
                  ) : (
                    <div className={styles.imagePlaceholder}>Sin imagen</div>
                  )}
                </CardContent>

                <div className={styles.textColumn}>
                  <CardHeader className={styles.cardHeader}>
                    <CardTitle className={styles.title}>{project.nombre}</CardTitle>
                    <CardDescription className={styles.description}>{project.descripcion}</CardDescription>
                    {project.categoria && <p className={styles.category}>{project.categoria}</p>}
                  </CardHeader>
                  <CardFooter className={styles.cardFooter}>
                    <Button
                      variant="ghost"
                      className={styles.exploreButton}
                      type="button"
                      onClick={() => {
                        if (project.enlace) {
                          window.open(project.enlace, "_blank", "noreferrer");
                        }
                      }}
                      disabled={!project.enlace}
                    >
                      {ctaLabel}
                      <ExternalLink className={styles.externalIcon} />
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}

