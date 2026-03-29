import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="mb-6 text-3xl font-bold">Privacy Policy</h1>

      <div className="flex flex-col gap-6 text-sm leading-7 text-muted-foreground sm:text-base">
        <h2>Cookie Policy</h2>
        <p>
          TempusTotal uses minimal cookies and local storage to enhance your experience. This page
          explains how we use these technologies.
        </p>

        <h3>What We Collect</h3>
        <p>We use the following technologies to store information:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Local Storage:</strong> We store your parser settings, like date format and
            timezone preferences, in your browser. This data never leaves your device.
          </li>
          <li>
            <strong>API Requests:</strong> Expressions sent to the public parser endpoint are
            processed only to return the parsed result. This deployment does not include analytics.
          </li>
        </ul>

        <h3>Your Choices</h3>
        <p>
          You can control local browser storage by clearing site data in your browser. If you clear
          local storage:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Your parser settings return to their defaults.</li>
          <li>
            No account or cross-device history is retained because the app does not maintain one.
          </li>
        </ul>

        <h3>Data Retention</h3>
        <p>Local storage data persists until you clear your browser data.</p>

        <h3>Updates to This Policy</h3>
        <p>
          We may update this policy as needed. Significant changes will be communicated through the
          site.
        </p>

        <h3>Contact</h3>
        <p>If you have questions about our privacy practices, please contact us.</p>
      </div>
    </div>
  );
}
