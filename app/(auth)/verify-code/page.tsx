import { Metadata } from "next"
import { Suspense } from "react"
import { TestimonialCarousel } from "@/features/auth/components/TestimonialCarousel"
import { VerifyCodeForm } from "@/features/auth/components/VerifyCodeForm"
import { Logo } from "@/components/Logo"

export const metadata: Metadata = {
  title: "Verify Code · Leadsage Africa",
  description: "Enter your verification code to reset your password.",
}

export default function VerifyCodePage() {
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
              <VerifyCodeForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
