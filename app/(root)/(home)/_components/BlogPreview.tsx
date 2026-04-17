import Link from "next/link"
import { IconArrowRight, IconCalendar, IconClock } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"

const POSTS = [
  {
    slug: "how-to-rent-in-lagos",
    category: "Renting",
    categoryColor: "bg-emerald-100 text-emerald-700",
    title: "How to rent an apartment in Lagos without getting scammed",
    excerpt:
      "Lagos is full of opportunities — and unfortunately, fake listings. Here's your definitive checklist before handing over any money.",
    date: "Apr 10, 2025",
    readTime: "5 min read",
  },
  {
    slug: "firstkey-savings-guide",
    category: "Savings",
    categoryColor: "bg-amber-100 text-amber-700",
    title: "How students are using FirstKey to pay rent before final year",
    excerpt:
      "We spoke to three university students who started saving in 200 level. They tell us how they did it — and what surprised them.",
    date: "Apr 3, 2025",
    readTime: "4 min read",
  },
  {
    slug: "landlord-listing-tips",
    category: "Landlords",
    categoryColor: "bg-blue-100 text-blue-700",
    title: "5 things that make your listing stand out and rent faster",
    excerpt:
      "From photo quality to pricing strategy, here's what separates listings that get filled in a week from those that sit for months.",
    date: "Mar 26, 2025",
    readTime: "6 min read",
  },
]

export function BlogPreview() {
  return (
    <section className="container py-14">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="text-2xl font-bold md:text-3xl">From the blog</h2>
          <p className="mt-2 text-muted-foreground">
            Guides, tips, and stories for renters and landlords.
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/blog" className="flex items-center gap-1.5">
            All articles <IconArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-2xl border bg-card p-6 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${post.categoryColor} mb-4`}
            >
              {post.category}
            </span>

            <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
              {post.title}
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-3 mt-5 pt-4 border-t text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <IconCalendar className="size-3.5" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <IconClock className="size-3.5" />
                {post.readTime}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
