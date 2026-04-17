import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTABanner() {
  return (
    <section className="bg-muted/40 py-14">
      <div className="container">
        <div className="flex flex-col items-center text-center gap-6 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold md:text-3xl lg:text-4xl">
            Ready to find your next home?
          </h2>
          <p className="text-muted-foreground">
            Join thousands of renters, landlords, and student savers already using Leadsage to make
            housing stress-free.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/listings">Browse listings</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/register">Create free account</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
