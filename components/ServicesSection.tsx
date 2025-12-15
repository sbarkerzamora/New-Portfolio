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
import { Code2, Globe, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import Image from "next/image";
import styles from "./ServicesSection.module.css";
import profileData from "@/docs/profile.json";

// Icons mapping for each service
const serviceIcons = [Code2, Globe, Zap];

// Auto-rotate interval in milliseconds
const CAROUSEL_INTERVAL = 4000;

/**
 * ImageCarousel Component
 * A simple image carousel with dots indicator and auto-rotation
 */
function ImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate images
  useEffect(() => {
    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, CAROUSEL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [images.length]);

  // Handle dot click
  const handleDotClick = useCallback((index: number) => {
    setCurrentIndex(index);
    // Reset the interval when user manually changes slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, CAROUSEL_INTERVAL);
    }
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className={styles.imagePlaceholder}>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carousel}>
      {/* Images */}
      <div className={styles.carouselTrack}>
        {images.map((src, index) => (
          <div
            key={src}
            className={cn(
              styles.carouselSlide,
              index === currentIndex && styles.carouselSlideActive
            )}
          >
            <Image
              src={src}
              alt={`${alt} - imagen ${index + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.carouselImage}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {/* Dots indicator */}
      {images.length > 1 && (
        <div className={styles.dots}>
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDotClick(index)}
              className={cn(
                styles.dot,
                index === currentIndex && styles.dotActive
              )}
              aria-label={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Single dot for single image */}
      {images.length === 1 && (
        <div className={styles.dots}>
          <span className={cn(styles.dot, styles.dotActive)} />
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
