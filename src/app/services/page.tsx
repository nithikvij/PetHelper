import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ServicesLocator } from "@/components/services/ServicesLocator";
import { VetLocator } from "@/components/symptoms/VetLocator";
import { PharmacyLocator } from "@/components/symptoms/PharmacyLocator";

export default async function ServicesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Local Pet Services</h1>
        <p className="text-muted-foreground mt-2">
          Find trusted pet care services near you
        </p>
      </div>

      <div className="space-y-6">
        {/* Main Services Locator */}
        <ServicesLocator />

        {/* Healthcare Section */}
        <div className="pt-4">
          <h2 className="text-xl font-semibold text-foreground mb-4">Healthcare Services</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <VetLocator species="dog" isEmergency={false} />
            <PharmacyLocator />
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 p-6 bg-secondary/50 rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-3">Tips for Choosing Pet Services</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Read reviews and ask for recommendations from other pet owners</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Visit facilities in person before booking to check cleanliness and safety</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Verify that staff are trained and certified in pet care</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Ask about emergency procedures and veterinary partnerships</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">•</span>
              <span>Ensure vaccinations and health requirements are enforced</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
