# Upgrade reviews, conversion motion, and add a secure admin area

## What will change

### Landing page
- Add distinct, relatable Indian customer portraits to the five review cards while keeping the reviews clearly marked as placeholders until genuine client quotes/screenshots are provided.
- Improve the review layout with stronger profile framing, ratings, result labels, and better mobile scrolling.
- Add restrained conversion-focused motion: section reveal, staggered review cards, subtle CTA sheen/pulse, progress animation, and image hover movement.
- Respect reduced-motion settings and avoid animation that delays reading or checkout.
- Read the current offer price and duration from saved settings so every headline, CTA, price block, FAQ, checkout button, and payment order stays consistent.

### Admin page at `/admin`
- Add a private sign-in screen using the supplied ID and password, checked only on the server.
- Store the admin session in a signed, secure, HTTP-only cookie; never expose credentials or admin state in browser storage.
- Add editable controls for:
  - One-time checkout price
  - Access duration in months
  - Private WhatsApp group link
- Add a payment summary with total, paid, and pending counts plus collected revenue.
- Add a searchable payment list showing customer, contact details, amount, status, date, payment time, and access expiry.
- Add refresh and sign-out controls, clear saving/loading/error states, and responsive mobile/desktop layouts.

### Payment and data safety
- Add a private settings record in Lovable Cloud; only server-side admin/payment code can access it.
- Remove the current fixed ₹300 database restriction so future admin price changes can be recorded safely.
- Cashfree order creation will always load the active price from the server; the browser cannot choose or override the amount.
- Successful payment verification and webhooks will use the saved access duration and current group link.
- Protect every admin read/write with the signed session and same-origin checks for changes.
- Keep Cashfree credentials and the admin password server-only. The supplied password is weak, so it should be changed before public launch.

## Validation
- Confirm admin login rejects incorrect details and survives refresh without exposing credentials.
- Confirm settings changes immediately update the funnel and the server-created Cashfree amount.
- Confirm paid/pending summaries match stored orders and no admin data is publicly readable.
- Verify landing page motion, review images, checkout, `/admin`, mobile layout, desktop layout, runtime errors, and build health.
- Do not make a live Cashfree charge during testing.
