# Project Overview

Build a **separate internal Admin Portal** for **Workshop.DevTrackAcademy**.

This is its own Next.js project, its own repository, and its own deployment. It is the back-office the team uses to run the platform — it is **not** the student-facing site.

Both apps share **one Supabase project and one Postgres database**. The public site already exists; this portal manages the same data behind it.

Through this portal an authenticated **admin** can:

* Create, edit, publish, and delete **workshops**
* Manage **batches** of each workshop (each run has its own price, seats, dates, sessions)
* Edit the **sessions** inside each batch (timings, topics, assignments, resources)
* View **registered students** for every workshop and batch
* Record **payments** and generate **Razorpay payment links**
* See a **dashboard overview** with counts and revenue

The portal must look and feel like the same product as the public site: bold **Neo Brutalism**, cream background, thick navy borders, hard offset shadows, huge display type.

---

# Tech Stack

Use:

* Next.js 16 (App Router, Turbopack)
* React 19
* TypeScript
* TailwindCSS v4
* @supabase/ssr
* @supabase/supabase-js
* Supabase Auth
* React Hook Form
* Zod Validation
* Razorpay (server-side only)
* Zustand
* Framer Motion
* Lucide Icons
* clsx

Do **not** add a component library (no shadcn / MUI / Chakra). All UI is hand-built with the Neo components below.

App Router note: this Next version differs from older training data. `params` is a `Promise` (await it) and `cookies()` from `next/headers` is async (await it). Read `node_modules/next/dist/docs/` before using an API you are unsure about.

---

# Design Language

Use **Modern Neo Brutalism**, identical to the existing public site.

Characteristics

* Thick borders (2–4px), always deep navy `#1B1F3B`
* Large rounded corners (24px)
* Hard offset drop-shadows (no soft blur), e.g. `4px 4px 0 0 #1B1F3B`
* Flat colors
* Huge, black-weight display typography
* Bordered "chip" labels above headings
* Buttons and inputs that translate 2px and grow their shadow on hover, press in on active
* Playful but data-dense layouts
* Cream `#FFF8F0` background with a subtle grid pattern

Everything should look premium and handcrafted.

Never corporate. Never generic dashboard-template.

---

# Color Palette

Primary Orange

```
#FF6B35
```

Deep Navy

```
#1B1F3B
```

Background

```
#FFF8F0
```

Mint

```
#6EE7B7
```

Sky

```
#4EA8FF
```

Coral

```
#FF5C7A
```

Yellow

```
#FFD54F
```

Text

```
#1B1F3B
```

White

```
#FFFFFF
```

Success

```
#34D399
```

Warning

```
#F59E0B
```

---

# Typography

Headings

Space Grotesk

Body

Inter

Signature (certificates)

Alex Brush

Page Title

40px+

Section Titles

28px

Card Titles

20px

Body

14–16px

Load the three fonts with `next/font/google` in `app/layout.tsx`, exposing the CSS vars `--font-space-grotesk`, `--font-inter`, `--font-dancing-script`.

---

# Theme Setup

Recreate `app/globals.css` exactly (TailwindCSS v4 `@theme`):

```css
@import "tailwindcss";

@theme {
  --color-primary-orange: #FF6B35;
  --color-deep-navy: #1B1F3B;
  --color-bg-cream: #FFF8F0;
  --color-mint: #6EE7B7;
  --color-sky: #4EA8FF;
  --color-coral: #FF5C7A;
  --color-yellow: #FFD54F;
  --color-text-navy: #1B1F3B;
  --color-success: #34D399;
  --color-warning: #F59E0B;

  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-display: var(--font-space-grotesk), ui-sans-serif, system-ui, sans-serif;
  --font-signature: var(--font-dancing-script), cursive;

  --shadow-neo: 4px 4px 0px 0px #1B1F3B;
  --shadow-neo-lg: 8px 8px 0px 0px #1B1F3B;
  --shadow-neo-orange: 4px 4px 0px 0px #FF6B35;
  --shadow-neo-mint: 4px 4px 0px 0px #6EE7B7;
  --shadow-neo-inset: inset 2px 2px 0px 0px #1B1F3B;

  --radius-neo: 24px;
}

:root { --background: #FFF8F0; --foreground: #1B1F3B; }

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  overflow-x: hidden;
}

.bg-grid-pattern {
  background-size: 40px 40px;
  background-image:
    linear-gradient(to right, rgba(27,31,59,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(27,31,59,0.05) 1px, transparent 1px);
}
```

