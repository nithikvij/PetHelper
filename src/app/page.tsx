import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-accent to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Pet Symptom Checker
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Worried about your pet? Get AI-powered guidance on possible causes,
            severity assessment, and when to visit the vet.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-semibold text-primary">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Add Your Pet</h3>
                <p className="text-muted-foreground">
                  Create a profile with your pet&apos;s species, breed, age, and any
                  known conditions for personalized analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-semibold text-primary">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Describe Symptoms</h3>
                <p className="text-muted-foreground">
                  Tell us what symptoms your pet is experiencing in plain language.
                  Our AI understands natural descriptions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-semibold text-primary">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Guidance</h3>
                <p className="text-muted-foreground">
                  Receive possible causes, severity rating, recommended actions,
                  and guidance on when to see a vet.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Severity Levels Section */}
      <section className="py-16 px-4 bg-secondary/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Severity Categories
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-semibold text-red-800 mb-1">Emergency</h3>
              <p className="text-red-700 text-sm">
                Seek immediate veterinary care. Time-critical situation.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="font-semibold text-orange-800 mb-1">Urgent</h3>
              <p className="text-orange-700 text-sm">
                See a vet within 24 hours. Requires professional attention.
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-800 mb-1">Non-Urgent</h3>
              <p className="text-amber-700 text-sm">
                Schedule a vet visit soon. Monitor for changes.
              </p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <h3 className="font-semibold text-emerald-800 mb-1">Monitor at Home</h3>
              <p className="text-emerald-700 text-sm">
                Safe to observe at home. See vet if symptoms persist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto bg-accent border border-primary/20 rounded-xl p-6">
          <h3 className="font-semibold text-primary mb-2">Important Notice</h3>
          <p className="text-foreground/80 text-sm">
            PetHelper is an informational tool and does not replace professional
            veterinary advice. The AI provides possible causes and guidance based
            on symptoms, but cannot diagnose conditions. Always consult a
            qualified veterinarian for your pet&apos;s health concerns, especially in
            emergencies.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} PetHelper. For informational purposes only.</p>
        </div>
      </footer>
    </div>
  );
}
