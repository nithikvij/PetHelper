import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSpeciesInfo } from "@/types";

export default async function SharedRecordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Find the shared record
  const sharedRecord = await prisma.sharedRecord.findUnique({
    where: { shareToken: token },
  });

  if (!sharedRecord) {
    notFound();
  }

  // Check if expired
  if (new Date() > sharedRecord.expiresAt) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">⏰</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Link Expired</h1>
        <p className="text-muted-foreground">
          This shared record link has expired. Please ask the pet owner to generate a new link.
        </p>
      </div>
    );
  }

  // Update view count
  await prisma.sharedRecord.update({
    where: { id: sharedRecord.id },
    data: { viewCount: { increment: 1 } },
  });

  // Get pet details
  const pet = await prisma.pet.findUnique({
    where: { id: sharedRecord.petId },
  });

  if (!pet) {
    notFound();
  }

  // Get selected symptom checks
  const selectedCheckIds = JSON.parse(sharedRecord.selectedCheckIds) as string[];
  const symptomChecks = await prisma.symptomCheck.findMany({
    where: {
      id: { in: selectedCheckIds },
      petId: pet.id,
    },
    orderBy: { createdAt: "desc" },
  });

  const speciesInfo = getSpeciesInfo(pet.species);
  const knownConditions = JSON.parse(pet.knownConditions || "[]") as string[];
  const allergies = JSON.parse(pet.allergies || "[]") as string[];
  const medications = JSON.parse(pet.medications || "[]") as string[];

  const severityColors: Record<string, string> = {
    Emergency: "bg-red-500",
    Urgent: "bg-amber-500",
    "Non-Urgent": "bg-yellow-500",
    Monitor: "bg-emerald-500",
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">{speciesInfo.icon}</div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {pet.name}&apos;s Medical Record
        </h1>
        {sharedRecord.vetName && (
          <p className="text-muted-foreground">
            Prepared for: {sharedRecord.vetName}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-2">
          Shared on {new Date(sharedRecord.createdAt).toLocaleDateString()} •
          Expires {new Date(sharedRecord.expiresAt).toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-6">
        {/* Pet Information */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-foreground">Pet Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Name</span>
                <span className="text-foreground font-medium">{pet.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Species</span>
                <span className="text-foreground">{speciesInfo.label}</span>
              </div>
              {pet.breed && (
                <div>
                  <span className="text-muted-foreground block">Breed</span>
                  <span className="text-foreground">{pet.breed}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground block">Age</span>
                <span className="text-foreground">
                  {pet.age >= 12
                    ? `${Math.floor(pet.age / 12)} year${Math.floor(pet.age / 12) > 1 ? "s" : ""}`
                    : `${pet.age} month${pet.age > 1 ? "s" : ""}`}
                </span>
              </div>
              {pet.weight && (
                <div>
                  <span className="text-muted-foreground block">Weight</span>
                  <span className="text-foreground">{pet.weight} kg</span>
                </div>
              )}
            </div>

            {(knownConditions.length > 0 || allergies.length > 0 || medications.length > 0) && (
              <div className="border-t border-border pt-4 space-y-3">
                {knownConditions.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm block mb-1">Known Conditions</span>
                    <div className="flex flex-wrap gap-2">
                      {knownConditions.map((condition, i) => (
                        <Badge key={i} variant="outline">{condition}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {allergies.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm block mb-1">Allergies</span>
                    <div className="flex flex-wrap gap-2">
                      {allergies.map((allergy, i) => (
                        <Badge key={i} variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {medications.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm block mb-1">Current Medications</span>
                    <div className="flex flex-wrap gap-2">
                      {medications.map((med, i) => (
                        <Badge key={i} variant="secondary">{med}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Care Notes */}
        {sharedRecord.careNotes && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Care Notes from Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground whitespace-pre-wrap">{sharedRecord.careNotes}</p>
            </CardContent>
          </Card>
        )}

        {/* Symptom History */}
        {symptomChecks.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-foreground">Symptom History</CardTitle>
              <CardDescription>
                {symptomChecks.length} symptom check{symptomChecks.length !== 1 ? "s" : ""} shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {symptomChecks.map((check) => {
                const possibleCauses = JSON.parse(check.possibleCauses) as string[];
                const recommendations = JSON.parse(check.recommendations) as string[];

                return (
                  <div key={check.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-foreground">
                        {new Date(check.createdAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <Badge className={`${severityColors[check.severityCategory] || "bg-muted"} text-white`}>
                        {check.severityCategory}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Reported Symptoms
                        </h4>
                        <p className="text-foreground">{check.symptoms}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Possible Causes
                        </h4>
                        <ul className="list-disc list-inside text-foreground text-sm">
                          {possibleCauses.map((cause, i) => (
                            <li key={i}>{cause}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Recommendations
                        </h4>
                        <ul className="list-disc list-inside text-foreground text-sm">
                          {recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Vet Visit Guidance
                        </h4>
                        <p className="text-foreground text-sm">{check.whenToVisitVet}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Disclaimer */}
        <Alert className="bg-secondary border-border">
          <AlertDescription className="text-muted-foreground text-sm">
            <strong className="text-foreground">Note:</strong> This record was generated using
            AI-assisted symptom analysis. All information should be verified by a qualified
            veterinarian. The symptom assessments are for informational purposes only and do not
            constitute veterinary medical advice.
          </AlertDescription>
        </Alert>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Generated by PetHelper - Pet Symptom Checker</p>
        </div>
      </div>
    </div>
  );
}
