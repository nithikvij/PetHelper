"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EmergencyBannerProps {
  onDismiss?: () => void;
}

export function EmergencyBanner({ onDismiss }: EmergencyBannerProps) {
  return (
    <Alert className="border-red-400 bg-red-50 mb-6 shadow-sm">
      <AlertTitle className="text-red-800 text-lg font-bold flex items-center gap-2">
        <span className="text-2xl">🚨</span> EMERGENCY DETECTED
      </AlertTitle>
      <AlertDescription className="text-red-700 mt-2">
        <p className="font-semibold mb-2">
          The symptoms you described may indicate a life-threatening emergency.
        </p>
        <p className="mb-4">
          Please contact an emergency veterinarian immediately or call a pet poison
          control hotline if poisoning is suspected.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={() => window.open("https://www.google.com/search?q=emergency+vet+near+me", "_blank")}
          >
            Find Emergency Vet Near Me
          </Button>
          {onDismiss && (
            <Button
              variant="outline"
              onClick={onDismiss}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              Continue with Symptom Check
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