---

# Animations

Use Framer Motion for

* Fade Up
* Stagger on lists and cards
* Hover / Tap on buttons and cards
* Modal enter / exit
* Sidebar drawer slide on mobile

Micro interactions

Buttons

* shadow expansion on hover
* press-in on active

Cards

* lift
* shadow expansion

Toasts

* slide in / fade out

Keep motion subtle and fast — this is a working tool, not a marketing page. Respect `prefers-reduced-motion`.

---

# Admin Shell

Every page sits on `bg-bg-cream bg-grid-pattern` inside a persistent shell.

Sidebar

* Fixed left, `bg-deep-navy`, white text, thick right border
* Nav items: Dashboard, Workshops, Registrations, Payments, Instructors, Settings
* Active item highlighted with a yellow bordered chip
* Collapses to a slide-in drawer on mobile (mirror the public site's mobile Navbar)

Top bar

* White, `border-b-4 border-deep-navy`, `shadow-[0_4px_0_0_#1B1F3B]`
* Shows the admin's name and a Logout button

Headings

* `font-display font-black` in deep navy, tight leading
* Small bordered uppercase chip label above each heading
  (`border-2 border-deep-navy bg-yellow px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#1B1F3B]`)

Wide tables scroll inside an `overflow-x-auto` bordered box.

---

# Core Components

Build these first, in the Neo style, reused everywhere.

NeoButton

* Variants: orange, mint, sky, coral, yellow, white, navy
* Sizes: sm, md, lg, xl
* Uppercase `font-display`, `border-deep-navy`, hard offset shadow growing on hover, pressing in on active

```tsx
import React from 'react';
import clsx from 'clsx';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'orange' | 'mint' | 'sky' | 'coral' | 'yellow' | 'white' | 'navy';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children: React.ReactNode;
}

export const NeoButton: React.FC<NeoButtonProps> = ({
  variant = 'orange', size = 'md', className, children, ...props
}) => {
  const bgClasses = {
    orange: 'bg-primary-orange text-white hover:bg-[#ff7a4b]',
    mint: 'bg-mint text-deep-navy hover:bg-[#85f3c5]',
    sky: 'bg-sky text-deep-navy hover:bg-[#68b7ff]',
    coral: 'bg-coral text-white hover:bg-[#ff708c]',
    yellow: 'bg-yellow text-deep-navy hover:bg-[#ffe07d]',
    white: 'bg-white text-deep-navy hover:bg-bg-cream',
    navy: 'bg-deep-navy text-white hover:bg-[#2b315b]',
  };
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm font-bold rounded-lg border-2 shadow-[2px_2px_0px_0px_#1B1F3B] hover:shadow-[4px_4px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_0px_#1B1F3B]',
    md: 'px-6 py-3 text-base font-bold rounded-xl border-3 shadow-[4px_4px_0px_0px_#1B1F3B] hover:shadow-[6px_6px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-[4px_4px_0px_0px_#1B1F3B]',
    lg: 'px-8 py-4 text-lg font-bold rounded-2xl border-4 shadow-[6px_6px_0px_0px_#1B1F3B] hover:shadow-[8px_8px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-[6px_6px_0px_0px_#1B1F3B]',
    xl: 'px-10 py-5 text-xl font-extrabold rounded-[24px] border-4 shadow-[8px_8px_0px_0px_#1B1F3B] hover:shadow-[10px_10px_0px_0px_#1B1F3B] hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-x-0 active:translate-y-0 active:shadow-[8px_8px_0px_0px_#1B1F3B]',
  };
  return (
    <button className={clsx('font-display uppercase tracking-wider transition-all duration-150 cursor-pointer outline-none relative select-none border-deep-navy text-center inline-flex items-center justify-center gap-2', bgClasses[variant], sizeClasses[size], className)} {...props}>
      {children}
    </button>
  );
};
```

NeoCard

* Variants: white, orange, mint, sky, coral, yellow, cream, navy
* `borderSize`: normal (border-3) or thick (border-4)
* `shadowSize`: normal (shadow-neo), large (shadow-neo-lg), none
* Optional `hoverEffect` and `hoverRotate`
* Rounded 24px, `border-deep-navy`

Also build, in the same language:

* NeoInput / NeoTextarea / NeoSelect — `border-3 border-deep-navy rounded-xl bg-bg-cream font-semibold px-4 py-3 shadow-neo-inset focus:bg-white focus:outline-none`, uppercase display labels, coral error text
* NeoTable — thick navy outer border, bold navy header row on yellow, `border-b-2 border-deep-navy/10` rows, hover highlight
* StatTile — NeoCard with a big number, label, and a lucide icon in a bordered chip
* StatusBadge — small bordered pill, color-mapped by status (see below)
* TagInput — chip editor for JSONB `string[]` fields (highlights, topics, resources); type + Enter adds a bordered chip with an ✕
* Modal — centered NeoCard over `bg-deep-navy/70 backdrop-blur-sm`, yellow bordered close button
* Toast — bordered hard-shadow save/error notifications

StatusBadge color map

* Live / paid / confirmed → mint or success
* Upcoming / pending → yellow
* Completed → navy tint (`bg-deep-navy/10`)
* Cancelled / failed / refunded → coral

---

# Shared Database

This portal reads and writes the **same** schema the public site defined (full DDL lives in the public repo at `supabase/schema.sql`). Do not re-create the core tables; build on top of them. The shape is below.

Enums

```
difficulty_level    : Beginner | Intermediate | Advanced
workshop_category   : Frontend | Backend | AI | Career | Dev Tools | Portfolio
batch_status        : Upcoming | Live | Completed | Cancelled
registration_status : pending | confirmed | waitlisted | cancelled | refunded
payment_status      : pending | paid | failed | refunded
user_role           : student | instructor | admin
```

instructors

* id, name, title, bio, avatar_url

workshops (reusable content)

* id, slug (unique), title, description, about_text, cover_image
* difficulty (enum), category (enum), default_instructor_id → instructors
* highlights (jsonb `string[]`)
* learning_outcomes (jsonb `{ title, desc }[]`)
* faq (jsonb `{ q, a }[]`)
* is_published (bool), created_at, updated_at

workshop_batches (one row per run — where price/seats/dates vary)

* id, workshop_id → workshops, instructor_id → instructors (override)
* batch_label (e.g. "Batch 1"), status (enum)
* date_label (display string, e.g. "11 - 12 July"), start_date, end_date
* duration_label (e.g. "2 Days"), num_sessions, timezone
* currency (default INR), price, original_price, seat_limit, registration_open

batch_sessions (per-batch schedule)

* id, batch_id → workshop_batches, session_order (unique per batch)
* title, duration_label (e.g. "2 Hours"), scheduled_at (timestamptz)
* topics (jsonb `string[]`), assignment (text), resources (jsonb `string[]`)

profiles (extends auth.users — admin gate is `role = 'admin'`)

* id, full_name, email, phone, avatar_url, role (enum)

registrations

* id, user_id → profiles, batch_id → workshop_batches, status (enum)
* full_name, email, phone (snapshot at signup)
* confirmation_code (unique), confirmed_at, registered_at
* unique (user_id, batch_id)

payments

* id, registration_id → registrations, user_id, batch_id
* amount (numeric), currency, status (enum)
* provider, provider_order_id, provider_payment_id (unique), payment_method
* receipt_url, paid_at

certificates

* id, certificate_code (unique), user_id, batch_id
* student_name, student_email, workshop_name, workshop_date, duration_label
* completion_date, issued_at, is_revoked

View: batch_seat_status

* batch_id, seat_limit, seats_taken (confirmed registrations), seats_remaining
* Use this for all seat counts — never hand-maintain a counter

Relationships to render

```
workshop 1—* batch 1—* session
batch 1—* registration 1—* payment
batch_seat_status → live seats per batch
```

---

# Security & Access Control

This is a privileged app. The public site's existing RLS allows public read of the catalog and owner-only access to profiles/registrations/payments — not enough for an admin. Handle it in three layers.

Gate the whole portal behind admin login

* Supabase email/password auth via @supabase/ssr
* After login, look up `profiles.role`; if not `admin`, sign out and show "Not authorized"
* Middleware protects every route and redirects unauthenticated / non-admin users to `/login`

Privileged reads/writes use the SERVICE ROLE key, server-side only

* Create a server-only admin client with `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS)
* Use it only inside Route Handlers / Server Actions / Server Components
* Never ship the service role key to the browser
* Re-verify the caller is an admin (`assertAdmin()`) before every privileged call

Add admin RLS policies as defense-in-depth

* Run the SQL in the "Admin Policies SQL" section once against the shared DB
* This lets admins read/write every table through the normal client too

Secrets (`SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) live only in server env — never `NEXT_PUBLIC_*`.

