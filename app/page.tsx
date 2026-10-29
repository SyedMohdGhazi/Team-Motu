import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { HomeBg } from "@/components/home-bg";

async function getLiveCounts() {
  try {
    const supabase = await createClient();
    const [{ count: vendors }] = await Promise.all([
      supabase
        .from("grooming_vendors")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);
    return { vendors: vendors ?? 0 };
  } catch {
    return { vendors: 0 };
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
    registerHref: "/vendor/dashboard",
    registerLabel: "Register your salon",
    countKey: "vendors" as const,
    color: "from-violet-500 to-purple-400",
    bgGlow: "from-violet-500/20 via-purple-400/10 to-transparent",
    badges: ["At-Home", "Salon Visit", "Dogs & Cats"],
  },
  {
    emoji: "🦮",
    fullTitle: "Daily Walkies",
    subtitle: "On-Demand Pet Walks",
    description:
      "Too busy for a walk? Book a certified pet walker for your dog or cat — scheduled daily walks, solo or group, right in your neighbourhood.",
    href: "/pet-walking",
    registerHref: "/pet-walking/register",
    registerLabel: "Register as a walker",
    countKey: "walkers" as const,
    color: "from-amber-500 to-orange-400",
    bgGlow: "from-amber-500/20 via-orange-400/10 to-transparent",
    badges: ["Solo Walks", "Group Walks", "Daily Schedule"],
  },
];

export default async function HomePage() {
  const counts = await getLiveCounts();
  const allCounts = { ...counts, walkers: 0 };

  return (
    <>
      <HomeBg />
      <Navbar />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">

        {/* Hero */}
        <section className="relative px-4 pb-8 pt-14 text-center sm:pt-20">
          <div className="mx-auto max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Live · Dehradun, Uttarakhand
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">
              Your pet deserves{" "}
              <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
                the best
              </span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Professional grooming and daily walks for your furry family — trusted, vetted, and local to Dehradun.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/grooming"
                className="rounded-full bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:-translate-y-0.5"
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
        <section className="container mx-auto grid grid-cols-1 gap-5 px-4 pb-16 pt-10 sm:grid-cols-2">
          {tiles.map(({ emoji, fullTitle, subtitle, description, href, registerHref, registerLabel, countKey, color, bgGlow, badges }) => {
            const count = allCounts[countKey];
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
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
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
                    {count === 0 && (
                      <Link href={registerHref} className="text-xs text-primary hover:underline font-medium">
                        {registerLabel} →
                      </Link>
                    )}
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

        <div className="pb-10 text-center text-xs text-muted-foreground">
          Are you a groomer or pet walker?{" "}
          <Link href="/vendor/register" className="text-primary hover:underline font-medium">
            Join as a vendor →
          </Link>
        </div>
      </main>
    </>
  );
}
