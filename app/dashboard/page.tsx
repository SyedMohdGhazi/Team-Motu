"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, PawPrint, CalendarDays, ArrowRight, PlusCircle, PencilLine } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface UserPet {
  id: string;
  name: string;
  type: string;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [pet, setPet] = useState<UserPet | null | undefined>(undefined); // undefined = still loading
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from("users") as any)
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (profile?.full_name) setUserName(profile.full_name);

      // Fetch pet profile (one per user)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: petData } = await (supabase.from("user_pets") as any)
        .select("id, name, type")
        .eq("user_id", user.id)
        .maybeSingle();
      setPet(petData ?? null);
    }
    load();
  }, []);

  const firstName = userName ? userName.split(" ")[0] : null;

  const quickLinks = [
    {
      icon: Scissors,
      title: "Book Grooming",
      description: "At-home or salon visits",
      href: "/grooming",
      color: "text-blue-500",
    },
    {
      icon: PawPrint,
      title: "Find a Walker",
      description: "Daily walks near you",
      href: "/pet-walking",
      color: "text-amber-500",
    },
    {
      icon: CalendarDays,
      title: "My Bookings",
      description: "View appointments",
      href: "/dashboard/bookings",
      color: "text-violet-500",
    },
  ];

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {firstName ? `Hello, ${firstName} 👋` : "Hello there 👋"}
          </h1>
          <p className="text-muted-foreground mt-1">What do you need today?</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map(({ icon: Icon, title, description, href, color }) => (
            <Link key={title} href={href} className="group">
              <Card className="hover:shadow-md transition-shadow h-full">
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

          {/* Pet tile — always visible, changes based on whether pet exists */}
          {pet !== undefined && (
            <Link href="/pet/my" className="group">
              <Card className="hover:shadow-md transition-shadow h-full border-dashed">
                <CardHeader className="pb-2">
                  {pet ? (
                    <PencilLine className="h-8 w-8 text-rose-500" />
                  ) : (
                    <PlusCircle className="h-8 w-8 text-rose-500" />
                  )}
                  <CardTitle className="text-base mt-2">
                    {pet ? `My Pet: ${pet.name}` : "Add your pet"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {pet ? "Edit pet details" : "Save your pet's profile"}
                  </p>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
