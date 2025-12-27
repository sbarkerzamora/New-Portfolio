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

import React, { useState, useRef, useEffect, useMemo, useCallback, Fragment, ReactNode } from "react";
import { Send, X, Info, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport, type UIMessage } from "ai";
import { useCalModal } from "@/contexts/CalModalContext";
import { useLanguage } from "@/contexts/LanguageContext";
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

/**
 * Parse basic markdown to React elements
 * Supports: **bold**, *italic*, - lists, numbered lists
 * Uses stable keys based on content position to prevent blinking during streaming
 */
function parseMarkdown(text: string): ReactNode {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let listItems: ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let elementIndex = 0;
  let listItemIndex = 0;
  
  const parseInline = (line: string, lineKey: string): ReactNode => {
    // Parse bold and italic
    const parts: ReactNode[] = [];
    let remaining = line;
    let keyIndex = 0;
    
    // Pattern for **bold** and *italic*
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(remaining)) !== null) {
      // Add text before match
      if (match.index > lastIndex) {
        const textBefore = remaining.slice(lastIndex, match.index);
        if (textBefore) {
          parts.push(<span key={`${lineKey}-text-${keyIndex++}`}>{textBefore}</span>);
        }
      }
      
      // Add formatted text
      if (match[2]) {
        // Bold
        parts.push(<strong key={`${lineKey}-bold-${keyIndex++}`} className="font-semibold text-white">{match[2]}</strong>);
      } else if (match[3]) {
        // Italic
        parts.push(<em key={`${lineKey}-italic-${keyIndex++}`}>{match[3]}</em>);
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < remaining.length) {
      const textAfter = remaining.slice(lastIndex);
      if (textAfter) {
        parts.push(<span key={`${lineKey}-text-${keyIndex++}`}>{textAfter}</span>);
      }
    }
    
    return parts.length > 0 ? parts : <span key={`${lineKey}-plain`}>{line}</span>;
  };
  
  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const ListTag = listType;
      const listKey = `list-${listType}-${elementIndex}`;
      elements.push(
        <ListTag key={listKey} className={listType === 'ul' ? 'list-disc' : 'list-decimal'} style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
          {listItems}
        </ListTag>
      );
      listItems = [];
      listType = null;
      listItemIndex = 0;
      elementIndex++;
    }
  };
  
  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    const lineKey = `line-${index}`;
    
    // Check for unordered list
    if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(
        <li key={`${lineKey}-li-${listItemIndex++}`} style={{ marginBottom: '0.25rem' }}>{parseInline(trimmedLine.slice(2), `${lineKey}-content`)}</li>
      );
      return;
    }
    
    // Check for ordered list
    const orderedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(
        <li key={`${lineKey}-li-${listItemIndex++}`} style={{ marginBottom: '0.25rem' }}>{parseInline(orderedMatch[2], `${lineKey}-content`)}</li>
      );
      return;
    }
    
    // Regular line - flush any list first
    flushList();
    
    if (trimmedLine === '') {
      // Empty line - use stable key
      elements.push(<div key={`${lineKey}-empty`} style={{ height: '0.5rem' }} />);
    } else {
      elements.push(
        <p key={`${lineKey}-p`} style={{ marginBottom: '0.5rem' }}>{parseInline(line, lineKey)}</p>
      );
    }
    elementIndex++;
  });
  
  // Flush remaining list
  flushList();
  
  return <>{elements}</>;
}

/**
 * Memoized message content component to prevent re-rendering and blinking during streaming
 * Uses stable keys in parseMarkdown to allow React to efficiently update only changed parts
 */
const MemoizedMessageContent = React.memo(({ content, role, messageId }: { content: string; role: "user" | "assistant"; messageId: string }) => {
  const parsedContent = useMemo(() => {
    if (role === "assistant") {
      return parseMarkdown(content);
    }
    return content;
  }, [content, role]);
  
  return <>{parsedContent}</>;
}, (prevProps, nextProps) => {
  // During streaming, content changes frequently but we want to allow updates
  // The stable keys in parseMarkdown will help React efficiently update
  // Only skip if nothing changed
  if (prevProps.content === nextProps.content && 
      prevProps.role === nextProps.role && 
      prevProps.messageId === nextProps.messageId) {
    return true; // Skip re-render
  }
  return false; // Allow re-render
});

