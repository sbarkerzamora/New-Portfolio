"use client";

/**
 * CalModalContext
 * 
 * Context to share the Cal.com calendar state across components.
 * Allows showing the calendar in chat from footer, chat, or any other component.
 * 
 * @module contexts/CalModalContext
 */

import { createContext, useContext, useState, ReactNode } from "react";

interface CalModalContextType {
  showCalendar: boolean;
  setShowCalendar: (show: boolean) => void;
  openCalendar: () => void;
  closeCalendar: () => void;
}

const CalModalContext = createContext<CalModalContextType | undefined>(undefined);

export function CalModalProvider({ children }: { children: ReactNode }) {
  const [showCalendar, setShowCalendar] = useState(false);

  const openCalendar = () => setShowCalendar(true);
  const closeCalendar = () => setShowCalendar(false);

  return (
    <CalModalContext.Provider value={{ showCalendar, setShowCalendar, openCalendar, closeCalendar }}>
      {children}
    </CalModalContext.Provider>
  );
}

export function useCalModal() {
  const context = useContext(CalModalContext);
  if (context === undefined) {
    throw new Error("useCalModal must be used within a CalModalProvider");
  }
  return context;
}

