"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Github,
  Terminal,
  X,
  Code,
  Sparkles,
  Settings,
  FileCode,
  Package,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import styles from "./InfoModal.module.css";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl?: string;
  projectName?: string;
  summary?: string;
  highlights?: string[];
}

const defaultRepoUrl = "https://github.com/sbarkerzamora/New-Portfolio.git";

const defaultHighlights = [
  "Open source y listo para bifurcar o clonar.",
  "Next.js + TypeScript + UI propia con componentes reutilizables.",
  "Incluye chat minimalista, booking con Cal.com y descarga de CV.",
];

export default function InfoModal({
  isOpen,
  onClose,
  repoUrl = defaultRepoUrl,
  projectName = "New Portfolio",
  summary = "Portafolio moderno, optimizado para performance y DX. Hecho con Next.js, animaciones suaves y componentes desacoplados para que puedas reutilizar o extender fácilmente.",
  highlights = defaultHighlights,
}: InfoModalProps) {
  const [copiedHttps, setCopiedHttps] = useState(false);
  const [copiedSsh, setCopiedSsh] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const cleanRepoUrl = repoUrl.replace(/\.git$/, "");
  const httpsClone = repoUrl;
  const sshClone = `git@github.com:${cleanRepoUrl.replace(
    /^https?:\/\/github.com\//,
    "",
  )}.git`;
  const zipUrl = `${cleanRepoUrl}/archive/refs/heads/main.zip`;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const copyToClipboard = async (value: string, type: "https" | "ssh") => {
    try {
      await navigator.clipboard.writeText(value);
      if (type === "https") {
        setCopiedHttps(true);
        setTimeout(() => setCopiedHttps(false), 1800);
      } else {
        setCopiedSsh(true);
        setTimeout(() => setCopiedSsh(false), 1800);
      }
    } catch (error) {
      console.error("No se pudo copiar el comando:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={cn(styles.modalContent, isOpen && styles.modalOpen)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
      >
        <div className={styles.modalHeader}>
          <div className={styles.headerMeta}>
            <div className={styles.badgeWithIcon}>
              <Sparkles className="h-3.5 w-3.5" />
              <span className={styles.badge}>Open Source</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Cerrar modal"
            className={styles.closeButton}
            ref={closeButtonRef}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className={styles.body}>
          <div className={styles.intro}>
            <div>
              <div className={styles.eyebrowWithIcon}>
                <Code className="h-3.5 w-3.5" />
                <p className={styles.eyebrow}>Proyecto</p>
              </div>
              <h3 id="info-modal-title" className={styles.title}>
                {projectName}
              </h3>
              <p className={styles.summary}>{summary}</p>
            </div>
            <div className={styles.repoCard}>
              <div className={styles.repoTitle}>
                <Github className="h-4 w-4" />
                <span>{cleanRepoUrl.replace("https://github.com/", "")}</span>
              </div>
              <div className={styles.repoActions}>
                <a
                  href={cleanRepoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" }),
                    styles.primaryAction,
                  )}
                >
                  <Github className="h-4 w-4" />
                  Ver en GitHub
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(httpsClone, "https")}
                  className={styles.secondaryAction}
                >
                  {copiedHttps ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      HTTPS
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(sshClone, "ssh")}
                  className={styles.secondaryAction}
                >
                  {copiedSsh ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Terminal className="h-4 w-4" />
                      SSH
                    </>
                  )}
                </Button>
                <a
                  href={zipUrl}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    styles.secondaryAction,
                  )}
                  download
                >
                  <Download className="h-4 w-4" />
                  ZIP
                </a>
              </div>
            </div>
          </div>

          <div className={styles.grid}>
            <div className={styles.panel}>
              <div className={styles.eyebrowWithIcon}>
                <Package className="h-3.5 w-3.5" />
                <p className={styles.eyebrow}>Lo que incluye</p>
              </div>
              <ul className={styles.list}>
                {highlights.map((item) => (
                  <li key={item} className={styles.listItem}>
                    <div className={styles.listIcon}>
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.panel}>
              <div className={styles.eyebrowWithIcon}>
                <Settings className="h-3.5 w-3.5" />
                <p className={styles.eyebrow}>Cómo personalizar</p>
              </div>
              <div className={styles.instructions}>
                <div className={styles.instructionItem}>
                  <FileCode className="h-4 w-4" />
                  <p>
                    Pasa tus propios textos, enlaces o comandos como props a{" "}
                    <code className={styles.code}>InfoModal</code> o edita las
                    constantes <code className={styles.code}>summary</code>{" "}
                    y <code className={styles.code}>highlights</code>.
                  </p>
                </div>
                <div className={styles.instructionItem}>
                  <Code className="h-4 w-4" />
                  <p>
                    Ajusta <code className={styles.code}>repoUrl</code> para apuntar a otro
                    repositorio y se actualizarán el enlace, los comandos de clonación y la
                    descarga ZIP.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
