import { Pet, SymptomCheck } from "@prisma/client";

// Animal categories and species
export const ANIMAL_CATEGORIES = {
  mammal: {
    label: "Mammals",
    species: [
      { value: "dog", label: "Dog", icon: "🐕", vetType: "small animal" },
      { value: "cat", label: "Cat", icon: "🐈", vetType: "small animal" },
      { value: "rabbit", label: "Rabbit", icon: "🐇", vetType: "exotic" },
      { value: "hamster", label: "Hamster", icon: "🐹", vetType: "exotic" },
      { value: "guinea_pig", label: "Guinea Pig", icon: "🐹", vetType: "exotic" },
      { value: "ferret", label: "Ferret", icon: "🦡", vetType: "exotic" },
    ],
  },
  bird: {
    label: "Birds",
    species: [
      { value: "parrot", label: "Parrot", icon: "🦜", vetType: "avian" },
      { value: "parakeet", label: "Parakeet/Budgie", icon: "🐦", vetType: "avian" },
      { value: "cockatiel", label: "Cockatiel", icon: "🐦", vetType: "avian" },
      { value: "canary", label: "Canary", icon: "🐤", vetType: "avian" },
      { value: "finch", label: "Finch", icon: "🐦", vetType: "avian" },
      { value: "chicken", label: "Chicken", icon: "🐔", vetType: "avian" },
    ],
  },
  reptile: {
    label: "Reptiles",
    species: [
      { value: "turtle", label: "Turtle/Tortoise", icon: "🐢", vetType: "reptile" },
      { value: "snake", label: "Snake", icon: "🐍", vetType: "reptile" },
      { value: "lizard", label: "Lizard", icon: "🦎", vetType: "reptile" },
      { value: "gecko", label: "Gecko", icon: "🦎", vetType: "reptile" },
      { value: "bearded_dragon", label: "Bearded Dragon", icon: "🦎", vetType: "reptile" },
      { value: "iguana", label: "Iguana", icon: "🦎", vetType: "reptile" },
    ],
  },
  fish: {
    label: "Fish",
    species: [
      { value: "goldfish", label: "Goldfish", icon: "🐠", vetType: "aquatic" },
      { value: "betta", label: "Betta Fish", icon: "🐟", vetType: "aquatic" },
      { value: "tropical_fish", label: "Tropical Fish", icon: "🐠", vetType: "aquatic" },
      { value: "koi", label: "Koi", icon: "🐟", vetType: "aquatic" },
    ],
  },
  amphibian: {
    label: "Amphibians",
    species: [
      { value: "frog", label: "Frog", icon: "🐸", vetType: "exotic" },
      { value: "axolotl", label: "Axolotl", icon: "🦎", vetType: "aquatic" },
      { value: "salamander", label: "Salamander", icon: "🦎", vetType: "exotic" },
    ],
  },
} as const;

// Species info type
export interface SpeciesInfo {
  value: string;
  label: string;
  icon: string;
  vetType: "small animal" | "exotic" | "avian" | "reptile" | "aquatic" | "general";
}

// Flat list of all species for easy lookup
export const ALL_SPECIES: SpeciesInfo[] = Object.values(ANIMAL_CATEGORIES).flatMap(
  (category) => category.species.map((s) => ({
    value: s.value,
    label: s.label,
    icon: s.icon,
    vetType: s.vetType as SpeciesInfo["vetType"],
  }))
);

// Get species info by value
export function getSpeciesInfo(speciesValue: string): SpeciesInfo {
  return ALL_SPECIES.find((s) => s.value === speciesValue) || {
    value: speciesValue,
    label: speciesValue,
    icon: "🐾",
    vetType: "general",
  };
}

// Vet types for search
export const VET_TYPES = {
  "small animal": {
    label: "Small Animal Vet",
    searchTerm: "veterinarian",
    description: "General practice for dogs and cats",
  },
  exotic: {
    label: "Exotic Animal Vet",
    searchTerm: "exotic pet veterinarian",
    description: "Specializes in rabbits, rodents, ferrets, and unusual pets",
  },
  avian: {
    label: "Avian Vet",
    searchTerm: "avian bird veterinarian",
    description: "Specializes in birds",
  },
  reptile: {
    label: "Reptile Vet",
    searchTerm: "reptile veterinarian",
    description: "Specializes in reptiles and amphibians",
  },
  aquatic: {
    label: "Aquatic Vet",
    searchTerm: "fish aquatic veterinarian",
    description: "Specializes in fish and aquatic animals",
  },
  general: {
    label: "General Vet",
    searchTerm: "veterinarian",
    description: "General veterinary practice",
  },
} as const;

export type VetType = keyof typeof VET_TYPES;
export type SpeciesValue = (typeof ALL_SPECIES)[number]["value"];

// Extended Pet type with parsed JSON arrays
export interface PetWithParsedFields
  extends Omit<Pet, "knownConditions" | "allergies" | "medications"> {
  knownConditions: string[];
  allergies: string[];
  medications: string[];
}

// Pet form data for creating/updating pets
export interface PetFormData {
  name: string;
  species: string;
  breed?: string;
  age: number;
  weight?: number;
  knownConditions: string[];
  allergies: string[];
  medications: string[];
}

// Symptom check form data
export interface SymptomCheckFormData {
  petId: string;
  symptoms: string;
}

// AI analysis response
export interface SymptomAnalysis {
  possibleCauses: string[];
  severityCategory: "Emergency" | "Urgent" | "Non-Urgent" | "Monitor";
  recommendations: string[];
  whenToVisitVet: string;
  disclaimer: string;
}

// Extended symptom check with parsed fields
export interface SymptomCheckWithParsedFields
  extends Omit<SymptomCheck, "possibleCauses" | "recommendations"> {
  possibleCauses: string[];
  recommendations: string[];
}

// Emergency keywords for client-side detection
export const EMERGENCY_KEYWORDS = [
  "not breathing",
  "can't breathe",
  "difficulty breathing",
  "unconscious",
  "unresponsive",
  "seizure",
  "convulsion",
  "poisoning",
  "poison",
  "ate poison",
  "hit by car",
  "severe bleeding",
  "won't stop bleeding",
  "collapse",
  "collapsed",
  "choking",
  "bloated stomach",
  "twisted stomach",
  // Bird-specific
  "fluffed up and lethargic",
  "sitting at bottom of cage",
  // Reptile-specific
  "mouth gaping",
  "not moving for days",
  // Fish-specific
  "floating sideways",
  "gasping at surface",
];
