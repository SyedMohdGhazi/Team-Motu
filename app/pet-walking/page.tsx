"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { ArrowLeft, MapPin, Phone, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Walker {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  service_area: string | null;
  pet_types: string | null;
  bio: string | null;
}

const PET_TYPE_LABEL: Record<string, string> = {
  dogs: "🐶 Dogs",
  cats: "🐱 Cats",
  both: "🐶🐱 Dogs & Cats",
};

function WalkerCard({ walker }: { walker: Walker }) {
  const initials = walker.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const petLabel = walker.pet_types ? (PET_TYPE_LABEL[walker.pet_types] ?? walker.pet_types) : null;

  return (
    <div className="rounded-2xl border bg-card hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-24 bg-gradient-to-br from-amber-500/15 to-orange-400/10 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-white text-xl font-bold shadow-md">
          {initials}
        </div>
      </div>
      <div className="p-4 grid gap-2.5">
        <div>
          <h3 className="font-bold text-base">{walker.full_name}</h3>
          {petLabel && (
            <span className="inline-block mt-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium">
              {petLabel}
            </span>
          )}
        </div>

        {walker.service_area && (
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            {walker.service_area}
          </p>
        )}

        {walker.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2">{walker.bio}</p>
        )}

        {walker.phone && (
          <a
            href={`tel:${walker.phone}`}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-400 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity"
          >
            <Phone className="h-4 w-4" /> Call to book
          </a>
        )}
      </div>
    </div>
  );
}

export default function PetWalkingPage() {
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [petFilter, setPetFilter] = useState<"all" | "dogs" | "cats">("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      // RLS: only is_active=true AND approval_status='approved' rows are returned
      const { data } = await (supabase.from("pet_walkers") as any)
        .select("id, user_id, full_name, phone, service_area, pet_types, bio")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setWalkers((data as Walker[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = walkers.filter((w) => {
    if (petFilter === "all") return true;
    if (!w.pet_types) return true;
    return w.pet_types === petFilter || w.pet_types === "both";
  });

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Daily Walkies</h1>
          <p className="text-sm text-muted-foreground mt-1">Certified pet walkers near Dehradun</p>
        </div>

        {/* Pet type filter */}
        <div className="flex rounded-lg border overflow-hidden text-sm mb-6 w-fit">
          {(["all", "dogs", "cats"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPetFilter(p)}
              className={`px-4 py-2 font-medium transition-colors capitalize ${petFilter === p ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {p === "all" ? "All pets" : p === "dogs" ? "🐶 Dogs" : "🐱 Cats"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🦮</p>
            <p className="font-medium">No walkers listed yet</p>
            <p className="text-sm mt-1">Check back soon — we&apos;re onboarding walkers in Dehradun.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((w) => <WalkerCard key={w.id} walker={w} />)}
          </div>
        )}
      </main>
    </>
  );
}
