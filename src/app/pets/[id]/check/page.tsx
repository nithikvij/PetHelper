import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { SymptomForm } from "@/components/symptoms/SymptomForm";

export default async function SymptomCheckPage({
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
  });

  if (!pet) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      <SymptomForm pet={pet} />
    </div>
  );
}
