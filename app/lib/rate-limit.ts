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

    // Get client identifier from request (async due to Next.js 15 headers())
    // SECURITY: Use the LAST IP in X-Forwarded-For (added by trusted proxy like Vercel)
    // The first IP can be spoofed by attackers to bypass per-IP rate limits
    getClientIdentifier: async (req: Request): Promise<string> => {
      const headersList = await headers()

      // X-Forwarded-For format: "client, proxy1, proxy2, ..., trusted-proxy"
      // In Vercel/production, the LAST IP is added by the trusted edge proxy
      const forwardedFor = headersList.get("x-forwarded-for")
      if (forwardedFor) {
        const ips = forwardedFor.split(",").map((ip) => ip.trim())
        // Use LAST IP (added by trusted proxy) - first IPs can be attacker-controlled
        return ips[ips.length - 1]
      }

      // Fallback to other trusted headers or placeholder
      return headersList.get("x-real-ip") || headersList.get("cf-connecting-ip") || "anonymous"
    },

    // Get a more unique identifier by combining IP with user agent (async due to Next.js 15 headers())
    getUniqueIdentifier: async (req: Request): Promise<string> => {
      const headersList = await headers()
      const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() || "anonymous"
      const userAgent = headersList.get("user-agent") || "unknown"

      // Create a hash of IP + partial user agent to identify unique clients
      // while not being too restrictive
      return `${ip}:${userAgent.substring(0, 20)}`
    },

    // Check if request is from local development environment
    // SECURITY: Only trust NODE_ENV - never trust client-supplied headers (Origin, Host, Referer)
    // Attackers can spoof these headers to bypass rate limiting
    isSameOrigin: async (req: Request): Promise<boolean> => {
      // In development, skip rate limiting for easier testing
      if (process.env.NODE_ENV === "development") {
        return true
      }

      // In production, apply rate limiting to ALL requests
      // This prevents attackers from spoofing Origin/Host headers to bypass limits
      return false
    },
  }
}
