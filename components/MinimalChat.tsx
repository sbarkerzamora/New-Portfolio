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

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Send, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "ai/react";
import { useCalModal } from "@/contexts/CalModalContext";
import Cal, { getCalApi } from "@calcom/embed-react";
import styles from "./MinimalChat.module.css";
import ProjectsCarousel from "./ProjectsCarousel";
import TechnologiesMarquee from "./TechnologiesMarquee";
import profileData from "@/docs/profile.json";
import Image from "next/image";

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
  { label: "Tecnologías", prompt: "¿Qué tecnologías usas?" },
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
  showTechnologies?: boolean; // Flag to show technologies marquee
  showCalendar?: boolean; // Flag to show Cal.com calendar
};

/**
 * MinimalChat Component Props
 */
interface MinimalChatProps {
  className?: string;
  onContactRequest?: () => void; // Callback when contact is requested
}

/**
 * MinimalChat Component
 * 
 * Displays a minimalistic chat interface with message history,
 * input validation, and quick action buttons.
 */
/**
 * Helper functions to determine if projects or technologies should be shown
 * Only activates when the LLM explicitly suggests showing them, not on initial message
 */
const shouldShowProjects = (content: string, messageId: string): boolean => {
  // Never show on initial message
  if (messageId === "initial-1") return false;
  
  const lower = content.toLowerCase();
  // Check for explicit mentions of carousel with projects
  const hasCarousel = lower.includes("carrusel");
  const hasProjects = lower.includes("proyecto") || lower.includes("portafolio");
  const hasShowPhrase = lower.includes("aquí tienes") || lower.includes("puedes ver") || lower.includes("muestra") || lower.includes("mostrar");
  
  // Show if: carousel mentioned OR (show phrase + projects mentioned)
  return hasCarousel || (hasShowPhrase && hasProjects);
};

const shouldShowTechnologies = (content: string, messageId: string): boolean => {
  // Never show on initial message
  if (messageId === "initial-1") return false;
  
  const lower = content.toLowerCase();
  // Check for explicit mentions of marquee with technologies
  const hasMarquee = lower.includes("marquee");
  const hasTech = lower.includes("tecnolog") || lower.includes("stack") || lower.includes("herramienta");
  const hasShowPhrase = lower.includes("aquí tienes") || lower.includes("puedes ver") || lower.includes("muestra") || lower.includes("mostrar");
  
  // Show if: marquee mentioned OR (show phrase + tech mentioned)
  // BUT exclude if projects are also mentioned (to avoid conflicts)
  const hasProjects = lower.includes("proyecto") || lower.includes("portafolio");
  if (hasProjects && !hasMarquee) return false; // Don't show tech if projects are mentioned without explicit marquee
  
  return hasMarquee || (hasShowPhrase && hasTech && !hasProjects);
};