---

# Authentication

Create a dedicated page.

```
/login
```

Use Supabase Authentication.

Desktop Layout

```
-------------------------------------------------------

Left

Navy panel, grid pattern

"Learn. Build. Deploy. Repeat." animated words

Admin badge

-------------------------------------------------------

Right

Login card (email + password)

-------------------------------------------------------
```

On success, server-check `profiles.role === 'admin'`. Admins go to `/` (dashboard); non-admins are signed out with an error. Mirror the public `/auth` split-screen styling.

---

# Dashboard Overview

Route

```
/
```

Top row of StatTiles

* Total Workshops
* Active Batches (status Live or Upcoming)
* Total Registrations
* Confirmed Students
* Total Revenue (sum of payments.amount where status = paid)
* Pending Payments

Below

* Recent Registrations table (latest 10, joined to workshop + batch title)
* Batches Filling Up (from batch_seat_status) with a neo progress bar showing seats_taken / seat_limit

---

# Workshops

Route

```
/workshops
```

* Grid or table of all workshops (published and drafts)
* Each row: title, category chip, difficulty, number of batches, published toggle, actions (Edit / Manage Batches / Delete)
* Search + filter by category, difficulty, published state — styled like the public catalog filters
* "New Workshop" button → `/workshops/new`

Confirm before delete with a neo confirm modal.

