import { NextResponse } from "next/server";
import { loadProfile } from "@/lib/profile";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "nodejs";

/**
 * LLM Provider Configuration
 * 
 * This project supports multiple LLM providers. Configure your provider using environment variables:
 * 
 * 1. OpenRouter (default): Set LLM_PROVIDER=openrouter and OPENROUTER_API_KEY
 *    - Supports multiple models from different providers
 *    - Get API key: https://openrouter.ai/keys
 *    - Models: https://openrouter.ai/models
 * 
 * 2. OpenAI: Set LLM_PROVIDER=openai and OPENAI_API_KEY
 *    - Direct OpenAI API access
 *    - Get API key: https://platform.openai.com/api-keys
 * 
 * 3. Custom: Implement your own provider in the getLLMModel function below
 * 
 * The model can be configured via environment variables:
 * - OPENROUTER_MODEL (for OpenRouter)
 * - OPENAI_MODEL (for OpenAI)
 * 
 * Default model: openai/gpt-4o-mini (OpenRouter) or gpt-4o-mini (OpenAI)
 */

/**
 * Gets the configured LLM model based on environment variables
 * @returns A configured model instance from the selected provider
 * @throws Error if provider is not configured correctly
 */
function getLLMModel() {
  const provider = (process.env.LLM_PROVIDER || "openrouter").toLowerCase();

  switch (provider) {
    case "openrouter": {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OpenRouter API key not set. Please set OPENROUTER_API_KEY in your environment variables."
        );
      }

      const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
      const openrouter = createOpenRouter({ apiKey });
      
      console.log("Using OpenRouter provider:", { model, hasApiKey: !!apiKey });
      return openrouter(model);
    }

    case "openai": {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error(
          "OpenAI API key not set. Please set OPENAI_API_KEY in your environment variables."
        );
      }

      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const openai = createOpenAI({ apiKey });
      
      console.log("Using OpenAI provider:", { model, hasApiKey: !!apiKey });
      return openai(model);
    }

    // Add more providers here as needed
    // Example for Anthropic:
    // case "anthropic": {
    //   const apiKey = process.env.ANTHROPIC_API_KEY;
    //   if (!apiKey) {
    //     throw new Error("Anthropic API key not set. Please set ANTHROPIC_API_KEY.");
    //   }
    //   const model = process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022";
    //   const anthropic = createAnthropic({ apiKey });
    //   return anthropic(model);
    // }

    default:
      throw new Error(
        `Unsupported LLM provider: ${provider}. Supported providers: openrouter, openai. ` +
        `Set LLM_PROVIDER environment variable to one of these values.`
      );
  }
}

