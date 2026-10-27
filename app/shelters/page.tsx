"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Phone,
  MapPin,
  Globe,
  Mail,
  AlertTriangle,
  Heart,
  Users,
  ExternalLink,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────
const SHELTERS = [
  {
    id: "1",
    name: "Dehradun Animal Rescue",
    description:
      "Largest animal rescue organisation in Dehradun. Providing shelter, food, and medical care to over 200 animals. Active adoption drives every Sunday.",
    address: "Near Forest Research Institute, Dehradun",
    city: "Dehradun",
    phone: "+91-7895-001122",
    email: "info@dehr escueanimals.org",
    website: "https://example.com",
    emergencyHelpline: "1800-XXX-0001",
    capacity: 300,
    currentOccupancy: 210,
    isNgo: true,
    isActive: true,
    animalsAvailable: 18,
  },
  {
    id: "2",
    name: "Clement Town Pet Shelter",
    description:
      "Community-run shelter near ISBT Dehradun focused on dog and cat welfare. Walk-in adoption open daily 10am–6pm.",
    address: "Clement Town, Dehradun",
    city: "Dehradun",
    phone: "+91-8765-334455",
    email: "adopt@clementtownpets.in",
    website: null,
    emergencyHelpline: "8765-334455",
    capacity: 120,
    currentOccupancy: 87,
    isNgo: false,
    isActive: true,
    animalsAvailable: 11,
  },
  {
    id: "3",
    name: "Prani Animal Welfare Society",
    description:
      "NGO working on stray animal sterilisation and vaccination drives. Also houses abandoned pets and facilitates adoptions.",
    address: "Rajpur Road, Dehradun",
    city: "Dehradun",
    phone: "+91-9876-221100",
    email: "prani@example.org",
    website: "https://example.com",
    emergencyHelpline: "1800-XXX-0002",
    capacity: 80,
    currentOccupancy: 72,
    isNgo: true,
    isActive: true,
    animalsAvailable: 6,
  },
];

const ANIMALS = [
  { id: "a1", shelterId: "1", name: "Max", species: "dog", breed: "Indie Mix", age: 2, gender: "male", vaccinated: true, neutered: true, description: "Friendly and playful. Loves fetch.", image: null },
  { id: "a2", shelterId: "1", name: "Bella", species: "cat", breed: "Tabby", age: 1.5, gender: "female", vaccinated: true, neutered: false, description: "Calm and affectionate. Great with kids.", image: null },
  { id: "a3", shelterId: "2", name: "Bruno", species: "dog", breed: "Labrador Mix", age: 3, gender: "male", vaccinated: true, neutered: true, description: "Well-trained, house-broken. Looking for a loving home.", image: null },
  { id: "a4", shelterId: "2", name: "Luna", species: "cat", breed: "Persian Mix", age: 0.5, gender: "female", vaccinated: true, neutered: false, description: "Tiny kitten rescued from the streets.", image: null },
  { id: "a5", shelterId: "3", name: "Rocky", species: "dog", breed: "German Shepherd Mix", age: 4, gender: "male", vaccinated: true, neutered: true, description: "Smart and loyal. Needs an experienced owner.", image: null },
  { id: "a6", shelterId: "1", name: "Mimi", species: "cat", breed: "Siamese Mix", age: 2.5, gender: "female", vaccinated: true, neutered: true, description: "Vocal and curious. Perfect apartment companion.", image: null },
];

const NGO_HELPLINES = [
  { name: "Dehradun Animal Rescue", number: "1800-XXX-0001", available: "24/7" },
  { name: "Prani Welfare Society", number: "1800-XXX-0002", available: "8am – 10pm" },
  { name: "SPCA Uttarakhand", number: "+91-135-271-XXXX", available: "9am – 6pm" },
  { name: "National Animal Helpline", number: "1962", available: "24/7" },
];

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
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function SheltersPage() {
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");

  const filteredAnimals = ANIMALS.filter(
    (a) => petFilter === "all" || a.species === petFilter
  );

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Animal Shelters & Adoption</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Local shelters, NGOs, and pets available for adoption near Clement Town / ISBT, Dehradun
          </p>
        </div>

        {/* Emergency helplines */}
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <h2 className="font-bold text-amber-800 dark:text-amber-200">
              Emergency NGO Helplines
            </h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {NGO_HELPLINES.map((h) => (
              <div
                key={h.name}
                className="flex items-center justify-between rounded-lg bg-white dark:bg-background border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.available}</p>
                </div>
                <a
                  href={`tel:${h.number}`}
                  className="flex items-center gap-1 text-sm font-bold text-primary hover:underline"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {h.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="shelters">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="shelters" className="flex-1">Shelter Directory</TabsTrigger>
            <TabsTrigger value="adopt" className="flex-1 gap-2">
              <Heart className="h-4 w-4" /> Pets for Adoption
            </TabsTrigger>
          </TabsList>

          {/* Shelter directory */}
          <TabsContent value="shelters" className="grid gap-4">
            {SHELTERS.map((s) => (
              <Card key={s.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-base">{s.name}</h3>
                        {s.isNgo && (
                          <Badge variant="secondary" className="text-xs">NGO</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {s.address}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">{s.animalsAvailable}</p>
                      <p className="text-xs text-muted-foreground">for adoption</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 grid gap-3">
                  <p className="text-sm text-muted-foreground">{s.description}</p>
                  <OccupancyBar current={s.currentOccupancy} capacity={s.capacity} />
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground pt-1 border-t">
                    <a href={`tel:${s.phone}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Phone className="h-3.5 w-3.5" />{s.phone}
                    </a>
                    <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Mail className="h-3.5 w-3.5" />{s.email}
                    </a>
                    {s.website && (
                      <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                        <Globe className="h-3.5 w-3.5" />Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {s.emergencyHelpline && (
                      <span className="flex items-center gap-1 text-amber-600 font-medium">
                        <AlertTriangle className="h-3.5 w-3.5" />Helpline: {s.emergencyHelpline}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Adoption listings */}
          <TabsContent value="adopt">
            {/* Pet type filter */}
            <div className="flex rounded-lg border overflow-hidden text-sm mb-5 w-fit">
              {(["all", "dog", "cat"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPetFilter(p)}
                  className={`px-4 py-1.5 font-medium transition-colors capitalize ${
                    petFilter === p
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {p === "all" ? "All pets" : p === "dog" ? "🐶 Dogs" : "🐱 Cats"}
                </button>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredAnimals.map((a) => (
                <Card key={a.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-28 bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-950 dark:to-pink-950 flex items-center justify-center text-5xl">
                    {a.species === "dog" ? "🐶" : "🐱"}
                  </div>
                  <CardContent className="p-4 grid gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold">{a.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {a.breed} · {a.age} yr · {a.gender}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {a.vaccinated && <Badge variant="secondary" className="text-xs">Vaccinated</Badge>}
                        {a.neutered && <Badge variant="outline" className="text-xs">Neutered</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {SHELTERS.find((s) => s.id === a.shelterId)?.name}
                      </span>
                      <Button size="sm" variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700">
                        <Heart className="h-3.5 w-3.5 mr-1" /> Adopt
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
