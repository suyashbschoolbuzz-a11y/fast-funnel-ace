# Reorder the Funnel and Add Cashfree Checkout

## Page updates
- Move “A marketing desk in your WhatsApp” directly below the opening section, then place “Testimonials from the work” beneath it.
- Replace the opening video with a relatable image showing a creator or small-business owner using WhatsApp for daily marketing guidance.
- Replace the repeated audience crop and current supporting photos with distinct, relevant images for coaches, doctors, education brands, food/luxury brands, and the mentor section.
- Keep the current dark neon reference-inspired visual direction, mobile sticky action bar, existing sales sections, and tracking parameters.

## Offer and copy
- Change the offer everywhere from ₹100 monthly checkout to a one-time ₹300 payment for three months of access.
- Explain the value as ₹100 per month, billed once as ₹300 for three months.
- Update buttons, price cards, urgency text, FAQs, onboarding steps, checkout summary, and footer bar so pricing is consistent.

## Cashfree payment flow
- Use Cashfree’s live hosted checkout rather than collecting card or UPI details inside the page.
- Clicking a buy button scrolls to a form requesting full name, email, and 10-digit WhatsApp number.
- After validated details are submitted, securely create a ₹300 Cashfree order on the server and open Cashfree checkout.
- On return, verify the order with Cashfree on the server. Only a verified successful payment can show the payment-complete popup and WhatsApp group link.
- Save each order and its payment status in Lovable Cloud so access can be verified and duplicate callbacks handled safely.
- Add a signed Cashfree webhook endpoint as a second source of payment confirmation.
- Preserve UTM and `fbclid` fields with the order for campaign attribution.

## Security and access
- Keep Cashfree App ID, Secret Key, and webhook secret in secure project secrets; they will never be exposed in the page or committed to source.
- Validate all customer and Cashfree payloads server-side, use fixed server-controlled pricing, and never trust a success value returned only by the browser.
- Store the private WhatsApp group URL as a secure project secret and reveal it only after confirmed payment.

## Verification
- Test form validation, live-checkout launch behavior without exposing credentials, cancelled/failed returns, successful verification, popup access, webhook signature rejection, and duplicate events.
- Check desktop and mobile layouts, section order, images, pricing consistency, page errors, and production build health.