MemoizedMessageContent.displayName = "MemoizedMessageContent";

// LocalStorage key for welcome message
const WELCOME_MESSAGE_KEY = "minimal-chat-welcome-dismissed";

// Quick action keys for translation lookup
const QUICK_ACTION_KEYS = [
  { labelKey: "quickActions.skills", promptKey: "quickActions.skillsPrompt", keywords: ["habilidad", "skill", "capacidad", "aptitud"] },
  { labelKey: "quickActions.technologies", promptKey: "quickActions.technologiesPrompt", keywords: ["tecnolog", "stack", "herramienta", "framework", "librería", "technologies"] },
  { labelKey: "quickActions.experience", promptKey: "quickActions.experiencePrompt", keywords: ["experiencia", "trabajo", "laboral", "empresa", "carrera", "experience"] },
  { labelKey: "quickActions.projects", promptKey: "quickActions.projectsPrompt", keywords: ["proyecto", "portafolio", "trabajo", "aplicación", "app", "project"] },
  { labelKey: "quickActions.contact", promptKey: "quickActions.contactPrompt", keywords: ["contacto", "contact", "cita", "reservar", "reunión", "meeting"] },
  { labelKey: "quickActions.downloadCV", promptKey: "quickActions.downloadCVPrompt", action: "download-cv", keywords: ["cv", "curriculum", "resumen", "descargar", "download"] },
  { labelKey: "quickActions.values", promptKey: "quickActions.valuesPrompt", keywords: ["valor", "filosofía", "principio", "ética", "values"] },
  { labelKey: "quickActions.achievements", promptKey: "quickActions.achievementsPrompt", keywords: ["logro", "éxito", "logrado", "conquista", "hito", "achievement"] },
  { labelKey: "quickActions.focus", promptKey: "quickActions.focusPrompt", keywords: ["enfoque", "metodología", "proceso", "trabajo", "focus"] },
  { labelKey: "quickActions.github", promptKey: "quickActions.githubPrompt", keywords: ["github", "código", "repositorio", "open source", "code"] },
  { labelKey: "quickActions.docker", promptKey: "quickActions.dockerPrompt", keywords: ["docker", "contenedor", "deployment", "devops", "container"] },
  { labelKey: "quickActions.nextjs", promptKey: "quickActions.nextjsPrompt", keywords: ["next.js", "nextjs", "react", "framework"] },
  { labelKey: "quickActions.supabase", promptKey: "quickActions.supabasePrompt", keywords: ["supabase", "backend", "base de datos", "bdd", "database"] },
  { labelKey: "quickActions.wordpress", promptKey: "quickActions.wordpressPrompt", keywords: ["wordpress", "cms", "woocommerce"] },
  { labelKey: "quickActions.stripe", promptKey: "quickActions.stripePrompt", keywords: ["stripe", "pago", "payment", "transacción"] },
];

// Type for translated quick action
type TranslatedQuickAction = {
  label: string;
  prompt: string;
  keywords: string[];
  action?: string;
  labelKey: string;
};

/**
 * Generates dynamic quick actions based on conversation context
 * 
 * Analyzes the conversation flow and suggests relevant topics that:
 * - Haven't been discussed yet
 * - Are related to current topics
 * - Are complementary to the conversation
 * 
 * @param messages - Array of conversation messages
 * @param quickActions - Translated quick actions
 * @param maxSuggestions - Maximum number of suggestions to show (default: 5)
 * @returns Array of relevant quick actions
 */
