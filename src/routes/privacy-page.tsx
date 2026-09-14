import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrivacyPage() {
  return (
    <main id="main" className="container max-w-3xl py-12">
      <Button variant="ghost" asChild className="mb-6">
        <a href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to calculator
        </a>
      </Button>
      <h1 className="mb-6 text-3xl font-bold">Privacy policy</h1>
      <div className="flex flex-col gap-6 text-sm leading-7 text-muted-foreground sm:text-base">
        <p>
          The calculator works in your browser. The API playground sends requests to our
          Cloudflare-hosted server. Here is what each part stores or sends.
        </p>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            Calculator and saved settings
          </h2>
          <p>
            Typing a phrase or choosing an example calculates a date on your device. The app does
            not send that phrase to the API until you select Check API result. It does not save a
            history of your phrases.
          </p>
          <p className="mt-3">
            Date format and timezone preferences are saved in your browser’s local storage. They
            remain there until you clear this site’s data. Reset preferences restores the defaults.
            There are no accounts or settings synced across devices.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Copying and calendar files</h2>
          <p>
            Copy buttons put the selected output on your clipboard, including any event title. Other
            apps may be able to read your clipboard, depending on your device and permissions.
          </p>
          <p className="mt-3">
            Calendar files are prepared in your browser. Choosing Download calendar file saves a
            file containing the reviewed title, dates, timezone, date phrase and interpretation
            notes. Tempus does not upload that file or add events to a calendar account. If you
            import or share the file, its contents go to the app or person you choose.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">API requests and hosting</h2>
          <p>
            An API request includes your phrase, date format, timezone, and reference time in its
            URL. Cloudflare processes these requests and serves the website. Hosting logs are
            enabled. Worker logs are configured to remove query strings; older logs and other
            hosting records may still contain request URLs and metadata. Avoid confidential
            information in API requests or URLs you share.
          </p>
          <p className="mt-3">
            Cloudflare also uses your IP address to limit API requests. People sharing a network may
            share that limit. This does not limit calculations on your device.
          </p>
          <p className="mt-3">
            Hosting log retention depends on the Cloudflare plan. See{" "}
            <a
              className="underline underline-offset-4"
              href="https://developers.cloudflare.com/workers/observability/logs/workers-logs/"
            >
              Cloudflare’s Workers Logs documentation
            </a>{" "}
            for its retention rules. The app does not load analytics scripts or set advertising
            cookies.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-semibold text-foreground">Your choices</h2>
          <p>
            Use the calculator without running API requests to keep your phrases on your device.
            Clear this site’s data in your browser to remove saved settings. Clearing browser data
            does not delete requests already recorded in hosting logs.
          </p>
        </section>
      </div>
    </main>
  );
}
