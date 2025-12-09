"use client";

/**
 * MinimalChat Component
 * 
 * A minimalistic chat component that displays messages in real-time
 * without requiring a backend. Uses local state for message management.
 * 
 * Features:
 * - Displays only the last 10 messages
 * - Validates empty inputs
 * - Smooth scroll to latest message
 * - Minimal styling integrated with background
 * 
 * @module components/MinimalChat
 */

import { useState, useRef, useEffect } from "react";
import { Send, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import styles from "./MinimalChat.module.css";
import ProjectsCarousel from "./ProjectsCarousel";
import profileData from "@/docs/profile.json";

// Maximum number of messages to display
const MAX_MESSAGES = 10;

// LocalStorage key for welcome message
const WELCOME_MESSAGE_KEY = "minimal-chat-welcome-dismissed";

// Welcome message content
const WELCOME_CONTENT = {
  title: "¡Bienvenido!",
  message: "Escribe tu mensaje y presiona Enter. Tu historial de chat es limitado.",
};

// Quick action prompts
const QUICK_ACTIONS = [
  { label: "Habilidades", prompt: "¿Qué habilidades tienes?" },
  { label: "Experiencia", prompt: "Cuéntame sobre tu experiencia" },
  { label: "Proyectos", prompt: "¿Qué proyectos has realizado?" },
  { label: "Contacto", prompt: "¿Cómo puedo contactarte?" },
];

/**
 * Message type definition
 */
export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  showProjects?: boolean; // Flag to show projects carousel
};

/**
 * MinimalChat Component Props
 */
interface MinimalChatProps {
  className?: string;
}

/**
 * MinimalChat Component
 * 
 * Displays a minimalistic chat interface with message history,
 * input validation, and quick action buttons.
 */
