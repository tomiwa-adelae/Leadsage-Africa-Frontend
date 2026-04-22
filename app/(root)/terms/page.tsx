import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terms & Conditions · Leadsage Africa",
  description:
    "Read the Terms and Conditions governing your use of Leadsage Africa's housing, savings, and payment platform.",
}

const EFFECTIVE_DATE = "22 April 2026"

const sections = [
  { id: "acceptance", title: "1. Introduction & Acceptance" },
  { id: "definitions", title: "2. Definitions" },
  { id: "services", title: "3. Nature of Services" },
  { id: "accounts", title: "4. User Accounts & Eligibility" },
  { id: "kyc", title: "5. KYC, AML & Verification" },
  { id: "listings", title: "6. Listings & Property Rules" },
  { id: "bookings", title: "7. Rentals, Bookings & Applications" },
  { id: "payments", title: "8. Payments, Escrow & Refunds" },
  { id: "sagenest", title: "9. SageNest Savings" },
  { id: "wallet", title: "10. Wallet & Financial Services" },
  { id: "fees", title: "11. Fees & Commission" },
  { id: "prohibited", title: "12. Prohibited Activities" },
  { id: "ip", title: "13. Intellectual Property" },
  { id: "third-party", title: "14. Third-Party Services" },
  { id: "liability", title: "15. Limitation of Liability" },
  { id: "indemnification", title: "16. Indemnification" },
  { id: "termination", title: "17. Suspension & Termination" },
  { id: "regulatory", title: "18. Regulatory Compliance" },
  { id: "communications", title: "19. Electronic Communications" },
  { id: "privacy", title: "20. Data Privacy" },
  { id: "force-majeure", title: "21. Force Majeure" },
  { id: "disputes", title: "22. Dispute Resolution" },
  { id: "governing", title: "23. Governing Law" },
  { id: "changes", title: "24. Changes to These Terms" },
  { id: "contact", title: "25. Contact Us" },
]

