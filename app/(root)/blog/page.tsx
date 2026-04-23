"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  IconLoader2,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  getPublishedPosts,
  POST_CATEGORIES,
  type PostSummary,
  type PostCategory,
} from "@/lib/blog-api"
import { formatDate } from "@/lib/utils"
import { DEFAULT_IMAGE } from "@/constants"
import { PageHeader } from "@/components/PageHeader"

const LIMIT = 9

export default function BlogPage() {
  const [posts, setPosts] = useState<PostSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<PostCategory | "">("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  const load = useCallback(
    async (currentPage: number) => {
      setLoading(true)
      try {
        const res = await getPublishedPosts({
          page: currentPage,
          limit: LIMIT,
          search: search || undefined,
          category: category || undefined,
        })
        setPosts(res.data)
        setTotal(res.total)
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    },
    [search, category]
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
    const t = setTimeout(() => load(1), 300)
    return () => clearTimeout(t)
  }, [search, category, load])

  // Load when page changes (but not on filter change — handled above)
  useEffect(() => {
    if (page !== 1) load(page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <main className="container space-y-10 py-12">
      {/* Header */}
      <PageHeader
        title="Blogs"
        description="News, updates, and resources from the Leadsage Africa."
      />

      {/* Filters */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch
            size={15}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            placeholder="Search articles…"
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={category === "" ? "default" : "outline"}
            onClick={() => setCategory("")}
          >
            All
          </Button>
          {POST_CATEGORIES.map((c) => (
            <Button
              key={c.value}
              size="sm"
              variant={category === c.value ? "default" : "outline"}
              onClick={() => setCategory(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <IconLoader2 size={32} className="animate-spin opacity-20" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-32 text-center text-muted-foreground">
          No articles found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border transition-colors hover:border-primary/50"
              >
                {/* Cover */}
                <div className="aspect-video w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImage || DEFAULT_IMAGE}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {post.category.toLowerCase()}
                    </Badge>
                    {post.publishedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(post.publishedAt)}
                      </span>
                    )}
                  </div>

                  <h2 className="line-clamp-2 text-base leading-snug font-semibold transition-colors group-hover:text-primary hover:underline">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                  )}

                  <p className="pt-1 text-xs text-muted-foreground">
                    By {post.author.firstName} {post.author.lastName}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <IconChevronLeft size={16} />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? "default" : "outline"}
                  onClick={() => setPage(p)}
                  disabled={loading}
                  className="w-9"
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                <IconChevronRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </main>
  )
}
