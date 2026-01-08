"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  // Initialize with a function to avoid SSR hydration mismatch
  // On server, assume desktop (most common case for responsive designs)
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)

    // Set initial value (handles SSR -> client transition)
    setMatches(media.matches)

    // Update the state when the media query changes
    const listener = () => setMatches(media.matches)
    media.addEventListener("change", listener)

    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}
