import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pets = await prisma.pet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pets);
  } catch (error) {
    console.error("Get pets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      name,
      species,
      breed,
      age,
      weight,
      photoUrl,
      knownConditions,
      allergies,
      medications,
    } = data;

    if (!name || !species || !age) {
      return NextResponse.json(
        { error: "Name, species, and age are required" },
        { status: 400 }
      );
    }

    const pet = await prisma.pet.create({
      data: {
        name,
        species,
        breed: breed || null,
        age,
        weight: weight || null,
        photoUrl: photoUrl || null,
        knownConditions: JSON.stringify(knownConditions || []),
        allergies: JSON.stringify(allergies || []),
        medications: JSON.stringify(medications || []),
        userId: session.user.id,
      },
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error) {
    console.error("Create pet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