---

# Workshop Editor

Routes

```
/workshops/new
/workshops/[id]/edit
```

Full content editor (React Hook Form + Zod). Fields

* title
* slug (auto-slugify from title, editable, must be unique)
* description (short)
* about_text (long textarea)
* cover_image (URL or Supabase Storage upload — optional)
* difficulty (select enum)
* category (select enum)
* default_instructor_id (select from instructors)
* is_published (toggle)
* highlights → TagInput (`string[]`)
* learning_outcomes → repeatable rows of `{ title, desc }` (add / remove)
* faq → repeatable rows of `{ q, a }` (add / remove)

Save via a Server Action using the admin client. Show a toast. On create, redirect to the batch manager.

---

# Batch Manager

Route

```
/workshops/[id]/batches
```

This is the "different each run" part of the model.

* List this workshop's batches as neo cards
* Each card: batch_label, status badge, date_label, price / original_price, seats_taken / seat_limit (from batch_seat_status), sessions count
* Actions: Edit, Manage Sessions, View Registrations, Delete
* "Add Batch" form fields: batch_label, status, date_label, start_date, end_date, duration_label, num_sessions, currency, price, original_price, seat_limit, instructor_id (override), registration_open

---

# Session Editor

Route

```
/batches/[batchId]/sessions
```

