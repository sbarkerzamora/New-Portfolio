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

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import MinimalChat from "../MinimalChat";

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

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

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

vi.mock("@/components/ui/input", () => ({
  Input: ({
    value,
    onChange,
    placeholder,
    ...props
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    [key: string]: unknown;
  }) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

describe("MinimalChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorageMock.clear();
  });

  describe("Message Submission", () => {
    it("should add a user message when form is submitted with valid input", async () => {
      render(<MinimalChat />);
      
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
      render(<MinimalChat />);
      
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
      render(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...") as HTMLInputElement;
      const sendButton = screen.getByLabelText("Enviar mensaje");

      fireEvent.change(input, { target: { value: "Test message" } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(input.value).toBe("");
      });
    });

    it("should generate assistant response after user message", async () => {
      render(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
      const sendButton = screen.getByLabelText("Enviar mensaje");

      fireEvent.change(input, { target: { value: "habilidades" } });
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(screen.getByText(/desarrollo web/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Message Limit", () => {
    it("should limit displayed messages to MAX_MESSAGES (10)", async () => {
      render(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
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
    it("should populate input when quick action button is clicked", () => {
      render(<MinimalChat />);
      
      const quickActionButton = screen.getByText("Habilidades");
      fireEvent.click(quickActionButton);

      const input = screen.getByPlaceholderText("Escribe tu mensaje...") as HTMLInputElement;
      expect(input.value).toBe("¿Qué habilidades tienes?");
    });

    it("should clear error when quick action is clicked", async () => {
      localStorageMock.setItem("minimal-chat-welcome-dismissed", "true");
      render(<MinimalChat />);
      
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
      render(<MinimalChat />);
      
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
      render(<MinimalChat />);
      
      const sendButton = screen.getByLabelText("Enviar mensaje") as HTMLButtonElement;
      expect(sendButton.disabled).toBe(true);
    });

    it("should enable send button when input has content", () => {
      render(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
      const sendButton = screen.getByLabelText("Enviar mensaje") as HTMLButtonElement;

      fireEvent.change(input, { target: { value: "Test" } });
      expect(sendButton.disabled).toBe(false);
    });
  });

  describe("Response Generation", () => {
    it("should generate appropriate response for habilidades query", async () => {
      render(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
      const sendButton = screen.getByLabelText("Enviar mensaje");

      fireEvent.change(input, { target: { value: "habilidades" } });
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(screen.getByText(/WordPress|WooCommerce|Elementor/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it("should generate appropriate response for experiencia query", async () => {
      render(<MinimalChat />);
      
      const input = screen.getByPlaceholderText("Escribe tu mensaje...");
      const sendButton = screen.getByLabelText("Enviar mensaje");

      fireEvent.change(input, { target: { value: "experiencia" } });
      fireEvent.click(sendButton);

      await waitFor(
        () => {
          expect(screen.getByText(/8 años|años de experiencia/i)).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Welcome Message", () => {
    it("should display welcome message on first visit", async () => {
      // Ensure localStorage is empty (first visit)
      localStorageMock.clear();
      
      render(<MinimalChat />);

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

      render(<MinimalChat />);

      await waitFor(() => {
        expect(screen.queryByText("¡Bienvenido!")).not.toBeInTheDocument();
      });
    });

    it("should dismiss welcome message when close button is clicked", async () => {
      localStorageMock.clear();

      render(<MinimalChat />);

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

      const { rerender } = render(<MinimalChat />);

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

      render(<MinimalChat />);

      await waitFor(() => {
        const welcomeBanner = screen.getByRole("alert");
        expect(welcomeBanner).toBeInTheDocument();
        expect(welcomeBanner).toHaveAttribute("aria-live", "polite");
      });
    });
  });
});

