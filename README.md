# YAARANA — E-Commerce Website

Next.js 14 (App Router) + Supabase frontend for the YAARANA SRS.

## Setup

1. `npm install`
2. `cp .env.local.example .env.local` — it's pre-filled with your live Supabase project URL and
   anon key (project ref `jtgfatcqlazlysbytmqt`, this key is safe to expose client-side; RLS
   protects the data). Swap it out if you rotate keys later.
3. `npm run dev` → http://localhost:3000

## Creating your first admin account

The database has no admin yet. To make one:
1. Sign up normally through `/sign-up` (or `/admin/login` won't let you in yet — that's expected).
2. In the Supabase dashboard → Table Editor → `profiles`, find your row and change `role` from
   `customer` to `admin`.
3. Sign in at `/admin/login` with that account.

## Structure

- `app/(site)/...` — customer-facing pages (mobile-first, max-width 480px shell)
- `app/admin/...` — admin panel (desktop sidebar, protected by middleware + RLS)
- `app/page.tsx` — splash screen
- `lib/supabase/` — browser/server/middleware Supabase clients
- `lib/context/` — cart (localStorage-backed) and auth React contexts
- `components/` — shared UI (ProductCard, BottomNav, TopBar, Button, etc.)

## Payment gateways (JazzCash + EasyPaisa)

Checkout now redirects customers to a real hosted-checkout page for JazzCash or EasyPaisa,
and a server-side callback route verifies the result and marks the order paid/failed.

**Important — read before going live:**
- This was built against each gateway's publicly documented hosted-checkout / page-redirection
  pattern, but **was not tested against a live sandbox** (this dev environment has no network
  access). Test thoroughly in each gateway's sandbox before accepting real payments.
- You need your own merchant accounts:
  - JazzCash: apply for their Online Payment Gateway, you'll receive a Merchant ID, Password,
    and Integrity Salt.
  - EasyPaisa: register at easypay.easypaisa.com.pk, you'll receive a Store ID and Hash Key.
- Fill those into `.env.local` (see `.env.local.example`) along with a `SUPABASE_SERVICE_ROLE_KEY`
  (Supabase Dashboard → Settings → API). The service-role key is only used server-side in the two
  `/api/payments/*/callback` routes, which bypass RLS after independently verifying the gateway's
  signed hash — never expose it to the browser or commit it.
- Both gateways' exact field names/response codes can change between API versions. Before
  launch, cross-check `lib/payments/jazzcash.ts` and `lib/payments/easypaisa.ts` against the
  current integration guide from your merchant dashboard, particularly:
  - the hash algorithm and field ordering (`computeJazzCashHash` / `computeEasyPaisaHash`)
  - the success response code you're checking (`pp_ResponseCode === "000"` / `responseCode === "0000"`)
- Callback URLs to register with each gateway (once deployed):
  - JazzCash return URL: `https://yourdomain.com/api/payments/jazzcash/callback`
  - EasyPaisa postback URL: `https://yourdomain.com/api/payments/easypaisa/callback`

## Design refresh (v2)

- **Theme**: switched from black-dominant to a warm white/ivory canvas (`#FCFAF3`) with a
  deepened antique gold accent (`#96691F`) — chosen darker than a typical "brass gold" so it
  still reads clearly as text/icons against a light background (contrast matters more on white
  than it did on black).
- **Typography**: swapped Fraunces/Plus Jakarta Sans for **Bodoni Moda** (headlines/wordmark) +
  **Inter** (UI/body). Bodoni is the high-contrast serif long associated with Vogue-style fashion
  editorial; Inter is the clean grotesk used across Stripe, Linear, Notion, etc. — a deliberately
  "premium fashion meets premium software" pairing.
- **Scroll animations**: added `framer-motion` and a `<Reveal>` component — sections and product
  grids fade/slide into view as you scroll (staggered on grids). Respects
  `prefers-reduced-motion`.
- **Add to cart**: adding an item now opens a slide-over cart drawer (`components/CartDrawer.tsx`)
  with a brief "Added to your cart" confirmation, rather than navigating away from the product
  page — matches the pattern most premium stores use. The full `/cart` page still exists (linked
  from the drawer and the top bar's cart icon) for the complete review-and-promo-code experience.

## Splash screen loader

Replaced the thin progress bar with an animated hourglass (adapted from a Uiverse.io CSS loader,
recolored to the gold/bone palette) — pure CSS, no extra dependencies. Splash duration was bumped
from 1.8s to 2.6s so the 2-second hourglass cycle has room to complete once before redirecting.

## Hero banners (home page)

The home page hero is now a full image/video slideshow, managed entirely from **Admin → Banners**:
- Add one banner for a static hero, or two or more for an auto-advancing slideshow (5s per slide,
  crossfade, tappable dot indicators).
- Each banner can be an **image** or a **video** (`media_type` column on `banners`) — videos
  autoplay muted/looped/inline, which is required for autoplay to work on mobile browsers.
- Optional per-banner link URL (e.g. `/shop?category=hoodies`) makes the whole banner tappable.
- Reordering, activate/deactivate, and delete all work the same way the category manager does.
- Banner media uses a plain `<img>`/`<video>` tag rather than `next/image`, since video needs a
  real `<video>` element anyway and this keeps both media types on one code path.

## Notes / assumptions made

- **Currency**: prices are formatted as PKR (`formatPrice` in `lib/utils.ts`) — change the
  `currency` field there if you're pricing in a different currency.
- **Cart**: currently stored in `localStorage`, not synced to the `cart_items` table. This keeps
  guest browsing simple; wiring persistent server-side carts for logged-in users is a natural next
  step if you want cross-device cart sync.
- **Order updates**: only admins can change order status (matches BR list); there's no customer
  self-cancel flow yet — customers are pointed to Customer Care instead.
- **Images**: product/category images are plain URLs (`image_url` field) — for real uploads you'll
  want to wire up Supabase Storage and swap the URL inputs for a file picker.
- **Payments**: JazzCash and EasyPaisa hosted checkout are now wired up (see the Payment Gateways
  section above) — this goes beyond the original SRS, which listed online payment as a Future
  Enhancement. Orders are created as `pending` / `awaiting_payment` and flip to `confirmed` / `paid`
  once the gateway's callback confirms payment.

## Still to build (natural next steps)

- Admin: product variant (size/color) management UI
- Supabase Storage-backed image/video uploads (banners/products currently take pasted URLs)
- Guest checkout (currently requires sign-in, per SRS §31 BR-01)
