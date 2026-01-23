"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SymptomCheck {
  id: string;
  symptoms: string;
  severityCategory: string;
  possibleCauses: string;
  recommendations: string;
  whenToVisitVet: string;
  createdAt: Date;
}

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  age: number;
  weight: number | null;
  knownConditions: string;
  allergies: string;
  medications: string;
  symptomChecks: SymptomCheck[];
}

interface MedicalRecordShareProps {
  pet: Pet;
}

export function MedicalRecordShare({ pet }: MedicalRecordShareProps) {
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [careNotes, setCareNotes] = useState("");
  const [vetEmail, setVetEmail] = useState("");
  const [vetName, setVetName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const knownConditions = JSON.parse(pet.knownConditions || "[]") as string[];
  const allergies = JSON.parse(pet.allergies || "[]") as string[];
  const medications = JSON.parse(pet.medications || "[]") as string[];

  const handleCheckToggle = (checkId: string) => {
    setSelectedChecks((prev) =>
      prev.includes(checkId)
        ? prev.filter((id) => id !== checkId)
        : [...prev, checkId]
    );
  };

  const handleSelectAll = () => {
    if (selectedChecks.length === pet.symptomChecks.length) {
      setSelectedChecks([]);
    } else {
      setSelectedChecks(pet.symptomChecks.map((c) => c.id));
    }
  };

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    setError("");
    setShareLink(null);

    try {
      const response = await fetch("/api/records/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petId: pet.id,
          selectedCheckIds: selectedChecks,
          careNotes: careNotes.trim(),
          vetEmail: vetEmail.trim(),
          vetName: vetName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to generate share link");
      } else {
        setShareLink(data.shareUrl);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const severityColors: Record<string, string> = {
    Emergency: "bg-red-500",
    Urgent: "bg-amber-500",
    "Non-Urgent": "bg-yellow-500",
    Monitor: "bg-emerald-500",
  };

  return (
    <div className="space-y-6">
      {/* Pet Summary */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Pet Information</CardTitle>
          <CardDescription>This information will be included in the shared record</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-muted-foreground">Name:</span>{" "}
              <span className="text-foreground font-medium">{pet.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Species:</span>{" "}
              <span className="text-foreground">{pet.species}</span>
            </div>
            {pet.breed && (
              <div>
                <span className="text-muted-foreground">Breed:</span>{" "}
                <span className="text-foreground">{pet.breed}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Age:</span>{" "}
              <span className="text-foreground">
                {pet.age >= 12
                  ? `${Math.floor(pet.age / 12)} year${Math.floor(pet.age / 12) > 1 ? "s" : ""}`
                  : `${pet.age} month${pet.age > 1 ? "s" : ""}`}
              </span>
            </div>
            {pet.weight && (
              <div>
                <span className="text-muted-foreground">Weight:</span>{" "}
                <span className="text-foreground">{pet.weight} kg</span>
              </div>
            )}
          </div>

          {knownConditions.length > 0 && (
            <div>
              <span className="text-muted-foreground">Known Conditions:</span>{" "}
              <span className="text-foreground">{knownConditions.join(", ")}</span>
            </div>
          )}

          {allergies.length > 0 && (
            <div>
              <span className="text-muted-foreground">Allergies:</span>{" "}
              <span className="text-foreground">{allergies.join(", ")}</span>
            </div>
          )}

          {medications.length > 0 && (
            <div>
              <span className="text-muted-foreground">Current Medications:</span>{" "}
              <span className="text-foreground">{medications.join(", ")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Symptom History Selection */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base text-foreground">Symptom History</CardTitle>
              <CardDescription>Select which symptom checks to include</CardDescription>
            </div>
            {pet.symptomChecks.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedChecks.length === pet.symptomChecks.length ? "Deselect All" : "Select All"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pet.symptomChecks.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4 text-center">
              No symptom checks recorded yet
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pet.symptomChecks.map((check) => (
                <div
                  key={check.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedChecks.includes(check.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80"
                  }`}
                  onClick={() => handleCheckToggle(check.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedChecks.includes(check.id)}
                      onCheckedChange={() => handleCheckToggle(check.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {new Date(check.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <Badge
                          className={`${severityColors[check.severityCategory] || "bg-muted"} text-white text-xs`}
                        >
                          {check.severityCategory}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {check.symptoms}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Care Notes */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Additional Care Notes</CardTitle>
          <CardDescription>
            Add any extra information you want to share with the vet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={careNotes}
            onChange={(e) => setCareNotes(e.target.value)}
            placeholder="e.g., Recent diet changes, behavioral observations, concerns you want to discuss..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Vet Information (Optional) */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Vet Information (Optional)</CardTitle>
          <CardDescription>
            Add vet details to personalize the shared record
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vetName">Vet/Clinic Name</Label>
              <Input
                id="vetName"
                value={vetName}
                onChange={(e) => setVetName(e.target.value)}
                placeholder="e.g., Dr. Smith's Veterinary Clinic"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vetEmail">Vet Email (for reference)</Label>
              <Input
                id="vetEmail"
                type="email"
                value={vetEmail}
                onChange={(e) => setVetEmail(e.target.value)}
                placeholder="vet@clinic.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Share Link Result */}
      {shareLink && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground flex items-center gap-2">
              <span>✅</span> Share Link Generated
            </CardTitle>
            <CardDescription>
              Copy this link and send it to your vet. The link expires in 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyLink} variant="secondary">
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      <Button
        onClick={handleGenerateLink}
        disabled={isGenerating}
        className="w-full"
        size="lg"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Generating...
          </span>
        ) : (
          <>
            <span className="mr-2">🔗</span>
            Generate Shareable Link
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        The generated link will be valid for 7 days. Anyone with the link can view the selected records.
      </p>
    </div>
  );
}