// Helper function to extract text content from UIMessage parts (AI SDK v5 format)
function extractTextFromMessage(msg: any): string {
  // If message has 'parts' (AI SDK v5 format), extract text from parts
  if (msg.parts && Array.isArray(msg.parts)) {
    return msg.parts
      .filter((part: any) => part.type === "text" && part.text)
      .map((part: any) => part.text)
      .join("");
  }
  // Fallback to 'content' field (legacy format)
  return String(msg.content || "").trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: Array<{
        role: "system" | "user" | "assistant";
        content?: string;
        parts?: Array<{ type: string; text?: string }>;
      }>;
    };

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error("Invalid messages format:", messages);
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 },
      );
    }

    // Load profile
    let profile;
    try {
      profile = await loadProfile();
    } catch (profileError) {
      console.error("Error loading profile:", profileError);
      return NextResponse.json(
        { error: "Error loading profile data" },
        { status: 500 },
      );
    }

    const systemPrompt = buildSystemPrompt(profile);

    // Get configured LLM model
    let llmModel;
    let modelName: string;
    try {
      llmModel = getLLMModel();
      // Extract model name for logging (this is provider-specific)
      const provider = (process.env.LLM_PROVIDER || "openrouter").toLowerCase();
      if (provider === "openrouter") {
        modelName = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
      } else if (provider === "openai") {
        modelName = process.env.OPENAI_MODEL || "gpt-4o-mini";
      } else {
        modelName = "unknown";
      }
    } catch (modelError) {
      console.error("Error configuring LLM model:", modelError);
      const errorMessage = modelError instanceof Error ? modelError.message : String(modelError);
      return NextResponse.json(
        { 
          error: "LLM configuration error",
          message: errorMessage,
        },
        { status: 500 },
      );
    }

    // Filter out system messages from the messages array (they should only be in system prompt)
    const conversationMessages = messages.filter(
      (msg) => msg.role !== "system"
    );

    // Validate and clean messages
    const cleanedMessages = conversationMessages
      .map((msg, idx) => {
        const role = msg.role === "system" ? "user" : (msg.role as "user" | "assistant");
        const content = extractTextFromMessage(msg);
        
        console.log(`Processing message ${idx}:`, {
          role,
          contentLength: content.length,
          contentPreview: content.substring(0, 50),
        });
        
        if (!content || content.length === 0) {
          console.warn(`Skipping empty message at index ${idx}`);
          return null;
        }
        
        return { role, content };
      })
      .filter((msg): msg is { role: "user" | "assistant"; content: string } => msg !== null);

    if (cleanedMessages.length === 0) {
      console.error("No valid messages after cleaning");
      return NextResponse.json(
        { error: "No valid messages" },
        { status: 400 },
      );
    }

    try {
      // Use streamText from AI SDK with the configured model
      // Note: Type assertion needed due to different model types from different providers
      const result = streamText({
        model: llmModel as any,
        system: systemPrompt,
        messages: cleanedMessages,
      });

      // Consume the stream and merge into text stream response
      // This ensures proper streaming to the useChat hook
      return result.toTextStreamResponse({
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "x-model-used": modelName,
          "x-provider": process.env.LLM_PROVIDER || "openrouter",
        },
      });
    } catch (error) {
      console.error("Error calling LLM:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      const provider = process.env.LLM_PROVIDER || "openrouter";
      
      if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('ETIMEDOUT'))) {
        return NextResponse.json(
          {
            error: "Network error",
            message: `Error de conexión con ${provider}. Por favor, verifica tu conexión e intenta de nuevo.`,
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        {
          error: `Error calling ${provider} AI`,
          message: errorMsg,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { 
        error: "Chat error",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(profile: Awaited<ReturnType<typeof loadProfile>>) {
  const hero = profile.perfil_profesional;
  const stats = profile.estadisticas;
  const stack = profile.stack_tecnologico;
  
  const stackTech = [
    `Frontend: ${stack.frontend_moderno.join(", ")}`,
    `Backend: ${stack.backend_y_datos.join(", ")}`,
    `DevOps: ${stack.devops_e_infraestructura.join(", ")}`,
    `Pagos: ${stack.pagos_y_comercio.join(", ")}`,
    `Herramientas: ${stack.herramientas_y_flujo.join(", ")}`,
  ].join(" | ");
  
  const experiencia = profile.experiencia_laboral
    .map((e) => {
      const empresa = e.empresa ?? "Independiente";
      const rol = e.rol ?? "Desarrollador";
      const periodo = e.periodo ? ` (${e.periodo})` : "";
      const logros = e.logros ? ` Logros: ${e.logros.join(". ")}.` : "";
      return `${rol} en ${empresa}${periodo}: ${e.descripcion}.${logros}`;
    })
    .join(" | ");
  
  const proyectos = profile.proyectos_destacados
    .map((p) => {
      const impacto = p.impacto ? ` Impacto: ${p.impacto}.` : "";
      const techs = p.tecnologias ? ` Tecnologías: ${p.tecnologias.join(", ")}.` : "";
      return `${p.nombre} (${p.categoria}): ${p.descripcion}.${techs}${impacto}`;
    })
    .join(" | ");

  const valores = hero.valores ? `Valores: ${hero.valores.join(", ")}.` : "";
  const filosofia = hero.filosofia_trabajo ? `Filosofía: ${hero.filosofia_trabajo}.` : "";
  const enfoque = hero.enfoque ? `Enfoque: ${hero.enfoque}.` : "";
  const logros = hero.logros_destacados ? `Logros destacados: ${hero.logros_destacados.join(". ")}.` : "";

  return [
    "Eres STEPHAN BARKER hablando directamente con el usuario. No eres un asistente, ERES Stephan Barker. Habla en primera persona como si fueras él mismo.",
    "",
    "INFORMACIÓN PERSONAL:",
    `Soy ${hero.nombre}, ${hero.titulo_principal}.`,
    `Resumen: ${hero.resumen_perfil}`,
    `Descripción: ${hero.descripcion_hero}`,
    filosofia,
    valores,
    enfoque,
    logros,
    "",
    "EXPERIENCIA LABORAL:",
    experiencia,
    "",
    "STACK TECNOLÓGICO:",
    stackTech,
    "",
    "PROYECTOS DESTACADOS:",
    proyectos,
    "",
    "ESTADÍSTICAS:",
    `Más de ${stats.anos_experiencia} años de experiencia, ${stats.proyectos_exitosos} proyectos exitosos, ${stats.clientes_satisfechos} clientes satisfechos.`,
    "",
    "ENLACES:",
    `GitHub: ${hero.enlaces.github}`,
    `Portfolio: ${hero.enlaces.portfolio}`,
    `CV PDF: ${hero.enlaces.cv} (disponible para descarga)`,
    "",
    "INSTRUCCIONES DE CONVERSACIÓN:",
    "- Habla de forma natural, conversacional y amigable.",
    "- SIEMPRE invita al usuario a conocer más sobre ti al final de cada respuesta.",
    "- Sé entusiasta y apasionado cuando hablas de tus proyectos y tecnologías.",
    "",
    "REGLAS IMPORTANTES SOBRE MOSTRAR CONTENIDO VISUAL:",
    "- Cuando el usuario pregunta por PROYECTOS o PORTAFOLIO, incluye: 'Aquí tienes un carrusel con mis proyectos destacados'.",
    "- Cuando el usuario pregunta por TECNOLOGÍAS, STACK TECNOLÓGICO o HERRAMIENTAS, incluye: 'Aquí tienes un marquee con las tecnologías que uso'.",
    "- Cuando el usuario pregunta por CONTACTO, CITA o RESERVAR, menciona que puedes abrir el calendario de reservas.",
    "- Cuando el usuario pregunta por CV, CURRICULUM, menciona que tienen disponible mi CV actualizado en PDF.",
    "",
    "- Mantén las respuestas concisas pero informativas (2-4 oraciones normalmente).",
    "- Usa emojis ocasionalmente para hacer la conversación más amigable (👋 😊 🚀 💻 ⚡).",
    "- Responde SIEMPRE en español.",
  ].filter(Boolean).join("\n");
}
