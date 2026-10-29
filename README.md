<div align="center">

<img src="public/icons/icon-192.svg" width="80" height="80" alt="Team Motu logo" />

# Team Motu

**Pet grooming & daily walks in Dehradun — simple, trusted, local**

[![Live](https://img.shields.io/badge/Live%20at-team--motu.vercel.app-7c3aed?style=for-the-badge&logo=vercel)](https://team-motu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## What is Team Motu?

Team Motu helps pet owners in Dehradun find and book trusted grooming and walking services — with a clean mobile-first experience and PWA support for home-screen installs.

| Service | Description |
|---|---|
| ✂️ **Grooming Spas & Salons** | Book at-home or salon grooming — baths, haircuts, nail trims & more |
| 🦮 **Daily Walkies** | Book certified pet walkers for solo or group walks near you |

---

## Features

### For Customers
- Browse groomers and walkers without signing in
- Book grooming appointments — pick a date, add pet details, confirm
- View booking history with live status (Pending / Accepted / Rejected / Completed)

### For Vendors
- Separate vendor registration and login portal
- Dashboard to manage bookings and update your profile
- Listings only go live after admin approval
- Vendors cannot book their own services

### Platform
- **Role-based auth** — customer, vendor, and admin roles
- **Admin approval** — every vendor is reviewed before going live
- **PWA** — installable on Android/iOS, works offline
- **Dark / light mode** — follows system preference

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password, role-based) |
| Storage | Supabase Storage |
| UI | Tailwind CSS + shadcn/ui |
| Deployment | Vercel (auto-deploy on push) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/SyedMohdGhazi/Team-Motu.git
cd Team-Motu

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, and service role key

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key (**keep private**) |

### Database

Run the SQL migrations in order from `supabase/migrations/` in the Supabase SQL Editor.

---

## Project Structure

```
app/
├── (auth)/           # Customer login & register
├── vendor/           # Vendor login, register, dashboard
├── dashboard/        # Customer dashboard & booking history
├── grooming/         # Grooming listings & booking flow
├── pet-walking/      # Pet walker listings & registration
├── api/              # Secure API routes
└── manifest.ts       # PWA manifest

components/
├── navbar.tsx        # Role-aware navigation
├── home-bg.tsx       # Animated homepage background
├── install-banner.tsx
└── ui/               # shadcn/ui components

lib/supabase/         # Browser, server, and middleware clients
supabase/migrations/  # SQL migration files
public/
├── sw.js             # Service worker
└── icons/            # PWA icons
```

---

## Roadmap

- [ ] Veterinary clinic listings & booking
- [ ] Pet supplies & medical store listings
- [ ] Foster homes & daycare directory
- [ ] Pet walker live tracking
- [ ] In-app notifications
- [ ] Payment integration (Razorpay)
- [ ] Ratings & reviews
- [ ] Multi-city expansion

---

<div align="center">
  <sub>Built with ❤️ for the pets of Dehradun</sub>
</div>
