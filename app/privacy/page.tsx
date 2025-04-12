import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="container max-w-3xl py-12">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Cookie Policy</h2>
        <p>
          TempusTotal uses minimal cookies and local storage to enhance your experience. This page explains how we use
          these technologies.
        </p>

        <h3>What We Collect</h3>
        <p>We use the following technologies to store information:</p>
        <ul>
          <li>
            <strong>Local Storage:</strong> We store your parser settings (like date format preferences) in your
            browser's local storage. This data never leaves your device.
          </li>
          <li>
            <strong>Analytics Cookies:</strong> We use Vercel Analytics to understand how visitors use our site. This
            helps us improve the user experience. <strong>These are only enabled if you explicitly consent.</strong>
          </li>
          <li>
            <strong>Performance Measurement:</strong> Vercel Speed Insights helps us monitor and improve site
            performance. <strong>This is only enabled if you explicitly consent.</strong>
          </li>
        </ul>

        <h3>Your Choices</h3>
        <p>
          You can control cookie usage through the consent banner that appears when you first visit the site. If you
          decline:
        </p>
        <ul>
          <li>No analytics data will be collected</li>
          <li>No performance data will be sent to Vercel</li>
          <li>Only essential local storage for site functionality will be used</li>
        </ul>
        <p>
          You can change your preference at any time by clearing your browser's cookies and local storage, which will
          reset the consent banner.
        </p>

        <h3>Data Retention</h3>
        <p>
          Local storage data persists until you clear your browser data. Analytics data is anonymized and retained
          according to Vercel's data retention policies.
        </p>

        <h3>Updates to This Policy</h3>
        <p>We may update this policy as needed. Significant changes will be communicated through the site.</p>

        <h3>Contact</h3>
        <p>If you have questions about our privacy practices, please contact us.</p>
      </div>
    </div>
  )
}
