# ₹3 Community Access Funnel

## Goal
Build a single-page, mobile-first creator coaching funnel that drives visitors from proof and curriculum through scarcity to a validated registration form, with no navigation distractions.

## Experience
- Replace the starter screen with a polished warm white, black, orange-red landing page using bold sans-serif type, compact rounded cards, soft shadows, and strong CTA contrast.
- Create the full conversion flow: hero, animated proof stats, testimonial screenshots, curriculum, audience fit, value stack, mentor story, featured logos, scarcity, onboarding steps, FAQ, and checkout form.
- Add a persistent mobile purchase bar showing the struck-through original price, ₹3 offer, seats left, and a CTA that scrolls to checkout.
- Use generated, cohesive creator-workshop imagery for the mentor and audience sections, plus realistic designed chat/review cards without copying real private conversations.

## Interactions and Validation
- Animate count-up statistics when they enter view, while respecting reduced-motion preferences.
- Build accessible expandable curriculum and FAQ sections.
- Connect every CTA to the registration section.
- Validate full name, email, a 10-digit Indian WhatsApp number, and terms acceptance; show a clear success state after valid submission.
- Preserve UTM parameters and `fbclid` in the page URL and carry them into the registration payload during the current visit.
- Add clearly marked placeholder snippets for Meta Pixel and Google Tag Manager without activating external tracking.

## Technical Details
- Keep the experience frontend-only; form submission will demonstrate successful registration but will not charge ₹3 or store leads because payments and persistence were not requested.
- Implement reusable local section, CTA, accordion, counter, and form elements in the home route, using the existing icon and form libraries where appropriate.
- Define the full semantic color/type system in the global stylesheet and add route-specific metadata.
- Load any selected web font through the document head, not CSS imports.
- Verify the page at mobile and desktop widths, including sticky bar behavior, form validation, accordions, horizontal testimonial scrolling, and no overflow.

## Acceptance Checks
- All requested sections appear in a clear conversion sequence with repeated CTAs.
- Mobile layout remains readable and tappable; desktop layout uses the available width without oversized empty areas.
- WhatsApp validation accepts exactly 10 digits and rejects invalid input.
- The page has one H1, suitable title/description/social metadata, and descriptive image text.
- The preview builds without errors and key interactions work in-browser.