* Ordered list of batch_sessions
* Each session: session_order, title, duration_label, scheduled_at (datetime picker), topics (TagInput), assignment (textarea), resources (TagInput)
* Add, reorder, and remove sessions
* Keep workshop_batches.num_sessions in sync with the count

---

# Registrations

Routes

```
/batches/[batchId]/registrations
/registrations
```

This is the "see each workshop's registered students" feature.

Per-batch table columns

* Student full_name, email, phone
* Registration status (StatusBadge)
* confirmation_code
* Payment status (from the latest linked payment)
* Registered date

Row actions

* Confirm / Cancel / Waitlist the registration
  (confirm sets status = confirmed, confirmed_at = now, which fills a seat via the view)
* Copy confirmation code
* Create / copy Razorpay payment link
* View payment history

Global `/registrations` view

* All registrations across workshops with filters (workshop, batch, status, paid / unpaid)
* CSV export

---

# Payments & Razorpay

Route

```
/payments
```

Payments table

* amount, currency, status badge, provider, method, paid_at
* linked student and batch
* filter by status

Create payment link flow (from a registration, or standalone)

* Admin picks a registration (or batch + student) and confirms the amount (default = batch price)
* Server Action calls the Razorpay Payment Links API (`POST /v1/payment_links`) with
  amount in **paise** (rupees × 100), currency INR, customer name / email / phone
  from the registration, and `reference_id` = the registration id
* Store the returned link id in payments.provider_order_id, the short_url in
  payments.receipt_url, status = pending, provider = razorpay, linked registration_id
* Show the short URL with a copy button to send to the student

Webhook

```
POST /api/razorpay/webhook
```

* Verify the `X-Razorpay-Signature` header using `RAZORPAY_WEBHOOK_SECRET`
  (HMAC-SHA256 over the **raw** request body — read the raw body, do not JSON-parse first)
* On `payment_link.paid` / `payment.captured`: set the matching payments row to
  status = paid, paid_at = now, store provider_payment_id and payment_method; then set
  the linked registrations.status = confirmed, confirmed_at = now
* On failure / refund events: set failed / refunded accordingly
* Use the service-role client here (webhooks have no user session)

Razorpay client lives in `lib/razorpay.ts`, server-only, built from `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET`. Never expose the secret.

---

# Instructors

Route

```
/instructors
```

CRUD for instructors: name, title, bio, avatar_url. Optional, lower priority.

---

# Certificates

Route

```
/certificates
```

Issue a certificates row for a completed student — generate certificate_code, snapshot student_name / workshop_name / dates. Optional, later.

---

# Data Access Architecture

* `lib/supabase/config.ts` — reads the NEXT_PUBLIC env vars
* `lib/supabase/server.ts` — cookie-aware SSR client (anon key) for the admin's own session / RLS-safe reads
* `lib/supabase/admin.ts` — service-role client (from @supabase/supabase-js, no cookies), `import 'server-only'` at the top; used only in Server Actions / Route Handlers
* `lib/auth.ts` — `assertAdmin()` verifies session + `profiles.role = 'admin'` before any privileged call
* `actions/` — Server Actions for every mutation; validate input with Zod on the server
* Prefer Server Components for list / detail reads (fetch on the server, pass plain props to client components for interactivity) — the same pattern the public site uses

---

# Component Structure

Organize into reusable pieces:

* Sidebar
* Topbar
* NeoButton
* NeoCard
* NeoInput / NeoTextarea / NeoSelect
* NeoTable
* StatTile
* StatusBadge
* TagInput
* Modal
* Toast
* WorkshopForm
* BatchForm
* SessionEditor
* RegistrationsTable
* PaymentsTable
* PaymentLinkModal

---

# Environment Variables

`.env.local` (secrets) plus a committed `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=            # SAME project as the public site
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # server-only, Project Settings > API
RAZORPAY_KEY_ID=                     # can be public; used to build links
RAZORPAY_KEY_SECRET=                 # server-only
RAZORPAY_WEBHOOK_SECRET=             # server-only, set when creating the webhook
```

---

# Performance & Non-Functional

* Use Server Components wherever possible; client components only for interactivity
* Validate all input with Zod on the server, not just the client
* Loading, empty, and error states on every page
* Toast feedback on every write
* Responsive; sidebar collapses to a drawer on mobile
* Accessible: semantic HTML, keyboard navigation, sufficient contrast
* Respect `prefers-reduced-motion`
* No secret keys in any client bundle

---

# Definition of Done

* Running Next.js 16 app with the neo design system and admin shell
* Middleware-protected, admin-only access; non-admins rejected
* Working CRUD for workshops → batches → sessions, with JSONB fields edited via TagInput / repeatable rows
* Registrations viewer per batch and global, with confirm / cancel and CSV export
* Payments list + Razorpay payment-link creation + verified webhook that flips payment and registration status
* Live seat counts from batch_seat_status
* `supabase/admin-policies.sql` in the repo, and a `.env.example`
* No secret keys in any client bundle

---

# Guardrails

* Never put SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_SECRET, or RAZORPAY_WEBHOOK_SECRET in a NEXT_PUBLIC var or any client component
* Do not alter the existing core tables' structure; only add the admin RLS policies below. If a genuinely new table is needed (e.g. an audit log), propose it before creating it
* Store rupees in payments.amount (matching the public site), but send paise to Razorpay (× 100). Keep currency INR unless told otherwise
* Confirm before destructive actions (delete workshop / batch) with a neo confirm modal
* Match the existing visual language precisely — if in doubt, mirror a screen from the public site (auth split-screen, dashboard cards, catalog filters, modals)

---

# Admin Policies SQL

Save as `supabase/admin-policies.sql` in the new repo and run it **once** in the shared Supabase project's SQL Editor, **after** the main `schema.sql`. It adds an `is_admin()` helper plus additive admin policies so admins can read/write every table through the normal client (defense-in-depth alongside the server-side service-role writes).

Promote yourself first:

```
update public.profiles set role = 'admin' where email = 'you@example.com';
```

```sql
-- Helper: is the currently-authenticated user an admin?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- One additive full-access policy per table (safe to re-run).
drop policy if exists "admin full access workshops" on public.workshops;
create policy "admin full access workshops" on public.workshops for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access batches" on public.workshop_batches;
create policy "admin full access batches" on public.workshop_batches for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access sessions" on public.batch_sessions;
create policy "admin full access sessions" on public.batch_sessions for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access instructors" on public.instructors;
create policy "admin full access instructors" on public.instructors for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access profiles" on public.profiles;
create policy "admin full access profiles" on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access registrations" on public.registrations;
create policy "admin full access registrations" on public.registrations for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access payments" on public.payments;
create policy "admin full access payments" on public.payments for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin full access certificates" on public.certificates;
create policy "admin full access certificates" on public.certificates for all
  using (public.is_admin()) with check (public.is_admin());
```

---

# Project Structure

