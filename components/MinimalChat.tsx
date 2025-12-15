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
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useCalModal } from "@/contexts/CalModalContext";
import Cal, { getCalApi } from "@calcom/embed-react";
import styles from "./MinimalChat.module.css";
import ProjectsCarousel from "./ProjectsCarousel";
import TechnologiesMarquee from "./TechnologiesMarquee";
import GitHubContributions from "./GitHubContributions";
import profileData from "@/docs/profile.json";
import Image from "next/image";
import gsap from "gsap";

// Maximum number of messages to display
const MAX_MESSAGES = 10;

// LocalStorage key for welcome message
const WELCOME_MESSAGE_KEY = "minimal-chat-welcome-dismissed";

// Welcome message content
const WELCOME_CONTENT = {
  title: "¡Bienvenido!",
  message: "Escribe tu mensaje y presiona Enter. Tu historial de chat es limitado.",
};

// Base quick actions pool - all available suggestions
const ALL_QUICK_ACTIONS = [
  { label: "Habilidades", prompt: "¿Qué habilidades tienes?", keywords: ["habilidad", "skill", "capacidad", "aptitud"] },
  { label: "Tecnologías", prompt: "¿Qué tecnologías usas?", keywords: ["tecnolog", "stack", "herramienta", "framework", "librería"] },
  { label: "Experiencia", prompt: "Cuéntame sobre tu experiencia", keywords: ["experiencia", "trabajo", "laboral", "empresa", "carrera"] },
  { label: "Proyectos", prompt: "¿Qué proyectos has realizado?", keywords: ["proyecto", "portafolio", "trabajo", "aplicación", "app"] },
  { label: "Contacto", prompt: "¿Cómo puedo contactarte?", keywords: ["contacto", "contact", "cita", "reservar", "reunión"] },
  { label: "Descargar CV", prompt: "¿Puedo descargar tu CV?", action: "download-cv", keywords: ["cv", "curriculum", "resumen", "descargar"] },
  { label: "Valores", prompt: "¿Cuáles son tus valores profesionales?", keywords: ["valor", "filosofía", "principio", "ética"] },
  { label: "Logros", prompt: "¿Cuáles son tus logros destacados?", keywords: ["logro", "éxito", "logrado", "conquista", "hito"] },
  { label: "Enfoque", prompt: "¿Cuál es tu enfoque de trabajo?", keywords: ["enfoque", "metodología", "proceso", "trabajo"] },
  { label: "GitHub", prompt: "¿Puedo ver tu código en GitHub?", keywords: ["github", "código", "repositorio", "open source"] },
  { label: "Docker", prompt: "¿Cómo usas Docker en tus proyectos?", keywords: ["docker", "contenedor", "deployment", "devops"] },
  { label: "Next.js", prompt: "¿Por qué eliges Next.js?", keywords: ["next.js", "nextjs", "react", "framework"] },
  { label: "Supabase", prompt: "¿Cómo usas Supabase?", keywords: ["supabase", "backend", "base de datos", "bdd"] },
  { label: "WordPress", prompt: "¿Trabajas con WordPress?", keywords: ["wordpress", "cms", "woocommerce"] },
  { label: "Stripe", prompt: "¿Has integrado pagos con Stripe?", keywords: ["stripe", "pago", "payment", "transacción"] },
];

/**
 * Generates dynamic quick actions based on conversation context
 * 
 * Analyzes the conversation flow and suggests relevant topics that:
 * - Haven't been discussed yet
 * - Are related to current topics
 * - Are complementary to the conversation
 * 
 * @param messages - Array of conversation messages
 * @param maxSuggestions - Maximum number of suggestions to show (default: 5)
 * @returns Array of relevant quick actions
 */