function generateDynamicSuggestions(
  messages: Message[], 
  quickActions: TranslatedQuickAction[],
  maxSuggestions: number = 5
): TranslatedQuickAction[] {
  // Initial state: show general, welcoming suggestions
  if (messages.length === 0 || (messages.length === 1 && messages[0].id === "initial-1")) {
    return [
      quickActions.find(a => a.labelKey === "quickActions.technologies")!,
      quickActions.find(a => a.labelKey === "quickActions.projects")!,
      quickActions.find(a => a.labelKey === "quickActions.experience")!,
      quickActions.find(a => a.labelKey === "quickActions.skills")!,
      quickActions.find(a => a.labelKey === "quickActions.contact")!,
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
  quickActions.forEach(action => {
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
      mentionedTopics.set(action.labelKey, mentionCount);
    }
  });

  // Define topic relationships for better suggestions (using labelKeys)
  const topicRelations: Record<string, string[]> = {
    "quickActions.technologies": ["quickActions.nextjs", "quickActions.docker", "quickActions.supabase", "quickActions.stripe", "quickActions.wordpress"],
    "quickActions.projects": ["quickActions.github", "quickActions.experience", "quickActions.technologies"],
    "quickActions.experience": ["quickActions.achievements", "quickActions.focus", "quickActions.values"],
    "quickActions.skills": ["quickActions.technologies", "quickActions.experience"],
  };

  // Score actions based on relevance
  const scoredActions = quickActions.map(action => {
    let score = 0;
    const isMentioned = mentionedTopics.has(action.labelKey);
    const mentionCount = mentionedTopics.get(action.labelKey) || 0;

    // Penalize heavily mentioned topics (unless it's CV which is always useful)
    if (isMentioned && action.action !== "download-cv") {
      if (mentionCount > 2) {
        score -= 5;
      } else {
        score -= 2;
      }
    }

    // Boost related topics
    const relatedTopics = topicRelations[action.labelKey] || [];
    relatedTopics.forEach(relatedTopic => {
      if (mentionedTopics.has(relatedTopic)) {
        score += 3;
      }
    });

    // Always prioritize CV download (but not if already mentioned multiple times)
    if (action.action === "download-cv" && mentionCount < 2) {
      score += 5;
    }

    // Prioritize general topics if conversation is just starting
    if (messages.length <= 3) {
      const generalKeys = ["quickActions.skills", "quickActions.technologies", "quickActions.experience", "quickActions.projects"];
      if (generalKeys.includes(action.labelKey)) {
        score += 2;
      }
    }

    // Boost contact if conversation is getting deep
    if (messages.length > 4 && action.labelKey === "quickActions.contact" && !isMentioned) {
      score += 2;
    }

    return { action, score };
  });

  // Sort by score and take top suggestions
  const topSuggestions = scoredActions
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > -3)
    .slice(0, maxSuggestions)
    .map(item => item.action);

  // Ensure we always have enough suggestions
  if (topSuggestions.length < maxSuggestions) {
    const generalActions = quickActions.filter(
      action => !topSuggestions.includes(action) && (mentionedTopics.get(action.labelKey) || 0) < 2
    );
    topSuggestions.push(...generalActions.slice(0, maxSuggestions - topSuggestions.length));
  }

  // Ensure CV is always available (but not if already shown multiple times)
  const hasCV = topSuggestions.some(a => a.action === "download-cv");
  const cvMentionCount = mentionedTopics.get("quickActions.downloadCV") || 0;
  if (!hasCV && cvMentionCount < 2) {
    topSuggestions.pop();
    const cvAction = quickActions.find(a => a.action === "download-cv");
    if (cvAction) topSuggestions.push(cvAction);
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
  // Get language context for translations
  const { t, language } = useLanguage();
  
  const [calLoaded, setCalLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [currentModel, setCurrentModel] = useState<string>("");
  const [error, setError] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const messagesAreaRef = useRef<HTMLDivElement | null>(null);

  // Generate translated quick actions
  const translatedQuickActions = useMemo((): TranslatedQuickAction[] => {
    return QUICK_ACTION_KEYS.map(item => ({
      label: t(item.labelKey),
      prompt: t(item.promptKey),
      keywords: item.keywords,
      action: item.action,
      labelKey: item.labelKey,
    }));
  }, [t, language]);
  
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

  // Create HTTP transport for useChat using TextStreamChatTransport (for text/plain responses)
  const transport = useMemo(() => {
    return new TextStreamChatTransport({
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

  // Get initial message based on current language
  const initialMessage = useMemo(() => t("chat.initialMessage"), [t, language]);

  // Use AI SDK for chat functionality
  const { messages: aiMessages, sendMessage, error: aiError, status } = useChat({
    transport,
    messages: [{
      id: "initial-1",
      role: "assistant",
      parts: [{
        type: "text",
        text: initialMessage,
      }],
    }],
  });

  // Animate messages when new ones arrive (only for new messages, not updates)
  const previousMessagesLengthRef = useRef(aiMessages.length);
  useEffect(() => {
    // Only animate if a new message was added, not if existing messages were updated
    const isNewMessage = aiMessages.length > previousMessagesLengthRef.current;
    previousMessagesLengthRef.current = aiMessages.length;
    
    if (isNewMessage && messagesRef.current) {
      const ctx = gsap.context(() => {
        // Only animate the last message (the new one)
        const lastMessage = messagesRef.current?.querySelectorAll("[data-message]");
        if (lastMessage && lastMessage.length > 0) {
          const newMessageElement = lastMessage[lastMessage.length - 1];
          gsap.fromTo(
            newMessageElement,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.25, ease: "power1.out" }
          );
        }
      }, messagesRef);
      return () => ctx.revert();
    }
  }, [aiMessages.length]); // Only depend on length, not the full array

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
      // Use a small delay to ensure DOM is ready
      const initTimer = setTimeout(async () => {
        try {
          const cal = await getCalApi({ namespace: "30-min-meeting" });
          if (cal) {
            cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
            setCalLoaded(true);
          }
        } catch (error) {
          console.error("Error initializing Cal.com:", error);
          // Still set calLoaded to true to prevent infinite retries
          setCalLoaded(true);
        }
      }, 100);
      
      return () => clearTimeout(initTimer);
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
      
      // Determine what to show based on user query - only show when SPECIFICALLY requested
      // User must explicitly ask about projects to show carousel
      const userAskedProjects = userQuery.includes("proyecto") || 
                                userQuery.includes("portafolio") || 
                                userQuery.includes("qué has hecho") ||
                                userQuery.includes("trabajos");
      // User must explicitly ask about technologies/stack to show marquee
      const userAskedTech = (userQuery.includes("tecnolog") && !userQuery.includes("sobre")) || 
                            userQuery.includes("stack") || 
                            userQuery.includes("qué usas") ||
                            userQuery.includes("herramientas que usas");
      // User must ask about contact to show calendar
      const userAskedContact = userQuery.includes("contacto") || 
                               userQuery.includes("contact") || 
                               userQuery.includes("cita") || 
                               userQuery.includes("reservar") ||
                               userQuery.includes("reunión");
      
      // Only show one component at a time, and only when explicitly asked
      const showProjects = msg.role === "assistant" && 
                          msg.id !== "initial-1" && 
                          userAskedProjects && 
                          !userAskedTech && 
                          !userAskedContact;
      
      const showTechnologies = msg.role === "assistant" && 
                               msg.id !== "initial-1" && 
                               userAskedTech && 
                               !userAskedProjects && 
                               !userAskedContact;
      
      return {
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: content,
        timestamp: (msg as any).createdAt?.getTime() ?? Date.now(),
        showProjects,
        showTechnologies,
        showCalendar: msg.role === "assistant" && msg.id !== "initial-1" && userAskedContact,
      };
    });
  }, [aiMessages]);

  // Re-initialize Cal.com when a calendar message appears in the DOM
  useEffect(() => {
    // Check if any message has showCalendar flag
    const hasCalendarMessage = messages.some(msg => msg.showCalendar);
    if (hasCalendarMessage && showCalendar && !calLoaded) {
      // Wait for the calendar wrapper to be in the DOM
      const checkTimer = setInterval(async () => {
        // Use a more specific selector to find the calendar wrapper
        const calendarCard = document.querySelector(`[data-calendar-card]`);
        const calendarWrapper = calendarCard?.querySelector('div[class*="calendarWrapper"]') as HTMLElement;
        if (calendarWrapper && calendarWrapper.offsetHeight > 0) {
          clearInterval(checkTimer);
          try {
            const cal = await getCalApi({ namespace: "30-min-meeting" });
            if (cal) {
              cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
              setCalLoaded(true);
            }
          } catch (error) {
            console.error("Error initializing Cal.com:", error);
            setCalLoaded(true);
          }
        }
      }, 200);
      
      // Cleanup after 5 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkTimer);
      }, 5000);
      
      return () => {
        clearInterval(checkTimer);
        clearTimeout(timeout);
      };
    }
  }, [messages, showCalendar, calLoaded]);

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
   * Scrolls to the bottom of the messages container (within the chat only)
   */
  const scrollToBottom = useCallback(() => {
    // Only scroll within the messages container, not the whole page
    if (messagesRef.current) {
      const container = messagesRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, []);

  /**
   * Updates messages when new ones are added - scroll only within chat
   */
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  /**
   * Check if there's scrollable content and show scroll indicator
   */
  useEffect(() => {
    const checkScroll = () => {
      if (messagesAreaRef.current) {
        const container = messagesAreaRef.current;
        const hasScroll = container.scrollHeight > container.clientHeight;
        const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        setShowScrollIndicator(hasScroll && !isAtBottom);
      }
    };

    // Check on mount and when messages change
    checkScroll();

    // Check on scroll
    const container = messagesAreaRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      // Also check on resize
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
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
      setError(t("errors.emptyMessage"));
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
      setError(t("errors.sendError"));
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
      setError(t("errors.downloadError"));
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
      setError(t("errors.quickActionError"));
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
    return generateDynamicSuggestions(messages, translatedQuickActions, 5);
  }, [messages, translatedQuickActions]);

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
      
      // Provide more specific error messages using translations
      let errorMessage = t("errors.genericError");
      
      if (aiError.message) {
        const errorMsgLower = aiError.message.toLowerCase();
        if (errorMsgLower.includes("api key") || errorMsgLower.includes("unauthorized") || errorMsgLower.includes("401")) {
          errorMessage = t("errors.apiKeyError");
        } else if (
          errorMsgLower.includes("network") || 
          errorMsgLower.includes("fetch") || 
          errorMsgLower.includes("failed to fetch") ||
          errorMsgLower.includes("error de conexión") ||
          errorMsgLower.includes("network error") ||
          errorMsgLower.includes("typeerror")
        ) {
          errorMessage = t("errors.connectionError");
        } else if (errorMsgLower.includes("rate limit") || errorMsgLower.includes("too many") || errorMsgLower.includes("429")) {
          errorMessage = t("errors.rateLimitError");
        } else if (errorMsgLower.includes("timeout") || errorMsgLower.includes("timed out")) {
          errorMessage = t("errors.timeoutError");
        } else if (errorMsgLower.includes("insufficient credits") || errorMsgLower.includes("402")) {
          errorMessage = t("errors.creditsError");
        } else if (errorMsgLower.includes("no valid messages") || errorMsgLower.includes("400")) {
          errorMessage = t("errors.processingError");
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
  }, [aiError, t]);

  // Ref to track if we've already triggered contact message
  const contactMessageSentRef = useRef(false);

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
        }
      }
    }
  }, [aiMessages, setShowCalendar]);

  // When calendar is shown externally (e.g., from footer), send a contact message ONCE
  useEffect(() => {
    if (showCalendar && !contactMessageSentRef.current) {
      // Check if there's already a contact-related message
      const hasContactMessage = aiMessages.some(msg => {
        const role: string = msg.role;
        const text = getMessageText(msg).toLowerCase();
        return role === "user" && (
          text.includes("contacto") ||
          text.includes("contact") ||
          text.includes("cita") ||
          text.includes("reservar")
        );
      });
      
      if (!hasContactMessage) {
        // Mark as sent before sending to prevent loops
        contactMessageSentRef.current = true;
        // Send message directly
        sendMessage({ text: "¿Cómo puedo contactarte?" });
      } else {
        // Already has a contact message, just mark as sent
        contactMessageSentRef.current = true;
      }
    }
    
    // Reset ref when calendar is hidden
    if (!showCalendar) {
      contactMessageSentRef.current = false;
    }
  }, [showCalendar, aiMessages, sendMessage]);

  return (
    <div ref={chatContainerRef} className={cn(styles.chatContainer, className)}>
      {/* GitHub Contributions */}
      <GitHubContributions username="sbarkerzamora" months={8} />
      {/* Connection indicator (fixed, compact, minimal) */}
      <div
        className={styles.connectionIndicator}
        title={currentModel ? `Model: ${currentModel}` : ""}
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
          aria-label={`Status: ${connectionStatus}`}
        />
        <span className={styles.statusLabel}>
          {connectionStatus === "connected" && t("ui.connected")}
          {connectionStatus === "connecting" && t("ui.connecting")}
          {connectionStatus === "error" && t("ui.error")}
          {connectionStatus === "idle" && t("ui.idle")}
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
              <div className={styles.welcomeTitle}>{t("ui.welcome")}</div>
              <div className={styles.welcomeMessage}>{t("ui.welcomeMessage")}</div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismissWelcome}
              className={styles.welcomeCloseButton}
              aria-label={t("ui.closeWelcome")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div ref={messagesAreaRef} className={styles.messagesArea}>
        {displayMessages.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{t("ui.noMessages")}</p>
          </div>
        ) : (
          <div ref={messagesRef} className={styles.messagesList}>
            {displayMessages.map((message) => (
              <Fragment key={message.id}>
                {/* Message row - ChatGPT style */}
                <div
                  data-message
                  className={cn(
                    styles.messageRow,
                    message.role === "user" ? styles.userMessageRow : styles.assistantMessageRow
                  )}
                >
                  {message.role === "assistant" && (
                    <div className={styles.messageAvatar}>
                      <span>🤖</span>
                    </div>
                  )}
                  <div className={cn(
                    styles.messageContent,
                    message.role === "user" ? styles.userContent : styles.assistantContent
                  )}>
                    <MemoizedMessageContent 
                      content={message.content} 
                      role={message.role} 
                      messageId={message.id}
                    />
                  </div>
                </div>
                
                {/* Projects carousel - separate card */}
                {message.showProjects && projects.length > 0 && (
                  <div className={styles.componentCard} data-message>
                    <div className={styles.componentLabel}>📁 {t("ui.projectsTitle")}</div>
                    <ProjectsCarousel projects={projects} />
                  </div>
                )}
                
                {/* Technologies marquee - separate card */}
                {message.showTechnologies && technologies.length > 0 && (
                  <div className={styles.componentCard} data-message>
                    <div className={styles.componentLabel}>🛠️ {t("ui.techStackTitle")}</div>
                    <TechnologiesMarquee technologies={technologies} />
                  </div>
                )}
                
                {/* Calendar - separate card */}
                {(message.showCalendar || (showCalendar && message.role === "assistant" && message.id === aiMessages[aiMessages.length - 1]?.id)) && (
                  <div className={styles.componentCard} data-message data-calendar-card>
                    <div className={styles.componentLabel}>📅 {t("ui.bookingTitle")}</div>
                    <div className={styles.calendarWrapper}>
                      {calLoaded ? (
                        <Cal
                          namespace="30-min-meeting"
                          calLink="sbarker/30-min-meeting"
                          style={{ width: "100%", height: "100%", minHeight: "400px" }}
                          config={{ layout: "month_view" }}
                        />
                      ) : (
                        <div className={styles.calendarLoading}>
                          <p>{t("ui.loadingCalendar")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Dynamic quick actions - inside messages area */}
            <div className={styles.quickActions}>
              {dynamicSuggestions.map((action, index) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleQuickAction(action.prompt, action.action)}
                  className={styles.quickActionButton}
                  aria-label={action.label}
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
          placeholder={t("ui.placeholder")}
          className={styles.input}
          aria-label={t("ui.placeholder")}
          aria-invalid={!!error}
          disabled={status === "submitted" || status === "streaming"}
        />
        <Button
          type="submit"
          size="icon"
          className={styles.sendButton}
          disabled={!input.trim() || status === "submitted" || status === "streaming"}
          aria-label={t("ui.send")}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Scroll indicator - below input, subtle and minimalistic */}
      {showScrollIndicator && (
        <div className={styles.scrollIndicator} onClick={scrollToBottom} aria-label={t("ui.scrollDown")}>
          <ChevronDown className={styles.scrollIndicatorIcon} />
        </div>
      )}
    </div>
  );
}

