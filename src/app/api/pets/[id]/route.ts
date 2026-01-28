import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const pet = await prisma.pet.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    return NextResponse.json(pet);
  } catch (error) {
    console.error("Get pet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingPet = await prisma.pet.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
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

    const pet = await prisma.pet.update({
      where: { id },
      data: {
        name,
        species,
        breed: breed || null,
        age,
        weight: weight || null,
        photoUrl: photoUrl !== undefined ? (photoUrl || null) : existingPet.photoUrl,
        knownConditions: JSON.stringify(knownConditions || []),
        allergies: JSON.stringify(allergies || []),
        medications: JSON.stringify(medications || []),
      },
    });

    return NextResponse.json(pet);
  } catch (error) {
    console.error("Update pet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership
    const existingPet = await prisma.pet.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingPet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    await prisma.pet.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Pet deleted" });
  } catch (error) {
    console.error("Delete pet error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