export default function TermsPage() {
  return (
    <div className="container py-12 lg:py-16">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated:{" "}
          {EFFECTIVE_DATE}
        </p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          These Terms and Conditions ("Terms") govern your access to and use of
          LeadSage Africa ("LeadSage", "we", "our", or "us"), including our
          website, mobile applications, and all related services (collectively,
          the "Platform"). By accessing or using LeadSage, you confirm that you
          have read, understood, and agree to be bound by these Terms and our{" "}
          <Link
            href="/privacy"
            className="text-primary underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Table of contents — sticky on desktop */}
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-1">
            <p className="mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
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
          <section id="acceptance" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              1. Introduction &amp; Acceptance of Terms
            </h2>
            <p>
              These Terms form a legally binding agreement between you ("User",
              "you") and Leadsage Africa ("Leadsage", "we", "us", "our"), a
              technology company operating Nigeria's housing platform. By
              creating an account or using any part of our platform, you agree
              to be bound by these Terms.
            </p>
            <p>
              If you do not agree to these Terms, you must not use our platform.
              We reserve the right to update these Terms at any time. Continued
              use after changes constitutes acceptance.
            </p>
          </section>

          {/* 2 */}
          <section id="definitions" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              2. Definitions
            </h2>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">"User"</strong> means any
                person who accesses or uses the Platform.
              </li>
              <li>
                <strong className="text-foreground">"SageNest"</strong> refers
                to LeadSage's goal-based savings feature.
              </li>
              <li>
                <strong className="text-foreground">"Listings"</strong> refer to
                property or service postings on the Platform.
              </li>
              <li>
                <strong className="text-foreground">"Service Providers"</strong>{" "}
                include agents, landlords, artisans, and vendors on the
                Platform.
              </li>
              <li>
                <strong className="text-foreground">"Platform"</strong> means
                the Leadsage Africa website, mobile applications, and all
                related services.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section id="services" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              3. Nature of Services
            </h2>
            <p>Leadsage Africa provides:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">Property Listings</strong> —
                a digital marketplace for long-term rentals, shortlets, office
                spaces, and hotel rooms
              </li>
              <li>
                <strong className="text-foreground">
                  Applications & Screening
                </strong>{" "}
                — tenant screening, document submission, and rental applications
              </li>
              <li>
                <strong className="text-foreground">
                  Access to verified agents and artisans
                </strong>{" "}
                — connecting users with trusted service providers
              </li>
              <li>
                <strong className="text-foreground">Tour Requests</strong> —
                scheduling property viewings with landlords or agents
              </li>
              <li>
                <strong className="text-foreground">Leadsage Wallet</strong> — a
                digital wallet for funding, payments, and withdrawals
              </li>
              <li>
                <strong className="text-foreground">SageNest Savings</strong> —
                a financial planning and goal-based savings system
              </li>
              <li>
                <strong className="text-foreground">Escrow Payments</strong> —
                secure holding of rental and booking payments until release
                conditions are met
              </li>
            </ul>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 dark:border-yellow-900 dark:bg-yellow-950/30">
              <p className="font-medium text-foreground">Important:</p>
              <p className="mt-1">
                LeadSage is a facilitator only. We do{" "}
                <strong className="text-foreground">not</strong> own listed
                properties, act as a landlord, agent, or employer, or guarantee
                transactions between users.
              </p>
            </div>
          </section>

          {/* 4 */}
          <section id="accounts" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              4. User Accounts &amp; Eligibility
            </h2>
            <p>To use Leadsage, you must:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Be at least 18 years of age</li>
              <li>
                Be a Nigerian resident or legally eligible user with a valid
                Nigerian address
              </li>
              <li>
                Provide accurate, current, and complete registration information
              </li>
              <li>Have a valid bank account</li>
              <li>Verify your email address after registration</li>
              <li>
                Not create more than one account per person (duplicate accounts
                may be suspended)
              </li>
            </ul>
            <p>
              You are responsible for maintaining the confidentiality of your
              account credentials and for all activities under your account.
              Notify us immediately at{" "}
              <a
                href="mailto:support@leadsageafrica.com"
                className="text-primary underline underline-offset-4"
              >
                support@leadsageafrica.com
              </a>{" "}
              if you suspect unauthorised access. Leadsage is not liable for
              losses caused by compromised accounts.
            </p>
            <p>
              We reserve the right to deny or terminate access if these
              conditions are not met.
            </p>
          </section>

          {/* 5 */}
          <section id="kyc" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              5. KYC, AML &amp; Verification
            </h2>
            <p>
              To comply with Nigerian financial regulations and anti-money
              laundering (AML) requirements, you agree to provide:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Valid government-issued ID (NIN, BVN, passport, or driver's
                licence)
              </li>
              <li>Proof of address</li>
              <li>Additional documents when requested</li>
            </ul>
            <p>Leadsage may:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Verify your identity through authorised third-party partners
              </li>
              <li>Restrict accounts pending successful verification</li>
              <li>
                Report suspicious activities to relevant regulatory authorities
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section id="listings" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              6. Listings &amp; Property Rules
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
                Only properties you own, are authorised to list, or are duly
                appointed to manage may be submitted.
              </li>
              <li>
                All listings are subject to review and approval by the Leadsage
                moderation team. We reserve the right to reject or remove any
                listing.
              </li>
              <li>
                Photos must be genuine representations of the property. Stock
                images or deceptive photographs are not permitted.
              </li>
              <li>
                Pricing must be stated in Nigerian Naira (₦). Landlords may not
                solicit payments outside the Leadsage platform.
              </li>
              <li>
                Leadsage performs verification checks but does not guarantee
                listing authenticity and is not liable for disputes between
                users.
              </li>
              <li>
                Users must independently verify properties before making any
                payment.
              </li>
            </ul>
          </section>

          {/* 7 */}
          <section id="bookings" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              7. Rentals, Bookings &amp; Applications
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
              Renters may book shortlet properties for specified dates. Where a
              listing is marked "Instant Book", the booking is confirmed
              automatically upon payment. Otherwise, the landlord must confirm
              the booking within the specified window.
            </p>
            <p>
              <strong className="text-foreground">Cancellations:</strong>{" "}
              Cancellation policies are set by the landlord and displayed on the
              listing page. Leadsage is not liable for cancellations made by
              either party. Refunds for cancellations are subject to the
              applicable cancellation policy and our escrow release terms.
            </p>
          </section>

          {/* 8 */}
          <section id="payments" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              8. Payments, Escrow &amp; Refunds
            </h2>
            <p>
              All payments for rentals and bookings made through the Leadsage
              platform are processed via our integrated payment providers
              (Paystack for card payments, Anchor BaaS for wallet transfers).
            </p>
            <p>
              <strong className="text-foreground">Escrow:</strong> Rental and
              booking payments are held in escrow for a defined period after the
              transaction (typically 24 hours after payment for rentals, or 24
              hours after check-in for shortlets). Funds are only released to
              the landlord after the hold period lapses without a valid dispute.
            </p>
            <p>
              <strong className="text-foreground">Refunds:</strong> Refunds are
              processed in accordance with the applicable cancellation policy.
              Card payment refunds are returned to the original payment method.
              Wallet payment refunds are credited to the payer's Leadsage
              wallet.
            </p>
            <p>
              Leadsage does not guarantee the quality, safety, or legality of
              any property. We are a payment facilitator, not a guarantor of any
              transaction.
            </p>
          </section>

          {/* 9 */}
          <section id="sagenest" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              9. SageNest Savings
            </h2>
            <p>
              SageNest is a goal-based savings product offered through the
              Leadsage platform, powered by our banking-as-a-service partner
              (Anchor). By using SageNest:
            </p>

            <p className="font-medium text-foreground">9.1 Nature of Funds</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Funds saved are held with licensed financial partners in a
                dedicated account on your behalf.
              </li>
              <li>
                Funds may be pooled and invested in low-risk instruments in
                accordance with applicable regulations.
              </li>
            </ul>

            <p className="font-medium text-foreground">9.2 Withdrawals</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Withdrawal of locked savings before the maturity date may be
                subject to applicable charges or penalties as stated at the time
                of plan creation.
              </li>
              <li>
                Withdrawals are subject to liquidity availability, product
                terms, and processing timelines.
              </li>
            </ul>

            <p className="font-medium text-foreground">9.3 Risk Disclosure</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Returns or interest, where offered, are not guaranteed and are
                subject to change.
              </li>
              <li>Market conditions may affect earnings.</li>
              <li>
                Temporary delays may occur due to system or partner constraints.
              </li>
              <li>
                SageNest is a savings product, not an investment scheme. Your
                principal is not at risk from market movements.
              </li>
            </ul>
          </section>

          {/* 10 */}
          <section id="wallet" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              10. Wallet &amp; Financial Services
            </h2>
            <p>
              The Leadsage Wallet is a digital payment wallet powered by Anchor
              BaaS. To activate your wallet and access full functionality, you
              must complete our KYC process, which requires:
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
              responsible for keeping your PIN confidential. Leadsage will never
              ask for your PIN by phone, email, or any other channel.
            </p>
            <p>
              Wallet funds are not NDIC-insured. Leadsage holds your wallet
              balance in a pooled account with our licensed BaaS partner.
              Withdrawals are subject to network availability and may take up to
              one business day to reflect in your bank account.
            </p>
          </section>

          {/* 11 */}
          <section id="fees" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              11. Fees &amp; Commission
            </h2>
            <p>
              Leadsage charges a platform service fee of{" "}
              <strong className="text-foreground">5%</strong> on all rental and
              booking payments processed through the platform. This fee is
              deducted from the amount disbursed to the landlord upon escrow
              release.
            </p>
            <p>
              Leadsage may also charge listing fees, transaction commissions,
              and premium subscription fees. All fees will be clearly
              communicated at the point of use.
            </p>
            <p>
              All fees are inclusive of applicable VAT as required by Nigerian
              tax law. Leadsage reserves the right to revise its fee structure
              with reasonable notice.
            </p>
          </section>

          {/* 12 */}
          <section id="prohibited" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              12. Prohibited Activities
            </h2>
            <p>You may not use Leadsage to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Engage in fraud, misrepresentation, or post fraudulent,
                misleading, or non-existent listings
              </li>
              <li>
                Solicit or accept payments for rentals or bookings outside the
                Leadsage platform
              </li>
              <li>
                Conduct illegal transactions or use the platform to launder
                money or finance criminal activity
              </li>
              <li>
                Circumvent platform fees or impersonate any person or Leadsage
                representative
              </li>
              <li>
                Interfere with platform security or attempt to scrape,
                reverse-engineer, or exploit the platform or its data
              </li>
              <li>
                Harass, threaten, or discriminate against other users on the
                basis of gender, ethnicity, religion, or any other protected
                characteristic
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
              Violations may result in immediate account suspension, permanent
              banning, fund restriction, or legal action without refund.
            </p>
          </section>

          {/* 13 */}
          <section id="ip" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              13. Intellectual Property
            </h2>
            <p>
              All platform content including logos, software, and design belongs
              to Leadsage Africa or its licensors. You may not copy, reproduce,
              distribute, or create derivative works without our prior written
              consent, or use the brand for unauthorised purposes.
            </p>
            <p>
              By uploading content (photos, documents, listing descriptions) to
              Leadsage, you grant us a non-exclusive, royalty-free, worldwide
              licence to use, display, and distribute that content solely for
              operating and promoting our services.
            </p>
          </section>

          {/* 14 */}
          <section id="third-party" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              14. Third-Party Services
            </h2>
            <p>
              Leadsage integrates third-party services including payment
              processors, identity verification providers, and cloud
              infrastructure. We are not responsible for:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Failures, delays, or errors from third-party providers
                (Paystack, Anchor BaaS, Prembly, Mailjet, Cloudflare)
              </li>
              <li>External service disruptions beyond our control</li>
            </ul>
            <p>
              Use of third-party services is subject to their respective terms
              and privacy policies.
            </p>
          </section>

          {/* 15 */}
          <section id="liability" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              15. Limitation of Liability
            </h2>
            <p>
              The Leadsage platform is provided "as is" and "as available"
              without warranties of any kind, express or implied. To the fullest
              extent permitted by law, Leadsage is not liable for:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Property transaction losses or disputes between landlords and
                renters
              </li>
              <li>Fraud committed by third parties</li>
              <li>Financial losses from savings or investments via SageNest</li>
              <li>
                System downtime, payment delays, or third-party service failures
              </li>
              <li>Inaccurate property information provided by a landlord</li>
              <li>
                Unauthorised access to your account due to your negligence
              </li>
            </ul>
            <p>
              Use of the platform is at your own risk. To the maximum extent
              permitted by Nigerian law, our total liability to you shall not
              exceed the total fees paid by you to Leadsage in the 12 months
              preceding the claim.
            </p>
          </section>

          {/* 16 */}
          <section id="indemnification" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              16. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless Leadsage Africa
              and its officers, directors, employees, and agents from and
              against any claims, liabilities, damages, losses, and expenses
              (including legal fees) arising out of or in connection with:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Your access to or use of the Platform</li>
              <li>Your violation of these Terms</li>
              <li>Disputes with other users arising from your actions</li>
              <li>
                Any content you submit, post, or transmit through the Platform
              </li>
            </ul>
          </section>

          {/* 17 */}
          <section id="termination" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              17. Suspension &amp; Termination
            </h2>
            <p>
              We may suspend or terminate your account immediately, without
              prior notice, if:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Fraud or suspicious activity is detected</li>
              <li>You violate any provision of these Terms</li>
              <li>Required by law or a regulatory authority</li>
            </ul>
            <p>
              Funds may be restricted pending investigation. Termination does
              not relieve you of any obligations incurred prior to the
              termination date.
            </p>
            <p>
              You may close your account at any time by contacting us at{" "}
              <a
                href="mailto:support@leadsageafrica.com"
                className="text-primary underline underline-offset-4"
              >
                support@leadsageafrica.com
              </a>
              . Any outstanding wallet balance will be disbursed to a verified
              bank account before closure.
            </p>
          </section>

          {/* 18 */}
          <section id="regulatory" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              18. Regulatory Compliance
            </h2>
            <p>
              Leadsage operates in accordance with applicable Nigerian laws and
              regulations, including:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Nigerian financial regulations (CBN guidelines)</li>
              <li>
                Anti-money laundering (AML) and counter-terrorism financing laws
              </li>
              <li>Real estate regulatory standards</li>
              <li>Nigeria Data Protection Act 2023 (NDPA) and NDPR 2019</li>
            </ul>
            <p>
              Users agree to comply with all applicable laws and regulations in
              their use of the Platform.
            </p>
          </section>

          {/* 19 */}
          <section id="communications" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              19. Electronic Communications
            </h2>
            <p>
              By using the Leadsage platform, you consent to receive
              communications from us electronically, including:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Transactional and notification emails</li>
              <li>SMS notifications</li>
              <li>In-platform alerts and notices</li>
            </ul>
            <p>
              These electronic communications satisfy any legal requirement that
              such communications be in writing and are legally binding to the
              same extent as written communications.
            </p>
          </section>

          {/* 20 */}
          <section id="privacy" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              20. Data Privacy
            </h2>
            <p>
              Your use of the Platform is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-4"
              >
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference. We may
              share your data with financial partners, identity verification
              providers, and regulatory authorities as required by law or to
              deliver our services.
            </p>
          </section>

          {/* 21 */}
          <section id="force-majeure" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              21. Force Majeure
            </h2>
            <p>
              Leadsage is not liable for any failure or delay in performance
              caused by circumstances beyond our reasonable control, including:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Network or internet failures</li>
              <li>Government actions, sanctions, or regulatory orders</li>
              <li>Natural disasters or acts of God</li>
              <li>Banking system disruptions or partner outages</li>
              <li>Civil unrest or other extraordinary events</li>
            </ul>
          </section>

          {/* 22 */}
          <section id="disputes" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              22. Dispute Resolution
            </h2>
            <p>
              In the event of a dispute arising out of or in connection with
              these Terms or your use of the Platform, the parties agree to
              resolve the matter through the following process:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">Negotiation</strong> — both
                parties will first attempt to resolve the dispute informally
                within 30 days of written notice
              </li>
              <li>
                <strong className="text-foreground">Mediation</strong> — if
                negotiation fails, the parties will submit to mediation before a
                mutually agreed mediator
              </li>
              <li>
                <strong className="text-foreground">Arbitration</strong> — if
                mediation is unsuccessful, the dispute shall be referred to
                binding arbitration in Lagos, Nigeria, under applicable Nigerian
                arbitration rules. Arbitration decisions are final and binding.
              </li>
            </ul>
          </section>

          {/* 23 */}
          <section id="governing" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              23. Governing Law
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the
              laws of the Federal Republic of Nigeria. Any dispute not resolved
              through arbitration shall be subject to the exclusive jurisdiction
              of the courts of Lagos State, Nigeria.
            </p>
            <p>
              Where mandatory local consumer protection laws apply, those rights
              are not excluded by these Terms.
            </p>
          </section>

          {/* 24 */}
          <section id="changes" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              24. Changes to These Terms
            </h2>
            <p>
              We may update these Terms at any time. When we do, we will revise
              the "Last updated" date at the top of this page and, for material
              changes, notify you by email or via an in-app notification. Your
              continued use of the platform after the effective date of any
              changes constitutes acceptance of the updated Terms.
            </p>
          </section>

          {/* 25 */}
          <section id="contact" className="scroll-mt-8 space-y-3">
            <h2 className="text-base font-semibold text-foreground">
              25. Contact Us
            </h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <address className="space-y-1 not-italic">
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
              <p>
                Website:{" "}
                <a
                  href="https://www.leadsageafrica.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  www.leadsageafrica.com
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
