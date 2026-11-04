"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, PawPrint, CalendarDays, ArrowRight, Plus, BookOpen } from "lucide-react";
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
      color: "text-[#62C995]",
      gradient: "from-[#62C995]/20 to-[#B8E8C9]/30",
    },
    {
      icon: PawPrint,
      title: "Find a Walker",
      description: activePet?.type === "dog"
        ? `Walks for ${activePet.name}`
        : "Daily walks near you",
      href: "/pet-walking",
      color: "text-[#FFAA62]",
      gradient: "from-[#FFAA62]/20 to-[#FFD966]/30",
    },
    {
      icon: CalendarDays,
      title: "My Bookings",
      description: "View appointments",
      href: "/dashboard/bookings",
      color: "text-[#62C995]",
      gradient: "from-[#62C995]/15 to-[#B8E8C9]/20",
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
            <p className="text-sm font-medium mt-1" style={{ color: "#62C995" }}>
              Caring for {activePet.name} today
              {activePet.breed ? ` · ${activePet.breed}` : ""} {PET_EMOJI[activePet.type] ?? "🐾"}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground mt-1">What do you need today?</p>
          )}
        </div>

        {/* Pet circles */}
        {!loading && (
          <div className="mb-8 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">My Pets</p>
              <Link href="/pet/my" className="text-xs text-primary hover:underline font-medium">Manage →</Link>
            </div>
            <div className="flex items-start gap-4 overflow-x-auto pb-2 no-scrollbar">
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
                        ? "border-[#62C995] bg-[#62C995]/15 shadow-lg shadow-[#62C995]/30 scale-110 ring-2 ring-[#62C995]/20 ring-offset-2"
                        : "border-border bg-card hover:border-[#62C995]/50 hover:scale-105 hover:shadow-md"
                    }`}>
                      {PET_EMOJI[pet.type] ?? "🐾"}
                    </div>
                    <span className={`text-xs font-semibold max-w-[72px] truncate transition-colors ${
                      isActive ? "text-[#35443B] dark:text-[#d4f0e3]" : "text-muted-foreground"
                    }`}>
                      {pet.name}
                    </span>
                  </button>
                );
              })}

              {/* Add pet circle */}
              <Link href="/pet/new" className="flex flex-col items-center gap-2 shrink-0 group">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-card hover:border-[#62C995]/60 hover:bg-[#62C995]/8 text-2xl text-muted-foreground group-hover:text-[#62C995] transition-all duration-200">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-[#62C995] transition-colors">Add pet</span>
              </Link>
            </div>
          </div>
        )}

        {/* Service quick links */}
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map(({ icon: Icon, title, description, href, color, gradient }) => (
            <Link key={title} href={href} className="group">
              <Card className={`hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full border bg-gradient-to-br ${gradient}`}>
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
            <Card className="hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 h-full border border-dashed bg-gradient-to-br from-[#FFD966]/15 to-[#FFAA62]/15 hover:border-[#FFAA62]/50">
              <CardHeader className="pb-2">
                <BookOpen className="h-8 w-8 text-[#FFAA62]" />
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
        </div>
      </main>
    </>
  );
}