export default function MinimalChat({ className }: MinimalChatProps) {
  // Initialize with a personalized welcome message
  const initialMessage: Message = {
    id: "initial-1",
    role: "assistant",
    content: `¡Hola! 👋 Soy Stephan Barker, Desarrollador Full Stack & Asesor Digital.

Con más de 8 años de experiencia, me especializo en transformar ideas en productos digitales escalables. Trabajo con tecnologías modernas como Next.js, TypeScript y Supabase, combinando la agilidad del desarrollo No-Code/WordPress con la potencia del código a medida.

Este es mi portafolio personal, donde puedes conocer más sobre mi experiencia, proyectos y habilidades técnicas.

¿Te gustaría saber más sobre algo en particular? Puedes hacerme cualquier pregunta o usar las sugerencias que aparecen abajo. ¡Estoy aquí para ayudarte! 😊`,
    timestamp: 0,
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(WELCOME_MESSAGE_KEY);
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Use a counter to ensure unique message IDs
  const messageIdCounter = useRef(0);

  // Proyectos desde el perfil (para el carousel)
  const projects = profileData.proyectos_destacados ?? [];

  /**
   * Handles welcome message dismissal
   * Saves to localStorage to prevent showing again
   */
  const handleDismissWelcome = () => {
    setShowWelcome(false);
    // Save dismissal to localStorage
    localStorage.setItem(WELCOME_MESSAGE_KEY, "true");
  };

  /**
   * Scrolls to the bottom of the messages container
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /**
   * Updates messages when new ones are added
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Generates a simple response based on user input
   * In a real implementation, this would call an API
   */
  const generateResponse = (userMessage: string): { content: string; showProjects: boolean } => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("habilidad") || lowerMessage.includes("skill")) {
      return { 
        content: "Tengo experiencia en desarrollo web, WordPress, WooCommerce y Elementor. También trabajo con transformación digital y desarrollo frontend.",
        showProjects: false
      };
    }
    if (lowerMessage.includes("experiencia") || lowerMessage.includes("año")) {
      return { 
        content: "Tengo más de 8 años de experiencia trabajando en desarrollo web y transformación digital. He trabajado en empresas como Polygon CRM y White Shark Media.",
        showProjects: false
      };
    }
    if (lowerMessage.includes("proyecto") || lowerMessage.includes("portafolio")) {
      return { 
        content: "¡Claro! Aquí tienes algunos de mis proyectos destacados. Puedes usar las flechas para navegar entre ellos.",
        showProjects: true
      };
    }
    if (lowerMessage.includes("contacto") || lowerMessage.includes("contact")) {
      return { 
        content: "Puedes contactarme a través del botón 'Reserva una cita' o escribirme directamente. Estoy disponible para proyectos nuevos.",
        showProjects: false
      };
    }
    
    return { 
      content: "Gracias por tu mensaje. ¿Hay algo específico sobre mi experiencia o proyectos que te gustaría conocer?",
      showProjects: false
    };
  };

  /**
   * Handles message submission
   * Validates input and adds messages to the history
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate input
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError("Por favor, escribe un mensaje antes de enviar.");
      return;
    }

    // Clear error and input
    setError("");
    setInput("");

    // Generate unique IDs using counter
    messageIdCounter.current += 1;
    const userMessageId = `user-${messageIdCounter.current}-${Date.now()}`;
    const assistantMessageId = `assistant-${messageIdCounter.current}-${Date.now()}`;
    const now = Date.now();

    // Add user message immediately
    const userMessage: Message = {
      id: userMessageId,
      role: "user",
      content: trimmedInput,
      timestamp: now,
    };

    setMessages((prev) => {
      const newMessages = [...prev, userMessage];
      // Keep only the last MAX_MESSAGES messages
      return newMessages.slice(-MAX_MESSAGES);
    });

    // Add assistant response after a short delay (simulating API call)
    setTimeout(() => {
      const response = generateResponse(trimmedInput);
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        content: response.content,
        timestamp: Date.now(),
        showProjects: response.showProjects,
      };

      setMessages((prev) => {
        // Only add the assistant message, user message was already added
        const newMessages = [...prev, assistantMessage];
        // Keep only the last MAX_MESSAGES messages
        return newMessages.slice(-MAX_MESSAGES);
      });
    }, 500);
  };

  /**
   * Handles quick action button clicks
   */
  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setError("");
  };

  /**
   * Gets the last MAX_MESSAGES messages for display
   */
  const displayMessages = messages.slice(-MAX_MESSAGES);

  return (
    <div className={cn(styles.chatContainer, className)}>
      {/* Welcome message banner */}
      {showWelcome && (
        <div className={styles.welcomeBanner} role="alert" aria-live="polite">
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeIcon}>
              <Info className="h-4 w-4" />
            </div>
            <div className={styles.welcomeText}>
              <div className={styles.welcomeTitle}>{WELCOME_CONTENT.title}</div>
              <div className={styles.welcomeMessage}>{WELCOME_CONTENT.message}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismissWelcome}
              className={styles.welcomeCloseButton}
              aria-label="Cerrar mensaje de bienvenida"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className={styles.messagesArea}>
        {displayMessages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay mensajes aún. Escribe algo para comenzar.</p>
          </div>
        ) : (
          <div className={styles.messagesList}>
            {displayMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  styles.messageBubble,
                  message.role === "user" ? styles.userMessage : styles.assistantMessage,
                  message.showProjects && styles.messageWithProjects
                )}
              >
                <span className={styles.messageContent}>{message.content}</span>
                {message.showProjects && projects.length > 0 && (
                  <div className={styles.projectsInMessage}>
                    <ProjectsCarousel projects={projects} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Input form */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <Input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          placeholder="Escribe tu mensaje..."
          className={styles.input}
          aria-label="Mensaje de chat"
          aria-invalid={!!error}
        />
        <Button
          type="submit"
          size="icon"
          className={styles.sendButton}
          disabled={!input.trim()}
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Quick actions */}
      <div className={styles.quickActions}>
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => handleQuickAction(action.prompt)}
            className={styles.quickActionButton}
            aria-label={`Acción rápida: ${action.label}`}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

