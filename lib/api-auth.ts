import { createHash, timingSafeEqual } from "crypto"

interface ApiKeyOptions {
  salt: string
}

export class ApiKeyManager {
  private salt: string

  constructor(options: ApiKeyOptions) {
    this.salt = options.salt
  }

  // Generate a hash for a partner ID
  generateApiKey(partnerId: string): string {
    // In production, you'd use a more sophisticated method
    // This is a simple example using SHA-256
    const hash = createHash("sha256")
      .update(this.salt + partnerId)
      .digest("hex")

    // Return first 32 chars as the API key
    return hash.substring(0, 32)
  }

  // Verify an API key against a partner ID
  verifyApiKey(apiKey: string, partnerId: string): boolean {
    const expectedKey = this.generateApiKey(partnerId)

    try {
      // Use timing-safe comparison to prevent timing attacks
      return timingSafeEqual(Buffer.from(apiKey), Buffer.from(expectedKey))
    } catch (e) {
      return false
    }
  }

  // Get higher rate limits for verified partners
  getPartnerRateLimits(partnerId: string): { perMinute: number; perSecond: number } {
    // You could customize limits per partner
    // This is a simple example
    return {
      perMinute: 300, // 300 requests per minute
      perSecond: 10, // 10 requests per second
    }
  }
}

// SECURITY: Require API_KEY_SALT in production to prevent predictable API keys
const salt = process.env.API_KEY_SALT
if (!salt && process.env.NODE_ENV === "production") {
  throw new Error(
    "API_KEY_SALT environment variable is required in production. " +
      "Generate a secure random value: openssl rand -hex 32"
  )
}

// Initialize with environment variable (fallback only for development)
export const apiKeyManager = new ApiKeyManager({
  salt: salt || "default-salt-for-development",
})
