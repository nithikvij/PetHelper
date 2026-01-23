"use client";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">📡</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          You&apos;re Offline
        </h1>
        <p className="text-muted-foreground mb-6">
          It looks like you&apos;ve lost your internet connection. Some features
          of PetHelper require an internet connection to work properly.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            While offline, you can still:
          </p>
          <ul className="text-sm text-left text-muted-foreground space-y-2 bg-muted/50 rounded-lg p-4">
            <li className="flex items-center gap-2">
              <span>✓</span> View previously cached pages
            </li>
            <li className="flex items-center gap-2">
              <span>✓</span> Browse app settings
            </li>
          </ul>
          <p className="text-sm text-muted-foreground mt-4">
            Features that need internet:
          </p>
          <ul className="text-sm text-left text-muted-foreground space-y-2 bg-muted/50 rounded-lg p-4">
            <li className="flex items-center gap-2">
              <span>✗</span> AI symptom analysis
            </li>
            <li className="flex items-center gap-2">
              <span>✗</span> Finding nearby vets
            </li>
            <li className="flex items-center gap-2">
              <span>✗</span> Syncing pet data
            </li>
          </ul>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
