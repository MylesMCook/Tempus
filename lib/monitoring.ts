export interface APIMetrics {
  timestamp: number
  duration: number
  success: boolean
  expression: string
  statusCode: number
}

class MetricsCollector {
  private metrics: APIMetrics[] = []
  private readonly maxSize = 100

  addMetric(metric: APIMetrics) {
    this.metrics.push(metric)

    // Keep only the last maxSize items
    if (this.metrics.length > this.maxSize) {
      this.metrics = this.metrics.slice(-this.maxSize)
    }

    // Log metrics in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Metric:", metric)
    }

    // In production, periodically send metrics to your monitoring service
    if (process.env.NODE_ENV === "production") {
      this.reportMetrics()
    }
  }

  private reportMetrics() {
    // Calculate aggregate statistics
    const recentMetrics = this.metrics.slice(-20)
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length
    const successRate = recentMetrics.filter((m) => m.success).length / recentMetrics.length

    // Report to monitoring service
    if (avgDuration > 1000) {
      // Alert if average duration > 1s
      this.alertSlowResponses(avgDuration)
    }
    if (successRate < 0.95) {
      // Alert if success rate drops below 95%
      this.alertHighErrorRate(successRate)
    }
  }

  private alertSlowResponses(avgDuration: number) {
    console.error(`High latency detected: ${avgDuration.toFixed(2)}ms average`)
  }

  private alertHighErrorRate(successRate: number) {
    console.error(`High error rate detected: ${(100 - successRate * 100).toFixed(2)}% errors`)
  }
}

export const metrics = new MetricsCollector()
