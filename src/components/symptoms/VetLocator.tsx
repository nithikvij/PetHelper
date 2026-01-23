"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSpeciesInfo, VET_TYPES, type VetType } from "@/types";

interface VetLocatorProps {
  species: string;
  isEmergency?: boolean;
}

export function VetLocator({ species, isEmergency = false }: VetLocatorProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");

  const speciesInfo = getSpeciesInfo(species);
  const vetType = speciesInfo.vetType as VetType;
  const vetInfo = VET_TYPES[vetType] || VET_TYPES.general;

  const handleFindVet = (emergency: boolean = false) => {
    setIsLocating(true);
    setError("");

    if (!navigator.geolocation) {
      // Fallback to general search without location
      const searchTerm = emergency
        ? `emergency ${vetInfo.searchTerm} near me`
        : `${vetInfo.searchTerm} near me`;
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`,
        "_blank"
      );
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const searchTerm = emergency
          ? `emergency ${vetInfo.searchTerm}`
          : vetInfo.searchTerm;

        // Open Google Maps with the search and user's location
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}/@${latitude},${longitude},14z`;
        window.open(mapsUrl, "_blank");
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        // Fallback to search without precise location
        const searchTerm = emergency
          ? `emergency ${vetInfo.searchTerm} near me`
          : `${vetInfo.searchTerm} near me`;
        window.open(
          `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`,
          "_blank"
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  return (
    <Card className={`border-border/60 ${isEmergency ? "border-red-300 bg-red-50/50" : ""}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-foreground">
          <span>📍</span>
          Find a {vetInfo.label}
        </CardTitle>
        <CardDescription>{vetInfo.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {vetType !== "small animal" && vetType !== "general" && (
          <Alert className="bg-secondary/50 border-border">
            <AlertDescription className="text-sm text-muted-foreground">
              <strong className="text-foreground">Specialist needed:</strong>{" "}
              {speciesInfo.label}s require a vet who specializes in{" "}
              {vetType === "avian"
                ? "birds"
                : vetType === "reptile"
                  ? "reptiles"
                  : vetType === "aquatic"
                    ? "aquatic animals"
                    : "exotic pets"}
              . Not all vets treat these animals.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          {isEmergency ? (
            <Button
              onClick={() => handleFindVet(true)}
              disabled={isLocating}
              variant="destructive"
              className="w-full"
            >
              {isLocating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Locating...
                </span>
              ) : (
                <>
                  <span className="mr-2">🚨</span>
                  Find Emergency Vet Now
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleFindVet(false)}
                disabled={isLocating}
                variant="outline"
                className="flex-1 min-w-0"
              >
                {isLocating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Locating...
                  </span>
                ) : (
                  <>
                    <span className="mr-2 flex-shrink-0">🔍</span>
                    <span className="truncate">Find Nearby {vetInfo.label}</span>
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleFindVet(true)}
                disabled={isLocating}
                variant="destructive"
                className="flex-shrink-0"
              >
                <span className="mr-2">🚨</span>
                Emergency Vet
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Opens Google Maps with {vetType === "small animal" ? "veterinarians" : `${vetType} vets`} near your location
        </p>
      </CardContent>
    </Card>
  );
}
