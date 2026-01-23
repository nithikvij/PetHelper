import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { MedicalRecordShare } from "@/components/records/MedicalRecordShare";
import { getSpeciesInfo } from "@/types";

export default async function ShareRecordsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  const pet = await prisma.pet.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      symptomChecks: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!pet) {
    notFound();
  }

  const speciesInfo = getSpeciesInfo(pet.species);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center flex-shrink-0">
          {pet.photoUrl ? (
            <Image
              src={pet.photoUrl}
              alt={`${pet.name}'s photo`}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-3xl">{speciesInfo.icon}</span>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Share {pet.name}&apos;s Records
          </h1>
          <p className="text-muted-foreground">
            Send medical history and care notes to your vet
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
          Why share records before your visit?
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Saves time during your appointment</li>
          <li>• Helps vets prepare for your pet&apos;s specific needs</li>
          <li>• Provides context on symptom history and severity</li>
          <li>• Ensures important details aren&apos;t forgotten</li>
        </ul>
      </div>

      <MedicalRecordShare pet={pet} />
    </div>
  );
}
