/**
 * MinimalChat Component Tests
 * 
 * Unit tests for the MinimalChat component focusing on:
 * - Message submission and validation
 * - Message limit enforcement (MAX_MESSAGES)
 * - Error handling for empty inputs
 * - Quick action button functionality
 * - Welcome message display and dismissal
 * 
 * @module components/__tests__/MinimalChat.test
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, vi } from "vitest";
import { render, screen, fireEvent, waitFor, RenderOptions } from "@testing-library/react";
import React, { ReactElement } from "react";
import MinimalChat from "../MinimalChat";
import { CalModalProvider } from "@/contexts/CalModalContext";
import { LanguageProvider } from "@/contexts/LanguageContext";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Apply localStorage mock after jsdom is ready
beforeAll(() => {
  Object.defineProperty(globalThis, "localStorage", {
    value: localStorageMock,
    writable: true,
  });
  // Force Spanish language in tests to match original test expectations
  Object.defineProperty(globalThis, "navigator", {
    value: {
      ...globalThis.navigator,
      language: "es-ES",
    },
    writable: true,
    configurable: true,
  });
});

// Mock @calcom/embed-react to avoid loading external scripts in tests
vi.mock("@calcom/embed-react", () => ({
  __esModule: true,
  default: ({ "data-cal-link": calLink }: { "data-cal-link"?: string }) => (
    <div data-testid="cal-embed" data-cal-link={calLink || ""} />
  ),
  getCalApi: vi.fn(() => Promise.resolve({} as any)),
}));

// Mock the UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

/**
 * Helper to render MinimalChat with all required context providers
 */
function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <LanguageProvider>
        <CalModalProvider>{children}</CalModalProvider>
      </LanguageProvider>
    ),
    ...options,
  });
}

