/**
 * Spinner Showcase Page
 * 
 * This page displays the spinner showcase component for users to explore and
 * test the different AI-themed spinner variations.
 */

import { SpinnerShowcase } from "@/components/spinner-showcase";

export default function SpinnerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">AI Service Loading Spinners</h1>
          <p className="text-muted-foreground">
            Customizable, themed loading indicators for AI services and integrations
          </p>
        </div>
        
        <SpinnerShowcase />
      </div>
    </div>
  );
}