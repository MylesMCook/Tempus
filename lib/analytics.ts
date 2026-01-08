interface EventOptions {
  // Custom properties for the event
  [key: string]: string | number | boolean | undefined;
}

export function trackEvent(eventName: string, options?: EventOptions) {
  // Google Analytics 4 tracking
  if (typeof window !== "undefined" && "gtag" in window) {
    // @ts-expect-error - GA4 global is dynamically injected
    window.gtag("event", eventName, options);
  }
}

export function trackAPIUsage(expression: string, success: boolean, duration: number) {
  trackEvent("api_call", {
    expression,
    success,
    duration_ms: duration,
    timestamp: new Date().toISOString(),
  });
}

export function trackError(error: Error, context?: Record<string, unknown>) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error, "Context:", context);
  }

  // Send to monitoring service in production
  if (process.env.NODE_ENV === "production") {
    trackEvent("error", {
      name: error.name,
      message: error.message,
      stack: error.stack ?? "No stack trace",
      ...(context as EventOptions),
    });
  }
}
