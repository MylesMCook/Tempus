import { metrics } from "./monitoring"

interface SecurityEvent {
  type: "rate-limit" | "validation-error" | "suspicious-activity" | "error"
  timestamp: number
  clientIp: string
  userAgent?: string
  path: string
  details?: any
}

class SecurityMonitor {
  private events: SecurityEvent[] = []
  private readonly maxEvents = 100
  private suspiciousIPs = new Map<string, number>()
  private readonly suspicionThreshold = 5
  private lastPruneTime = Date.now()
  private readonly pruneInterval = 15 * 60 * 1000 // 15 minutes

  addEvent(event: SecurityEvent) {
    // Lazy pruning - only prune if enough time has passed
    const now = Date.now()
    if (now - this.lastPruneTime > this.pruneInterval) {
      this.pruneOldEvents()
      this.lastPruneTime = now
    }

    this.events.push(event)

    // Keep only the most recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents)
    }

    // Track suspicious activity
    if (event.type === "rate-limit" || event.type === "validation-error") {
      const currentCount = this.suspiciousIPs.get(event.clientIp) || 0
      this.suspiciousIPs.set(event.clientIp, currentCount + 1)

      // Check if IP has crossed the threshold
      if (currentCount + 1 >= this.suspicionThreshold) {
        this.reportSuspiciousActivity(event.clientIp)
      }
    }

    // Log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Security] ${event.type} from ${event.clientIp}: ${JSON.stringify(event.details)}`)
    }
  }

  isSuspicious(clientIp: string): boolean {
    return (this.suspiciousIPs.get(clientIp) || 0) >= this.suspicionThreshold
  }

  private reportSuspiciousActivity(clientIp: string) {
    // In a production environment, you might want to:
    // 1. Log to a security monitoring service
    // 2. Send an alert to administrators
    // 3. Temporarily block the IP at the edge

    // For now, we'll just log it
    console.warn(`[Security Alert] Suspicious activity detected from ${clientIp}`)

    // Add to metrics for monitoring
    metrics.addMetric({
      timestamp: Date.now(),
      duration: 0,
      success: false,
      expression: "SECURITY_ALERT",
      statusCode: 0,
      clientIp,
      eventType: "suspicious-activity",
    })
  }

  private pruneOldEvents() {
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    // Remove events older than 1 hour
    this.events = this.events.filter((event) => event.timestamp >= oneHourAgo)

    // Reset suspicion counters periodically
    this.suspiciousIPs.clear()
  }

  getRecentEvents(): SecurityEvent[] {
    return [...this.events]
  }
}

export const securityMonitor = new SecurityMonitor()
