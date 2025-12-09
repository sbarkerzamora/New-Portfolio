import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { loadProfile } from "@/lib/profile";

const MODEL = "openai/gpt-oss-20b:free";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
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
    });

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("OPENROUTER_API_KEY not set");
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not set" },
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

    // Create OpenAI provider with OpenRouter configuration
    const openai = createOpenAI({
      apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      headers: {
        "HTTP-Referer": process.env.OPENROUTER_SITE || "http://localhost:3000",
        "X-Title": "Stephan Barker AI Chat",
      },
    });

    // Log API key status (without exposing the key)
    console.log("OpenRouter configuration:", {
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      baseURL: "https://openrouter.ai/api/v1",
      model: MODEL,
    });

    // Filter out system messages from the messages array (they should only be in system prompt)
    const conversationMessages = messages.filter(
      (msg) => msg.role !== "system"
    );

    // Validate and clean messages
    // Ensure messages are in the correct format for the AI SDK
    const cleanedMessages = conversationMessages
      .map((msg) => {
        // Ensure role is valid
        const role = msg.role === "system" ? "user" : (msg.role as "user" | "assistant");
        const content = String(msg.content || "").trim();
        
        // Skip empty messages
        if (!content || content.length === 0) {
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

    console.log("Sending request to OpenRouter:", {
      model: MODEL,
      messageCount: cleanedMessages.length,
      hasSystemPrompt: !!systemPrompt,
      lastMessage: cleanedMessages[cleanedMessages.length - 1]?.content?.substring(0, 50),
      messages: cleanedMessages.map(m => ({ role: m.role, contentLength: m.content.length })),
    });

    try {
      // Try to get the text stream first to catch any immediate errors
      const result = await streamText({
        model: openai(MODEL),
        system: systemPrompt,
        messages: cleanedMessages,
        temperature: 0.5,
        maxTokens: 400,
        onFinish: async ({ text, finishReason, usage, warnings }) => {
          console.log("Stream finished successfully:", {
            textLength: text?.length,
            finishReason,
            usage,
            warnings: warnings?.length || 0,
          });
        },
        onError: (error: unknown) => {
          console.error("Stream error in streamText onError callback:", error);
          const errorDetails = error instanceof Error 
            ? {
                message: error.message,
                name: error.name,
                stack: error.stack,
                cause: (error as any)?.cause,
              }
            : { error: String(error) };
          console.error("Stream error details:", errorDetails);
        },
      });

      console.log("StreamText result created successfully");
      
      // Return the data stream response directly
      // The AI SDK handles the proper headers and format
      const response = result.toDataStreamResponse();
      
      console.log("Response created:", {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
      });
      
      return response;
    } catch (streamError) {
      console.error("Error in streamText:", streamError);
      
      // If it's an error from the AI SDK, try to extract more details
      const errorDetails = streamError instanceof Error 
        ? {
            message: streamError.message,
            name: streamError.name,
            stack: streamError.stack,
          }
        : { error: String(streamError) };
      
      console.error("Stream error details:", errorDetails);
      
      // Return a proper error response that the client can handle
      return NextResponse.json(
        {
          error: "Error processing stream",
          message: streamError instanceof Error ? streamError.message : "Unknown error",
          details: process.env.NODE_ENV === "development" ? errorDetails : undefined,
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
        "- Cuando el usuario pregunta por CONTACTO, CITA o RESERVAR, menciona que puedes abrir el calendario de reservas. El sistema abrirá automáticamente el modal de Cal.com cuando detecte estas palabras.",
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

