"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { VoiceInput } from "@/components/ui/voice-input";
import { MediaUpload } from "@/components/ui/media-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmergencyBanner } from "./EmergencyBanner";
import { ResultsDisplay } from "./ResultsDisplay";
import { EMERGENCY_KEYWORDS, getSpeciesInfo, type SymptomAnalysis } from "@/types";

interface MediaFile {
  id: string;
  type: "image" | "video";
  data: string;
  name: string;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number;
  weight: number | null;
  photoUrl: string | null;
  knownConditions: string;
  allergies: string;
  medications: string;
}

interface SymptomFormProps {
  pet: Pet;
}

// Get species-specific symptom placeholder
function getSymptomPlaceholder(species: string, petName: string): string {
  const speciesInfo = getSpeciesInfo(species);

  switch (speciesInfo.vetType) {
    case "avian":
      return `e.g., "${petName} has been sitting at the bottom of the cage, feathers are fluffed up, and hasn't been eating seeds since yesterday."`;
    case "reptile":
      return `e.g., "${petName} hasn't eaten in 2 weeks, seems less active than usual, and I noticed some mucus around the mouth."`;
    case "aquatic":
      return `e.g., "${petName} is swimming sideways, has white spots on the fins, and is staying at the surface gasping."`;
    case "exotic":
      return `e.g., "${petName} hasn't eaten any hay today, seems to be grinding teeth, and the droppings are smaller than usual."`;
    default:
      return `e.g., "${petName} has been vomiting since yesterday morning, about 3 times. Also seems lethargic and not interested in food."`;
  }
}

// Get species-specific helpful hints
function getHelpfulHints(species: string): string[] {
  const speciesInfo = getSpeciesInfo(species);

  switch (speciesInfo.vetType) {
    case "avian":
      return [
        "Changes in droppings (color, consistency, frequency)",
        "Fluffed feathers or sitting at cage bottom",
        "Changes in vocalization or activity level",
        "Breathing changes (tail bobbing, open-mouth breathing)",
        "Appetite and water intake changes",
      ];
    case "reptile":
      return [
        "Feeding schedule and last successful meal",
        "Enclosure temperature and humidity levels",
        "Shedding issues or skin changes",
        "Breathing changes or mouth gaping",
        "Changes in activity or basking behavior",
      ];
    case "aquatic":
      return [
        "Water parameters (ammonia, nitrite, pH, temperature)",
        "Swimming behavior changes",
        "Visible spots, fin damage, or color changes",
        "Breathing rate and position in tank",
        "Recent tank changes or new fish added",
      ];
    case "exotic":
      return [
        "Eating and drinking habits",
        "Droppings (size, shape, frequency)",
        "Activity level and behavior changes",
        "Dental issues (drooling, difficulty eating)",
        "Respiratory sounds or discharge",
      ];
    default:
      return [
        "When symptoms started",
        "Frequency (how often it happens)",
        "Any recent changes (food, environment, etc.)",
        "Changes in eating, drinking, or bathroom habits",
        "Energy level changes",
      ];
  }
}

export function SymptomForm({ pet }: SymptomFormProps) {
  const [symptoms, setSymptoms] = useState("");
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencyDismissed, setEmergencyDismissed] = useState(false);

  const speciesInfo = getSpeciesInfo(pet.species);

  // Handle voice input transcript
  const handleVoiceTranscript = useCallback((text: string) => {
    setSymptoms((prev) => {
      // Add space if there's existing text
      if (prev.trim()) {
        return prev.trim() + " " + text;
      }
      return text;
    });
  }, []);

  // Check for emergency keywords
  useEffect(() => {
    const lowerSymptoms = symptoms.toLowerCase();
    const hasEmergency = EMERGENCY_KEYWORDS.some((keyword) =>
      lowerSymptoms.includes(keyword.toLowerCase())
    );
    setShowEmergency(hasEmergency && !emergencyDismissed);
  }, [symptoms, emergencyDismissed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!symptoms.trim()) {
      setError("Please describe the symptoms");
      return;
    }

    setIsLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // Prepare media data for API (only send images, as videos are typically too large for AI analysis)
      const mediaForAnalysis = media
        .filter((m) => m.type === "image")
        .map((m) => ({ type: m.type, data: m.data }));

      const response = await fetch("/api/symptoms/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          symptoms: symptoms.trim(),
          media: mediaForAnalysis,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to analyze symptoms");
      } else {
        setAnalysis(data.analysis);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCheck = () => {
    setSymptoms("");
    setMedia([]);
    setAnalysis(null);
    setError("");
    setEmergencyDismissed(false);
    setShowEmergency(false);
  };

  const petAge =
    pet.age >= 12
      ? `${Math.floor(pet.age / 12)} year${Math.floor(pet.age / 12) > 1 ? "s" : ""}`
      : `${pet.age} month${pet.age > 1 ? "s" : ""}`;

  const weightUnit =
    speciesInfo.vetType === "aquatic"
      ? "cm"
      : ["hamster", "guinea_pig", "parakeet", "canary", "finch"].includes(pet.species)
        ? "g"
        : "kg";

  return (
    <div className="space-y-6">
      {/* Pet Info Card */}
      <Card className="bg-secondary/50 border-border/60">
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            {/* Pet Photo */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center flex-shrink-0">
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
              <h2 className="font-semibold text-lg text-foreground">{pet.name}</h2>
              <p className="text-sm text-muted-foreground">
                {pet.breed || speciesInfo.label} • {petAge}
                {pet.weight ? ` • ${pet.weight} ${weightUnit}` : ""}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Banner */}
      {showEmergency && (
        <EmergencyBanner
          onDismiss={() => {
            setEmergencyDismissed(true);
            setShowEmergency(false);
          }}
        />
      )}

      {/* Results or Form */}
      {analysis ? (
        <div>
          <ResultsDisplay
            analysis={analysis}
            symptoms={symptoms}
            species={pet.species}
          />
          <div className="mt-6 flex gap-4">
            <Button onClick={handleNewCheck} variant="outline">
              Check New Symptoms
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Describe Symptoms</CardTitle>
            <CardDescription>
              Tell us what symptoms {pet.name} is experiencing. Be as detailed as
              possible including when symptoms started and any changes in
              behavior.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="symptoms">Symptoms</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Voice input</span>
                    <VoiceInput
                      onTranscript={handleVoiceTranscript}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Textarea
                  id="symptoms"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder={getSymptomPlaceholder(pet.species, pet.name)}
                  rows={5}
                  disabled={isLoading}
                />
              </div>

              {/* Media Upload */}
              <MediaUpload
                onMediaChange={setMedia}
                maxFiles={3}
                maxSizeMB={5}
              />

              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">
                  Helpful details to include for {speciesInfo.label}s:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  {getHelpfulHints(pet.species).map((hint, index) => (
                    <li key={index}>{hint}</li>
                  ))}
                </ul>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Analyzing...
                  </span>
                ) : (
                  "Analyze Symptoms"
                )}
              </Button>
            </CardContent>
          </form>
        </Card>
      )}
    </div>
  );
}
