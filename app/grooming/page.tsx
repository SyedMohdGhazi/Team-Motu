"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
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
  SlidersHorizontal, ChevronRight, ChevronLeft, Loader2, Tag, ArrowLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const TIME_SLOTS = [
  "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM",
];

type BookingStep = 1 | 2 | 3;

interface VendorOffer {
  id: string;
  coupon_code: string;
  title: string;
  discount_type: "percentage" | "flat";
  discount_value: number;
  min_amount: number | null;
  valid_until: string | null;
}

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
  services?: { id: string; price: number; pet_type: string; service_type: string }[];
  primaryImage?: string | null;
  activeOffers?: VendorOffer[];
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
  const [couponCode, setCouponCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<VendorOffer | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const priceFrom = vendor.services?.length
    ? Math.min(...vendor.services.map((s) => s.price))
    : null;

  const discountAmount = appliedOffer
    ? appliedOffer.discount_type === "percentage"
      ? Math.round((priceFrom ?? 0) * appliedOffer.discount_value / 100)
      : appliedOffer.discount_value
    : 0;
  const finalPrice = Math.max(0, (priceFrom ?? 0) - discountAmount);

  function validateCoupon() {
    const code = couponCode.trim().toUpperCase();
    const offer = vendor.activeOffers?.find(
      (o) => o.coupon_code === code &&
        (!o.valid_until || new Date(o.valid_until) >= new Date())
    );
    if (!offer) {
      setCouponError("Invalid or expired coupon code");
      setAppliedOffer(null);
    } else if (offer.min_amount && (priceFrom ?? 0) < offer.min_amount) {
      setCouponError(`Minimum booking amount ₹${offer.min_amount} required`);
      setAppliedOffer(null);
    } else {
      setAppliedOffer(offer);
      setCouponError(null);
    }
  }

  function handleClose() {
    onClose();
    setStep(1); setDate(""); setTime(""); setPetName(""); setPetType(""); setPetBreed(""); setPetAge("");
    setCouponCode(""); setAppliedOffer(null); setCouponError(null);
  }

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("bookings") as any).insert({
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
      total_price: appliedOffer ? finalPrice : (priceFrom ?? 0),
      coupon_code: appliedOffer?.coupon_code ?? null,
      discount_amount: discountAmount,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Booking confirmed!", description: `${vendor.business_name} on ${date} at ${time}` });
      handleClose();
    }
  }

  const STEP_TITLES = ["Select Date & Time", "Pet Details", "Review & Confirm"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
          <div className="grid gap-4 py-2">
            <div className="rounded-xl border bg-muted/40 p-4 grid gap-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{vendor.business_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Service type</span><span className="font-medium capitalize">{serviceType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Date & time</span><span className="font-medium">{date} · {time}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pet</span><span className="font-medium">{petName} ({petType}{petBreed ? `, ${petBreed}` : ""})</span></div>
              {priceFrom != null && (
                <>
                  {appliedOffer && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedOffer.coupon_code})</span>
                      <span className="font-medium">−₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-muted-foreground">{appliedOffer ? "Final price" : "Estimated price"}</span>
                    <span className="font-bold text-primary">₹{appliedOffer ? finalPrice : priceFrom}+</span>
                  </div>
                </>
              )}
            </div>

            {(vendor.activeOffers?.length ?? 0) > 0 && (
              <div className="grid gap-2">
                <Label>Coupon code <span className="text-muted-foreground font-normal text-xs">(optional)</span></Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. SAVE20"
                    value={couponCode}
                    className="font-mono uppercase"
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setAppliedOffer(null);
                      setCouponError(null);
                    }}
                  />
                  <Button type="button" variant="outline" onClick={validateCoupon} disabled={!couponCode.trim()}>
                    Apply
                  </Button>
                </div>
                {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                {appliedOffer && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {appliedOffer.title}
                  </p>
                )}
              </div>
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
            <Button onClick={handleConfirm} disabled={loading} className="bg-gradient-to-r from-[#62C995] to-[#43B07A] text-white hover:opacity-90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirm booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VendorCard({ vendor, activeTab, isOwnVendor }: { vendor: Vendor; activeTab: "home" | "clinic"; isOwnVendor: boolean }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const priceFrom = vendor.services?.length ? Math.min(...vendor.services.map((s) => s.price)) : null;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
        <div className="h-40 bg-gradient-to-br from-[#62C995]/20 to-[#B8E8C9]/30 flex items-center justify-center overflow-hidden relative">
          {vendor.primaryImage ? (
            <img src={vendor.primaryImage} alt={vendor.business_name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 dark:bg-card/60 shadow-sm backdrop-blur-sm text-3xl">
              ✂️
            </div>
          )}
          {(vendor.activeOffers?.length ?? 0) > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
              {vendor.activeOffers!.slice(0, 1).map((offer) => (
                <span key={offer.id} className="inline-flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-2.5 py-0.5 text-xs font-semibold text-white">
                  <Tag className="h-3 w-3" />
                  {offer.discount_type === "percentage" ? `${offer.discount_value}% off` : `₹${offer.discount_value} off`}
                </span>
              ))}
            </div>
          )}
        </div>

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
            {isOwnVendor ? (
              <Button size="sm" variant="outline" disabled>Your business</Button>
            ) : (
              <Button size="sm" onClick={() => setBookingOpen(true)} disabled={!vendor.services?.length}>Book now</Button>
            )}
          </div>
        </CardContent>
      </Card>
      {bookingOpen && !isOwnVendor && (
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [{ data: { user } }, { data: vendorData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("grooming_vendors")
          .select("*, services(id, price, pet_type, service_type)")
          .eq("is_active", true)
          .order("rating", { ascending: false }),
      ]);
      setCurrentUserId(user?.id ?? null);

      const vendorList = (vendorData as Vendor[]) ?? [];
      if (vendorList.length === 0) {
        setVendors([]);
        setLoading(false);
        return;
      }

      const vendorIds = vendorList.map((v) => v.id);
      const [{ data: imagesData }, { data: offersData }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("vendor_images") as any)
          .select("vendor_id, image_url, is_primary")
          .eq("vendor_type", "grooming")
          .in("vendor_id", vendorIds),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("vendor_offers") as any)
          .select("id, vendor_id, coupon_code, title, discount_type, discount_value, min_amount, valid_until")
          .eq("vendor_type", "grooming")
          .eq("is_active", true)
          .in("vendor_id", vendorIds),
      ]);

      // Build lookup maps
      const imageMap: Record<string, string | null> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (imagesData as any[] ?? []).forEach((img: any) => {
        if (img.is_primary || !imageMap[img.vendor_id]) {
          imageMap[img.vendor_id] = img.image_url;
        }
      });

      const offersMap: Record<string, VendorOffer[]> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (offersData as any[] ?? []).forEach((o: any) => {
        if (!offersMap[o.vendor_id]) offersMap[o.vendor_id] = [];
        offersMap[o.vendor_id].push(o);
      });

      setVendors(vendorList.map((v) => ({
        ...v,
        primaryImage: imageMap[v.id] ?? null,
        activeOffers: offersMap[v.id] ?? [],
      })));
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
          <TabsList className="w-full">
            <TabsTrigger value="home" className="flex-1 gap-2"><Home className="h-4 w-4" /> Home Service at Doorstep</TabsTrigger>
            <TabsTrigger value="clinic" className="flex-1 gap-2"><Building2 className="h-4 w-4" /> Book Clinic Visit</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {(["all", "dog", "cat"] as const).map((p) => (
                <button key={p} onClick={() => setPetFilter(p)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all border ${petFilter === p ? "bg-[#62C995] text-white border-[#62C995] shadow-sm" : "border-border/60 hover:border-[#62C995]/40 hover:bg-accent"}`}>
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
                  {filtered.map((v) => <VendorCard key={v.id} vendor={v} activeTab={tab} isOwnVendor={currentUserId === v.user_id} />)}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </>
  );
}
