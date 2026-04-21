import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms of Service · Leadsage Africa",
  description:
    "Read the Terms of Service governing your use of Leadsage Africa's housing, savings, and payment platform.",
}

const EFFECTIVE_DATE = "21 April 2026"

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "services", title: "2. Description of Services" },
  { id: "accounts", title: "3. User Accounts & Eligibility" },
  { id: "listings", title: "4. Listings & Property Rules" },
  { id: "bookings", title: "5. Rentals, Bookings & Applications" },
  { id: "payments", title: "6. Payments, Escrow & Refunds" },
  { id: "firstkey", title: "7. FirstKey Savings" },
  { id: "wallet", title: "8. Wallet & Financial Services" },
  { id: "fees", title: "9. Fees & Commission" },
  { id: "prohibited", title: "10. Prohibited Activities" },
  { id: "ip", title: "11. Intellectual Property" },
  { id: "liability", title: "12. Disclaimers & Limitation of Liability" },
  { id: "termination", title: "13. Termination" },
  { id: "governing", title: "14. Governing Law" },
  { id: "changes", title: "15. Changes to These Terms" },
  { id: "contact", title: "16. Contact Us" },
]

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12 lg:py-16">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated:{" "}
          {EFFECTIVE_DATE}
        </p>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          Welcome to Leadsage Africa. By creating an account or using any part
          of our platform, you agree to be bound by these Terms of Service.
          Please read them carefully.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Table of contents — sticky on desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-1">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Contents
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {s.title}
              </a>
            ))}
          </div>
        </aside>

        {/* Body */}
        <div className="space-y-10 text-sm leading-relaxed text-muted-foreground">
          {/* 1 */}
          <section id="acceptance" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              1. Acceptance of Terms
            </h2>
            <p>
              These Terms of Service ("Terms") form a legally binding agreement
              between you ("User", "you") and Leadsage Africa ("Leadsage",
              "we", "us", "our"), a technology company operating Nigeria's
              housing platform. By accessing or using our website, mobile
              application, or any services we provide, you confirm that you
              have read, understood, and agree to these Terms and our{" "}
              <Link href="/privacy" className="text-primary underline underline-offset-4">
                Privacy Policy
              </Link>
              .
            </p>
            <p>
              If you do not agree to these Terms, you must not use our
              platform. We reserve the right to update these Terms at any time.
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          {/* 2 */}
          <section id="services" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              2. Description of Services
            </h2>
            <p>
              Leadsage Africa is a technology platform that connects property
              seekers (renters, tenants, guests) with property owners and
              managers (landlords, hosts) across Nigeria. Our services include:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">Property Listings</strong>{" "}
                — long-term rentals, shortlets, office spaces, and hotel rooms
              </li>
              <li>
                <strong className="text-foreground">Applications & Screening</strong>{" "}
                — tenant screening, document submission, and rental applications
              </li>
              <li>
                <strong className="text-foreground">Tour Requests</strong> —
                scheduling property viewings with landlords or agents
              </li>
              <li>
                <strong className="text-foreground">
                  Leadsage Wallet
                </strong>{" "}
                — a digital wallet for funding, payments, and withdrawals
              </li>
              <li>
                <strong className="text-foreground">FirstKey Savings</strong>{" "}
                — goal-based savings products designed to help renters save
                toward their next rent or property deposit
              </li>
              <li>
                <strong className="text-foreground">Escrow Payments</strong>{" "}
                — secure holding of rental and booking payments until release
                conditions are met
              </li>
            </ul>
            <p>
              Leadsage is a marketplace and technology platform. We are not a
              landlord, property agent, estate surveyor, or financial
              institution. We do not own any of the listed properties.
            </p>
          </section>

          {/* 3 */}
          <section id="accounts" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              3. User Accounts & Eligibility
            </h2>
            <p>To use Leadsage, you must:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Be at least 18 years of age</li>
              <li>Be a Nigerian resident or have a valid Nigerian address</li>
              <li>Provide accurate, current, and complete registration information</li>
              <li>Verify your email address after registration</li>
              <li>
                Not create more than one account per person (duplicate
                accounts may be suspended)
              </li>
            </ul>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials. All activity under your account is your
              responsibility. Notify us immediately at{" "}
              <a
                href="mailto:support@leadsageafrica.com"
                className="text-primary underline underline-offset-4"
              >
                support@leadsageafrica.com
              </a>{" "}
              if you suspect unauthorised access.
            </p>
            <p>
              We may suspend or permanently ban any account that violates these
              Terms, without notice, at our sole discretion.
            </p>
          </section>

          {/* 4 */}
          <section id="listings" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              4. Listings & Property Rules
            </h2>
            <p>
              Landlords and property managers who list properties on Leadsage
              agree to the following:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                All listing information must be accurate, truthful, and
                up-to-date. Misleading or fraudulent listings are strictly
                prohibited.
              </li>
              <li>
                Only properties you own, are authorised to list, or are
                duly appointed to manage may be submitted.
              </li>
              <li>
                All listings are subject to review and approval by the
                Leadsage moderation team before being published. We reserve
                the right to reject or remove any listing.
              </li>
              <li>
                Photos must be genuine representations of the property. Stock
                images or deceptive photographs are not permitted.
              </li>
              <li>
                Pricing must be stated in Nigerian Naira (₦). Landlords may
                not solicit payments outside the Leadsage platform.
              </li>
              <li>
                Leadsage charges a service fee (commission) on transactions
                processed through the platform. See Section 9 for details.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section id="bookings" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              5. Rentals, Bookings & Applications
            </h2>
            <p>
              <strong className="text-foreground">Long-term Rentals:</strong>{" "}
              Renters may submit a rental application which includes identity
              verification and supporting documents. Landlords review and
              approve or decline applications. A rental agreement is generated
              upon approval.
            </p>
            <p>
              <strong className="text-foreground">Shortlet Bookings:</strong>{" "}
              Renters may book shortlet properties for specified dates. Where
              a listing is marked "Instant Book", the booking is confirmed
              automatically upon payment. Otherwise, the landlord must confirm
              the booking within the specified window.
            </p>
            <p>
              <strong className="text-foreground">Cancellations:</strong>{" "}
              Cancellation policies are set by the landlord and displayed on
              the listing page. Leadsage is not liable for cancellations made
              by either party. Refunds for cancellations are subject to the
              applicable cancellation policy and our escrow release terms.
            </p>
          </section>

          {/* 6 */}
          <section id="payments" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              6. Payments, Escrow & Refunds
            </h2>
            <p>
              All payments for rentals and bookings made through the Leadsage
              platform are processed via our integrated payment providers
              (Paystack for card payments, Anchor BaaS for wallet transfers).
            </p>
            <p>
              <strong className="text-foreground">Escrow:</strong> Rental
              and booking payments are held in escrow for a defined period
              after the transaction (typically 24 hours after payment for
              rentals, or 24 hours after check-in for shortlets). Escrow
              protects both parties — funds are only released to the landlord
              after the hold period lapses without a valid dispute.
            </p>
            <p>
              <strong className="text-foreground">Refunds:</strong> Refunds
              are processed in accordance with the applicable cancellation
              policy. Card payment refunds are returned to the original
              payment method. Wallet payment refunds are credited to the
              payer's Leadsage wallet.
            </p>
            <p>
              Leadsage does not guarantee the quality, safety, or legality
              of any property. We are a payment facilitator, not a guarantor
              of any transaction.
            </p>
          </section>

          {/* 7 */}
          <section id="firstkey" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              7. FirstKey Savings
            </h2>
            <p>
              FirstKey is a goal-based savings product offered through the
              Leadsage platform, powered by our banking-as-a-service partner
              (Anchor). By using FirstKey:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                You authorise Leadsage and its BaaS partner to hold your
                savings in a dedicated account on your behalf.
              </li>
              <li>
                Withdrawal of locked savings before the maturity date may be
                subject to applicable charges or penalties as stated at the
                time of plan creation.
              </li>
              <li>
                Returns or interest, where offered, are subject to change.
                Leadsage does not guarantee specific investment returns.
              </li>
              <li>
                FirstKey is a savings product, not an investment scheme. Your
                principal is not at risk from market movements.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section id="wallet" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              8. Wallet & Financial Services
            </h2>
            <p>
              The Leadsage Wallet is a digital payment wallet powered by
              Anchor BaaS. To activate your wallet and access full
              functionality, you must complete our Know Your Customer (KYC)
              process, which requires:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Bank Verification Number (BVN) — used to verify your identity
                with our BaaS partner. Your BVN is never stored in plain text.
              </li>
              <li>Date of birth and gender for BVN matching purposes</li>
            </ul>
            <p>
              A 4-digit transaction PIN is required to authorise all wallet
              transactions including payments and withdrawals. You are solely
              responsible for keeping your PIN confidential. Leadsage will
              never ask for your PIN by phone, email, or any other channel.
            </p>
            <p>
              Wallet funds are not NDIC-insured. Leadsage holds your wallet
              balance in a pooled account with our licensed BaaS partner.
              Withdrawals are subject to network availability and may take
              up to one business day to reflect in your bank account.
            </p>
          </section>

          {/* 9 */}
          <section id="fees" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              9. Fees & Commission
            </h2>
            <p>
              Leadsage charges a platform service fee of{" "}
              <strong className="text-foreground">5%</strong> on all rental
              and booking payments processed through the platform. This fee
              is deducted from the amount disbursed to the landlord upon
              escrow release.
            </p>
            <p>
              Renters are not charged a service fee on payments. Fees for
              additional services (e.g. application processing, premium
              listings) will be disclosed at the point of use.
            </p>
            <p>
              All fees are inclusive of applicable VAT as required by Nigerian
              tax law. Leadsage reserves the right to revise its fee structure
              with reasonable notice.
            </p>
          </section>

          {/* 10 */}
          <section id="prohibited" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              10. Prohibited Activities
            </h2>
            <p>You must not use Leadsage to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Post fraudulent, misleading, or non-existent property listings
              </li>
              <li>
                Solicit or accept payments for rentals or bookings outside the
                Leadsage platform
              </li>
              <li>
                Impersonate any person, landlord, property manager, or
                Leadsage representative
              </li>
              <li>
                Use the platform to launder money, finance criminal activity,
                or engage in any unlawful transaction
              </li>
              <li>
                Harass, threaten, or discriminate against other users on the
                basis of gender, ethnicity, religion, or any other protected
                characteristic
              </li>
              <li>
                Attempt to scrape, reverse-engineer, or exploit the Leadsage
                platform, its API, or its data
              </li>
              <li>
                Create multiple accounts to circumvent suspensions or
                restrictions
              </li>
              <li>
                Upload malicious content, spam, or content that infringes
                third-party intellectual property rights
              </li>
            </ul>
            <p>
              Violation of any of the above may result in immediate account
              suspension or permanent banning without refund.
            </p>
          </section>

          {/* 11 */}
          <section id="ip" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              11. Intellectual Property
            </h2>
            <p>
              All content, design, trademarks, logos, and software on the
              Leadsage platform are the exclusive property of Leadsage Africa
              or its licensors. You may not reproduce, distribute, or create
              derivative works without our prior written consent.
            </p>
            <p>
              By uploading content (photos, documents, listing descriptions)
              to Leadsage, you grant us a non-exclusive, royalty-free,
              worldwide licence to use, display, and distribute that content
              solely for operating and promoting our services.
            </p>
          </section>

          {/* 12 */}
          <section id="liability" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              12. Disclaimers & Limitation of Liability
            </h2>
            <p>
              The Leadsage platform is provided "as is" and "as available"
              without warranties of any kind, express or implied. We do not
              warrant that the platform will be error-free, uninterrupted, or
              free of viruses or other harmful components.
            </p>
            <p>
              Leadsage is not liable for any direct, indirect, incidental,
              special, or consequential damages arising from:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Any transaction between a landlord and a renter, including
                disputes over property condition, tenancy terms, or refunds
              </li>
              <li>
                Failure of third-party payment providers (Paystack, Anchor)
              </li>
              <li>
                Inaccurate property information provided by a landlord
              </li>
              <li>Unauthorised access to your account due to your negligence</li>
              <li>
                Force majeure events — natural disasters, government actions,
                or other events beyond our reasonable control
              </li>
            </ul>
            <p>
              To the maximum extent permitted by Nigerian law, our total
              liability to you shall not exceed the total fees paid by you to
              Leadsage in the 12 months preceding the claim.
            </p>
          </section>

          {/* 13 */}
          <section id="termination" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              13. Termination
            </h2>
            <p>
              You may close your account at any time by contacting us at{" "}
              <a
                href="mailto:support@leadsageafrica.com"
                className="text-primary underline underline-offset-4"
              >
                support@leadsageafrica.com
              </a>
              . Any outstanding wallet balance will be disbursed to a
              verified bank account before closure.
            </p>
            <p>
              We may terminate or suspend your account immediately, without
              prior notice, if we believe you have violated these Terms or
              any applicable law. Termination does not relieve you of any
              obligations incurred prior to the termination date.
            </p>
          </section>

          {/* 14 */}
          <section id="governing" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              14. Governing Law
            </h2>
            <p>
              These Terms are governed by and construed in accordance with
              the laws of the Federal Republic of Nigeria. Any dispute arising
              out of or in connection with these Terms shall be subject to
              the exclusive jurisdiction of the courts of Lagos State, Nigeria.
            </p>
            <p>
              Where mandatory local consumer protection laws apply, those
              rights are not excluded by these Terms.
            </p>
          </section>

          {/* 15 */}
          <section id="changes" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              15. Changes to These Terms
            </h2>
            <p>
              We may update these Terms from time to time. When we do, we
              will revise the "Last updated" date at the top of this page and,
              for material changes, notify you by email or via an in-app
              notification. Your continued use of the platform after the
              effective date of any changes constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          {/* 16 */}
          <section id="contact" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              16. Contact Us
            </h2>
            <p>
              If you have questions about these Terms, please contact us:
            </p>
            <address className="not-italic space-y-1">
              <p className="font-medium text-foreground">Leadsage Africa</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@leadsageafrica.com"
                  className="text-primary underline underline-offset-4"
                >
                  support@leadsageafrica.com
                </a>
              </p>
              <p>Location: Lagos, Nigeria</p>
            </address>
            <p className="mt-4 rounded-lg border bg-muted/40 px-4 py-3 text-xs">
              Also read our{" "}
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-4"
              >
                Privacy Policy
              </Link>{" "}
              to understand how we collect and use your data.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
