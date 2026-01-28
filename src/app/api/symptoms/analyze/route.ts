import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeSymptoms } from "@/lib/ai/claude";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { petId, symptoms, media } = await request.json();

    if (!petId || !symptoms) {
      return NextResponse.json(
        { error: "Pet ID and symptoms are required" },
        { status: 400 }
      );
    }

    // Validate media if provided (array of { type: "image", data: string })
    const validMedia = Array.isArray(media)
      ? media.filter(
          (m: { type?: string; data?: string }) =>
            m.type === "image" && typeof m.data === "string" && m.data.startsWith("data:image")
        )
      : [];

    // Get pet with ownership verification
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: session.user.id,
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Parse JSON fields
    const petInfo = {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      knownConditions: JSON.parse(pet.knownConditions) as string[],
      allergies: JSON.parse(pet.allergies) as string[],
      medications: JSON.parse(pet.medications) as string[],
    };

    // Check if AI is available
    const hasApiKey = process.env.ANTHROPIC_API_KEY &&
                      process.env.ANTHROPIC_API_KEY !== "your-anthropic-api-key-here";

    let analysis;

    if (hasApiKey) {
      // Analyze symptoms with Claude (pass media for image analysis)
      analysis = await analyzeSymptoms(symptoms, petInfo, validMedia);
    } else {
      // Placeholder response when AI is not configured
      analysis = {
        possibleCauses: [
          "AI analysis is not available - please consult a veterinarian for proper diagnosis"
        ],
        severityCategory: "Non-Urgent",
        recommendations: [
          "Contact your local veterinarian for a professional assessment",
          "Monitor your pet's symptoms and note any changes",
          "Keep your pet comfortable and hydrated",
          "AI symptom analysis will be available once configured"
        ],
        whenToVisitVet: "For any concerning symptoms, please visit your veterinarian for a proper examination and diagnosis.",
        disclaimer: "This is a placeholder response. AI-powered symptom analysis is not currently configured. Please consult a qualified veterinarian for medical advice about your pet."
      };
    }

    // Save to database
    await prisma.symptomCheck.create({
      data: {
        petId: pet.id,
        symptoms,
        possibleCauses: JSON.stringify(analysis.possibleCauses),
        severityCategory: analysis.severityCategory,
        recommendations: JSON.stringify(analysis.recommendations),
        whenToVisitVet: analysis.whenToVisitVet,
        disclaimer: analysis.disclaimer,
      },
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Symptom analysis error:", error);

    // Check for API key issues
    if (error instanceof Error && error.message.includes("API")) {
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze symptoms. Please try again." },
      { status: 500 }
    );
  }
}
