"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { IconSearch, IconMapPin } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const TABS = [
  { label: "All",        value: ""              },
  { label: "Long-term",  value: "LONG_TERM"     },
  { label: "Shortlet",   value: "SHORTLET"      },
  { label: "Office",     value: "OFFICE_SPACE"  },
] as const

export function HeroSearchForm() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<string>("")
  const [query, setQuery] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (activeTab) params.set("type", activeTab)
    if (query.trim()) params.set("q", query.trim())
    router.push(`/listings${params.toString() ? `?${params}` : ""}`)
  }

  return (
    <div className="mt-8">
      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              activeTab === tab.value
                ? "bg-white text-primary"
                : "bg-white/15 text-white hover:bg-white/25"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-xl max-w-lg"
      >
        <IconMapPin className="ml-2 size-5 shrink-0 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by location, property type…"
          className="border-0 shadow-none focus-visible:ring-0 text-foreground placeholder:text-muted-foreground flex-1"
        />
        <Button type="submit" size="sm" className="shrink-0 rounded-lg px-5">
          <IconSearch className="size-4 mr-1.5" />
          Search
        </Button>
      </form>
    </div>
  )
}
