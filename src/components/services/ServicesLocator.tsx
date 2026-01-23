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

type ServiceType = "groomer" | "boarding" | "trainer" | "pet_store" | "dog_park";

interface ServiceConfig {
  label: string;
  searchTerm: string;
  icon: string;
  description: string;
}

const SERVICE_TYPES: Record<ServiceType, ServiceConfig> = {
  groomer: {
    label: "Pet Groomer",
    searchTerm: "pet groomer dog groomer",
    icon: "✂️",
    description: "Professional grooming services for your pet",
  },
  boarding: {
    label: "Pet Boarding & Daycare",
    searchTerm: "pet boarding pet daycare dog daycare",
    icon: "🏠",
    description: "Safe places for your pet to stay or play",
  },
  trainer: {
    label: "Pet Trainer",
    searchTerm: "dog trainer pet trainer obedience training",
    icon: "🎓",
    description: "Professional training and behavior specialists",
  },
  pet_store: {
    label: "Pet Store",
    searchTerm: "pet store pet supplies",
    icon: "🛒",
    description: "Supplies, food, and accessories for your pet",
  },
  dog_park: {
    label: "Dog Park",
    searchTerm: "dog park off leash dog park",
    icon: "🌳",
    description: "Parks and outdoor spaces for exercise",
  },
};

interface ServicesLocatorProps {
  showTitle?: boolean;
  defaultService?: ServiceType;
}

export function ServicesLocator({ showTitle = true, defaultService }: ServicesLocatorProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [activeService, setActiveService] = useState<ServiceType | null>(null);

  const handleFindService = (serviceType: ServiceType) => {
    setIsLocating(true);
    setActiveService(serviceType);

    const service = SERVICE_TYPES[serviceType];

    if (!navigator.geolocation) {
      // Fallback to general search without location
      window.open(
        `https://www.google.com/maps/search/${encodeURIComponent(service.searchTerm + " near me")}`,
        "_blank"
      );
      setIsLocating(false);
      setActiveService(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Open Google Maps with the search and user's location
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(service.searchTerm)}/@${latitude},${longitude},14z`;
        window.open(mapsUrl, "_blank");
        setIsLocating(false);
        setActiveService(null);
      },
      (err) => {
        console.error("Geolocation error:", err);
        // Fallback to search without precise location
        window.open(
          `https://www.google.com/maps/search/${encodeURIComponent(service.searchTerm + " near me")}`,
          "_blank"
        );
        setIsLocating(false);
        setActiveService(null);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const content = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.entries(SERVICE_TYPES) as [ServiceType, ServiceConfig][]).map(
          ([key, service]) => (
            <Button
              key={key}
              onClick={() => handleFindService(key)}
              disabled={isLocating}
              variant={defaultService === key ? "default" : "outline"}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              {isLocating && activeService === key ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Locating...
                </span>
              ) : (
                <>
                  <span className="text-2xl">{service.icon}</span>
                  <span className="font-medium">{service.label}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {service.description}
                  </span>
                </>
              )}
            </Button>
          )
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Opens Google Maps with services near your location
      </p>
    </div>
  );

  if (!showTitle) {
    return content;
  }

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <span>📍</span>
          Find Local Pet Services
        </CardTitle>
        <CardDescription>
          Discover groomers, boarding, trainers, and more near you
        </CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
