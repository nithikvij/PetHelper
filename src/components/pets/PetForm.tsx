"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ANIMAL_CATEGORIES, getSpeciesInfo } from "@/types";

interface PetFormProps {
  initialData?: {
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
  };
}

// Helper to get breed/variety placeholder based on species
function getBreedPlaceholder(species: string): string {
  const speciesInfo = getSpeciesInfo(species);
  switch (speciesInfo.vetType) {
    case "avian":
      return "e.g., African Grey, Cockatoo";
    case "reptile":
      return "e.g., Ball Python, Leopard Gecko";
    case "aquatic":
      return "e.g., Fancy Goldfish, Crowntail Betta";
    case "exotic":
      return "e.g., Holland Lop, Syrian Hamster";
    default:
      return "e.g., Golden Retriever, Siamese";
  }
}

// Helper to get weight label based on species
function getWeightLabel(species: string): string {
  const speciesInfo = getSpeciesInfo(species);
  if (speciesInfo.vetType === "aquatic") {
    return "Size (cm)";
  }
  if (["hamster", "guinea_pig", "parakeet", "canary", "finch"].includes(species)) {
    return "Weight (grams)";
  }
  return "Weight (kg)";
}

export function PetForm({ initialData }: PetFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [species, setSpecies] = useState(initialData?.species || "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialData?.photoUrl || null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
  const [breed, setBreed] = useState(initialData?.breed || "");
  const [ageYears, setAgeYears] = useState(
    initialData ? Math.floor(initialData.age / 12).toString() : ""
  );
  const [ageMonths, setAgeMonths] = useState(
    initialData ? (initialData.age % 12).toString() : ""
  );
  const [weight, setWeight] = useState(initialData?.weight?.toString() || "");
  const [knownConditions, setKnownConditions] = useState(
    initialData ? JSON.parse(initialData.knownConditions).join(", ") : ""
  );
  const [allergies, setAllergies] = useState(
    initialData ? JSON.parse(initialData.allergies).join(", ") : ""
  );
  const [medications, setMedications] = useState(
    initialData ? JSON.parse(initialData.medications).join(", ") : ""
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const speciesInfo = getSpeciesInfo(species);
  const isFish = speciesInfo.vetType === "aquatic";

  // Handle photo file selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    // Convert to base64 for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPhotoUrl(base64String);
      setPhotoPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setPhotoUrl(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const totalMonths =
      (parseInt(ageYears) || 0) * 12 + (parseInt(ageMonths) || 0);

    // Fish and some reptiles might not have precise ages
    if (totalMonths <= 0 && !isFish) {
      setError("Please enter a valid age");
      setIsLoading(false);
      return;
    }

    const petData = {
      name,
      species,
      breed: breed || null,
      age: totalMonths || 1, // Default to 1 month if not specified for fish
      weight: weight ? parseFloat(weight) : null,
      photoUrl: photoUrl,
      knownConditions: knownConditions
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      allergies: allergies
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      medications: medications
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
    };

    try {
      const url = isEditing ? `/api/pets/${initialData.id}` : "/api/pets";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(petData),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to save pet");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this pet?")) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/pets/${initialData?.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Failed to delete pet");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border-border/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-foreground">
          {isEditing ? "Edit Pet" : "Add New Pet"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your pet's information"
            : "Enter your pet's details for personalized symptom analysis"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Pet Photo */}
          <div className="space-y-2">
            <Label>Pet Photo</Label>
            <div className="flex items-center gap-4">
              {/* Photo Preview */}
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Pet photo preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-4xl text-muted-foreground">
                    {speciesInfo.icon || "🐾"}
                  </span>
                )}
              </div>

              {/* Upload Controls */}
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? "Change Photo" : "Upload Photo"}
                </Button>
                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove Photo
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 2MB. JPG, PNG, or GIF.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Max"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Select value={species} onValueChange={setSpecies} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select species" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(ANIMAL_CATEGORIES).map(([key, category]) => (
                    <SelectGroup key={key}>
                      <SelectLabel className="text-primary font-semibold">
                        {category.label}
                      </SelectLabel>
                      {category.species.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          <span className="flex items-center gap-2">
                            <span>{s.icon}</span>
                            <span>{s.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breed">
                {speciesInfo.vetType === "avian"
                  ? "Variety/Mutation"
                  : speciesInfo.vetType === "aquatic"
                    ? "Variety"
                    : "Breed"}
              </Label>
              <Input
                id="breed"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder={getBreedPlaceholder(species)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">{getWeightLabel(species)}</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={isFish ? "e.g., 10" : "e.g., 15.5"}
              />
            </div>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <Label>
              Age {isFish ? "(approximate)" : "*"}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  placeholder="0"
                />
                <span className="text-sm text-muted-foreground">years</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="11"
                  value={ageMonths}
                  onChange={(e) => setAgeMonths(e.target.value)}
                  placeholder="0"
                />
                <span className="text-sm text-muted-foreground">months</span>
              </div>
            </div>
            {isFish && (
              <p className="text-xs text-muted-foreground">
                Age is optional for fish - enter approximate if known
              </p>
            )}
          </div>

          {/* Medical History */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h3 className="font-medium text-foreground">
              Medical History (Optional)
            </h3>

            <div className="space-y-2">
              <Label htmlFor="conditions">Known Conditions</Label>
              <Textarea
                id="conditions"
                value={knownConditions}
                onChange={(e) => setKnownConditions(e.target.value)}
                placeholder={
                  speciesInfo.vetType === "avian"
                    ? "e.g., Psittacosis, Feather plucking (separate with commas)"
                    : speciesInfo.vetType === "reptile"
                      ? "e.g., Metabolic bone disease, Respiratory infection (separate with commas)"
                      : "e.g., Hip dysplasia, Diabetes (separate with commas)"
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergies">
                {speciesInfo.vetType === "aquatic"
                  ? "Sensitivities"
                  : "Allergies"}
              </Label>
              <Textarea
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder={
                  speciesInfo.vetType === "aquatic"
                    ? "e.g., Copper medications, certain foods (separate with commas)"
                    : "e.g., Chicken, Pollen (separate with commas)"
                }
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="medications">
                {speciesInfo.vetType === "aquatic"
                  ? "Current Treatments"
                  : "Current Medications"}
              </Label>
              <Textarea
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder={
                  speciesInfo.vetType === "aquatic"
                    ? "e.g., Salt treatment, Ich medication (separate with commas)"
                    : speciesInfo.vetType === "reptile"
                      ? "e.g., Calcium supplements, Antibiotics (separate with commas)"
                      : "e.g., Insulin, Joint supplements (separate with commas)"
                }
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditing
                  ? "Update Pet"
                  : "Add Pet"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isLoading}
              >
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
