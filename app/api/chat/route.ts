import { NextResponse } from "next/server";
import { loadProfile } from "@/lib/profile";
import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

// Modelo a usar en OpenRouter
const MODEL = "openai/gpt-4o-mini";

export const runtime = "nodejs";

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

    // Log incoming messages for debugging
    console.log("Received messages:", {
      count: messages.length,
      lastMessage: messages[messages.length - 1],
      hasParts: messages[messages.length - 1]?.parts !== undefined,
      hasContent: messages[messages.length - 1]?.content !== undefined,
      allMessages: messages.map((msg, idx) => ({
        index: idx,
        role: msg.role,
        hasParts: !!msg.parts,
        hasContent: !!msg.content,
        partsLength: msg.parts?.length || 0,
        contentPreview: msg.content?.substring(0, 50) || extractTextFromMessage(msg).substring(0, 50),
      })),
    });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OpenRouter API key not set (OPENROUTER_API_KEY)");
      return NextResponse.json(
        { error: "OpenRouter API key not set" },
        { status: 500 },
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

    // Log API key status (without exposing the key)
    console.log("OpenRouter AI configuration:", {
      hasApiKey: !!apiKey,
      model: MODEL,
    });

    // Filter out system messages from the messages array (they should only be in system prompt)
    const conversationMessages = messages.filter(
      (msg) => msg.role !== "system"
    );

    // Validate and clean messages
    // Ensure messages are in the correct format for the AI SDK
    // Convert from UIMessage format (with parts) to CoreMessage format (with content)
    const cleanedMessages = conversationMessages
      .map((msg, idx) => {
        // Ensure role is valid
        const role = msg.role === "system" ? "user" : (msg.role as "user" | "assistant");
        
        // Extract text content from parts (AI SDK v5) or content (legacy)
        const content = extractTextFromMessage(msg);
        
        console.log(`Processing message ${idx}:`, {
          role,
          contentLength: content.length,
          contentPreview: content.substring(0, 50),
          hasParts: !!msg.parts,
          hasContent: !!msg.content,
        });
        
        // Skip empty messages
        if (!content || content.length === 0) {
          console.warn(`Skipping empty message at index ${idx}`);
          return null;
        }
        
        return {
          role,
          content,
        };
      })
      .filter((msg): msg is { role: "user" | "assistant"; content: string } => msg !== null);

    if (cleanedMessages.length === 0) {
      console.error("No valid messages after cleaning");
      return NextResponse.json(
        { error: "No valid messages" },
        { status: 400 },
      );
    }

    // Prepare messages for OpenRouter
    const openRouter = createOpenRouter({
      apiKey: apiKey,
    });

    try {
      // Use AI SDK streamText with OpenRouter
      const result = streamText({
        model: openRouter(MODEL),
        system: systemPrompt,
        messages: cleanedMessages,
        temperature: 0.7,
      });

      // Use toDataStreamResponse for DefaultChatTransport compatibility
      return (result as any).toDataStreamResponse();
    } catch (error) {
      console.error("Error calling OpenRouter AI:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Check if it's a network error
      if (error instanceof Error && (error.message.includes('fetch failed') || error.message.includes('ETIMEDOUT'))) {
        return NextResponse.json(
          {
            error: "Network error",
            message: "Error de conexión con OpenRouter. Por favor, verifica tu conexión e intenta de nuevo.",
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        {
          error: "Error calling OpenRouter AI",
          message: errorMsg,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

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
  
  // Build stack technology string
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
      return `${p.nombre} (${p.categoria}): ${p.descripcion}.${techs}${impacto}${p.imagen ? ` (imagen: ${p.imagen})` : ""}`;
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
    "- Habla de forma natural, conversacional y amigable, como si estuvieras hablando con un amigo o colega.",
    "- SIEMPRE invita al usuario a conocer más sobre ti al final de cada respuesta. Usa frases como: '¿Te gustaría saber más sobre...?', '¿Hay algo más que te interese?', '¿Quieres que te cuente sobre...?'",
    "- Sé entusiasta y apasionado cuando hablas de tus proyectos y tecnologías.",
    "- Comparte detalles específicos y ejemplos concretos cuando sea relevante.",
    "",
    "REGLAS IMPORTANTES SOBRE MOSTRAR CONTENIDO VISUAL:",
    "- Cuando el usuario pregunta por PROYECTOS o PORTAFOLIO, DEBES incluir en tu respuesta la frase exacta: 'Aquí tienes un carrusel con mis proyectos destacados' o 'Puedes ver un carrusel con mis proyectos'.",
    "- Cuando el usuario pregunta por TECNOLOGÍAS, STACK TECNOLÓGICO o HERRAMIENTAS, DEBES incluir en tu respuesta la frase exacta: 'Aquí tienes un marquee con las tecnologías que uso' o 'Puedes ver un marquee con mi stack tecnológico'.",
        "- Cuando el usuario pregunta por CONTACTO, CITA, RESERVAR, o '¿Cómo puedo contactarte?', DEBES mencionar explícitamente que puedes abrir el calendario de reservas usando Cal.com. El sistema mostrará automáticamente el widget de Cal.com cuando detecte estas palabras. Responde de forma clara y directa, por ejemplo: '¡Por supuesto! Puedes reservar una cita conmigo usando mi calendario de Cal.com. Aquí tienes el widget para que elijas el horario que mejor te convenga.'",
        "- Cuando el usuario pregunta por CV, CURRICULUM, o quiere descargar información profesional, menciona que tienen disponible mi CV actualizado en PDF con diseño profesional. Pueden descargarlo desde el botón en el footer o desde las acciones rápidas del chat.",
        "- NUNCA menciones proyectos cuando te pregunten por tecnologías, y viceversa.",
    "- Si el usuario pregunta por tecnologías, habla SOLO de tecnologías, herramientas y stack. NO menciones proyectos a menos que el usuario pregunte específicamente por ellos.",
    "- Si el usuario pregunta por proyectos, habla SOLO de proyectos y portafolio. NO menciones tecnologías a menos que el usuario pregunte específicamente por ellas.",
    "",
    "- Si no encuentras información específica, sé honesto y ofrece hablar de algo relacionado que sí conozcas.",
    "- Mantén las respuestas concisas pero informativas (2-4 oraciones normalmente, más si el usuario pide detalles).",
    "- Usa emojis ocasionalmente para hacer la conversación más amigable (👋 😊 🚀 💻 ⚡).",
    "- Responde SIEMPRE en español.",
    "",
    "RECUERDA: El objetivo es que el usuario se sienta como si estuviera hablando directamente contigo, Stephan Barker, y que siempre quiera conocer más sobre tu trabajo y experiencia."
  ].filter(Boolean).join("\n");
}

