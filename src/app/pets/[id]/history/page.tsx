import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSpeciesInfo } from "@/types";

const severityColors = {
  Emergency: "bg-red-500",
  Urgent: "bg-amber-500",
  "Non-Urgent": "bg-yellow-500",
  Monitor: "bg-emerald-500",
};

export default async function HistoryPage({
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
        <Link href={`/pets/${pet.id}/check`}>
          <Button>New Symptom Check</Button>
        </Link>
      </div>

      <div className="mb-8 flex items-center gap-4">
        {/* Pet Photo */}
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
            {pet.name}&apos;s Health History
          </h1>
          <p className="text-muted-foreground">
            {pet.symptomChecks.length} symptom check
            {pet.symptomChecks.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
      </div>

      {pet.symptomChecks.length === 0 ? (
        <Card className="text-center py-12 border-border/60">
          <CardContent>
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">No history yet</h2>
            <p className="text-muted-foreground mb-4">
              Start by checking {pet.name}&apos;s symptoms
            </p>
            <Link href={`/pets/${pet.id}/check`}>
              <Button>Check Symptoms</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pet.symptomChecks.map((check) => {
            const possibleCauses = JSON.parse(check.possibleCauses) as string[];
            const recommendations = JSON.parse(check.recommendations) as string[];
            const severityColor =
              severityColors[check.severityCategory as keyof typeof severityColors] ||
              "bg-muted-foreground";

            return (
              <Card key={check.id} className="border-border/60">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base text-foreground">
                        {new Date(check.createdAt).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardTitle>
                      <CardDescription>
                        {new Date(check.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <Badge className={`${severityColor} text-white`}>
                      {check.severityCategory}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Reported Symptoms
                      </h4>
                      <p className="text-foreground">{check.symptoms}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Possible Causes
                      </h4>
                      <ul className="list-disc list-inside text-foreground">
                        {possibleCauses.slice(0, 3).map((cause, i) => (
                          <li key={i}>{cause}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Key Recommendations
                      </h4>
                      <ul className="list-disc list-inside text-foreground">
                        {recommendations.slice(0, 2).map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">
                        Vet Visit Guidance
                      </h4>
                      <p className="text-foreground">{check.whenToVisitVet}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
