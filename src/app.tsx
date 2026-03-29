import { Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/features/parser/context/settings-context";
import { HomePage } from "@/routes/home-page";
import { PrivacyPage } from "@/routes/privacy-page";

export function App() {
  return (
    <SettingsProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
      </Routes>
      <Toaster closeButton position="top-right" richColors />
    </SettingsProvider>
  );
}
