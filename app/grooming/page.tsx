"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Star, MapPin, Clock, Home, Building2,
  SlidersHorizontal, Loader2, ExternalLink, ArrowLeft, ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  address: string | null;
  city: string | null;
  rating: number;
  total_reviews: number;
  offers_home_service: boolean;
  offers_clinic_visit: boolean;
  maps_url: string | null;
  services?: { id: string; price: number; pet_type: string; service_type: string }[];
}

function VendorCard({ vendor, isOwnVendor }: { vendor: Vendor; isOwnVendor: boolean }) {
  const priceFrom = vendor.services?.length ? Math.min(...vendor.services.map((s) => s.price)) : null;
  const href = isOwnVendor ? "/vendor/dashboard" : `/grooming/${vendor.id}`;

  return (
    <Link href={href} className="block group">
      <Card className="overflow-hidden hover:shadow-md transition-all duration-200 group-hover:-translate-y-0.5 cursor-pointer">
        <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-4xl">🐾</div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base group-hover:text-primary transition-colors">{vendor.business_name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />{vendor.address ?? vendor.city ?? "Dehradun"}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{vendor.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({vendor.total_reviews})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {vendor.offers_home_service && <span className="flex items-center gap-1"><Home className="h-3.5 w-3.5 text-primary" /> Home</span>}
            {vendor.offers_clinic_visit && <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-primary" /> Clinic</span>}
            <span className="flex items-center gap-1 ml-auto"><Clock className="h-3.5 w-3.5" /> 30–90 min</span>
          </div>
          {vendor.offers_clinic_visit && vendor.maps_url && (
            <a
              href={vendor.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline w-fit"
            >
              <MapPin className="h-3.5 w-3.5" /> View on Maps <ExternalLink className="h-3 w-3" />
            </a>
          )}
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="text-sm">
              {priceFrom
                ? <>From <strong className="text-primary">₹{priceFrom}</strong></>
                : <span className="text-muted-foreground text-xs">No services listed yet</span>}
            </span>
            {isOwnVendor ? (
              <span className="text-xs text-muted-foreground font-medium">Your business →</span>
            ) : (
              <span className="text-xs font-semibold text-primary flex items-center gap-1">
                View details <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function GroomingPage() {
  const [activeTab, setActiveTab] = useState<"home" | "clinic">("home");
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [{ data: { user } }, { data }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("grooming_vendors")
          .select("*, services(id, price, pet_type, service_type)")
          .eq("is_active", true)
          .order("rating", { ascending: false }),
      ]);
      setCurrentUserId(user?.id ?? null);
      setVendors((data as Vendor[]) ?? []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const filtered = vendors.filter((v) => {
    const serviceOk = activeTab === "home" ? v.offers_home_service : v.offers_clinic_visit;
    const petOk = petFilter === "all" || v.services?.some((s) => s.pet_type === petFilter || s.pet_type === "both");
    const priceOk = !v.services?.length || Math.min(...v.services.map((s) => s.price)) <= maxPrice;
    return serviceOk && petOk && priceOk;
  });

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Grooming Spas & Salons</h1>
          <p className="text-sm text-muted-foreground mt-1">Verified groomers near Dehradun</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "home" | "clinic")} className="mb-5">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex h-10 w-max min-w-full">
              <TabsTrigger value="home" className="flex-1 shrink-0 gap-2"><Home className="h-4 w-4" /> Home Service at Doorstep</TabsTrigger>
              <TabsTrigger value="clinic" className="flex-1 shrink-0 gap-2"><Building2 className="h-4 w-4" /> Book Clinic Visit</TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <div className="flex rounded-lg border overflow-hidden text-sm">
              {(["all", "dog", "cat"] as const).map((p) => (
                <button key={p} onClick={() => setPetFilter(p)} className={`px-3 py-1.5 font-medium transition-colors capitalize ${petFilter === p ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}>
                  {p === "all" ? "All pets" : p === "dog" ? "🐶 Dogs" : "🐱 Cats"}
                </button>
              ))}
            </div>
            <button onClick={() => setFiltersOpen((o) => !o)} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> Price: ≤₹{maxPrice}
            </button>
          </div>

          {filtersOpen && (
            <div className="mt-3 rounded-xl border bg-muted/40 p-4">
              <Label className="text-sm font-semibold">Max price: ₹{maxPrice}</Label>
              <input type="range" min={100} max={2000} step={50} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="mt-2 w-full accent-primary" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>₹100</span><span>₹2,000</span></div>
            </div>
          )}

          {(["home", "clinic"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-5">
              {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <p className="text-4xl mb-3">🐾</p>
                  <p className="font-medium">No vendors listed yet</p>
                  <p className="text-sm mt-1">Be the first! <a href="/vendor/dashboard" className="text-primary underline">Register your grooming business</a></p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {filtered.map((v) => <VendorCard key={v.id} vendor={v} isOwnVendor={currentUserId === v.user_id} />)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
}