```
admin-portal/
├─ .env.local                      # secrets (gitignored)
├─ .env.example                    # committed template
├─ supabase/
│  └─ admin-policies.sql           # run once on the shared DB
├─ middleware.ts                   # gate every route behind admin auth
└─ src/
   ├─ app/
   │  ├─ layout.tsx                # fonts + globals + admin shell
   │  ├─ globals.css               # theme
   │  ├─ login/page.tsx
   │  ├─ (dashboard)/
   │  │  ├─ page.tsx               # overview
   │  │  ├─ workshops/{page,new,[id]/edit,[id]/batches}/...
   │  │  ├─ batches/[batchId]/{sessions,registrations}/page.tsx
   │  │  ├─ registrations/page.tsx
   │  │  ├─ payments/page.tsx
   │  │  └─ instructors/page.tsx
   │  └─ api/razorpay/webhook/route.ts
   ├─ components/
   │  ├─ UI/ (NeoButton, NeoCard, NeoInput, NeoSelect, NeoTable, StatTile,
   │  │        StatusBadge, TagInput, Modal, Toast)
   │  └─ layout/ (Sidebar, Topbar)
   ├─ lib/
   │  ├─ supabase/{server.ts, admin.ts, config.ts}
   │  ├─ razorpay.ts               # server-only client
   │  ├─ auth.ts                   # assertAdmin()
   │  └─ types.ts                  # DB row types + enums
   └─ actions/                     # server actions for all mutations
```

Install

```bash
npx create-next-app@latest admin-portal --typescript --app --tailwind --eslint
cd admin-portal
npm i @supabase/ssr @supabase/supabase-js react-hook-form zod \
  @hookform/resolvers lucide-react clsx framer-motion zustand razorpay
```

Then replace the generated CSS with the Theme Setup block and wire the three Google fonts in `layout.tsx` exactly as the public site does.

---

# Repo README

Save as `README.md` in the new repo.

````markdown
# DevTrackAcademy — Admin Portal

Internal back-office for DevTrackAcademy. Manages workshops, batches, sessions,
registrations, and Razorpay payments. Shares one Supabase project / database with
the public student site — this app never re-creates the core tables, it only adds
admin RLS policies.

## Prerequisites
- Node 18+
- Access to the same Supabase project the public site uses
- A Razorpay account (test mode is fine to start)

## Setup
1. Install deps: `npm install`
2. Copy env: `cp .env.example .env.local` and fill in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=            # SAME project as the public site
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=           # Supabase > Project Settings > API (server-only!)
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=                 # server-only
   RAZORPAY_WEBHOOK_SECRET=             # set when you create the webhook
   ```
3. Apply admin policies to the shared DB once: open Supabase SQL Editor and run
   `supabase/admin-policies.sql` (after the main site's `schema.sql` already exists).
4. Make yourself an admin (Supabase SQL Editor):
   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```
   (Sign up once via the public site or the portal login first so the profile row
   exists.)
5. Run: `npm run dev` → open http://localhost:3000 and log in.

## Razorpay webhook
- In the Razorpay dashboard → Settings → Webhooks, add:
  `https://<your-admin-domain>/api/razorpay/webhook`
- Subscribe to `payment_link.paid`, `payment.captured`, `payment.failed`,
  `refund.processed`.
- Put the webhook's signing secret in `RAZORPAY_WEBHOOK_SECRET`.
- The webhook verifies the `X-Razorpay-Signature` header (HMAC-SHA256 over the raw
  body) before updating any row.

## Security
- `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`
  are server-only — never referenced in client components or `NEXT_PUBLIC_*`.
- Every route is gated by middleware; every mutation re-checks `profiles.role='admin'`
  server-side before using the service-role client.

## Deploy
- Deploy on Vercel (or similar). Set all env vars in the host's project settings.
- Use Razorpay live keys and a live webhook URL only when going to production.
````

---

# Overall Experience

The final admin portal should feel like the **operator's console of a premium live-coding bootcamp** — the same bold, playful Neo-Brutalist world as the public site, but dense with the data the team needs to run it. Every screen reinforces the core model: a **workshop** is written once, each **batch** is a real run with its own price, seats, and schedule, and every **student** flows from registration → payment → confirmation → certificate. It must be fast, safe, and unmistakably part of the DevTrackAcademy family.
