"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useConsent } from "../context/consent-context"

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false)
  const { consentStatus, acceptCookies, declineCookies, isConsentLoaded } = useConsent()

  useEffect(() => {
    // Only show banner if consent is pending and the context has loaded
    if (consentStatus === "pending" && isConsentLoaded) {
      // Small delay to prevent banner from showing immediately on page load
      const timer = setTimeout(() => {
        setShowConsent(true)
      }, 1000)

      return () => clearTimeout(timer)
    } else {
      setShowConsent(false)
    }
  }, [consentStatus, isConsentLoaded])

  const handleAccept = () => {
    acceptCookies()
    setShowConsent(false)
  }

  const handleDecline = () => {
    declineCookies()
    setShowConsent(false)
  }

  if (!showConsent) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-background border rounded-lg shadow-lg p-4 text-sm animate-in fade-in slide-in-from-bottom-5 z-50">
      <div className="flex justify-between items-start gap-2">
        <p className="text-muted-foreground">We use cookies to enhance your experience and analyze site usage.</p>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleDecline}>
          <X className="h-3 w-3" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" className="text-xs h-7" onClick={handleDecline}>
          Decline
        </Button>
        <Button size="sm" className="text-xs h-7 bg-primary text-primary-foreground" onClick={handleAccept}>
          Accept
        </Button>
      </div>
    </div>
  )
}
