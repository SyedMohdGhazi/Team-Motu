"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Phone, MapPin, Globe, Mail, AlertTriangle,
  ExternalLink, Loader2, Plus, ChevronLeft, ChevronRight,
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
  photos: string[] | null;
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

function PhotoCarousel({ photos }: { photos: string[] }) {
  const [idx, setIdx] = useState(0);
  if (photos.length === 0) return null;
  return (
    <div className="relative h-44 w-full overflow-hidden bg-muted">
      <img
        src={photos[idx]}
        alt="Shelter photo"
        className="h-full w-full object-cover transition-opacity duration-300"
      />
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + photos.length) % photos.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % photos.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SheltersPage() {
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("shelters") as any)
        .select("*")
        .eq("is_active", true)
        .order("name");
      setShelters((data as Shelter[]) ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const helplines = shelters.filter((s) => s.emergency_helpline);

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Foster Homes & Daycare</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Shelters, foster homes, and NGOs in Dehradun
            </p>
          </div>
          <Button size="sm" asChild className="shrink-0">
            <Link href="/shelter/register">
              <Plus className="h-4 w-4 mr-1" /> Add shelter
            </Link>
          </Button>
        </div>

        {/* Emergency helplines */}
        {helplines.length > 0 && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/30 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
              <h2 className="font-bold text-amber-800 dark:text-amber-200">Emergency Helplines</h2>
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

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : shelters.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🏠</p>
            <p className="font-medium">No shelters registered yet</p>
            <p className="text-sm mt-2">
              Run a shelter or foster home?{" "}
              <Link href="/shelter/register" className="text-primary underline">Add yours here</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {shelters.map((s) => {
              const photos = s.photos?.filter(Boolean) ?? [];
              return (
                <Card key={s.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {photos.length > 0 ? (
                    <PhotoCarousel photos={photos} />
                  ) : (
                    <div className="h-28 bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-950/40 dark:to-pink-950/40 flex items-center justify-center text-5xl">
                      🏠
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base">{s.name}</h3>
                          {s.is_ngo && <Badge variant="secondary" className="text-xs">NGO</Badge>}
                        </div>
                        {s.address && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />{s.address}
                          </p>
                        )}
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
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