function generateDynamicSuggestions(messages: Message[], maxSuggestions: number = 5): typeof ALL_QUICK_ACTIONS {
  // Initial state: show general, welcoming suggestions
  if (messages.length === 0 || (messages.length === 1 && messages[0].id === "initial-1")) {
    return [
      ALL_QUICK_ACTIONS.find(a => a.label === "Tecnologías")!,
      ALL_QUICK_ACTIONS.find(a => a.label === "Proyectos")!,
      ALL_QUICK_ACTIONS.find(a => a.label === "Experiencia")!,
      ALL_QUICK_ACTIONS.find(a => a.label === "Habilidades")!,
      ALL_QUICK_ACTIONS.find(a => a.label === "Contacto")!,
    ].filter(Boolean);
  }

  // Get recent conversation context (last 6 messages for better context)
  const recentMessages = messages.slice(-6);
  const conversationText = recentMessages
    .map(msg => msg.content.toLowerCase())
    .join(" ");

  // Track mentioned topics with their frequency
  const mentionedTopics = new Map<string, number>();
  
  // Check which topics have been mentioned and how often
  ALL_QUICK_ACTIONS.forEach(action => {
    let mentionCount = 0;
    action.keywords.forEach(keyword => {
      // Count keyword occurrences
      const regex = new RegExp(keyword, "gi");
      const matches = conversationText.match(regex);
      if (matches) {
        mentionCount += matches.length;
      }
    });
    if (mentionCount > 0) {
      mentionedTopics.set(action.label, mentionCount);
    }
  });

  // Define topic relationships for better suggestions
  const topicRelations: Record<string, string[]> = {
    "Tecnologías": ["Next.js", "Docker", "Supabase", "Stripe", "WordPress"],
    "Proyectos": ["GitHub", "Experiencia", "Tecnologías"],
    "Experiencia": ["Logros", "Enfoque", "Valores"],
    "Habilidades": ["Tecnologías", "Experiencia"],
    "Next.js": ["Supabase", "Docker", "Proyectos"],
    "Docker": ["DevOps", "Deployment", "Tecnologías"],
    "Supabase": ["Backend", "Base de datos", "Tecnologías"],
    "Stripe": ["Pagos", "Proyectos", "Tecnologías"],
    "WordPress": ["CMS", "Proyectos", "Tecnologías"],
  };

  // Score actions based on relevance
  const scoredActions = ALL_QUICK_ACTIONS.map(action => {
    let score = 0;
    const isMentioned = mentionedTopics.has(action.label);
    const mentionCount = mentionedTopics.get(action.label) || 0;

    // Penalize heavily mentioned topics (unless it's CV which is always useful)
    if (isMentioned && action.action !== "download-cv") {
      if (mentionCount > 2) {
        score -= 5; // Heavily penalize if mentioned multiple times
      } else {
        score -= 2; // Lightly penalize if mentioned once
      }
    }

    // Boost related topics
    const relatedTopics = topicRelations[action.label] || [];
    relatedTopics.forEach(relatedTopic => {
      if (mentionedTopics.has(relatedTopic)) {
        score += 3; // Strong boost for related topics
      }
    });

    // Check for semantic relationships in conversation
    action.keywords.forEach(keyword => {
      // Find related actions that share context
      const relatedActions = ALL_QUICK_ACTIONS.filter(a => 
        a.label !== action.label && 
        a.keywords.some(k => {
          // Check if keywords are semantically related
          const relatedPairs = [
            ["proyecto", "portafolio", "trabajo"],
            ["tecnolog", "stack", "herramienta", "framework"],
            ["experiencia", "trabajo", "empresa", "carrera"],
            ["habilidad", "skill", "capacidad"],
            ["docker", "deployment", "devops", "contenedor"],
            ["next.js", "react", "frontend"],
            ["supabase", "backend", "base de datos"],
          ];
          return relatedPairs.some(pair => 
            pair.includes(keyword) && pair.includes(k)
          );
        })
      );

      relatedActions.forEach(relatedAction => {
        if (mentionedTopics.has(relatedAction.label)) {
          score += 2; // Boost for semantically related topics
        }
      });
    });

    // Always prioritize CV download (but not if already mentioned multiple times)
    if (action.action === "download-cv" && mentionCount < 2) {
      score += 5;
    }

    // Prioritize general topics if conversation is just starting
    if (messages.length <= 3) {
      if (["Habilidades", "Tecnologías", "Experiencia", "Proyectos"].includes(action.label)) {
        score += 2;
      }
    }

    // Boost complementary topics (e.g., if talking about projects, suggest technologies)
    const lastUserMessage = recentMessages.filter(m => m.role === "user").pop();
    if (lastUserMessage) {
      const lastUserText = lastUserMessage.content.toLowerCase();
      
      if (lastUserText.includes("proyecto") && action.label === "Tecnologías") {
        score += 4;
      }
      if (lastUserText.includes("tecnolog") && action.label === "Proyectos") {
        score += 4;
      }
      if (lastUserText.includes("experiencia") && action.label === "Logros") {
        score += 3;
      }
      if (lastUserText.includes("trabajo") && action.label === "Enfoque") {
        score += 3;
      }
    }

    // Boost contact if conversation is getting deep
    if (messages.length > 4 && action.label === "Contacto" && !isMentioned) {
      score += 2;
    }

    return { action, score };
  });

  // Sort by score and take top suggestions
  const topSuggestions = scoredActions
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > -3) // Filter out heavily penalized items
    .slice(0, maxSuggestions)
    .map(item => item.action);

  // Ensure we always have enough suggestions
  if (topSuggestions.length < maxSuggestions) {
    const generalActions = ALL_QUICK_ACTIONS.filter(
      action => !topSuggestions.includes(action) && (mentionedTopics.get(action.label) || 0) < 2
    );
    topSuggestions.push(...generalActions.slice(0, maxSuggestions - topSuggestions.length));
  }

  // Ensure CV is always available (but not if already shown multiple times)
  const hasCV = topSuggestions.some(a => a.action === "download-cv");
  const cvMentionCount = mentionedTopics.get("Descargar CV") || 0;
  if (!hasCV && cvMentionCount < 2) {
    // Replace the lowest priority suggestion with CV
    topSuggestions.pop();
    topSuggestions.push(ALL_QUICK_ACTIONS.find(a => a.action === "download-cv")!);
  }

  return topSuggestions;
}

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
  onConnectionStatusChange?: (status: "idle" | "connecting" | "connected" | "error", model?: string) => void; // Callback to pass connection status to parent
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

