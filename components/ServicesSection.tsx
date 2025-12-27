"use client";

/**
 * ServicesSection Component
 * 
 * A full-height section showcasing services in a 3-column grid layout.
 * Dark theme with animated entrance effects triggered by IntersectionObserver.
 * 
 * Features:
 * - Eyebrow label with slashes
 * - Large title "¿Qué hago?"
 * - Description paragraph aligned right
 * - 3 service cards with icon, title, description, tags, and image carousel
 * - GSAP animations on scroll into view
 * - Respects prefers-reduced-motion
 * 
 * @module components/ServicesSection
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Code2, Globe, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import styles from "./ServicesSection.module.css";
import profileData from "@/docs/profile.json";

// Icons mapping for each service
const serviceIcons = [Code2, Globe, Zap];

// Auto-rotate interval in milliseconds
const CAROUSEL_INTERVAL = 4000;

/**
 * ImageCarousel Component
 * A simple image carousel with navigation arrows and auto-rotation
 * Using a simpler implementation without shadcn for better control
 */
function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-rotation
  useEffect(() => {
    if (images.length <= 1) return;

    const startAutoRotation = () => {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, CAROUSEL_INTERVAL);
    };

    startAutoRotation();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    // Reset auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    // Restart auto-rotation
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, CAROUSEL_INTERVAL);
    }
  }, [images.length]);

  const goToNext = useCallback(() => {
    // Reset auto-rotation timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setCurrentIndex((prev) => (prev + 1) % images.length);
    // Restart auto-rotation
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, CAROUSEL_INTERVAL);
    }
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className={styles.imagePlaceholder}>
        <div className={styles.placeholderContent}>
          <span>No images</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={styles.simpleCarousel}>
      {/* Images */}
      <div className={styles.slidesContainer}>
        {images.map((src, index) => {
          const imageSrc = src.trim().startsWith('/') ? src.trim() : `/${src.trim()}`;
          return (
            <div
              key={`${imageSrc}-${index}`}
              className={cn(
                styles.slide,
                index === currentIndex && styles.slideActive
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt={`${alt} - imagen ${index + 1}`}
                className={styles.slideImage}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          );
        })}
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className={cn(styles.carouselNav, styles.carouselNavPrev)}
            aria-label="Imagen anterior"
          >
            <ChevronLeft className={styles.carouselNavIcon} />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className={cn(styles.carouselNav, styles.carouselNavNext)}
            aria-label="Siguiente imagen"
          >
            <ChevronRight className={styles.carouselNavIcon} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className={styles.dotsContainer}>
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={cn(
                styles.dotButton,
                index === currentIndex && styles.dotButtonActive
              )}
              aria-label={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ServicesSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const eyebrowRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descriptionRef = useRef<HTMLParagraphElement | null>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);

  const servicios = profileData.servicios;

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      // If reduced motion, just show everything without animation
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            runEntranceAnimation();
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "-50px",
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  const runEntranceAnimation = () => {
    const tl = gsap.timeline({
      defaults: { ease: "power2.out" },
    });

    // Animate eyebrow
    if (eyebrowRef.current) {
      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }

    // Animate title
    if (titleRef.current) {
      tl.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6 },
        "-=0.3"
      );
    }

    // Animate description
    if (descriptionRef.current) {
      tl.fromTo(
        descriptionRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        "-=0.4"
      );
    }

    // Animate cards with stagger
    const validCards = cardsRef.current.filter(Boolean);
    if (validCards.length > 0) {
      tl.fromTo(
        validCards,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
        "-=0.3"
      );
    }
  };

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-labelledby="services-title"
    >
      {/* Emerald glow background */}
      <div className={styles.backgroundGlow} aria-hidden="true" />
      
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {/* Eyebrow */}
            <div
              ref={eyebrowRef}
              className={cn(styles.eyebrow, !hasAnimated && styles.hidden)}
            >
              <span className={styles.eyebrowSlash}>//</span>
              <span>{servicios.eyebrow}</span>
              <span className={styles.eyebrowSlash}>//</span>
            </div>

            {/* Title */}
            <h2
              ref={titleRef}
              id="services-title"
              className={cn(styles.title, !hasAnimated && styles.hidden)}
            >
              {servicios.titulo}
            </h2>
          </div>

          <div className={styles.headerRight}>
            {/* Description */}
            <p
              ref={descriptionRef}
              className={cn(styles.description, !hasAnimated && styles.hidden)}
            >
              {servicios.descripcion}
            </p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className={styles.grid}>
          {servicios.items.map((item, index) => {
            const IconComponent = serviceIcons[index] || Code2;
            const images = (item as any).imagenes || [];
            // Debug: log images array
            if (images.length > 0) {
              console.log(`📋 Images for ${item.titulo}:`, images);
            }
            
            return (
              <div
                key={item.titulo}
                ref={(el) => { cardsRef.current[index] = el; }}
                className={cn(styles.card, !hasAnimated && styles.hidden)}
              >
                {/* Card Content */}
                <div className={styles.cardContent}>
                  {/* Icon */}
                  <div className={styles.iconContainer}>
                    <IconComponent className={styles.icon} strokeWidth={1.5} />
                  </div>

                  {/* Title */}
                  <h3 className={styles.cardTitle}>{item.titulo}</h3>

                  {/* Description */}
                  <p className={styles.cardDescription}>{item.descripcion}</p>

                  {/* Tags */}
                  <div className={styles.tags}>
                    {item.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className={styles.tag}>
                        <span className={styles.tagDot} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Image Carousel */}
                <div className={styles.imageContainer}>
                  <ImageCarousel images={images} alt={item.titulo} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
