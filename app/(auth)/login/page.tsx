import { Metadata } from "next"
import { TestimonialCarousel } from "@/features/auth/components/TestimonialCarousel"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { Logo } from "@/components/Logo"

export const metadata: Metadata = {
  title: "Sign In · Leadsage Africa",
  description: "Sign in to your Leadsage Africa account.",
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[55%_45%]">
      {/* Left — Testimonial Carousel (desktop only) */}
      <div className="relative hidden lg:block">
        <TestimonialCarousel />
      </div>

      {/* Right — Login form */}
      <div className="flex min-h-screen flex-col">
        {/* Logo — top */}
        <div className="p-6 lg:p-8">
          <Logo color="green" />
        </div>

        {/* Form — vertically centered */}
        <div className="container flex flex-1 items-center justify-center pb-12 lg:px-6">
          <div className="w-full">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
