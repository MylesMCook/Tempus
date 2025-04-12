"use client"

import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { useConsent } from "../context/consent-context"

export function ConditionalAnalytics() {
  const { consentStatus, isConsentLoaded } = useConsent()

  // Only render analytics if consent is explicitly accepted and loaded
  if (consentStatus === "accepted" && isConsentLoaded) {
    return (
      <>
        <Analytics
          beforeSend={(event) => {
            // Double-check consent before sending events
            // This handles cases where consent might change during a session
            const currentConsent = localStorage.getItem("cookie-consent")
            if (currentConsent !== "accepted" || window._analyticsDisabled) {
              return null // Don't send the event
            }
            return event
          }}
        />
        <SpeedInsights />
      </>
    )
  }

  return null
}