describe("MinimalChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorageMock.clear();
    // Force Spanish language to match original test expectations
    localStorageMock.setItem("language-preference", "es");
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorageMock.clear();
  });

  describe("Message Submission", () => {
    it("should add a user message when form is submitted with valid input", async () => {
      renderWithProviders(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
      const sendButton = screen.getByLabelText("Enviar mensaje");

      fireEvent.change(input, { target: { value: "Hola" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText("Hola")).toBeInTheDocument();
      });
    });

    it("should display error message when submitting empty input", async () => {
      localStorageMock.setItem("minimal-chat-welcome-dismissed", "true");
      renderWithProviders(<MinimalChat />);
      
      // Submit form with empty input
      const form = screen.getByPlaceholderText("Escribe tu mensaje...").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(
          screen.getByText("Por favor, escribe un mensaje antes de enviar.")
        ).toBeInTheDocument();
      });
    });

    it("should clear input after successful submission", async () => {
      renderWithProviders(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...") as HTMLInputElement;
      const sendButton = screen.getByLabelText("Enviar mensaje");

      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

  });

  describe("Message Limit", () => {
    it("should limit displayed messages to MAX_MESSAGES (10)", async () => {
      renderWithProviders(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...") as HTMLInputElement;
      const sendButton = screen.getByLabelText("Enviar mensaje");

      // Send 12 messages (should only show last 10)
      for (let i = 0; i < 12; i++) {
        fireEvent.change(input, { target: { value: `Message ${i}` } });
        fireEvent.click(sendButton);
        await waitFor(() => {
          expect(input.value).toBe("");
        });
      }

      // Wait for all messages to be processed
      await waitFor(
        () => {
          const messages = screen.getAllByText(/Message \d+/);
          // Should have at most 10 user messages visible
          expect(messages.length).toBeLessThanOrEqual(10);
        },
        { timeout: 2000 }
      );
    });
  });

  describe("Quick Actions", () => {
    it("should send message when quick action button is clicked", async () => {
      renderWithProviders(<MinimalChat />);
      
      const quickActionButton = screen.getByText("Habilidades");
      fireEvent.click(quickActionButton);

      // The quick action should add the user message to the chat
      await waitFor(() => {
        expect(screen.getByText("¿Qué habilidades tienes?")).toBeInTheDocument();
      });
    });

    it("should clear error when quick action is clicked", async () => {
      localStorageMock.setItem("minimal-chat-welcome-dismissed", "true");
      renderWithProviders(<MinimalChat />);
      
      // Trigger error first by submitting empty form
      const form = screen.getByPlaceholderText("Escribe tu mensaje...").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText(/Por favor, escribe/i)).toBeInTheDocument();
      });

      // Click quick action
      const quickActionButton = screen.getByText("Habilidades");
      fireEvent.click(quickActionButton);

      await waitFor(() => {
        expect(screen.queryByText(/Por favor, escribe/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should clear error when user starts typing", async () => {
      localStorageMock.setItem("minimal-chat-welcome-dismissed", "true");
      renderWithProviders(<MinimalChat />);
      
      // Trigger error by submitting empty form
      const form = screen.getByPlaceholderText("Escribe tu mensaje...").closest("form");
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText(/Por favor, escribe/i)).toBeInTheDocument();
      });

      // Start typing
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
      fireEvent.change(input, { target: { value: "T" } });

      await waitFor(() => {
        expect(screen.queryByText(/Por favor, escribe/i)).not.toBeInTheDocument();
      });
    });

    it("should disable send button when input is empty", () => {
      renderWithProviders(<MinimalChat />);
      
      const sendButton = screen.getByLabelText("Enviar mensaje") as HTMLButtonElement;
      expect(sendButton.disabled).toBe(true);
    });

    it("should enable send button when input has content", () => {
      renderWithProviders(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
      const sendButton = screen.getByLabelText("Enviar mensaje") as HTMLButtonElement;

      fireEvent.change(input, { target: { value: "Test" } });
      expect(sendButton.disabled).toBe(false);
    });
  });

  describe("Welcome Message", () => {
    it("should display welcome message on first visit", async () => {
      // Ensure localStorage is empty (first visit)
      localStorageMock.clear();
      
      renderWithProviders(<MinimalChat />);

      await waitFor(() => {
        expect(screen.getByText("¡Bienvenido!")).toBeInTheDocument();
        expect(
          screen.getByText(/Escribe tu mensaje y presiona Enter/i)
        ).toBeInTheDocument();
      });
    });

    it("should not display welcome message if already dismissed", async () => {
      // Simulate that welcome message was already dismissed
      localStorageMock.setItem("minimal-chat-welcome-dismissed", "true");

      renderWithProviders(<MinimalChat />);

      await waitFor(() => {
        expect(screen.queryByText("¡Bienvenido!")).not.toBeInTheDocument();
      });
    });

    it("should dismiss welcome message when close button is clicked", async () => {
      localStorageMock.clear();

      renderWithProviders(<MinimalChat />);

      // Wait for welcome message to appear
      await waitFor(() => {
        expect(screen.getByText("¡Bienvenido!")).toBeInTheDocument();
      });

      // Click close button
      const closeButton = screen.getByLabelText("Cerrar mensaje de bienvenida");
      fireEvent.click(closeButton);

      // Wait for welcome message to disappear
      await waitFor(() => {
        expect(screen.queryByText("¡Bienvenido!")).not.toBeInTheDocument();
      });

      // Verify localStorage was updated
      expect(localStorageMock.getItem("minimal-chat-welcome-dismissed")).toBe("true");
    });

    it("should not show welcome message again after dismissal", async () => {
      localStorageMock.clear();

      const { rerender } = renderWithProviders(<MinimalChat />);

      // Wait for welcome message to appear
      await waitFor(() => {
        expect(screen.getByText("¡Bienvenido!")).toBeInTheDocument();
      });

      // Dismiss welcome message
      const closeButton = screen.getByLabelText("Cerrar mensaje de bienvenida");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByText("¡Bienvenido!")).not.toBeInTheDocument();
      });

      // Rerender component (simulating page reload)
      rerender(<MinimalChat />);

      // Welcome message should not appear again
      await waitFor(() => {
        expect(screen.queryByText("¡Bienvenido!")).not.toBeInTheDocument();
      });
    });

    it("should have accessible welcome message with proper ARIA attributes", async () => {
      localStorageMock.clear();

      renderWithProviders(<MinimalChat />);

      await waitFor(() => {
        const welcomeBanner = screen.getByRole("alert");
        expect(welcomeBanner).toBeInTheDocument();
        expect(welcomeBanner).toHaveAttribute("aria-live", "polite");
      });
    });
  });
});

