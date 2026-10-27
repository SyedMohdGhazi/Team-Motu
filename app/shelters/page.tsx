"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Phone, MapPin, Globe, Mail, AlertTriangle,
  Heart, Users, ExternalLink, Loader2, Plus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Shelter {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website_url: string | null;
  emergency_helpline: string | null;
  capacity: number | null;
  current_occupancy: number | null;
  is_ngo: boolean;
}

interface Animal {
  id: string;
  shelter_id: string | null;
  name: string;
  species: string;
  breed: string | null;
  age_years: number | null;
  gender: string | null;
  description: string | null;
  is_vaccinated: boolean;
  is_neutered: boolean;
  image_url: string | null;
  shelters?: { name: string } | null;
}

function OccupancyBar({ current, capacity }: { current: number; capacity: number }) {
  const pct = Math.round((current / capacity) * 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Occupancy</span>
        <span>{current}/{capacity} ({pct}%)</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SheltersPage() {
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [{ data: shelterData }, { data: animalData }] = await Promise.all([
        supabase.from("shelters").select("*").eq("is_active", true).order("name"),
        supabase.from("shelter_animals").select("*, shelters(name)").eq("adoption_status", "available"),
      ]);
      setShelters((shelterData as Shelter[]) ?? []);
      setAnimals((animalData as Animal[]) ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const helplines = shelters.filter((s) => s.emergency_helpline);
  const filteredAnimals = animals.filter(
    (a) => petFilter === "all" || a.species === petFilter
  );

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Animal Shelters & Adoption</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Shelters, foster homes, and NGOs near Clement Town / ISBT, Dehradun
          </p>
        </div>

        {/* Emergency helplines — only shown if shelters have listed one */}
        {helplines.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-bold text-amber-800 dark:text-amber-200">
                Emergency Helplines
              </h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {helplines.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg bg-white dark:bg-background border px-3 py-2"
                >
                  <p className="text-sm font-medium">{s.name}</p>
                  <a
                    href={`tel:${s.emergency_helpline}`}
                    className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {s.emergency_helpline}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="shelters">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="shelters" className="flex-1">Shelter Directory</TabsTrigger>
            <TabsTrigger value="adopt" className="flex-1 gap-2">
              <Heart className="h-4 w-4" /> Pets for Adoption
            </TabsTrigger>
          </TabsList>

          {/* Shelter directory */}
          <TabsContent value="shelters">
            <div className="flex justify-end mb-4">
              <Button size="sm" asChild>
                <Link href="/shelter/register">
                  <Plus className="h-4 w-4 mr-1" /> Add shelter
                </Link>
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : shelters.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-4xl mb-3">🏠</p>
                <p className="font-medium">No shelters registered yet</p>
                <p className="text-sm mt-2">
                  Run a shelter or foster home?{" "}
                  <Link href="/shelter/register" className="text-primary underline">
                    Add yours here
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {shelters.map((s) => (
                  <Card key={s.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base">{s.name}</h3>
                            {s.is_ngo && (
                              <Badge variant="secondary" className="text-xs">NGO</Badge>
                            )}
                          </div>
                          {s.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />{s.address}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-primary">
                            {animals.filter((a) => a.shelter_id === s.id).length}
                          </p>
                          <p className="text-xs text-muted-foreground">for adoption</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 grid gap-3">
                      {s.description && (
                        <p className="text-sm text-muted-foreground">{s.description}</p>
                      )}
                      {s.capacity != null && s.current_occupancy != null && (
                        <OccupancyBar current={s.current_occupancy} capacity={s.capacity} />
                      )}
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1 border-t">
                        {s.phone && (
                          <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Phone className="h-3.5 w-3.5" />{s.phone}
                          </a>
                        )}
                        {s.email && (
                          <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Mail className="h-3.5 w-3.5" />{s.email}
                          </a>
                        )}
                        {s.website_url && (
                          <a href={s.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                            <Globe className="h-3.5 w-3.5" />Website
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {s.emergency_helpline && (
                          <span className="flex items-center gap-1 text-amber-600 font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Helpline: {s.emergency_helpline}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Adoption listings */}
          <TabsContent value="adopt">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex rounded-lg border overflow-hidden text-sm w-fit">
                {(["all", "dog", "cat"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPetFilter(p)}
                    className={`px-4 py-1.5 font-medium transition-colors ${
                      petFilter === p ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                    }`}
                  >
                    {p === "all" ? "All pets" : p === "dog" ? "🐶 Dogs" : "🐱 Cats"}
                  </button>
                ))}
              </div>
              <Button size="sm" asChild>
                <Link href="/pet/add">
                  <Plus className="h-4 w-4 mr-1" /> Add pet for adoption
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAnimals.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-4xl mb-3">🐾</p>
                <p className="font-medium">No animals listed for adoption yet</p>
                <p className="text-sm mt-2">
                  Have a pet in need of a home?{" "}
                  <Link href="/pet/add" className="text-primary underline">
                    List them here
                  </Link>
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredAnimals.map((a) => (
                  <Card key={a.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {a.image_url ? (
                      <img src={a.image_url} alt={a.name} className="h-36 w-full object-cover" />
                    ) : (
                      <div className="h-28 bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-950 dark:to-pink-950 flex items-center justify-center text-5xl">
                        {a.species === "dog" ? "🐶" : a.species === "cat" ? "🐱" : "🐾"}
                      </div>
                    )}
                    <CardContent className="p-4 grid gap-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold">{a.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {[a.breed, a.age_years ? `${a.age_years} yr` : null, a.gender]
                              .filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-wrap justify-end">
                          {a.is_vaccinated && (
                            <Badge variant="secondary" className="text-xs">Vaccinated</Badge>
                          )}
                          {a.is_neutered && (
                            <Badge variant="outline" className="text-xs">Neutered</Badge>
                          )}
                        </div>
                      </div>
                      {a.description && (
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />{a.shelters?.name ?? "Independent"}
                        </span>
                        <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                          <Heart className="h-3.5 w-3.5 mr-1" /> Adopt
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
