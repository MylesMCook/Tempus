"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type ConsentStatus = "accepted" | "declined" | "pending"

interface ConsentContextType {
  consentStatus: ConsentStatus
  acceptCookies: () => void
  declineCookies: () => void
  isConsentLoaded: boolean
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>("pending")
  const [isConsentLoaded, setIsConsentLoaded] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const storedConsent = localStorage.getItem("cookie-consent")

    if (storedConsent === "accepted") {
      setConsentStatus("accepted")
    } else if (storedConsent === "declined") {
      setConsentStatus("declined")
    }

    setIsConsentLoaded(true)
  }, [])

  const acceptCookies = () => {
    localStorage.setItem("cookie-consent", "accepted")
    setConsentStatus("accepted")
  }

  const declineCookies = () => {
    localStorage.setItem("cookie-consent", "declined")
    setConsentStatus("declined")

    // Disable analytics by setting a flag that prevents data collection
    // This will be read by analytics providers
    window._analyticsDisabled = true

    // You could also try to clear existing analytics cookies here
    // This is a basic approach - a more comprehensive solution would
    // identify and clear all analytics cookies
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.split("=")
      if (name.trim().startsWith("_vercel") || name.trim().startsWith("_ga")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })
  }

  return (
    <ConsentContext.Provider value={{ consentStatus, acceptCookies, declineCookies, isConsentLoaded }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useConsent() {
  const context = useContext(ConsentContext)
  if (context === undefined) {
    throw new Error("useConsent must be used within a ConsentProvider")
  }
  return context
}
