"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, PawPrint, CalendarDays, ArrowRight, Plus, BookOpen, LifeBuoy } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserPet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
}

const PET_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", rabbit: "🐰", bird: "🐦", other: "🐾",
};

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [pets, setPets] = useState<UserPet[]>([]);
  const [activePetId, setActivePetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from("users") as any)
        .select("full_name").eq("id", user.id).single();
      if (profile?.full_name) setUserName(profile.full_name);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: petData } = await (supabase.from("user_pets") as any)
        .select("id, name, type, breed")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      const petList = (petData as UserPet[]) ?? [];
      setPets(petList);
      if (petList.length > 0) setActivePetId(petList[0].id);
      setLoading(false);
    }
    load();
  }, []);

  const firstName = userName ? userName.split(" ")[0] : null;
  const activePet = pets.find((p) => p.id === activePetId) ?? null;

  const quickLinks = [
    {
      icon: Scissors,
      title: "Book Grooming",
      description: activePet?.type === "dog" || activePet?.type === "cat"
        ? `For ${activePet.name}`
        : "At-home or salon visits",
      href: "/grooming",
      color: "text-primary",
      gradient: "from-primary/15 to-primary/5",
    },
    {
      icon: PawPrint,
      title: "Find a Walker",
      description: activePet?.type === "dog"
        ? `Walks for ${activePet.name}`
        : "Daily walks near you",
      href: "/pet-walking",
      color: "text-amber-500",
      gradient: "from-amber-500/15 to-amber-400/5",
    },
    {
      icon: CalendarDays,
      title: "My Bookings",
      description: "View appointments",
      href: "/dashboard/bookings",
      color: "text-primary",
      gradient: "from-primary/10 to-primary/5",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">

        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {firstName ? `Hello, ${firstName} 👋` : "Hello there 👋"}
          </h1>
          {activePet ? (
            <p className="text-sm font-medium text-primary mt-1">
              Caring for {activePet.name} today
              {activePet.breed ? ` · ${activePet.breed}` : ""} {PET_EMOJI[activePet.type] ?? "🐾"}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">What do you need today?</p>
          )}
        </div>

        {/* Pet circles */}
        {!loading && (
          <div className="mb-8">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wider">My Pets</p>
            <div className="flex items-start gap-4 overflow-x-auto py-3 px-1 no-scrollbar">
              {pets.map((pet) => {
                const isActive = activePetId === pet.id;
                return (
                  <button
                    key={pet.id}
                    onClick={() => setActivePetId(isActive ? null : pet.id)}
                    className="flex flex-col items-center gap-2 shrink-0 group"
                  >
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full border-2 text-3xl transition-all duration-200 ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-md shadow-primary/20 ring-2 ring-primary/30 ring-offset-2"
                        : "border-border bg-card hover:border-primary/50"
                    }`}>
                      {PET_EMOJI[pet.type] ?? "🐾"}
                    </div>
                    <span className={`text-xs font-semibold max-w-[72px] truncate transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}>
                      {pet.name}
                    </span>
                  </button>
                );
              })}

              {/* Add pet circle */}
              <Link href="/pet/new" className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-card hover:border-primary/50 hover:bg-primary/5 text-2xl text-muted-foreground group-hover:text-primary transition-all duration-200">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors">Add pet</span>
              </Link>
            </div>
          </div>
        )}

        {/* Service quick links */}
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map(({ icon: Icon, title, description, href, color, gradient }) => (
            <Link key={title} href={href} className="group">
              <Card className={`hover:shadow-md transition-all h-full border bg-gradient-to-br ${gradient}`}>
                <CardHeader className="pb-2">
                  <Icon className={`h-8 w-8 ${color}`} />
                  <CardTitle className="text-base mt-2">{title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* My Pets management tile */}
          <Link href="/pet/my" className="group">
            <Card className="hover:shadow-md transition-all h-full border border-dashed bg-gradient-to-br from-amber-500/10 to-amber-400/5 hover:border-amber-500/40">
              <CardHeader className="pb-2">
                <BookOpen className="h-8 w-8 text-amber-500" />
                <CardTitle className="text-base mt-2">
                  {pets.length > 0 ? `My Pets (${pets.length})` : "Add your pet"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {pets.length > 0 ? "Manage profiles & health info" : "Save your pet's profile"}
                </p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>

          {/* Support tile */}
          <Link href="/support" className="group">
            <Card className="hover:shadow-md transition-all h-full border border-dashed bg-gradient-to-br from-primary/5 to-primary/0 hover:border-primary/40">
              <CardHeader className="pb-2">
                <LifeBuoy className="h-8 w-8 text-primary" />
                <CardTitle className="text-base mt-2">Support</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Get help or report an issue</p>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </>
  );
}
