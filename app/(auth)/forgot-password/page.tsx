import { Metadata } from "next"
import { TestimonialCarousel } from "@/features/auth/components/TestimonialCarousel"
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"
import { Logo } from "@/components/Logo"

export const metadata: Metadata = {
  title: "Forgot Password · Leadsage Africa",
  description: "Reset your Leadsage Africa account password.",
}

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[55%_45%]">
      {/* Left — Testimonial Carousel (desktop only) */}
      <div className="relative hidden lg:block">
        <TestimonialCarousel />
      </div>

      {/* Right — Form */}
      <div className="flex min-h-screen flex-col">
        <div className="p-6 lg:p-8">
          <Logo color="green" />
        </div>
        <div className="container flex flex-1 items-center justify-center pb-12 lg:px-6">
          <div className="w-full">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  )
}
