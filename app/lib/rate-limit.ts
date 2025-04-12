import { LRUCache } from "lru-cache"
import { headers } from "next/headers"

type Options = {
  uniqueTokenPerInterval?: number
  interval?: number
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

export default function rateLimit(options?: Options) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (limit: number, token: string): Promise<RateLimitResult> =>
      new Promise<RateLimitResult>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        const currentUsage = tokenCount[0]
        const expiration = tokenCache.getTtl(token) || Date.now() + (options?.interval || 60000)
        const ttl = Math.floor((expiration - Date.now()) / 1000)

        if (currentUsage >= limit) {
          reject({
            success: false,
            limit,
            remaining: 0,
            reset: ttl,
          })
        } else {
          // Update the token count
          tokenCount[0] = currentUsage + 1
          tokenCache.set(token, tokenCount)

          resolve({
            success: true,
            limit,
            remaining: Math.max(0, limit - tokenCount[0]),
            reset: ttl,
          })
        }
      }),

    // Get client identifier from request
    getClientIdentifier: (req: Request): string => {
      const headersList = headers()

      // Try to get real IP from Vercel-specific headers
      const forwardedFor = headersList.get("x-forwarded-for")
      if (forwardedFor) {
        // Get the first IP in the list (client IP)
        return forwardedFor.split(",")[0].trim()
      }

      // Fallback to other headers or a placeholder
      return headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || "anonymous"
    },

    // Get a more unique identifier by combining IP with user agent
    getUniqueIdentifier: (req: Request): string => {
      const headersList = headers()
      const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous"
      const userAgent = headersList.get("user-agent") || "unknown"

      // Create a hash of IP + partial user agent to identify unique clients
      // while not being too restrictive
      return `${ip}:${userAgent.substring(0, 20)}`
    },

    // Check if request is from the same origin/local development
    isSameOrigin: (req: Request): boolean => {
      const headersList = headers()
      const origin = headersList.get("origin")
      const referer = headersList.get("referer")
      const host = headersList.get("host")

      // Check if this is a local development environment
      const isLocalDev =
        process.env.NODE_ENV === "development" || host?.includes("localhost") || host?.includes("127.0.0.1")

      // Check if the request is from the same origin
      const isSameOriginRequest = origin ? origin.includes(host || "") : referer ? referer.includes(host || "") : false

      return isLocalDev || isSameOriginRequest
    },
  }
}
