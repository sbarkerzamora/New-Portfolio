"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "ai/react";
import {
  Menu,
  Info,
  Send,
  Sparkles,
  Link2,
  ArrowRight,
  Play,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import profileData from "@/docs/profile.json";
import { cn } from "@/lib/utils";
import ShinyText from "@/components/ShinyText";
import Image from "next/image";
import Avatar from "@/assets/images/avatar.png";

const shinyPhrases = [
  "Cargando experiencia...",
  "Cargando modelos de LLMs...",
  "Cargando formulario de contaco...",
];

const quickActions = [
  { label: "Personal", prompt: "Cuéntame sobre Stephan Barker" },
  { label: "Habilidades", prompt: "¿Qué habilidades domina Stephan?" },
  { label: "Portafolio", prompt: "Proyectos destacados de Stephan" },
  { label: "Experiencia", prompt: "Resumen de su experiencia laboral" },
  { label: "Contacto", prompt: "¿Cómo contactar a Stephan Barker?" },
];



type CalNamespace = {
  (command: string, ...args: unknown[]): void;
  ns: Record<
    string,
    (command: string, args: Record<string, unknown>) => void
  >;
};

export default function Home() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setInput,
    isLoading,
  } = useChat({ api: "/api/chat" });
  const bottomRef = useRef<HTMLDivElement>(null);
  const calLoadedRef = useRef(false);
  const [showCal, setShowCal] = useState(false);
  const [closingCal, setClosingCal] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [chatVisible, setChatVisible] = useState(false);
  const [heroTransitioning, setHeroTransitioning] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const profile = profileData.perfil_profesional;
  const stats = profileData.estadisticas;

  const combinedMessages = useMemo(() => messages, [messages]);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % shinyPhrases.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!showCal) return;
    if (
      calLoadedRef.current &&
      typeof window !== "undefined" &&
      typeof (window as { Cal?: CalNamespace }).Cal !== "undefined"
    ) {
      (window as { Cal?: CalNamespace }).Cal?.ns["30-min-meeting"]?.("inline", {
        elementOrSelector: "#my-cal-inline-30-min-meeting",
        config: { layout: "month_view" },
        calLink: "sbarker/30-min-meeting",
      });
      (window as { Cal?: CalNamespace }).Cal?.ns["30-min-meeting"]?.("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://app.cal.com/embed/embed.js";
    script.async = true;
    script.onload = () => {
      const cal = (window as { Cal?: CalNamespace }).Cal;
      if (!cal) return;
      cal("init", "30-min-meeting", {
        origin: "https://app.cal.com",
      });
      cal.ns["30-min-meeting"]("inline", {
        elementOrSelector: "#my-cal-inline-30-min-meeting",
        config: { layout: "month_view" },
        calLink: "sbarker/30-min-meeting",
      });
      cal.ns["30-min-meeting"]("ui", {
        hideEventTypeDetails: false,
        layout: "month_view",
      });
      calLoadedRef.current = true;
    };
    document.body.appendChild(script);
  }, [showCal]);

  const skipHero = () => {
    if (!showHero) return;
    setHeroTransitioning(true);
    setShowHero(false);
    setTimeout(() => {
      setChatVisible(true);
      setHeroTransitioning(false);
    }, 400);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120, 180, 255, 0.25), transparent 70%), #000000",
        }}
      />

      {showHero && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-black/80 px-6 text-center backdrop-blur-xl",
            heroTransitioning ? "animate-out fade-out-0 duration-500" : "animate-in fade-in-0 duration-500",
          )}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-lg">
              <Image src={Avatar} alt="Avatar" fill className="object-cover" />
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary shadow-lg">
              Digital Products Developer
            </div>
          </div>
          <div className="text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
            <ShinyText text={shinyPhrases[phraseIndex]} speed={3} />
          </div>
          <Button variant="secondary" size="lg" className="mt-2" onClick={skipHero}>
            Comenzar
          </Button>
        </div>
      )}

      <div
        className={cn(
          "container relative z-10 flex min-h-screen flex-col gap-10 pb-12 pt-8 transition-all duration-500",
          !chatVisible && "opacity-0 pointer-events-none translate-y-6",
        )}
      >
        <header className="flex items-center justify-between rounded-2xl border border-border/60 bg-black/30 px-4 py-3 backdrop-blur">
          <Button variant="ghost" size="icon" aria-label="Menú">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
            Stephan Barker
          </div>
          <Button variant="ghost" size="icon" aria-label="Sobre">
            <Info className="h-5 w-5" />
          </Button>
        </header>

        <section className="flex flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-primary/90 shadow-lg backdrop-blur">
            <span className="rounded-full bg-primary/20 px-2 py-[2px] text-[10px] uppercase tracking-[0.2em] text-primary">
              Updates
            </span>
            <span>Interfaz de chat para conocer a Stephan Barker</span>
            <ArrowRight className="h-4 w-4" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-[0.28em] text-primary">
              {profile.titulo_principal}
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl md:text-6xl">
              Construye más inteligente. Crece más rápido.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {profile.descripcion_hero}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <StatPill label="Experiencia" value={stats.anos_experiencia} />
            <StatPill label="Proyectos" value={stats.proyectos_exitosos} />
            <StatPill label="Clientes" value={stats.clientes_satisfechos} />
          </div>

          <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
            <div className="rounded-3xl border border-white/12 bg-white/5 p-6 shadow-2xl backdrop-blur-xl transition-all duration-500">
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-primary">
                    <Sparkles className="h-4 w-4" />
                    AI Chat
                  </span>
                  <span className="text-xs text-muted-foreground">Explora preguntas rápidas o escribe la tuya</span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex h-[340px] flex-col gap-3 overflow-hidden">
                    <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                      {combinedMessages.length === 0 && <EmptyState />}
                      {combinedMessages.map((message) => (
                        <ChatBubble
                          key={message.id}
                          role={message.role}
                          content={message.content}
                        />
                      ))}
                      <div ref={bottomRef} />
                    </div>
                    <form
                      onSubmit={handleSubmit}
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur"
                    >
                      <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Pregunta sobre mi experiencia, proyectos o habilidades..."
                        className="flex-1 border-none bg-transparent text-base focus-visible:ring-0"
                      />
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isLoading}
                        className="gap-2 px-5"
                      >
                        Send
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="secondary"
                      size="sm"
                      onClick={() => setInput(action.prompt)}
                    >
                      {action.label}
                    </Button>
                  ))}
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setClosingCal(false);
                      setShowCal(true);
                    }}
                  >
                    Reserva una cita
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <Button variant="secondary" size="lg" className="gap-2 bg-white/10">
                <Play className="h-4 w-4" />
                Ver demo sin código
              </Button>
              <Button variant="ghost" size="lg" className="gap-2 bg-white/5">
                <Rocket className="h-4 w-4" />
                Integraciones
              </Button>
              <Button variant="ghost" size="lg" className="gap-2 bg-white/5">
                <ArrowRight className="h-4 w-4" />
                Solicitar template
              </Button>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-black/30 px-5 py-4 text-sm text-muted-foreground backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            © {new Date().getFullYear()} Stephan Barker — Asesor Digital
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a className="inline-flex items-center gap-2 hover:text-primary" href="mailto:contacto@stephanbarker.com">
              <Link2 className="h-4 w-4" />
              contacto@stephanbarker.com
            </a>
            <span className="hidden h-1 w-1 rounded-full bg-border md:inline-block" />
            <a className="hover:text-primary" href="#" aria-label="LinkedIn">
              LinkedIn
            </a>
            <a className="hover:text-primary" href="#" aria-label="GitHub">
              GitHub
            </a>
            <a className="hover:text-primary" href="#" aria-label="Portfolio">
              Portafolio
            </a>
          </div>
        </footer>
      </div>
      {showCal && (
        <div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm",
            closingCal
              ? "animate-out fade-out-0 duration-200"
              : "animate-in fade-in-0 duration-200",
          )}
        >
          <div
            className={cn(
              "relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-black/85 p-4 shadow-2xl",
              closingCal
                ? "animate-out fade-out-0 zoom-out-95 duration-200"
                : "animate-in fade-in-0 zoom-in-95 duration-200",
            )}
          >
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-lg font-semibold text-foreground">
                Reserva una cita (Cal.com)
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setClosingCal(true);
                  setTimeout(() => {
                    setShowCal(false);
                    setClosingCal(false);
                  }, 180);
                }}
              >
                ✕
              </Button>
            </div>
            <div
              id="my-cal-inline-30-min-meeting"
              className="h-[620px] w-full overflow-auto rounded-xl bg-black/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-border/60 px-3 py-1 text-xs">
      <strong className="text-primary">{value}</strong>{" "}
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

function ChatBubble({
  role,
  content,
}: {
  role: "user" | "assistant" | "system";
  content: string;
}) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";
  const label = isUser ? "Tú" : isAssistant ? "SB" : "Sys";

  return (
    <div
      className={cn(
        "flex w-full items-start gap-3",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {label}
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-black/60 text-foreground border border-white/5",
        )}
      >
        {content}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-foreground">
          {label}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-black/20 p-6 text-center text-sm text-muted-foreground">
      <Sparkles className="h-6 w-6 text-primary" />
      <p>Pregunta algo sobre mi experiencia, habilidades o proyectos.</p>
    </div>
  );
}
