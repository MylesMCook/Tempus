import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">Could not find requested resource</p>
      <Button asChild variant="outline">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  )
}