export default function MinimalChat({ className, onContactRequest }: MinimalChatProps) {
  // Get Cal.com context to show calendar in chat
  const { showCalendar, setShowCalendar } = useCalModal();
  const [calLoaded, setCalLoaded] = useState(false);

  // Use AI SDK for chat functionality
  const { messages: aiMessages, input: aiInput, handleInputChange, handleSubmit: aiHandleSubmit, isLoading, error: aiError } = useChat({
    api: "/api/chat",
    initialMessages: [{
      id: "initial-1",
      role: "assistant",
      content: `¡Hola! 👋 Soy Stephan Barker.

Tengo más de 8 años transformando ideas en productos digitales que realmente funcionan. Me apasiona encontrar ese punto perfecto entre la velocidad del desarrollo y la calidad del código.

He trabajado en proyectos como Tu Menú Digital (una plataforma completa para restaurantes), Polygon CRM, y varios sitios corporativos. Mi stack favorito incluye Next.js, TypeScript y Supabase, pero también domino WordPress cuando la situación lo requiere.

Este es mi espacio personal donde puedes conocerme mejor. ¿Qué te gustaría saber? Puedes preguntarme sobre mis proyectos, tecnologías que uso, mi experiencia, o cualquier cosa que te interese. ¡Estoy aquí para conversar! 😊`,
    }],
    maxSteps: 1,
    onError: (error) => {
      console.error("useChat onError:", error);
    },
  });

  // Initialize Cal.com API when calendar should be shown
  useEffect(() => {
    if (showCalendar && !calLoaded) {
      (async function () {
        const cal = await getCalApi({ namespace: "30-min-meeting" });
        cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
        setCalLoaded(true);
      })();
    }
  }, [showCalendar, calLoaded]);

  // Convert AI SDK messages to our Message format
  const messages = useMemo(() => {
    return aiMessages.map((msg, index) => {
      // For assistant messages, check the previous user message to understand context
      let userQuery = "";
      if (msg.role === "assistant" && index > 0) {
        const prevMsg = aiMessages[index - 1];
        if (prevMsg.role === "user") {
          userQuery = prevMsg.content.toLowerCase();
        }
      }
      
      // Determine what to show based on both LLM response and user query
      const content = msg.content.toLowerCase();
      const hasCarouselPhrase = content.includes("carrusel") || (content.includes("aquí tienes") && (content.includes("proyecto") || content.includes("portafolio")));
      const hasMarqueePhrase = content.includes("marquee") || (content.includes("aquí tienes") && (content.includes("tecnolog") || content.includes("stack")));
      
      // If user asked about projects, show projects carousel
      const userAskedProjects = userQuery.includes("proyecto") || userQuery.includes("portafolio");
      // If user asked about technologies, show technologies marquee
      const userAskedTech = userQuery.includes("tecnolog") || userQuery.includes("stack") || userQuery.includes("herramienta");
      // If user asked about contact, show calendar
      const userAskedContact = userQuery.includes("contacto") || userQuery.includes("contact") || userQuery.includes("cita") || userQuery.includes("reservar");
      
      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: msg.createdAt?.getTime() ?? Date.now(),
        showProjects: msg.role === "assistant" && msg.id !== "initial-1" && (hasCarouselPhrase || (userAskedProjects && !userAskedTech && !userAskedContact)),
        showTechnologies: msg.role === "assistant" && msg.id !== "initial-1" && (hasMarqueePhrase || (userAskedTech && !userAskedProjects && !userAskedContact)),
        showCalendar: msg.role === "assistant" && msg.id !== "initial-1" && userAskedContact,
      };
    });
  }, [aiMessages]);

  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem(WELCOME_MESSAGE_KEY);
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Proyectos desde el perfil (para el carousel)
  const projects = profileData.proyectos_destacados ?? [];

  // Tecnologías desde el perfil (para el marquee)
  const technologies = useMemo(() => {
    const stack = profileData.stack_tecnologico ?? {};
    return [
      ...(stack.frontend_moderno ?? []),
      ...(stack.backend_y_datos ?? []),
      ...(stack.devops_e_infraestructura ?? []),
      ...(stack.pagos_y_comercio ?? []),
      ...(stack.herramientas_y_flujo ?? []),
    ];
  }, []);

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
   * Handles message submission
   * Uses AI SDK's handleSubmit which calls the API
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate input using AI SDK's input
    const trimmedInput = aiInput.trim();
    if (!trimmedInput) {
      setError("Por favor, escribe un mensaje antes de enviar.");
      return;
    }

    // Clear error
    setError("");

    // Use AI SDK's handleSubmit which will call the API
    aiHandleSubmit(e);
  };

  /**
   * Handles quick action button clicks
   * Automatically submits the prompt as a message using AI SDK
   */
  const handleQuickAction = (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    setError("");

    // Set the input and submit using AI SDK
    handleInputChange({ target: { value: trimmedPrompt } } as React.ChangeEvent<HTMLInputElement>);
    
    // Wait a bit for the input to update, then submit
    setTimeout(() => {
      const syntheticEvent = {
        preventDefault: () => {},
      } as React.FormEvent<HTMLFormElement>;
      
      aiHandleSubmit(syntheticEvent);
    }, 50);
  };

  /**
   * Gets the last MAX_MESSAGES messages for display
   */
  const displayMessages = useMemo(() => {
    return messages.slice(-MAX_MESSAGES);
  }, [messages]);

  // Update error state from AI SDK with better error handling
  useEffect(() => {
    if (aiError) {
      console.error("Chat error from AI SDK:", aiError);
      
      // Provide more specific error messages
      let errorMessage = "Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.";
      
      if (aiError.message) {
        if (aiError.message.includes("API key")) {
          errorMessage = "Error de configuración: La clave de API no está configurada correctamente.";
        } else if (aiError.message.includes("network") || aiError.message.includes("fetch")) {
          errorMessage = "Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.";
        } else if (aiError.message.includes("rate limit")) {
          errorMessage = "Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.";
        } else {
          // In development, show more details
          if (process.env.NODE_ENV === "development") {
            errorMessage = `Error: ${aiError.message}`;
          }
        }
      }
      
      setError(errorMessage);
    }
  }, [aiError]);

  // Detect contact-related messages and show calendar in chat
  useEffect(() => {
    const lastMessage = aiMessages[aiMessages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      const userMessage = aiMessages[aiMessages.length - 2];
      const userQuery = userMessage?.role === "user" ? userMessage.content.toLowerCase() : "";
      
      // Check if user asked about contact or if assistant mentioned booking/reservation
      if (
        userQuery.includes("contacto") ||
        userQuery.includes("contact") ||
        userQuery.includes("cita") ||
        userQuery.includes("reservar")
      ) {
        // Show calendar in chat
        setShowCalendar(true);
        // Notify parent if callback provided
        if (onContactRequest) {
          onContactRequest();
        }
      }
    }
  }, [aiMessages, setShowCalendar, onContactRequest]);

  // When calendar is shown externally (e.g., from footer), send a contact message
  useEffect(() => {
    if (showCalendar) {
      // When calendar is shown externally (e.g., from footer), send a message
      const contactPrompt = "¿Cómo puedo contactarte?";
      const hasContactMessage = aiMessages.some(msg => 
        msg.role === "user" && msg.content.toLowerCase().includes("contacto")
      );
      
      if (!hasContactMessage) {
        // Set input and submit
        handleInputChange({ target: { value: contactPrompt } } as React.ChangeEvent<HTMLInputElement>);
        setTimeout(() => {
          const syntheticEvent = {
            preventDefault: () => {},
          } as React.FormEvent<HTMLFormElement>;
          aiHandleSubmit(syntheticEvent);
        }, 100);
      }
    }
  }, [showCalendar, aiMessages, handleInputChange, aiHandleSubmit]);

  return (
    <div className={cn(styles.chatContainer, className)}>
      {/* Avatar and title section */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <Image
            src="/assets/images/avatar.png"
            alt="Stephan Barker"
            width={80}
            height={80}
            className={styles.avatar}
            priority
          />
        </div>
        <h2 className={styles.avatarTitle}>Full Stack Developer</h2>
      </div>

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
                  (message.showProjects || message.showTechnologies || message.showCalendar || (showCalendar && message.role === "assistant" && message.id === aiMessages[aiMessages.length - 1]?.id)) && styles.messageWithContent
                )}
              >
                <span className={styles.messageContent}>{message.content}</span>
                {message.showProjects && projects.length > 0 && (
                  <div className={styles.projectsInMessage}>
                    <ProjectsCarousel projects={projects} />
                  </div>
                )}
                {message.showTechnologies && technologies.length > 0 && (
                  <div className={styles.technologiesInMessage}>
                    <TechnologiesMarquee technologies={technologies} />
                  </div>
                )}
                {(message.showCalendar || (showCalendar && message.role === "assistant" && message.id === aiMessages[aiMessages.length - 1]?.id)) && (
                  <div className={styles.calendarInMessage}>
                    {calLoaded && (
                      <Cal
                        namespace="30-min-meeting"
                        calLink="sbarker/30-min-meeting"
                        style={{ width: "100%", height: "100%", overflow: "scroll" }}
                        config={{ layout: "month_view" }}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Quick actions - inside messages area */}
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
        )}
      </div>

      {/* Error message */}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {/* Input form */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <Input
          value={aiInput}
          onChange={(e) => {
            handleInputChange(e);
            setError("");
          }}
          placeholder="Escribe tu mensaje..."
          className={styles.input}
          aria-label="Mensaje de chat"
          aria-invalid={!!error}
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className={styles.sendButton}
          disabled={!aiInput.trim() || isLoading}
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

