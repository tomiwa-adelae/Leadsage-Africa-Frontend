export type AmenityCategory = {
  category: string
  items: { id: string; label: string }[]
}

export const AMENITIES: AmenityCategory[] = [
  {
    category: "Utilities",
    items: [
      { id: "electricity", label: "24hr Electricity" },
      { id: "generator", label: "Generator / Inverter" },
      { id: "solar", label: "Solar Power" },
      { id: "water", label: "Running Water" },
      { id: "borehole", label: "Borehole" },
      { id: "prepaid-meter", label: "Prepaid Meter" },
      { id: "internet", label: "High-Speed Internet" },
      { id: "cable-tv", label: "Cable TV" },
    ],
  },
  {
    category: "Security",
    items: [
      { id: "security", label: "24hr Security" },
      { id: "cctv", label: "CCTV Surveillance" },
      { id: "gateman", label: "Gateman" },
      { id: "intercom", label: "Intercom" },
      { id: "smart-lock", label: "Smart Lock" },
      { id: "fence", label: "Perimeter Fencing" },
      { id: "alarm", label: "Security Alarm" },
    ],
  },
  {
    category: "Indoor",
    items: [
      { id: "air-conditioning", label: "Air Conditioning" },
      { id: "furnished", label: "Fully Furnished" },
      { id: "wardrobe", label: "Wardrobe / Closet" },
      { id: "kitchen-cabinet", label: "Kitchen Cabinet" },
      { id: "microwave", label: "Microwave" },
      { id: "refrigerator", label: "Refrigerator" },
      { id: "washing-machine", label: "Washing Machine" },
      { id: "gas-cooker", label: "Gas Cooker" },
      { id: "tv", label: "Television" },
      { id: "study-room", label: "Study Room" },
    ],
  },
  {
    category: "Outdoor & Building",
    items: [
      { id: "parking", label: "Parking Space" },
      { id: "boys-quarters", label: "Boys Quarters" },
      { id: "garden", label: "Garden / Lawn" },
      { id: "balcony", label: "Balcony" },
      { id: "rooftop", label: "Rooftop Access" },
      { id: "swimming-pool", label: "Swimming Pool" },
      { id: "gym", label: "Gym / Fitness Centre" },
      { id: "playground", label: "Playground" },
      { id: "event-hall", label: "Event Hall" },
    ],
  },
  {
    category: "Accessibility",
    items: [
      { id: "elevator", label: "Elevator / Lift" },
      { id: "wheelchair", label: "Wheelchair Accessible" },
      { id: "paved-road", label: "Paved Road Access" },
      { id: "bus-stop", label: "Close to Bus Stop" },
    ],
  },
]

export const ALL_AMENITY_IDS = AMENITIES.flatMap((cat) =>
  cat.items.map((item) => item.id)
)
