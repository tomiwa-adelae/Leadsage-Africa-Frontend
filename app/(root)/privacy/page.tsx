import { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Privacy Policy · Leadsage Africa",
  description:
    "Learn how Leadsage Africa collects, uses, and protects your personal data in accordance with the Nigeria Data Protection Regulation (NDPR).",
}

const EFFECTIVE_DATE = "21 April 2026"

const sections = [
  { id: "intro", title: "1. Introduction" },
  { id: "collect", title: "2. Information We Collect" },
  { id: "use", title: "3. How We Use Your Information" },
  { id: "sharing", title: "4. Information Sharing" },
  { id: "kyc", title: "5. KYC & Identity Verification" },
  { id: "financial", title: "6. Financial & Payment Data" },
  { id: "cookies", title: "7. Cookies & Tracking" },
  { id: "retention", title: "8. Data Retention" },
  { id: "rights", title: "9. Your Rights (NDPR)" },
  { id: "security", title: "10. Data Security" },
  { id: "third-party", title: "11. Third-Party Services" },
  { id: "children", title: "12. Children's Privacy" },
  { id: "changes", title: "13. Changes to This Policy" },
  { id: "contact", title: "14. Contact & DPO" },
]

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12 lg:py-16">
      {/* Header */}
      <div className="mb-10 space-y-2">
        <p className="text-sm font-medium text-primary">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground">
          Effective date: {EFFECTIVE_DATE} &nbsp;·&nbsp; Last updated:{" "}
          {EFFECTIVE_DATE}
        </p>
        <p className="mt-4 text-base text-muted-foreground leading-relaxed">
          At Leadsage Africa, we take your privacy seriously. This Policy
          explains what personal data we collect, why we collect it, how we
          use and protect it, and the rights you have under the Nigeria Data
          Protection Regulation (NDPR) 2019 and other applicable laws.
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
          <section id="intro" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              1. Introduction
            </h2>
            <p>
              This Privacy Policy applies to all products and services offered
              by Leadsage Africa ("Leadsage", "we", "us", "our"), including our
              website, mobile applications, Leadsage Wallet, FirstKey Savings,
              and related services.
            </p>
            <p>
              By registering for or using Leadsage, you acknowledge that you
              have read and understood this Privacy Policy and you consent to
              the collection and use of your personal data as described herein.
            </p>
            <p>
              This Policy is compliant with the{" "}
              <strong className="text-foreground">
                Nigeria Data Protection Regulation (NDPR) 2019
              </strong>{" "}
              and the Nigeria Data Protection Act (NDPA) 2023.
            </p>
          </section>

          {/* 2 */}
          <section id="collect" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              2. Information We Collect
            </h2>
            <p>
              We collect information you provide directly, information
              generated through your use of our platform, and information from
              third parties where permitted by law.
            </p>

            <p className="font-medium text-foreground">
              Information you provide:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">Identity data</strong> —
                first name, last name, username, email address, phone number,
                date of birth, gender, profile photo
              </li>
              <li>
                <strong className="text-foreground">Address data</strong> —
                country, state, city, and street address
              </li>
              <li>
                <strong className="text-foreground">
                  Identity verification data
                </strong>{" "}
                — Bank Verification Number (BVN), National Identification
                Number (NIN) for landlord onboarding
              </li>
              <li>
                <strong className="text-foreground">
                  Financial & payment data
                </strong>{" "}
                — bank account details (for withdrawals), wallet transaction
                history
              </li>
              <li>
                <strong className="text-foreground">Rental preferences</strong>{" "}
                — property types, budget range, preferred areas, move-in
                timeline (for renters)
              </li>
              <li>
                <strong className="text-foreground">Property data</strong> —
                listing details, photos, pricing, and availability (for
                landlords)
              </li>
              <li>
                <strong className="text-foreground">
                  Communications
                </strong>{" "}
                — messages sent to our support team and feedback you provide
              </li>
            </ul>

            <p className="font-medium text-foreground">
              Information collected automatically:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Device and browser information (IP address, browser type,
                operating system)
              </li>
              <li>
                Usage data (pages viewed, features used, search queries,
                click-through data)
              </li>
              <li>
                Authentication tokens and session cookies
              </li>
              <li>
                Geolocation data (city/region level, if you permit it)
              </li>
            </ul>

            <p className="font-medium text-foreground">
              Information from third parties:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Google account data when you sign in with Google (name, email,
                profile photo)
              </li>
              <li>
                BVN verification results from our identity verification
                partner (Prembly)
              </li>
              <li>
                Payment confirmation data from Paystack and Anchor BaaS
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section id="use" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              3. How We Use Your Information
            </h2>
            <p>We use your personal data for the following purposes:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Account management</strong>{" "}
                — creating and maintaining your account, verifying your email
                address, and authenticating your identity
              </li>
              <li>
                <strong className="text-foreground">Service delivery</strong>{" "}
                — enabling property searches, applications, bookings, rent
                payments, and wallet transactions
              </li>
              <li>
                <strong className="text-foreground">
                  KYC & fraud prevention
                </strong>{" "}
                — verifying your identity to comply with financial regulations
                and to detect and prevent fraud, money laundering, and
                unauthorised access
              </li>
              <li>
                <strong className="text-foreground">Communications</strong>{" "}
                — sending transactional emails (booking confirmations, payment
                receipts, OTP codes), service updates, and, where you have
                opted in, marketing messages
              </li>
              <li>
                <strong className="text-foreground">Platform improvement</strong>{" "}
                — analysing usage patterns to improve our features, fix bugs,
                and personalise your experience
              </li>
              <li>
                <strong className="text-foreground">Legal compliance</strong>{" "}
                — meeting our obligations under Nigerian law, including tax
                reporting and responding to lawful requests from authorities
              </li>
            </ul>

            <p>
              We process your data on the following legal bases (NDPR Article
              2.2):
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-foreground">Consent</strong> — where
                you have expressly agreed (e.g. marketing emails, geolocation)
              </li>
              <li>
                <strong className="text-foreground">Contract performance</strong>{" "}
                — to fulfil our obligations to you as a user of our platform
              </li>
              <li>
                <strong className="text-foreground">Legal obligation</strong>{" "}
                — KYC/AML compliance, tax reporting, and lawful orders
              </li>
              <li>
                <strong className="text-foreground">Legitimate interests</strong>{" "}
                — fraud prevention, platform security, and business analytics
                (where these do not override your rights)
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section id="sharing" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              4. Information Sharing
            </h2>
            <p>
              We do not sell your personal data. We share your information
              only in the following circumstances:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">
                  Between renters and landlords
                </strong>{" "}
                — when you submit a rental application or booking, relevant
                profile information is shared with the property owner to
                facilitate the transaction
              </li>
              <li>
                <strong className="text-foreground">Service providers</strong>{" "}
                — trusted third parties who process data on our behalf
                (payment processors, cloud storage, email delivery, identity
                verification). They are bound by data processing agreements
                and may not use your data for their own purposes.
              </li>
              <li>
                <strong className="text-foreground">Legal requirements</strong>{" "}
                — we may disclose your data where required by law, regulation,
                court order, or to protect the rights and safety of Leadsage,
                our users, or the public
              </li>
              <li>
                <strong className="text-foreground">
                  Business transfers
                </strong>{" "}
                — in the event of a merger, acquisition, or asset sale, your
                data may be transferred as part of that transaction. You will
                be notified of any change in ownership.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section id="kyc" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              5. KYC & Identity Verification
            </h2>
            <p>
              To comply with Nigerian financial regulations and to prevent
              fraud, we are required to verify the identity of users who
              access financial features (wallet, savings, withdrawals).
            </p>
            <p>
              <strong className="text-foreground">
                Bank Verification Number (BVN):
              </strong>{" "}
              Your BVN is submitted to our KYC partner (Prembly / Anchor) for
              verification. We do not store your raw BVN in plain text. The
              BVN is used solely for identity matching and is not shared for
              any commercial purpose.
            </p>
            <p>
              <strong className="text-foreground">
                National Identification Number (NIN):
              </strong>{" "}
              Landlords are required to provide their NIN during onboarding
              for identity verification. NIN data is submitted to our
              verification partner and is handled under strict confidentiality.
            </p>
            <p>
              Both BVN and NIN data are encrypted at rest and in transit. We
              retain only the verification status and a masked reference, not
              the full numbers, after verification is complete.
            </p>
          </section>

          {/* 6 */}
          <section id="financial" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              6. Financial & Payment Data
            </h2>
            <p>
              Card payment processing is handled entirely by{" "}
              <strong className="text-foreground">Paystack</strong>. Leadsage
              does not store your card number, CVV, or PIN. We only receive a
              payment reference and transaction status from Paystack.
            </p>
            <p>
              Wallet and bank transfer services are powered by{" "}
              <strong className="text-foreground">Anchor BaaS</strong>. Your
              virtual account number and wallet balance are managed by Anchor
              under their own regulatory framework. Leadsage mirrors your
              balance for display purposes.
            </p>
            <p>
              Your 4-digit wallet transaction PIN is stored as a bcrypt hash.
              We cannot retrieve or view your PIN. If you forget your PIN,
              you must reset it using a verified OTP sent to your registered
              email.
            </p>
            <p>
              Bank account details you provide for withdrawals are used solely
              to process the requested transfer and are not retained beyond
              what is necessary for that purpose and applicable record-keeping
              requirements.
            </p>
          </section>

          {/* 7 */}
          <section id="cookies" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              7. Cookies & Tracking
            </h2>
            <p>We use the following types of cookies and similar technologies:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">
                  Strictly necessary cookies
                </strong>{" "}
                — required for authentication (access token, refresh token)
                and session management. These cannot be disabled.
              </li>
              <li>
                <strong className="text-foreground">
                  Functional cookies
                </strong>{" "}
                — remember your preferences (e.g. dark mode, saved filters).
              </li>
              <li>
                <strong className="text-foreground">
                  Analytics cookies
                </strong>{" "}
                — help us understand how you use our platform so we can
                improve it. These may be disabled without affecting core
                functionality.
              </li>
            </ul>
            <p>
              Authentication tokens are stored in{" "}
              <strong className="text-foreground">
                httpOnly, secure cookies
              </strong>{" "}
              — they are not accessible to JavaScript, reducing XSS risk. We
              do not use third-party advertising cookies.
            </p>
          </section>

          {/* 8 */}
          <section id="retention" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              8. Data Retention
            </h2>
            <p>
              We retain your personal data for as long as your account is
              active or as necessary to provide you with our services. When
              you close your account, we will:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Delete or anonymise personal data that is no longer required
                within 90 days
              </li>
              <li>
                Retain transaction records, KYC data, and financial logs for a
                minimum of{" "}
                <strong className="text-foreground">7 years</strong> as
                required by Nigerian financial regulations (CBN, FIRS)
              </li>
              <li>
                Retain data subject to an active legal dispute or regulatory
                inquiry for the duration of that matter
              </li>
            </ul>
            <p>
              Anonymised and aggregated data (e.g. usage statistics) may be
              retained indefinitely as it can no longer identify you.
            </p>
          </section>

          {/* 9 */}
          <section id="rights" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              9. Your Rights (NDPR)
            </h2>
            <p>
              Under the Nigeria Data Protection Regulation, you have the
              following rights regarding your personal data:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Right of access</strong>{" "}
                — request a copy of the personal data we hold about you
              </li>
              <li>
                <strong className="text-foreground">
                  Right to rectification
                </strong>{" "}
                — update or correct inaccurate data via your account settings
                or by contacting us
              </li>
              <li>
                <strong className="text-foreground">
                  Right to erasure
                </strong>{" "}
                — request deletion of your personal data, subject to legal
                retention requirements
              </li>
              <li>
                <strong className="text-foreground">
                  Right to data portability
                </strong>{" "}
                — receive your data in a structured, machine-readable format
              </li>
              <li>
                <strong className="text-foreground">
                  Right to object
                </strong>{" "}
                — object to the processing of your data for direct marketing
                or where we rely on legitimate interests
              </li>
              <li>
                <strong className="text-foreground">
                  Right to withdraw consent
                </strong>{" "}
                — where processing is based on your consent, you may withdraw
                it at any time without affecting prior processing
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at{" "}
              <a
                href="mailto:privacy@leadsageafrica.com"
                className="text-primary underline underline-offset-4"
              >
                privacy@leadsageafrica.com
              </a>
              . We will respond within{" "}
              <strong className="text-foreground">30 days</strong> in
              accordance with the NDPR.
            </p>
            <p>
              You also have the right to lodge a complaint with the Nigeria
              Data Protection Commission (NDPC) if you believe your rights
              have been violated.
            </p>
          </section>

          {/* 10 */}
          <section id="security" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              10. Data Security
            </h2>
            <p>
              We implement industry-standard technical and organisational
              measures to protect your personal data, including:
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                TLS/HTTPS encryption for all data in transit
              </li>
              <li>
                bcrypt hashing for passwords, OTPs, and transaction PINs
              </li>
              <li>
                httpOnly, secure cookies for authentication tokens
              </li>
              <li>
                JWT-based access token rotation (15-minute expiry) with
                refresh token reuse detection
              </li>
              <li>
                Cloudflare Turnstile CAPTCHA to prevent automated attacks
              </li>
              <li>
                Role-based access controls limiting internal data access
                to authorised personnel only
              </li>
              <li>
                Encrypted storage for sensitive identity data (BVN references,
                NIN status)
              </li>
            </ul>
            <p>
              Despite these measures, no system is 100% secure. In the event
              of a data breach that affects your rights, we will notify you and
              the NDPC within{" "}
              <strong className="text-foreground">72 hours</strong> of becoming
              aware of the incident.
            </p>
          </section>

          {/* 11 */}
          <section id="third-party" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              11. Third-Party Services
            </h2>
            <p>
              Leadsage integrates with the following third-party services that
              may process your data:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Paystack</strong> — card
                payment processing. Subject to Paystack's{" "}
                <a
                  href="https://paystack.com/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  Privacy Policy
                </a>
                .
              </li>
              <li>
                <strong className="text-foreground">Anchor BaaS</strong> —
                virtual accounts, wallet infrastructure, and NIP transfers.
                Anchor is a licensed financial technology provider regulated
                by the CBN.
              </li>
              <li>
                <strong className="text-foreground">Prembly (IdentityPass)</strong>{" "}
                — BVN and NIN verification services.
              </li>
              <li>
                <strong className="text-foreground">Mailjet</strong> — email
                delivery for transactional and notification emails.
              </li>
              <li>
                <strong className="text-foreground">
                  Cloudflare (R2 & Turnstile)
                </strong>{" "}
                — media file storage and bot protection.
              </li>
              <li>
                <strong className="text-foreground">Google (OAuth)</strong> —
                optional Google sign-in. Subject to Google's Privacy Policy.
              </li>
            </ul>
            <p>
              All third-party processors are selected for their compliance
              with applicable data protection laws and are bound by data
              processing agreements where required.
            </p>
          </section>

          {/* 12 */}
          <section id="children" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              12. Children's Privacy
            </h2>
            <p>
              Leadsage is intended for users who are 18 years of age or older.
              We do not knowingly collect personal data from individuals under
              18. If we become aware that a minor has provided us with personal
              data, we will delete it promptly. If you believe a minor has
              registered on our platform, please contact us immediately.
            </p>
          </section>

          {/* 13 */}
          <section id="changes" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              13. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. We will notify
              you of significant changes by email or through a prominent notice
              on our platform before the change becomes effective. The "Last
              updated" date at the top of this page will always reflect the
              most recent revision.
            </p>
            <p>
              We encourage you to review this Policy regularly to stay informed
              about how we protect your information.
            </p>
          </section>

          {/* 14 */}
          <section id="contact" className="space-y-3 scroll-mt-8">
            <h2 className="text-base font-semibold text-foreground">
              14. Contact & Data Protection Officer
            </h2>
            <p>
              If you have questions, concerns, or wish to exercise your data
              rights, please contact us:
            </p>
            <address className="not-italic space-y-1">
              <p className="font-medium text-foreground">Leadsage Africa</p>
              <p>
                Privacy inquiries:{" "}
                <a
                  href="mailto:privacy@leadsageafrica.com"
                  className="text-primary underline underline-offset-4"
                >
                  privacy@leadsageafrica.com
                </a>
              </p>
              <p>
                General support:{" "}
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
                href="/terms"
                className="text-primary underline underline-offset-4"
              >
                Terms of Service
              </Link>{" "}
              for the full rules governing your use of the Leadsage platform.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
