import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { petId, selectedCheckIds, careNotes, vetEmail, vetName } = await request.json();

    if (!petId) {
      return NextResponse.json(
        { error: "Pet ID is required" },
        { status: 400 }
      );
    }

    // Verify pet ownership
    const pet = await prisma.pet.findFirst({
      where: {
        id: petId,
        userId: session.user.id,
      },
    });

    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // Generate unique share token
    const shareToken = randomBytes(32).toString("hex");

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create shared record
    const sharedRecord = await prisma.sharedRecord.create({
      data: {
        shareToken,
        petId,
        userId: session.user.id,
        selectedCheckIds: JSON.stringify(selectedCheckIds || []),
        careNotes: careNotes || null,
        vetName: vetName || null,
        vetEmail: vetEmail || null,
        expiresAt,
      },
    });

    // Generate the share URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/shared/${sharedRecord.shareToken}`;

    return NextResponse.json({
      shareUrl,
      expiresAt: sharedRecord.expiresAt,
    });
  } catch (error) {
    console.error("Share record error:", error);
    return NextResponse.json(
      { error: "Failed to create share link. Please try again." },
      { status: 500 }
    );
  }
}
