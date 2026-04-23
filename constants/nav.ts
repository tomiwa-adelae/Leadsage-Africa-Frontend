export type NavLink = {
  label: string
  href: string
  description: string
}

export const savingsLinks: NavLink[] = [
  {
    label: "FirstKey",
    href: "/firstkey",
    description: "Automated housing savings plan with 12% annual yield",
  },
  {
    label: "Wallet",
    href: "/wallet",
    description: "Store, manage and move your funds",
  },
  {
    label: "FirstKey Duo",
    href: "/firstkey-duo",
    description: "Save together with a partner toward a shared goal",
  },
  {
    label: "Furniture Savings",
    href: "/furniture-savings",
    description: "Furnish your new home affordably over time",
  },
]

export const listingsLinks: NavLink[] = [
  {
    label: "Long-term Rentals",
    href: "/listings?type=LONG_TERM",
    description:
      "Apartments, duplexes and houses for long-term rent across Nigeria",
  },
  {
    label: "Shortlets",
    href: "/listings?type=SHORTLET",
    description: "Short-term furnished stays, ready to move in",
  },
  {
    label: "Office Spaces",
    href: "/listings?type=OFFICE_SPACE",
    description: "Professional workspaces for businesses of all sizes",
  },
  {
    label: "Hotel Rooms",
    href: "/listings?type=HOTEL_ROOM",
    description: "Comfortable and verified hotel accommodations",
  },
]

export const resourcesLinks: NavLink[] = [
  {
    label: "Blog",
    href: "/blog",
    description: "News, updates, and resources from the Leadsage Africa",
  },
]
