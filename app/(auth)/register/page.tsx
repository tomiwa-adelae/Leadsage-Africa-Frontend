import { Metadata } from "next"
import { BrandPanel } from "@/features/auth/components/BrandPanel"
import { RegisterForm } from "@/features/auth/components/RegisterForm"

export const metadata: Metadata = {
  title: "Create Account · Leadsage Africa",
  description: "Join Leadsage Africa and find your perfect home.",
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[45%_55%]">
      {/* Left — Brand panel (desktop only) */}
      <div className="hidden lg:block">
        <BrandPanel />
      </div>

      {/* Right — Register form */}
      <div className="flex min-h-screen flex-col">
        {/* Scrollable form area */}
        <div className="container flex flex-1 items-start justify-center py-12 lg:px-6 lg:py-10">
          <div className="w-full">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  )
}
