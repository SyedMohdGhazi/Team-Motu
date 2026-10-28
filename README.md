<div align="center">

<img src="public/icons/icon-192.svg" width="80" height="80" alt="Team Motu logo" />

# Team Motu

**All-in-one pet services platform for Dehradun, Uttarakhand**

[![Live](https://img.shields.io/badge/Live%20at-team--motu.vercel.app-7c3aed?style=for-the-badge&logo=vercel)](https://team-motu.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)

</div>

---

## What is Team Motu?

Team Motu connects pet owners in Dehradun with trusted local services — all in one place, with a clean mobile-first experience and PWA support for home-screen installs.

| Service | Description |
|---|---|
| 🏥 **Veterinary Clinics & Hospitals** | Book home visits or in-clinic appointments with certified vets |
| ✂️ **Grooming Spas & Salons** | Schedule at-home or salon grooming sessions |
| 🛍️ **Medical Supplies, Food & Toys** | Browse trusted local pet stores |
| 🐾 **Foster Homes & Daycare** | Find shelters, foster homes, and daycare centres; list pets for adoption |
| 🦮 **Daily Walkies** | Book certified pet walkers for solo or group walks |

---

## Features

### For Customers
- Browse all services without signing in
- Book grooming appointments with a 3-step flow (date/time → pet details → confirm)
- View booking history with live status updates (Pending / Accepted / Rejected / Completed)
- List pets for adoption from the Shelters page

### For Vendors
- Separate vendor registration and login portal
- Dashboard to manage bookings, add services, and update business profile
- Real-time approval status banner (Under Review → Live → Rejected)
- Vendors cannot book their own services

### Platform
- **Role-based auth** — customer, vendor, and admin roles with separate portals
- **Admin approval** — vendors only go live after admin approval
- **PWA** — installable on Android/iOS home screen, cache-first offline support
- **Dark / light mode** — system-aware theme toggle

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, Server Components) |
| Language | TypeScript (strict mode) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password, role-based) |
| Storage | Supabase Storage (pet photo uploads) |
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

Run the SQL migrations in order from `supabase/migrations/` in the Supabase SQL Editor to create all required tables and RLS policies.

---

## Project Structure

```
app/
├── (auth)/           # Customer login & register
├── vendor/           # Vendor login, register, dashboard
├── dashboard/        # Customer dashboard & booking history
├── grooming/         # Grooming listings & booking flow
├── shelters/         # Shelter/adoption directory
├── medical-store/    # Medical store listings
├── veterinary/       # Veterinary clinics (coming soon)
├── pet-walking/      # Pet walker listings & registration
├── api/              # Secure API routes (service-role operations)
└── manifest.ts       # PWA manifest

components/
├── navbar.tsx        # Role-aware navigation
├── install-banner.tsx # PWA install prompt
└── ui/               # shadcn/ui components

lib/supabase/         # Browser, server, and middleware clients
types/                # Manual Supabase type definitions
supabase/migrations/  # SQL migration files
public/
├── sw.js             # Service worker
└── icons/            # PWA icons
```

---

## Roadmap

- [ ] Veterinary clinic listings & booking
- [ ] Pet walker live tracking
- [ ] In-app notifications for booking status changes
- [ ] Payment integration (Razorpay)
- [ ] Ratings & reviews for vendors
- [ ] Multi-city expansion

---

<div align="center">
  <sub>Built with ❤️ for the pets of Dehradun</sub>
</div>
