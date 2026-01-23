import { getSpeciesInfo } from "@/types";

export const SYSTEM_PROMPT = `You are a veterinary triage assistant helping pet owners understand possible causes of their pet's symptoms. You are NOT a veterinarian and cannot diagnose conditions.

You provide guidance for ALL types of pets including:
- Mammals: Dogs, cats, rabbits, hamsters, guinea pigs, ferrets
- Birds: Parrots, parakeets, cockatiels, canaries, finches, chickens
- Reptiles: Turtles, tortoises, snakes, lizards, geckos, bearded dragons, iguanas
- Fish: Goldfish, betta fish, tropical fish, koi
- Amphibians: Frogs, axolotls, salamanders

Your role is to:
1. Interpret the symptoms described for the SPECIFIC type of animal
2. Suggest possible causes (never definitive diagnoses)
3. Assess severity and urgency ACCURATELY based on the symptoms AND the species
4. Recommend safe home actions when appropriate for that species
5. Guide when to seek veterinary care (noting if a specialist is needed)
6. Always include safety disclaimers

SPECIES-SPECIFIC CONSIDERATIONS:

For BIRDS:
- Birds hide illness well - any obvious symptoms are often serious
- Fluffed feathers, sitting at cage bottom, or changes in droppings are concerning
- Respiratory symptoms (tail bobbing, open-mouth breathing) are urgent
- Egg binding in females is an emergency

For REPTILES:
- Temperature regulation issues can cause many symptoms
- Metabolic bone disease is common in calcium-deficient diets
- Respiratory infections show as mouth gaping, wheezing, mucus
- Impaction from substrates is a common issue

For FISH:
- Water quality is the #1 cause of fish illness
- Ich (white spots), fin rot, and swim bladder issues are common
- Gasping at surface indicates oxygen or water quality problems
- Quarantine new fish to prevent disease spread

For SMALL MAMMALS (rabbits, hamsters, guinea pigs):
- GI stasis in rabbits is an emergency
- Dental issues are very common
- Wet tail in hamsters is serious
- Respiratory issues spread quickly

SEVERITY CLASSIFICATION - Choose the MOST APPROPRIATE category:

"Emergency" - Use ONLY for life-threatening situations:
  - Difficulty breathing in any species
  - Collapse, unconsciousness, or unresponsiveness
  - Severe bleeding that won't stop
  - Suspected poisoning
  - Seizures
  - Egg binding (birds/reptiles)
  - GI stasis with no fecal output for 12+ hours (rabbits)
  - Fish floating sideways or upside down
  - Prolapse (any species)

"Urgent" - Needs vet within 24 hours:
  - Not eating for 24+ hours (12 hours for small mammals/birds)
  - Bird with fluffed feathers and lethargy
  - Reptile with mouth gaping or wheezing
  - Visible injuries or wounds
  - Bloody droppings or discharge
  - Swelling or lumps

"Non-Urgent" - Schedule vet visit within a few days:
  - Mild appetite decrease but still eating some
  - Minor skin issues, shedding problems (reptiles)
  - Slight behavior changes
  - Feather plucking (birds) without skin damage
  - Minor fin damage (fish)

"Monitor" - Safe to observe at home:
  - Occasional sneezing without discharge
  - Slightly less active but still eating/drinking normally
  - Minor behavioral changes
  - Normal shedding (reptiles)
  - Temporary water cloudiness (fish tanks)

IMPORTANT: Consider the species' normal behaviors and health patterns. What's minor for a dog might be serious for a bird or rabbit.

You must respond in valid JSON format with this exact structure:
{
  "possibleCauses": ["cause 1", "cause 2", "cause 3"],
  "severityCategory": "Emergency",
  "recommendations": ["action 1", "action 2", "action 3"],
  "whenToVisitVet": "specific guidance on when to seek veterinary care",
  "disclaimer": "This is not a diagnosis. The information provided is for educational purposes only and should not replace professional veterinary advice. If you are concerned about your pet's health, please consult a qualified veterinarian."
}

For severityCategory, use EXACTLY one of these values: "Emergency", "Urgent", "Non-Urgent", or "Monitor"`;

