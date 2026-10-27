import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Scissors, Heart, ShoppingBag, ArrowRight, Star, Clock, MapPin } from "lucide-react";

const PRIMARY_TILES = [
  {
    icon: Scissors,
    emoji: "✂️",
    title: "Pet Grooming & Spa",
    subtitle: "At-Home & Clinic Visits",
    description:
      "Book professional groomers near ISBT Dehradun. Choose between a doorstep visit or a clinic appointment for baths, haircuts, nail trims, and full spa packages.",
    href: "/grooming",
    badges: ["At-Home", "Clinic Visit", "Dogs & Cats"],
    stats: { label: "Vendors nearby", value: "12+" },
    color: "from-blue-500/10 to-indigo-500/10",
    iconBg: "bg-blue-500",
  },
  {
    icon: Heart,
    emoji: "🐾",
    title: "Animal Shelters",
    subtitle: "Adoption Directory",
    description:
      "Discover NGOs, shelters, and rescue centres around Clement Town. Browse pets ready for adoption and access emergency helplines for stray animal rescue.",
    href: "/shelters",
    badges: ["Adopt a Pet", "NGO Helplines", "Rescue"],
    stats: { label: "Shelters listed", value: "8" },
    color: "from-rose-500/10 to-pink-500/10",
    iconBg: "bg-rose-500",
  },
  {
    icon: ShoppingBag,
    emoji: "💊",
    title: "Medical Supplies",
    subtitle: "Essentials for Cats & Dogs",
    description:
      "Shop vet-recommended medicines, flea & tick treatments, nutritional supplements, quality pet food, and grooming tools — all delivered to your door.",
    href: "/medical-store",
    badges: ["Medicines", "Food", "Grooming Tools"],
    stats: { label: "Products in stock", value: "200+" },
    color: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-500",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        {/* Hero banner */}
        <section className="bg-gradient-to-b from-primary/8 to-background px-4 py-10 text-center sm:py-14">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Serving ISBT · Clement Town · Dehradun
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Everything your pet needs,{" "}
              <span className="text-primary">near you</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Grooming, adoption, and medical supplies — all within your chosen
              distance from home.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                4.8 avg. rating
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                Same-day bookings
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Hyperlocal results
              </span>
            </div>
          </div>
        </section>

        {/* 3 Feature tiles */}
        <section className="container mx-auto grid gap-5 px-4 pb-16 pt-6 sm:grid-cols-3">
          {PRIMARY_TILES.map(
            ({ icon: Icon, emoji, title, subtitle, description, href, badges, stats, color, iconBg }) => (
              <Link
                key={title}
                href={href}
                className="group relative flex flex-col rounded-2xl border bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 overflow-hidden"
              >
                {/* Gradient background swatch */}
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60`} />

                <div className="relative flex flex-col gap-4 p-6">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md ${iconBg}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  {/* Heading */}
                  <div>
                    <h2 className="text-xl font-bold leading-tight">{title}</h2>
                    <p className="text-sm font-medium text-primary">{subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {badges.map((b) => (
                      <span
                        key={b}
                        className="rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  {/* Footer: stat + CTA */}
                  <div className="mt-auto flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      <strong className="text-foreground text-sm">{stats.value}</strong>{" "}
                      {stats.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          )}
        </section>
      </main>
    </>
  );
}
