import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { loadProfile } from "@/lib/profile";

const MODEL = "openai/gpt-oss-20b:free";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as {
      messages: { role: "system" | "user" | "assistant"; content: string }[];
    };

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not set" },
        { status: 500 },
      );
    }

    const profile = await loadProfile();
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

    const result = await streamText({
      model: openai(MODEL),
      system: systemPrompt,
      messages,
      temperature: 0.2,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Chat error" }, { status: 500 });
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
    .map((e) => `${e.empresa ?? e.rol ?? "Experiencia"}: ${e.descripcion}`)
    .join(" | ");
  const proyectos = profile.proyectos_destacados
    .map((p) => `${p.nombre}: ${p.descripcion}${p.imagen ? ` (imagen: ${p.imagen})` : ""}`)
    .join(" | ");

  return [
    "Eres un asistente en tono profesional y cercano que responde sobre Stephan Barker.",
    `Nombre: ${hero.nombre}. Título: ${hero.titulo_principal}. Resumen: ${hero.resumen_perfil}`,
    `Experiencia: ${experiencia}`,
    `Stack tecnológico: ${stackTech}`,
    `Proyectos: ${proyectos}`,
    `Estadísticas clave: experiencia ${stats.anos_experiencia}, proyectos ${stats.proyectos_exitosos}, clientes ${stats.clientes_satisfechos}`,
    "Si el usuario pide ver proyectos/portafolio, menciona que se puede mostrar un carrusel visual y responde brevemente.",
    "Si no encuentras la respuesta en los datos, indica que no está en el perfil.",
    "Responde en español en formato breve y claro.",
  ].join("\n");
}

