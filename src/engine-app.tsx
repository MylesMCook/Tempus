"use client";

import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/features/parser/context/settings-context";
import { HomePage } from "@/routes/home-page";

export function EngineApp({ initialReference }: { initialReference: string }) {
  return (
    <SettingsProvider>
      <HomePage initialReference={initialReference} />
      <Toaster closeButton position="top-right" richColors />
    </SettingsProvider>
  );
}
