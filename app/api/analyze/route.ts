import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveAnalysis } from "@/lib/db";
import type { ApiResponse, ReviewInput } from "@/types";

const API_BASE = process.env.API_BASE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const body = await request.json();
    const { reviews, langue = "fr" } = body;

    if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucun avis fourni" },
        { status: 400 }
      );
    }

    // Appel au backend FastAPI
    const res = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews, langue }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("FastAPI error:", errText);
      return NextResponse.json(
        { success: false, error: `Erreur backend: ${res.status}` },
        { status: 502 }
      );
    }

    const data: ApiResponse = await res.json();

    // Persistance en base si utilisateur connecté
    if (userId && data.success) {
      try {
        await saveAnalysis({
          user_id: userId,
          reviews_json: reviews,
          diagnostic_json: data.diagnostic,
          optimized_json: data.optimized,
          note_moyenne: data.optimized.meta.note_moyenne_source,
          langue,
        });
      } catch (dbError) {
        console.error("Failed to save analysis:", dbError);
        // On ne bloque pas la réponse si la DB échoue
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { success: false, error: "Erreur de connexion au serveur NLP" },
      { status: 500 }
    );
  }
}
