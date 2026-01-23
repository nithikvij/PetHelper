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

interface PharmacyLocatorProps {
  showTitle?: boolean;
}

export function PharmacyLocator({ showTitle = true }: PharmacyLocatorProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [searchType, setSearchType] = useState<"pet" | "general" | null>(null);

  const handleFindPharmacy = (type: "pet" | "general") => {
    setIsLocating(true);
    setSearchType(type);

    const searchTerm =
      type === "pet"
        ? "pet pharmacy veterinary pharmacy"
        : "pharmacy with pet medications";

    if (!navigator.geolocation) {
      // Fallback to general search without location
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(searchTerm + " near me")}`,
        "_blank"
      );
      setIsLocating(false);
      setSearchType(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Open Google Maps with the search and user's location
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}/@${latitude},${longitude},14z`;
        window.open(mapsUrl, "_blank");
        setIsLocating(false);
        setSearchType(null);
      },
      (err) => {
        console.error("Geolocation error:", err);
        // Fallback to search without precise location
        window.open(
          `https://www.google.com/maps/search/${encodeURIComponent(searchTerm + " near me")}`,
          "_blank"
        );
        setIsLocating(false);
        setSearchType(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const content = (
    <div className="space-y-3">
      <Alert className="bg-secondary/50 border-border">
        <AlertDescription className="text-sm text-muted-foreground">
          <strong className="text-foreground">Tip:</strong> Pet pharmacies
          specialize in animal medications and may have better prices. Regular
          pharmacies (CVS, Walgreens, etc.) can also fill many pet prescriptions.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => handleFindPharmacy("pet")}
          disabled={isLocating}
          variant="outline"
          className="flex-1"
        >
          {isLocating && searchType === "pet" ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Locating...
            </span>
          ) : (
            <>
              <span className="mr-2">🐾</span>
              Pet Pharmacy
            </>
          )}
        </Button>
        <Button
          onClick={() => handleFindPharmacy("general")}
          disabled={isLocating}
          variant="outline"
          className="flex-1"
        >
          {isLocating && searchType === "general" ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Locating...
            </span>
          ) : (
            <>
              <span className="mr-2">💊</span>
              General Pharmacy
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Opens Google Maps with pharmacies near your location
      </p>
    </div>
  );

  if (!showTitle) {
    return content;
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2 text-foreground">
          <span>💊</span>
          Find a Pet Pharmacy
        </CardTitle>
        <CardDescription>
          Locate nearby pharmacies that carry pet medications
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
