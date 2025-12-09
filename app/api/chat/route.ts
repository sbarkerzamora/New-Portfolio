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

    // Filter out system messages from the messages array (they should only be in system prompt)
    const conversationMessages = messages.filter(
      (msg) => msg.role !== "system"
    );

    console.log("Sending request to OpenRouter:", {
      model: MODEL,
      messageCount: conversationMessages.length,
      hasSystemPrompt: !!systemPrompt,
    });

    const result = await streamText({
      model: openai(MODEL),
      system: systemPrompt,
      messages: conversationMessages,
      temperature: 0.5,
      maxTokens: 400,
    });

    return result.toDataStreamResponse();
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

