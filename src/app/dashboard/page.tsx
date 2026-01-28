import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSpeciesInfo } from "@/types";
import { PharmacyLocator } from "@/components/symptoms/PharmacyLocator";
import { VetLocator } from "@/components/symptoms/VetLocator";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const pets = await prisma.pet.findMany({
    where: { userId: session.user.id },
    include: {
      symptomChecks: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Pets</h1>
          <p className="text-muted-foreground">
            {pets.length === 0
              ? "Add your first pet to get started"
              : `You have ${pets.length} pet${pets.length > 1 ? "s" : ""} registered`}
          </p>
        </div>
        <Link href="/pets/new">
          <Button>Add Pet</Button>
        </Link>
      </div>

      {pets.length === 0 ? (
        <Card className="text-center py-12 border-border/60">
          <CardContent>
            <div className="text-6xl mb-4">🐾</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">No pets yet</h2>
            <p className="text-muted-foreground mb-4">
              Add your first pet to start using the symptom checker
            </p>
            <Link href="/pets/new">
              <Button>Add Your First Pet</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {pets.map((pet) => {
            const speciesInfo = getSpeciesInfo(pet.species);
            const weightUnit =
              speciesInfo.vetType === "aquatic"
                ? "cm"
                : ["hamster", "guinea_pig", "parakeet", "canary", "finch"].includes(pet.species)
                  ? "g"
                  : "kg";

            return (
              <Card key={pet.id} className="hover:shadow-md transition-shadow border-border/60">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {/* Pet Photo */}
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0">
                        <span className="text-2xl">{speciesInfo.icon}</span>
                      </div>
                      <CardTitle className="text-xl text-foreground">{pet.name}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="bg-accent text-primary">
                      {speciesInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
                    {pet.breed && (
                      <p>
                        {speciesInfo.vetType === "avian"
                          ? "Variety"
                          : speciesInfo.vetType === "aquatic"
                            ? "Type"
                            : "Breed"}
                        : {pet.breed}
                      </p>
                    )}
                    <p>
                      Age:{" "}
                      {pet.age >= 12
                        ? `${Math.floor(pet.age / 12)} year${Math.floor(pet.age / 12) > 1 ? "s" : ""}`
                        : `${pet.age} month${pet.age > 1 ? "s" : ""}`}
                    </p>
                    {pet.weight && (
                      <p>
                        {speciesInfo.vetType === "aquatic" ? "Size" : "Weight"}: {pet.weight}{" "}
                        {weightUnit}
                      </p>
                    )}
                  </div>

                  {pet.symptomChecks[0] && (
                    <div className="text-xs text-muted-foreground/70 mb-4">
                      Last check:{" "}
                      {new Date(pet.symptomChecks[0].createdAt).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Link href={`/pets/${pet.id}/check`} className="flex-1">
                      <Button className="w-full" size="sm">
                        Check Symptoms
                      </Button>
                    </Link>
                    <Link href={`/pets/${pet.id}/history`}>
                      <Button variant="outline" size="sm">
                        History
                      </Button>
                    </Link>
                    <Link href={`/pets/${pet.id}/share`}>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </Link>
                    <Link href={`/pets/${pet.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Access Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Quick Access</h2>
          <Link href="/services">
            <Button variant="outline" size="sm">
              View All Services →
            </Button>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <VetLocator species="dog" isEmergency={false} />
          <PharmacyLocator />
        </div>
      </div>
    </div>
  );
}