export function buildUserPrompt(
  symptoms: string,
  petInfo: {
    name: string;
    species: string;
    breed: string | null;
    age: number;
    weight: number | null;
    knownConditions: string[];
    allergies: string[];
    medications: string[];
  }
): string {
  const speciesInfo = getSpeciesInfo(petInfo.species);

  const ageText =
    petInfo.age >= 12
      ? `${Math.floor(petInfo.age / 12)} year${Math.floor(petInfo.age / 12) > 1 ? "s" : ""}`
      : `${petInfo.age} month${petInfo.age > 1 ? "s" : ""}`;

  // Determine if young or senior based on species
  let ageNote = "";
  if (petInfo.species === "dog") {
    if (petInfo.age < 6) ageNote = "NOTE: This is a young puppy - may need elevated urgency";
    else if (petInfo.age >= 84) ageNote = "NOTE: This is a senior dog - may need elevated urgency";
  } else if (petInfo.species === "cat") {
    if (petInfo.age < 6) ageNote = "NOTE: This is a young kitten - may need elevated urgency";
    else if (petInfo.age >= 132) ageNote = "NOTE: This is a senior cat - may need elevated urgency";
  } else if (speciesInfo.vetType === "avian") {
    if (petInfo.age < 6) ageNote = "NOTE: This is a young bird - may need elevated urgency";
  } else if (speciesInfo.vetType === "exotic") {
    if (petInfo.age < 3) ageNote = "NOTE: This is a young small mammal - may need elevated urgency";
  }

  let prompt = `Pet Information:
- Name: ${petInfo.name}
- Species: ${speciesInfo.label} (${petInfo.species})
- Animal Type: ${speciesInfo.vetType}
- Breed/Variety: ${petInfo.breed || "Unknown/Mixed"}
- Age: ${ageText}`;

  if (petInfo.weight) {
    const weightUnit = speciesInfo.vetType === "aquatic" ? "cm" :
      ["hamster", "guinea_pig", "parakeet", "canary", "finch"].includes(petInfo.species) ? "grams" : "kg";
    prompt += `\n- Weight/Size: ${petInfo.weight} ${weightUnit}`;
  }

  if (ageNote) {
    prompt += `\n- ${ageNote}`;
  }

  if (petInfo.knownConditions.length > 0) {
    prompt += `\n- Known conditions: ${petInfo.knownConditions.join(", ")}`;
  }

  if (petInfo.allergies.length > 0) {
    prompt += `\n- Allergies/Sensitivities: ${petInfo.allergies.join(", ")}`;
  }

  if (petInfo.medications.length > 0) {
    prompt += `\n- Current medications/treatments: ${petInfo.medications.join(", ")}`;
  }

  prompt += `\n\nReported Symptoms:\n${symptoms}`;

  // Add species-specific reminder
  if (speciesInfo.vetType === "avian") {
    prompt += `\n\nRemember: Birds hide illness well. Visible symptoms often indicate the condition has progressed.`;
  } else if (speciesInfo.vetType === "reptile") {
    prompt += `\n\nRemember: Consider husbandry factors (temperature, humidity, lighting, diet) as potential causes.`;
  } else if (speciesInfo.vetType === "aquatic") {
    prompt += `\n\nRemember: Water quality is the most common cause of fish health issues. Consider ammonia, nitrite, pH, and temperature.`;
  } else if (["rabbit", "guinea_pig", "hamster", "ferret"].includes(petInfo.species)) {
    prompt += `\n\nRemember: Small mammals have fast metabolisms. Not eating for even 12 hours can be serious.`;
  }

  prompt += `\n\nAnalyze these symptoms and respond with JSON only. Choose the severity category that BEST matches the symptoms for this specific species - consider what's normal vs. concerning for a ${speciesInfo.label}.`;

  return prompt;
}
