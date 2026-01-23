"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { VetLocator } from "./VetLocator";
import { PharmacyLocator } from "./PharmacyLocator";
import type { SymptomAnalysis } from "@/types";

interface ResultsDisplayProps {
  analysis: SymptomAnalysis;
  symptoms: string;
  species: string;
}

const severityConfig = {
  Emergency: {
    color: "bg-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    textColor: "text-red-800",
  },
  Urgent: {
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    textColor: "text-amber-800",
  },
  "Non-Urgent": {
    color: "bg-yellow-500",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    textColor: "text-yellow-800",
  },
  Monitor: {
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    textColor: "text-emerald-800",
  },
};

export function ResultsDisplay({ analysis, symptoms, species }: ResultsDisplayProps) {
  const config = severityConfig[analysis.severityCategory] || severityConfig.Monitor;
  const isEmergency = analysis.severityCategory === "Emergency";
  const isUrgent = analysis.severityCategory === "Urgent";

  return (
    <div className="space-y-6">
      {/* Severity Banner */}
      <div
        className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${config.color}`} />
          <span className={`font-semibold text-lg ${config.textColor}`}>
            Severity: {analysis.severityCategory}
          </span>
        </div>
      </div>

      {/* Vet Locator for Emergency/Urgent */}
      {(isEmergency || isUrgent) && (
        <VetLocator species={species} isEmergency={isEmergency} />
      )}

      {/* Reported Symptoms */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Reported Symptoms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{symptoms}</p>
        </CardContent>
      </Card>

      {/* Possible Causes */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Possible Causes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.possibleCauses.map((cause, index) => (
              <li key={index} className="flex items-start gap-2">
                <Badge variant="outline" className="mt-0.5 border-primary/40 text-primary">
                  {index + 1}
                </Badge>
                <span className="text-foreground">{cause}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Recommended Actions */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Recommended Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span className="text-foreground">{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* When to Visit Vet */}
      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">When to Visit a Vet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{analysis.whenToVisitVet}</p>
        </CardContent>
      </Card>

      {/* Vet Locator for Non-Urgent/Monitor */}
      {!isEmergency && !isUrgent && (
        <VetLocator species={species} isEmergency={false} />
      )}

      {/* Pharmacy Locator */}
      <PharmacyLocator />

      <Separator />

      {/* Disclaimer */}
      <Alert className="bg-secondary border-border">
        <AlertDescription className="text-muted-foreground text-sm">
          <strong className="text-foreground">Important Disclaimer:</strong> {analysis.disclaimer}
        </AlertDescription>
      </Alert>
    </div>
  );
}
