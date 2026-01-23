import { SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import type { SymptomAnalysis } from "@/types";

interface PetInfo {
  name: string;
  species: string;
  breed: string | null;
  age: number;
  weight: number | null;
  knownConditions: string[];
  allergies: string[];
  medications: string[];
}

interface MediaItem {
  type: "image";
  data: string; // base64 data URL
}

// Check if we should use Ollama (local) or Anthropic (cloud)
const useOllama = process.env.USE_OLLAMA === "true" || !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your-anthropic-api-key";
const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
const ollamaModel = process.env.OLLAMA_MODEL || "llama3.2";

async function analyzeWithOllama(
  symptoms: string,
  petInfo: PetInfo
): Promise<SymptomAnalysis> {
  const userPrompt = buildUserPrompt(symptoms, petInfo);

  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      prompt: `${SYSTEM_PROMPT}\n\n${userPrompt}`,
      stream: false,
      options: {
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const responseText = data.response;

  // Find JSON in response (may be wrapped in markdown code blocks)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("Ollama response:", responseText);
    throw new Error("Could not parse AI response as JSON");
  }

  const analysis = JSON.parse(jsonMatch[0]) as SymptomAnalysis;

  // Validate required fields
  if (
    !analysis.possibleCauses ||
    !analysis.severityCategory ||
    !analysis.recommendations ||
    !analysis.whenToVisitVet ||
    !analysis.disclaimer
  ) {
    throw new Error("Invalid AI response structure");
  }

  // Validate severity category
  const validCategories = ["Emergency", "Urgent", "Non-Urgent", "Monitor"];
  if (!validCategories.includes(analysis.severityCategory)) {
    analysis.severityCategory = "Non-Urgent";
  }

  return analysis;
}

async function analyzeWithAnthropic(
  symptoms: string,
  petInfo: PetInfo,
  media: MediaItem[] = []
): Promise<SymptomAnalysis> {
  // Dynamic import to avoid loading Anthropic SDK if not needed
  const Anthropic = (await import("@anthropic-ai/sdk")).default;

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const userPrompt = buildUserPrompt(symptoms, petInfo);

  type ImageMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

  // Build message content with text and optional images
  const contentBlocks: Array<
    | { type: "text"; text: string }
    | { type: "image"; source: { type: "base64"; media_type: ImageMediaType; data: string } }
  > = [];

  // Add images first if provided
  if (media.length > 0) {
    for (const item of media) {
      if (item.type === "image" && item.data) {
        // Extract base64 data and media type from data URL
        const matches = item.data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const rawMediaType = matches[1];
          const base64Data = matches[2];

          // Validate and cast media type
          const validMediaTypes: ImageMediaType[] = ["image/jpeg", "image/png", "image/gif", "image/webp"];
          const mediaType: ImageMediaType = validMediaTypes.includes(rawMediaType as ImageMediaType)
            ? (rawMediaType as ImageMediaType)
            : "image/jpeg"; // Default to jpeg if unknown

          contentBlocks.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data,
            },
          });
        }
      }
    }
  }

  // Add the text prompt
  const promptWithImageContext = media.length > 0
    ? `${userPrompt}\n\nI have also attached ${media.length} image(s) showing the symptoms. Please analyze these images as part of your assessment.`
    : userPrompt;

  contentBlocks.push({
    type: "text",
    text: promptWithImageContext,
  });

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: contentBlocks,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  // Extract text content from response
  const textContent = message.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from AI");
  }

  // Parse JSON from response
  const responseText = textContent.text;

  // Find JSON in response (may be wrapped in markdown code blocks)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Could not parse AI response as JSON");
  }

  const analysis = JSON.parse(jsonMatch[0]) as SymptomAnalysis;

  // Validate required fields
  if (
    !analysis.possibleCauses ||
    !analysis.severityCategory ||
    !analysis.recommendations ||
    !analysis.whenToVisitVet ||
    !analysis.disclaimer
  ) {
    throw new Error("Invalid AI response structure");
  }

  // Validate severity category
  const validCategories = ["Emergency", "Urgent", "Non-Urgent", "Monitor"];
  if (!validCategories.includes(analysis.severityCategory)) {
    analysis.severityCategory = "Non-Urgent";
  }

  return analysis;
}

export async function analyzeSymptoms(
  symptoms: string,
  petInfo: PetInfo,
  media: MediaItem[] = []
): Promise<SymptomAnalysis> {
  if (useOllama) {
    console.log(`Using Ollama (${ollamaModel}) for symptom analysis`);
    // Note: Ollama doesn't support image input in this basic integration
    // Images will be ignored when using Ollama
    if (media.length > 0) {
      console.log("Warning: Image analysis is not available with Ollama. Images will be ignored.");
    }
    return analyzeWithOllama(symptoms, petInfo);
  } else {
    console.log("Using Anthropic Claude for symptom analysis");
    return analyzeWithAnthropic(symptoms, petInfo, media);
  }
}
