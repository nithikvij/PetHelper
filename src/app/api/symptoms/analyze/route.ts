import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { analyzeSymptoms } from "@/lib/ai/claude";

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

    // Analyze symptoms with Claude (pass media for image analysis)
    const analysis = await analyzeSymptoms(symptoms, petInfo, validMedia);

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
