# Glow Studio — Online Booking Website (Demo)

A complete booking website for a fictional beauty studio, **Glow Studio**:
visitors browse services, see live slot availability, book an appointment
in three steps and get a booking reference. The owner manages everything
from a passcode-protected admin panel — bookings, services, prices, and
even the site's colour theme.

Built with Next.js (App Router, TypeScript) + Supabase (Postgres via its
REST API). No photos are used anywhere: all artwork is CSS/SVG, and the
whole site re-skins itself from CSS variables.

## Features

**Visitors**
- Service menu with prices and durations (loaded from the database)
- Booking flow: service → date (next 14 days, Sundays closed) → live time
  slots (booked ones are disabled) → name & phone → confirmation with a
  booking reference like `GS-K7QX2M`
- "Find My Booking": look up appointments by phone number and cancel them
- Fully responsive, mobile-first design with gentle scroll animations

**Admin (`/admin`, passcode protected)**
- Dashboard counts: bookings today, pending requests, total bookings
- Booking list with date/status filters; Confirm / Mark Done / Cancel
- Services manager: add, edit (name, price, duration, visibility), delete
- Theme picker: 5 palettes (Rosewood, Teal Fresh, Royal Purple, Emerald,
  Midnight Gold) saved to the database and applied to every visitor

## 1. Create the database (Supabase)

Create a free project at [supabase.com](https://supabase.com), open
**SQL Editor**, and run this script once:

```sql
-- Services menu
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_rs integer not null default 0,
  duration_min integer not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Appointments
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  service_id uuid references public.services (id) on delete set null,
  service_name text not null,
  date date not null,
  time time not null,
  customer_name text not null,
  phone text not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Key/value settings (holds the active theme)
create table if not exists public.site_settings (
  key text primary key,
  value text not null
);

-- Seed: the six starter services
insert into public.services (name, price_rs, duration_min) values
  ('Signature Facial',    2500, 60),
  ('Haircut & Styling',   1200, 45),
  ('Manicure',             900, 30),
  ('Pedicure',            1100, 40),
  ('Bridal Trial Makeup', 5000, 90),
  ('Hair Spa',            1800, 50);

-- Seed: default theme
insert into public.site_settings (key, value) values ('theme', 'rosewood')
on conflict (key) do nothing;
```

The site talks to Supabase from the server with the **Secret key**, which
bypasses Row Level Security, so no extra policies are needed for this setup.

## 2. Environment variables

Copy `.env.example` to `.env.local` for local development, and set the same
variables in Vercel (Project → Settings → Environment Variables) for
production:

| Variable              | Where to get it                                                                 |
| --------------------- | ------------------------------------------------------------------------------- |
| `SUPABASE_URL`        | Supabase Dashboard → Project Settings → API → Project URL                       |
| `SUPABASE_SECRET_KEY` | Supabase Dashboard → Project Settings → API Keys → the **secret** key           |
| `ADMIN_PASSCODE`      | Your own choice — this is the passcode for the `/admin` panel                    |

> The secret key must stay server-side. This project only ever uses it in
> API routes, never in the browser.

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 — and http://localhost:3000/admin for the panel.

If the Supabase variables are missing, the site still renders (with the
starter service menu) and the booking/admin APIs reply with a friendly
"not connected yet" message instead of crashing.

## 4. Deploy on Vercel

1. Push this folder to a GitHub repository.
2. In [Vercel](https://vercel.com), choose **Add New → Project** and import
   the repository. Framework preset: **Next.js** (auto-detected). No build
   settings need changing.
3. Add the three environment variables from the table above.
4. Deploy. Every future `git push` redeploys automatically.

## Project structure

```
app/
  page.tsx                 Visitor home page (hero, services, booking, visit)
  admin/page.tsx           Admin panel (bookings / services / theme)
  api/
    services/              Public service list
    availability/          Booked slots for a service + date
    bookings/              Create a booking, find bookings by phone
    bookings/cancel/       Visitor cancels their own booking
    admin/                 Login/logout, bookings, services, theme (auth-gated)
components/                BookingFlow, FindBooking, ServicesSection, HeroArt, Reveal
lib/                       Supabase REST helper, admin auth, themes, dates, types
```

## Notes

- Appointment slots are hourly, 10:00–19:00, one booking per service per
  slot. A slot counts as taken while its booking is `pending` or `confirmed`.
- Glow Studio is a fictional business; the address and phone number on the
  site are placeholders for the demo.
