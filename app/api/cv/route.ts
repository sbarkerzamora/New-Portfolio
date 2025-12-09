import { NextResponse } from "next/server";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { loadProfile } from "@/lib/profile";
import { createCVDocument } from "@/components/CVDocument";

/**
 * CV API Route
 * 
 * Generates a PDF CV dynamically from profile.json data.
 * Uses @react-pdf/renderer to create a professional PDF document.
 * 
 * @route GET /api/cv
 * @returns PDF file as response
 */
export const runtime = "nodejs";

export async function GET() {
  try {
    // Load profile data
    const profile = await loadProfile();

    // Create and render PDF document
    const document = createCVDocument(profile);
    const pdfBuffer = await renderToBuffer(document);

    // Convert Buffer to Uint8Array for NextResponse
    const pdfArray = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(pdfArray, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Stephan-Barker-CV.pdf"`,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error generating CV PDF:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      {
        error: "Error generating CV",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

