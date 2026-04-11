"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/useAuth"
import { OnboardingWizard } from "@/features/onboarding/OnboardingWizard"
import { IconLoader2 } from "@tabler/icons-react"
import { Loader } from "@/components/Loader"

export default function OnboardingPage() {
  const user = useAuth((s) => s.user)
  const hydrated = useAuth((s) => s._hasHydrated)
  const router = useRouter()

  useEffect(() => {
    if (!hydrated) return

    if (!user) {
      router.replace("/login")
      return
    }

    if (user.onboardingCompleted) {
      router.replace(
        user.role === "LANDLORD" ? "/landlord/dashboard" : "/dashboard"
      )
    }
  }, [user, hydrated, router])

  // Wait for hydration
  if (!hydrated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader text="Loading..." />
      </div>
    )
  }

  // Already onboarded — redirect is in flight
  if (user.onboardingCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader />
      </div>
    )
  }

  return <OnboardingWizard />
}
