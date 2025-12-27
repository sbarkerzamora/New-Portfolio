"use client";

/**
 * ThemeContext
 * 
 * Manages theme state (dark/light) across the application.
 * Features:
 * - Detects system preference via prefers-color-scheme
 * - Persists user choice to localStorage
 * - Provides toggle and set functions
 * 
 * @module contexts/ThemeContext
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "theme-preference";

/**
 * Detects system color scheme preference
 */
function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/**
 * Gets stored theme from localStorage or falls back to system preference
 */
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }
  
  // Default to dark theme as specified in requirements
  return "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    setThemeState(getInitialTheme());
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    
    try {
      const root = document.documentElement;
      if (root) {
        root.classList.remove("dark", "light");
        root.classList.add(theme);
      }
      
      // Save to localStorage
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [theme, mounted]);

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't manually set a preference
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (!stored) {
        setThemeState(e.matches ? "light" : "dark");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  // Always provide context, even before mount, to prevent errors
  // The theme will be applied once mounted
  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export { ThemeContext };

