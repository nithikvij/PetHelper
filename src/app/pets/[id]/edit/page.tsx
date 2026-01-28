import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import { PetForm } from "@/components/pets/PetForm";

export default async function EditPetPage({
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PetForm initialData={pet} />
    </div>
  );
}
