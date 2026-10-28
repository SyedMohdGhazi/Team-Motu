import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function getLiveCounts() {
  try {
    const supabase = await createClient();
    const [{ count: vendors }, { count: shelters }, { count: stores }] =
      await Promise.all([
        supabase
          .from("grooming_vendors")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("shelters")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("medical_stores")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);
    return { vendors: vendors ?? 0, shelters: shelters ?? 0, stores: stores ?? 0 };
  } catch {
    return { vendors: 0, shelters: 0, stores: 0 };
  }
}

const tiles = [
  {
    emoji: "🏥",
    title: "Veterinary Clinics",
    subtitle: "Home & In-Clinic",
    fullTitle: "Veterinary Clinics & Hospitals",
    description:
      "Connect with certified vets near Dehradun for check-ups, vaccinations, surgeries, and emergency care — at your doorstep or at the clinic.",
    href: "/veterinary",
    registerHref: "/vendor/dashboard",
    registerLabel: "List your clinic",
    countKey: "vets" as const,
    color: "from-blue-500 to-sky-400",
    bgGlow: "from-blue-500/15 via-sky-400/10 to-transparent",
    badges: ["Home Visits", "In-Clinic", "Emergency"],
  },
  {
    emoji: "✂️",
    title: "Grooming Spas & Salons",
    subtitle: "Home & Salon",
    fullTitle: "Grooming Spas & Salons",
    description:
      "Book professional groomers for baths, haircuts, nail trims, and full spa packages — choose a doorstep visit or a salon appointment.",
    href: "/grooming",
    registerHref: "/vendor/dashboard",
    registerLabel: "Register your salon",
    countKey: "vendors" as const,
    color: "from-violet-500 to-purple-400",
    bgGlow: "from-violet-500/15 via-purple-400/10 to-transparent",
    badges: ["At-Home", "Salon Visit", "Dogs & Cats"],
  },
  {
    emoji: "🛍️",
    title: "Medical Supplies",
    subtitle: "Food & Toys Store",
    fullTitle: "Medical Supplies, Food & Toys Store",
    description:
      "Shop vet-recommended medicines, flea treatments, pet food, toys, and grooming tools — sourced from trusted stores in Dehradun.",
    href: "/medical-store",
    registerHref: "/medical-store/register",
    registerLabel: "Register your store",
    countKey: "stores" as const,
    color: "from-emerald-500 to-teal-400",
    bgGlow: "from-emerald-500/15 via-teal-400/10 to-transparent",
    badges: ["Medicines", "Pet Food", "Toys & Accessories"],
  },
  {
    emoji: "🐾",
    title: "Foster Homes",
    subtitle: "Daycare & Pet Walking",
    fullTitle: "Foster Homes, Daycare & Pet Walking",
    description:
      "Find loving foster homes, trusted daycare centres, and professional pet walkers. List animals for adoption or help a stray find a home.",
    href: "/shelters",
    registerHref: "/shelter/register",
    registerLabel: "List your shelter",
    countKey: "shelters" as const,
    color: "from-rose-500 to-pink-400",
    bgGlow: "from-rose-500/15 via-pink-400/10 to-transparent",
    badges: ["Adopt a Pet", "Daycare", "Pet Walking"],
  },
];

export default async function HomePage() {
  const counts = await getLiveCounts();
  const allCounts = { ...counts, vets: 0 };

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 to-background px-4 py-12 text-center sm:py-16">
          <div className="mx-auto max-w-2xl relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live · Dehradun, Uttarakhand
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Everything your pet needs,{" "}
              <span className="text-primary">near you</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Vet care, grooming, supplies, and adoption — all in one place for pet parents in Dehradun.
            </p>
          </div>
        </section>

        {/* Service Tiles */}
        <section className="container mx-auto grid gap-5 px-4 pb-16 pt-6 sm:grid-cols-2">
          {tiles.map(({ emoji, title, subtitle, fullTitle, description, href, registerHref, registerLabel, countKey, color, bgGlow, badges }) => {
            const count = allCounts[countKey];
            return (
              <div key={title} className="group relative flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                {/* Gradient glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${bgGlow} opacity-60 transition-opacity group-hover:opacity-80`} />

                <div className="relative flex flex-col gap-4 p-6 flex-1">
                  {/* Icon + count */}
                  <div className="flex items-start justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-2xl shadow-md`}>
                      {emoji}
                    </div>
                    {count > 0 && (
                      <span className="flex items-center gap-1.5 rounded-full border bg-background/80 px-2.5 py-1 text-xs font-semibold backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {count} active
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h2 className="text-xl font-bold leading-tight">{fullTitle}</h2>
                    <p className={`text-sm font-semibold mt-0.5 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                      {subtitle}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {badges.map((b) => (
                      <span key={b} className="rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium">
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-4 border-t flex items-center justify-between gap-2">
                    {count === 0 && registerHref && (
                      <Link
                        href={registerHref}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        {registerLabel} →
                      </Link>
                    )}
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground">{count}</strong>{" "}
                        {count === 1 ? "listed" : "listed"} near you
                      </span>
                    )}
                    <Link
                      href={href}
                      className={`ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${color} px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md hover:gap-2.5 group/btn`}
                    >
                      Explore
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Footer hint */}
        <div className="pb-8 text-center text-xs text-muted-foreground">
          Are you a vet, groomer, or store owner?{" "}
          <Link href="/vendor/register" className="text-primary hover:underline">
            Join as a vendor →
          </Link>
        </div>
      </main>
    </>
  );
}
