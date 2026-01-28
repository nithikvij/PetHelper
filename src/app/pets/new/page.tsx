import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PetForm } from "@/components/pets/PetForm";

export const dynamic = "force-dynamic";

export default async function NewPetPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PetForm />
    </div>
  );
}
