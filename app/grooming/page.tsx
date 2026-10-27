"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Star, MapPin, Clock, CheckCircle2, Home, Building2,
  SlidersHorizontal, ChevronRight, ChevronLeft, Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const TIME_SLOTS = [
  "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM",
];

type BookingStep = 1 | 2 | 3;

interface Vendor {
  id: string;
  business_name: string;
  address: string | null;
  city: string | null;
  rating: number;
  total_reviews: number;
  offers_home_service: boolean;
  offers_clinic_visit: boolean;
  services?: { price: number; pet_type: string; service_type: string }[];
}

function BookingModal({ vendor, serviceType, open, onClose }: {
  vendor: Vendor; serviceType: "home" | "clinic"; open: boolean; onClose: () => void;
}) {
  const [step, setStep] = useState<BookingStep>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const priceFrom = vendor.services?.length
    ? Math.min(...vendor.services.map((s) => s.price))
    : null;

  async function handleConfirm() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to book", variant: "destructive" });
      setLoading(false);
      return;
    }
    const service = vendor.services?.[0];
    if (!service) {
      toast({ title: "No services available", variant: "destructive" });
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("bookings").insert({
      user_id: user.id,
      vendor_id: vendor.id,
      service_id: service.id ?? "",
      pet_name: petName,
      pet_type: petType as "dog" | "cat" | "other",
      pet_breed: petBreed || null,
      pet_age_years: petAge ? parseFloat(petAge) : null,
      appointment_date: date,
      appointment_time: time,
      booking_type: serviceType,
      total_price: priceFrom ?? 0,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking confirmed!", description: `${vendor.business_name} on ${date} at ${time}` });
      onClose();
      setStep(1); setDate(""); setTime(""); setPetName(""); setPetType(""); setPetBreed(""); setPetAge("");
    }
  }

  const STEP_TITLES = ["Select Date & Time", "Pet Details", "Review & Confirm"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book {serviceType === "home" ? "Home Service" : "Clinic Visit"} — {vendor.business_name}</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-1 pb-2">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 flex-1 rounded transition-colors ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-muted-foreground -mt-1">Step {step}: {STEP_TITLES[step - 1]}</p>

        {step === 1 && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Appointment date</Label>
              <Input type="date" value={date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Time slot</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button key={t} onClick={() => setTime(t)} className={`rounded-lg border py-2 text-sm font-medium transition-colors ${time === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Pet name</Label>
                <Input placeholder="Buddy" value={petName} onChange={(e) => setPetName(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Pet type</Label>
                <Select value={petType} onValueChange={setPetType}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dog">Dog</SelectItem>
                    <SelectItem value="cat">Cat</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Breed (optional)</Label>
                <Input placeholder="Golden Retriever" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Age (years)</Label>
                <Input type="number" min="0" max="30" step="0.5" placeholder="2" value={petAge} onChange={(e) => setPetAge(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border bg-muted/40 p-4 grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{vendor.business_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service type</span><span className="font-medium capitalize">{serviceType}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date & time</span><span className="font-medium">{date} · {time}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pet</span><span className="font-medium">{petName} ({petType}{petBreed ? `, ${petBreed}` : ""})</span></div>
            {priceFrom && (
              <div className="flex justify-between border-t pt-3"><span className="text-muted-foreground">Estimated price</span><span className="font-bold text-primary">₹{priceFrom}+</span></div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as BookingStep)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep((s) => (s + 1) as BookingStep)} disabled={(step === 1 && (!date || !time)) || (step === 2 && (!petName || !petType))}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirm booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VendorCard({ vendor, activeTab }: { vendor: Vendor; activeTab: "home" | "clinic" }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const priceFrom = vendor.services?.length ? Math.min(...vendor.services.map((s) => s.price)) : null;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-4xl">🐾</div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base">{vendor.business_name}</h3>
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
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="text-sm">
              {priceFrom ? <>From <strong className="text-primary">₹{priceFrom}</strong></> : <span className="text-muted-foreground text-xs">No services listed yet</span>}
            </span>
            <Button size="sm" onClick={() => setBookingOpen(true)} disabled={!vendor.services?.length}>Book now</Button>
          </div>
        </CardContent>
      </Card>
      {bookingOpen && (
        <BookingModal vendor={vendor} serviceType={activeTab} open={bookingOpen} onClose={() => setBookingOpen(false)} />
      )}
    </>
  );
}

export default function GroomingPage() {
  const [activeTab, setActiveTab] = useState<"home" | "clinic">("home");
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchVendors() {
      setLoading(true);
      const { data } = await supabase
        .from("grooming_vendors")
        .select("*, services(id, price, pet_type, service_type)")
        .eq("is_active", true)
        .order("rating", { ascending: false });
      setVendors((data as Vendor[]) ?? []);
      setLoading(false);
    }
    fetchVendors();
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pet Grooming & Spa</h1>
          <p className="text-sm text-muted-foreground mt-1">Verified groomers near ISBT / Clement Town, Dehradun</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "home" | "clinic")} className="mb-5">
          <TabsList className="w-full">
            <TabsTrigger value="home" className="flex-1 gap-2"><Home className="h-4 w-4" /> Home Service at Doorstep</TabsTrigger>
            <TabsTrigger value="clinic" className="flex-1 gap-2"><Building2 className="h-4 w-4" /> Book Clinic Visit</TabsTrigger>
          </TabsList>

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
                  {filtered.map((v) => <VendorCard key={v.id} vendor={v} activeTab={tab} />)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
}
