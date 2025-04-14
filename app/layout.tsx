import type React from "react"
import { Geist, Geist_Mono as GeistMono } from "next/font/google"
import type { Metadata } from "next"
import { cn } from "@/lib/utils"
import "./globals.css"
import { CookieConsent } from "./components/cookie-consent"
import { ConsentProvider } from "./context/consent-context"
import { ConditionalAnalytics } from "./components/conditional-analytics"

// Add this to make TypeScript happy with our custom window property
declare global {
  interface Window {
    _analyticsDisabled?: boolean
  }
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = GeistMono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "TempusTotal - Natural Language Date Parser",
  description:
    'Transform natural language expressions like "next friday" or "3 weeks from now" into precise dates. Simple, powerful, and built for humans.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tempustotal.com"),
  openGraph: {
    title: "TempusTotal - Natural Language Date Parser",
    description:
      "Transform natural language date expressions into precise dates. Simple, powerful, and built for humans.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://tempustotal.com",
    siteName: "TempusTotal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TempusTotal - Natural Language Date Parser",
    description:
      "Transform natural language date expressions into precise dates. Simple, powerful, and built for humans.",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={cn("min-h-screen bg-background antialiased", geist.variable, geistMono.variable, geist.className)}
      >
        <ConsentProvider>
          {children}
          <ConditionalAnalytics />
          <CookieConsent />
        </ConsentProvider>
      </body>
    </html>
  )
}


import './globals.css'