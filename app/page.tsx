import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Scissors, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function getLiveCounts() {
  try {
    const supabase = await createClient();
    const [{ count: vendors }, { count: shelters }, { count: products }] =
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
          .from("medical_products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);
    return { vendors: vendors ?? 0, shelters: shelters ?? 0, products: products ?? 0 };
  } catch {
    return { vendors: 0, shelters: 0, products: 0 };
  }
}

export default async function HomePage() {
  const counts = await getLiveCounts();

  const tiles = [
    {
      icon: Scissors,
      title: "Pet Grooming & Spa",
      subtitle: "At-Home & Clinic Visits",
      description:
        "Book professional groomers near ISBT Dehradun. Choose between a doorstep visit or a clinic appointment for baths, haircuts, nail trims, and full spa packages.",
      href: "/grooming",
      registerHref: "/vendor/dashboard",
      registerLabel: "Register your salon",
      count: counts.vendors,
      countLabel: counts.vendors === 1 ? "vendor active" : "vendors active",
      color: "from-blue-500/10 to-indigo-500/10",
      iconBg: "bg-blue-500",
      badges: ["At-Home", "Clinic Visit", "Dogs & Cats"],
    },
    {
      icon: Heart,
      title: "Animal Shelters",
      subtitle: "Adoption & Foster Directory",
      description:
        "Discover shelters, NGOs, and foster homes around Clement Town. Browse pets ready for adoption and find emergency helplines for stray animal rescue.",
      href: "/shelters",
      registerHref: "/shelter/register",
      registerLabel: "Add your shelter",
      count: counts.shelters,
      countLabel: counts.shelters === 1 ? "shelter listed" : "shelters listed",
      color: "from-rose-500/10 to-pink-500/10",
      iconBg: "bg-rose-500",
      badges: ["Adopt a Pet", "Foster Homes", "Rescue NGOs"],
    },
    {
      icon: ShoppingBag,
      title: "Medical Supplies",
      subtitle: "Essentials for Cats & Dogs",
      description:
        "Shop vet-recommended medicines, flea & tick treatments, nutritional supplements, quality pet food, and grooming tools — all delivered to your door.",
      href: "/medical-store",
      registerHref: null,
      registerLabel: null,
      count: counts.products,
      countLabel: counts.products === 1 ? "product available" : "products available",
      color: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500",
      badges: ["Medicines", "Food", "Grooming Tools"],
    },
  ];

  return (
    <>
      <Navbar />
      <main className="flex min-h-[calc(100vh-3.5rem)] flex-col">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/8 to-background px-4 py-10 text-center sm:py-14">
          <div className="mx-auto max-w-2xl">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
              Everything your pet needs,{" "}
              <span className="text-primary">near you</span>
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Grooming, adoption, and medical supplies — all within your chosen
              distance from ISBT / Clement Town, Dehradun.
            </p>
          </div>
        </section>

        {/* Feature tiles */}
        <section className="container mx-auto grid gap-5 px-4 pb-16 pt-6 sm:grid-cols-3">
          {tiles.map(
            ({
              icon: Icon,
              title,
              subtitle,
              description,
              href,
              registerHref,
              registerLabel,
              count,
              countLabel,
              color,
              iconBg,
              badges,
            }) => (
              <div
                key={title}
                className={`group relative flex flex-col rounded-2xl border bg-card shadow-sm overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60`} />
                <div className="relative flex flex-col gap-4 p-6 flex-1">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md ${iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold leading-tight">{title}</h2>
                    <p className="text-sm font-medium text-primary">{subtitle}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {badges.map((b) => (
                      <span key={b} className="rounded-full border bg-background/80 px-2.5 py-0.5 text-xs font-medium">{b}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2">
                    {count > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground text-sm">{count}</strong>{" "}{countLabel}
                      </span>
                    ) : (
                      registerHref ? (
                        <Link
                          href={registerHref}
                          className="text-xs text-primary hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {registerLabel} →
                        </Link>
                      ) : (
                        <span className="text-xs text-muted-foreground">Coming soon</span>
                      )
                    )}
                    <Link
                      href={href}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:gap-2 transition-all"
                    >
                      Explore <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          )}
        </section>
      </main>
    </>
  );
}
