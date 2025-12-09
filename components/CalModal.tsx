"use client";

/**
 * CalModal Component
 * 
 * Modal component that displays the Cal.com booking embed.
 * Includes open/close animations and proper initialization.
 * 
 * @module components/CalModal
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Cal, { getCalApi } from "@calcom/embed-react";
import { cn } from "@/lib/utils";
import styles from "./CalModal.module.css";

interface CalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalModal({ isOpen, onClose }: CalModalProps) {
  const [calLoaded, setCalLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Initialize Cal.com API when modal opens
      (async function () {
        const cal = await getCalApi({ namespace: "30-min-meeting" });
        cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
        setCalLoaded(true);
      })();
    }
  }, [isOpen]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={cn(styles.modalContent, isOpen && styles.modalOpen)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Reserva una cita</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className={styles.calContainer}>
          {calLoaded && (
            <Cal
              namespace="30-min-meeting"
              calLink="sbarker/30-min-meeting"
              style={{ width: "100%", height: "100%", overflow: "scroll" }}
              config={{ layout: "month_view" }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

