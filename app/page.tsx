import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowRight, ShieldCheck, MapPin, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HomeBg } from "@/components/home-bg";

async function getLiveCounts() {
  try {
    const supabase = await createClient();
    const [{ count: vendors }, { count: walkers }] = await Promise.all([
      supabase
        .from("grooming_vendors")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("pet_walkers")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);
    return { vendors: vendors ?? 0, walkers: walkers ?? 0 };
  } catch {
    return { vendors: 0, walkers: 0 };
  }
}

const tiles = [
  {
    emoji: "✂️",
    fullTitle: "Grooming Spas & Salons",
    subtitle: "At-Home & Salon",
    description:
      "Book professional groomers for baths, haircuts, nail trims, and full spa packages — doorstep visits or a salon appointment, your choice.",
    href: "/grooming",
    countKey: "vendors" as const,
    color: "from-[#62C995] to-[#43B07A]",
    bgGlow: "from-[#62C995]/20 via-[#B8E8C9]/10 to-transparent",
    badges: ["At-Home", "Salon Visit", "Dogs & Cats"],
  },
  {
    emoji: "🦮",
    fullTitle: "Daily Walkies",
    subtitle: "On-Demand Pet Walks",
    description:
      "Too busy for a walk? Book a certified pet walker for your dog or cat — scheduled daily walks, solo or group, right in your neighbourhood.",
    href: "/pet-walking",
    countKey: "walkers" as const,
    color: "from-[#FFAA62] to-[#FF8C42]",
    bgGlow: "from-[#FFAA62]/20 via-[#FFD966]/10 to-transparent",
    badges: ["Solo Walks", "Group Walks", "Daily Schedule"],
  },
];

export default async function HomePage() {
  const counts = await getLiveCounts();

  return (
    <>
      <HomeBg />
      <Navbar />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">

        {/* Hero */}
        <section className="relative px-4 pb-8 pt-14 text-center sm:pt-20">
          <div className="mx-auto max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#62C995] animate-pulse" />
              Live · Dehradun, Uttarakhand
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Your pet deserves{" "}
              <span className="bg-gradient-to-r from-[#62C995] to-[#FFAA62] bg-clip-text text-transparent">
                the best
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Professional grooming and daily walks for your furry family — trusted, vetted, and local to Dehradun.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/grooming"
                className="rounded-full bg-gradient-to-r from-[#62C995] to-[#43B07A] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#62C995]/30 transition-all hover:shadow-[#62C995]/50 hover:-translate-y-0.5"
              >
                Book a Groomer
              </Link>
              <Link
                href="/pet-walking"
                className="rounded-full border border-border/60 bg-background/70 px-6 py-2.5 text-sm font-semibold backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40"
              >
                Find a Walker
              </Link>
            </div>
          </div>
        </section>

        {/* Service Tiles */}
        <section className="container mx-auto grid grid-cols-1 gap-5 px-4 pb-10 pt-10 sm:grid-cols-2 max-w-4xl">
          {tiles.map(({ emoji, fullTitle, subtitle, description, href, countKey, color, bgGlow, badges }) => {
            const count = counts[countKey];
            return (
              <div
                key={fullTitle}
                className="group relative flex flex-col rounded-3xl border border-border/50 bg-card/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 backdrop-blur-sm min-h-[360px]"
              >
                {/* gradient glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${bgGlow} opacity-60 transition-opacity group-hover:opacity-90`} />

                <div className="relative flex flex-col gap-5 p-7 flex-1">
                  {/* icon + count */}
                  <div className="flex items-start justify-between">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} text-3xl shadow-lg`}>
                      {emoji}
                    </div>
                    {count > 0 && (
                      <span className="flex items-center gap-1.5 rounded-full border bg-background/80 px-3 py-1 text-xs font-semibold backdrop-blur">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#62C995]" />
                        {count} active
                      </span>
                    )}
                  </div>

                  {/* title */}
                  <div>
                    <h2 className="text-2xl font-bold leading-tight">{fullTitle}</h2>
                    <p className={`text-sm font-semibold mt-1 bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
                      {subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

                  <div className="flex flex-wrap gap-2">
                    {badges.map((b) => (
                      <span key={b} className="rounded-full border bg-background/70 px-3 py-0.5 text-xs font-medium backdrop-blur-sm">
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-4 border-t border-border/40 flex items-center justify-between gap-2">
                    {count > 0 && (
                      <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground">{count}</strong> listed near you
                      </span>
                    )}
                    <Link
                      href={href}
                      className={`ml-auto flex items-center gap-1.5 rounded-xl bg-gradient-to-r ${color} px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:gap-2.5 group/btn`}
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
        {/* Trust strip */}
        <section className="container mx-auto max-w-4xl px-4 pb-16">
          <div className="grid grid-cols-3 gap-3">
            {[
              { Icon: ShieldCheck, label: "Verified vendors", desc: "Every listing reviewed by our team" },
              { Icon: MapPin, label: "Dehradun-local", desc: "Only local services, no middlemen" },
              { Icon: Zap, label: "Easy booking", desc: "Book in under 2 minutes" },
            ].map(({ Icon, label, desc }) => (
              <div key={label} className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 text-center">
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}
