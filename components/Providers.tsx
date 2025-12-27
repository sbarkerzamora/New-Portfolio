"use client";

/**
 * Providers Component
 * 
 * Client-side wrapper that provides all context providers to the application.
 * This is necessary because Next.js layout.tsx is a server component by default.
 * 
 * @module components/Providers
 */

import React from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import SettingsButton from "./SettingsButton";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        {children}
        <SettingsButton />
      </LanguageProvider>
    </ThemeProvider>
  );
}

