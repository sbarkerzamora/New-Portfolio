"use client";

/**
 * TechnologiesMarquee Component
 * 
 * Displays a scrolling marquee of technology icons using Phosphor Icons.
 * Shows technologies from the profile's stack_tecnologico.
 * 
 * @module components/TechnologiesMarquee
 */

import { useMemo } from "react";
import {
  Code,
  Globe,
  Database,
  Cloud,
  CreditCard,
  FileCode,
  Terminal,
  ComputerTower,
  GitBranch,
  Package,
  HardDrives,
  CurrencyCircleDollar,
  CurrencyDollar,
  Atom,
  Circle,
  BracketsCurly,
  FileJs,
} from "phosphor-react";
import styles from "./TechnologiesMarquee.module.css";

// Map technology names to Phosphor Icons
const TECHNOLOGY_ICONS: Record<string, React.ComponentType<any>> = {
  "Next.js": Code,
  "React": Atom,
  "TypeScript": BracketsCurly,
  "JavaScript (ES6+)": FileJs,
  "Consumo de APIs RESTful": Globe,
  "Supabase (BaaS)": Database,
  "Creación de APIs": ComputerTower,
  "Node.js (Básico/Intermedio)": Circle,
  "Docker": Package,
  "Administración de Servidores Linux": HardDrives,
  "Gestión de Hosting y Dominios (DNS)": Cloud,
  "Git & GitHub (Control de versiones)": GitBranch,
  "Integración Stripe API": CurrencyCircleDollar,
  "Integración PayPal": CurrencyDollar,
  "WooCommerce Avanzado": CreditCard,
  "Cursor (AI Code Editor)": FileCode,
  "VS Code": Code,
  "Despliegue Continuo (CI/CD básico)": Terminal,
};

interface TechnologiesMarqueeProps {
  technologies: string[];
}

export default function TechnologiesMarquee({ technologies }: TechnologiesMarqueeProps) {
  // Flatten and deduplicate technologies
  const techList = useMemo(() => {
    const allTechs = technologies.flat();
    return Array.from(new Set(allTechs));
  }, [technologies]);

  if (techList.length === 0) {
    return null;
  }

  // Duplicate the list for seamless infinite scroll
  const duplicatedTechs = [...techList, ...techList];

  return (
    <div className={styles.marqueeContainer}>
      <div className={styles.marqueeTrack}>
        {duplicatedTechs.map((tech, index) => {
          const IconComponent = TECHNOLOGY_ICONS[tech] || Code;
          return (
            <div key={`${tech}-${index}`} className={styles.techItem}>
              <IconComponent className={styles.techIcon} weight="duotone" />
              <span className={styles.techName}>{tech}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

