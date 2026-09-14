import type { ReactNode } from "react";
import { requestInfo } from "rwsdk/worker";
import styles from "./index.css?url";

export function Document({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Tempus — Date math, with the steps</title>
        <meta
          name="description"
          content="Calculate dates in words. Follow each addition, subtraction and month-end adjustment, then copy the result or use the date engine in your application."
        />
        <link
          rel="preload"
          href="/fonts/geist-variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={styles} />
        <link rel="modulepreload" href="/src/client.tsx" />
      </head>
      <body className="bg-page">
        <a href="#main" className="sr-only focus:not-sr-only focus:block focus:p-4">
          Skip to content
        </a>
        <div className="border-b bg-background">
          <nav
            aria-label="Main navigation"
            className="mx-auto flex h-12 max-w-3xl items-center justify-between gap-4 px-4 sm:h-14 sm:px-8"
          >
            <a
              href="/"
              className="text-[1.0625rem] font-semibold tracking-[-0.03em] focus-visible:outline focus-visible:outline-2 sm:text-lg"
            >
              Tempus<span className="text-primary">.</span>
            </a>
            <a
              href="/developers"
              className="py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2"
            >
              Build with Tempus
            </a>
          </nav>
        </div>
        <noscript>
          <p className="mx-auto max-w-3xl p-4">
            Enable JavaScript to interpret dates on your device. The integration guide and privacy
            policy remain available.
          </p>
        </noscript>
        {children}
        <footer className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 border-t px-4 py-5 text-sm text-muted-foreground sm:px-8">
          <span>Natural language. Inspectable dates.</span>
          <a href="/privacy" className="py-3 underline-offset-4 hover:underline">
            Privacy policy
          </a>
        </footer>
        <script nonce={requestInfo.rw.nonce} type="module" src="/src/client.tsx" />
      </body>
    </html>
  );
}
