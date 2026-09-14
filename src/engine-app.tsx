"use client";

import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/features/parser/context/settings-context";
import { startClientCalendarWorkerPreload } from "@/features/parser/start-calendar-preparation";
import { HomePage } from "@/routes/home-page";

if (!import.meta.env.SSR) void startClientCalendarWorkerPreload();

export function EngineApp({ initialReference }: { initialReference: string }) {
  return (
    <SettingsProvider>
      <HomePage initialReference={initialReference} />
      <Toaster closeButton position="top-right" richColors />
    </SettingsProvider>
  );
}
