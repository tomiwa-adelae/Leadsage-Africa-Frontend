import { Metadata } from "next"
import { Suspense } from "react"
import { TestimonialCarousel } from "@/features/auth/components/TestimonialCarousel"
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm"
import { Logo } from "@/components/Logo"

export const metadata: Metadata = {
  title: "Verify Email · Leadsage Africa",
  description: "Enter your verification code to activate your account.",
}

export default function VerifyEmailPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[55%_45%]">
      <div className="relative hidden lg:block">
        <TestimonialCarousel />
      </div>
      <div className="flex min-h-screen flex-col">
        <div className="p-6 lg:p-8">
          <Logo color="green" />
        </div>
        <div className="container flex flex-1 items-center justify-center pb-12 lg:px-6">
          <div className="w-full">
            <Suspense>
              <VerifyEmailForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