// Helper function to extract text content from UIMessage parts
const getMessageText = (msg: UIMessage): string => {
  if (!msg.parts || msg.parts.length === 0) return "";
  return msg.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("");
};

export default function MinimalChat({ className, onContactRequest, onConnectionStatusChange }: MinimalChatProps) {
  // Get Cal.com context to show calendar in chat
  const { showCalendar, setShowCalendar } = useCalModal();
  const [calLoaded, setCalLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [currentModel, setCurrentModel] = useState<string>("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  
  // Check localStorage only on client after hydration
  useEffect(() => {
    const shouldShow = !localStorage.getItem(WELCOME_MESSAGE_KEY);
    setShowWelcome(shouldShow);
  }, []);

  // Animate chat entrance and message flow (especially on mobile)
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (chatContainerRef.current) {
        gsap.from(chatContainerRef.current, {
          opacity: 0,
          y: 18,
          duration: 0.45,
          ease: "power2.out",
        });
      }
    });
    return () => ctx.revert();
  }, []);

  // Local state for input (AI SDK v5 doesn't provide input state)
  const [input, setInput] = useState("");

  // Create HTTP transport for useChat using DefaultChatTransport
  const transport = useMemo(() => {
    return new DefaultChatTransport<UIMessage>({
      api: "/api/chat",
      headers: async () => {
        return {
          "Content-Type": "application/json",
        };
      },
      fetch: async (url, options) => {
        try {
          const response = await fetch(url, options);
          
          // Extract model from headers for connection indicator
          const modelHeader = response.headers.get("x-model-used");
          if (modelHeader) {
            setCurrentModel(modelHeader);
          }
          
          // Check if response is ok, if not, throw an error with more details
          if (!response.ok) {
            // Try to get error details from response
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            try {
              const errorData = await response.json();
              if (errorData.error || errorData.message) {
                errorMessage = errorData.error || errorData.message;
              }
            } catch {
              // If we can't parse JSON, use the status text
            }
            
            const error = new Error(errorMessage);
            (error as any).status = response.status;
            (error as any).statusText = response.statusText;
            throw error;
          }
          
          return response;
        } catch (fetchError) {
          // Handle network errors and other fetch errors
          console.error("Fetch error in transport:", fetchError);
          
          // If it's already an Error, re-throw it
          if (fetchError instanceof Error) {
            // Enhance error message for network errors
            if (fetchError.message === "Failed to fetch" || fetchError.message === "network error" || fetchError.name === "TypeError") {
              const networkError = new Error("Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.");
              (networkError as any).cause = fetchError;
              throw networkError;
            }
            throw fetchError;
          }
          
          // If it's not an Error, wrap it
          throw new Error(String(fetchError));
        }
      },
    });
  }, []);

  // Use AI SDK for chat functionality
  const { messages: aiMessages, sendMessage, error: aiError, status } = useChat({
    transport,
    messages: [{
      id: "initial-1",
      role: "assistant",
      parts: [{
        type: "text",
        text: `¡Hola! 👋 Soy Stephan Barker.

Tengo más de 8 años transformando ideas en productos digitales que realmente funcionan. Me apasiona encontrar ese punto perfecto entre la velocidad del desarrollo y la calidad del código.

He trabajado en proyectos como Tu Menú Digital (una plataforma completa para restaurantes), Polygon CRM, y varios sitios corporativos. Mi stack favorito incluye Next.js, TypeScript y Supabase, pero también domino WordPress cuando la situación lo requiere.

Este es mi espacio personal donde puedes conocerme mejor. ¿Qué te gustaría saber? Puedes preguntarme sobre mis proyectos, tecnologías que uso, mi experiencia, o cualquier cosa que te interese. ¡Estoy aquí para conversar! 😊`,
      }],
    }],
  });

  // Animate messages when new ones arrive
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (messagesRef.current) {
        gsap.fromTo(
          messagesRef.current.querySelectorAll("[data-message]"),
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.25, stagger: 0.05, ease: "power1.out" }
        );
      }
    }, messagesRef);
    return () => ctx.revert();
  }, [aiMessages]);

  // Update connection status based on chat status
  useEffect(() => {
    if (status === "submitted" || status === "streaming") {
      setConnectionStatus("connecting");
    } else if (status === "error") {
      setConnectionStatus("error");
    } else if (status === "ready") {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("idle");
    }
  }, [status]);

  // Notify parent of connection status changes
  useEffect(() => {
    if (onConnectionStatusChange) {
      onConnectionStatusChange(connectionStatus, currentModel);
    }
  }, [connectionStatus, currentModel, onConnectionStatusChange]);

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
      // Extract text content from parts
      const content = getMessageText(msg);
      
      // For assistant messages, check the previous user message to understand context
      let userQuery = "";
      if (msg.role === "assistant" && index > 0) {
        const prevMsg = aiMessages[index - 1];
        if (prevMsg) {
          const prevRole: string = prevMsg.role;
          if (prevRole === "user") {
            userQuery = getMessageText(prevMsg).toLowerCase();
          }
        }
      }
      
      // Determine what to show based on both LLM response and user query
      const contentLower = content.toLowerCase();
      const hasCarouselPhrase = contentLower.includes("carrusel") || (contentLower.includes("aquí tienes") && (contentLower.includes("proyecto") || contentLower.includes("portafolio")));
      const hasMarqueePhrase = contentLower.includes("marquee") || (contentLower.includes("aquí tienes") && (contentLower.includes("tecnolog") || contentLower.includes("stack")));
      
      // If user asked about projects, show projects carousel
      const userAskedProjects = userQuery.includes("proyecto") || userQuery.includes("portafolio");
      // If user asked about technologies, show technologies marquee
      const userAskedTech = userQuery.includes("tecnolog") || userQuery.includes("stack") || userQuery.includes("herramienta");
      // If user asked about contact, show calendar
      const userAskedContact = userQuery.includes("contacto") || userQuery.includes("contact") || userQuery.includes("cita") || userQuery.includes("reservar");
      
      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: content,
        timestamp: (msg as any).createdAt?.getTime() ?? Date.now(),
        showProjects: msg.role === "assistant" && msg.id !== "initial-1" && (hasCarouselPhrase || (userAskedProjects && !userAskedTech && !userAskedContact)),
        showTechnologies: msg.role === "assistant" && msg.id !== "initial-1" && (hasMarqueePhrase || (userAskedTech && !userAskedProjects && !userAskedContact)),
        showCalendar: msg.role === "assistant" && msg.id !== "initial-1" && userAskedContact,
      };
    });
  }, [aiMessages]);

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
   * Uses AI SDK's sendMessage which calls the API
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate input
    const trimmedInput = input.trim();
    if (!trimmedInput) {
      setError("Por favor, escribe un mensaje antes de enviar.");
      return;
    }

    // Clear error
    setError("");
    setConnectionStatus("connecting");

    console.log("Submitting message:", {
      input: trimmedInput,
      status,
      messageCount: aiMessages.length,
    });

    // Use AI SDK's sendMessage which will call the API
    try {
      sendMessage({ text: trimmedInput });
      setInput(""); // Clear input after sending
    } catch (submitError) {
      console.error("Error in handleSubmit:", submitError);
      setError("Error al enviar el mensaje. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Handles CV download
   * Downloads the dynamically generated PDF from the API
   */
  const handleDownloadCV = async () => {
    try {
      const response = await fetch("/api/cv");
      if (!response.ok) {
        throw new Error("Error generating CV");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Stephan-Barker-CV.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading CV:", error);
      setError("Error al descargar el CV. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Handles quick action button clicks
   * Automatically submits the prompt as a message using AI SDK
   * Or handles special actions like CV download
   */
  const handleQuickAction = (prompt: string, action?: string) => {
    console.log("Quick action clicked:", { prompt, action, status });
    
    // Handle special actions
    if (action === "download-cv") {
      handleDownloadCV();
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      console.warn("Empty prompt in quick action");
      return;
    }

    setError("");
    setConnectionStatus("connecting");

    try {
      // Send message directly using AI SDK's sendMessage
      console.log("Submitting quick action:", trimmedPrompt);
      sendMessage({ text: trimmedPrompt });
    } catch (error) {
      console.error("Error in handleQuickAction:", error);
      setError("Error al procesar la acción rápida. Por favor, intenta de nuevo.");
    }
  };

  /**
   * Gets the last MAX_MESSAGES messages for display
   */
  const displayMessages = useMemo(() => {
    return messages.slice(-MAX_MESSAGES);
  }, [messages]);

  /**
   * Generate dynamic suggestions based on conversation context
   */
  const dynamicSuggestions = useMemo(() => {
    return generateDynamicSuggestions(messages, 5);
  }, [messages]);

  // Update error state from AI SDK with better error handling
  useEffect(() => {
    if (aiError) {
      console.error("Chat error from AI SDK:", aiError);
      console.error("Error object details:", {
        message: aiError.message,
        name: aiError.name,
        stack: aiError.stack,
        cause: (aiError as any).cause,
      });
      
      // Provide more specific error messages
      let errorMessage = "Hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.";
      
      if (aiError.message) {
        const errorMsgLower = aiError.message.toLowerCase();
        if (errorMsgLower.includes("api key") || errorMsgLower.includes("unauthorized") || errorMsgLower.includes("401")) {
          errorMessage = "Error de configuración: La clave de API no está configurada correctamente.";
        } else if (
          errorMsgLower.includes("network") || 
          errorMsgLower.includes("fetch") || 
          errorMsgLower.includes("failed to fetch") ||
          errorMsgLower.includes("error de conexión") ||
          errorMsgLower.includes("network error") ||
          errorMsgLower.includes("typeerror")
        ) {
          errorMessage = "Error de conexión. Por favor, verifica tu conexión a internet e intenta de nuevo.";
        } else if (errorMsgLower.includes("rate limit") || errorMsgLower.includes("too many") || errorMsgLower.includes("429")) {
          errorMessage = "Demasiadas solicitudes. Por favor, espera un momento e intenta de nuevo.";
        } else if (errorMsgLower.includes("timeout") || errorMsgLower.includes("timed out")) {
          errorMessage = "La solicitud tardó demasiado. Por favor, intenta de nuevo.";
        } else if (errorMsgLower.includes("insufficient credits") || errorMsgLower.includes("402")) {
          errorMessage = "Error: El modelo requiere créditos. Por favor, verifica la configuración de OpenRouter.";
        } else if (errorMsgLower.includes("no valid messages") || errorMsgLower.includes("400")) {
          errorMessage = "Error al procesar el mensaje. Por favor, intenta de nuevo.";
        } else {
          // In development, show more details
          if (process.env.NODE_ENV === "development") {
            errorMessage = `Error: ${aiError.message}`;
          }
        }
      }
      
      setError(errorMessage);
    } else {
      // Clear error when there's no error
      setError("");
    }
  }, [aiError]);

  // Detect contact-related messages and show calendar in chat
  useEffect(() => {
    const lastMessage = aiMessages[aiMessages.length - 1];
    if (lastMessage && lastMessage.role === "assistant") {
      const userMessage = aiMessages[aiMessages.length - 2];
      if (userMessage) {
        const userRole: string = userMessage.role;
        const userQuery = userRole === "user" ? getMessageText(userMessage).toLowerCase() : "";
        
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
    }
  }, [aiMessages, setShowCalendar, onContactRequest]);

  // When calendar is shown externally (e.g., from footer), send a contact message
  useEffect(() => {
    if (showCalendar) {
      // When calendar is shown externally (e.g., from footer), send a message
      const contactPrompt = "¿Cómo puedo contactarte?";
      const hasContactMessage = aiMessages.some(msg => {
        const role: string = msg.role;
        return role === "user" && getMessageText(msg).toLowerCase().includes("contacto");
      });
      
      if (!hasContactMessage) {
        // Send message directly
        sendMessage({ text: contactPrompt });
      }
    }
  }, [showCalendar, aiMessages, sendMessage]);

  return (
    <div ref={chatContainerRef} className={cn(styles.chatContainer, className)}>
      {/* GitHub Contributions */}
      <GitHubContributions username="sbarkerzamora" months={8} />
      {/* Connection indicator (fixed, compact, minimal) */}
      <div
        className={styles.connectionIndicator}
        title={currentModel ? `Modelo en uso: ${currentModel}` : "Modelo no informado"}
      >
        <span
          className={cn(
            styles.statusDot,
            connectionStatus === "connected"
              ? styles.statusConnected
              : connectionStatus === "connecting"
              ? styles.statusConnecting
              : connectionStatus === "error"
              ? styles.statusError
              : styles.statusIdle
          )}
          aria-label={`Estado: ${connectionStatus}`}
        />
        <span className={styles.statusLabel}>
          {connectionStatus === "connected" && "Conectado"}
          {connectionStatus === "connecting" && "Conectando"}
          {connectionStatus === "error" && "Error"}
          {connectionStatus === "idle" && "En espera"}
        </span>
        {currentModel && <span className={styles.modelBadge}>{currentModel}</span>}
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
          <div ref={messagesRef} className={styles.messagesList}>
            {displayMessages.map((message) => (
              <div
                key={message.id}
                data-message
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
            
            {/* Dynamic quick actions - inside messages area */}
            <div className={styles.quickActions}>
              {dynamicSuggestions.map((action, index) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action.prompt, (action as any).action)}
                  className={styles.quickActionButton}
                  aria-label={`Acción rápida: ${action.label}`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
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
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError("");
          }}
          placeholder="Escribe tu mensaje..."
          className={styles.input}
          aria-label="Mensaje de chat"
          aria-invalid={!!error}
          disabled={status === "submitted" || status === "streaming"}
        />
        <Button
          type="submit"
          size="icon"
          className={styles.sendButton}
          disabled={!input.trim() || status === "submitted" || status === "streaming"}
          aria-label="Enviar mensaje"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

