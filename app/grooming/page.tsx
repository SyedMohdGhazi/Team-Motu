"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MapPin,
  Clock,
  CheckCircle2,
  Home,
  Building2,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Mock data ────────────────────────────────────────────────────────────────
const VENDORS = [
  {
    id: "1",
    name: "Paws & Polish",
    address: "Near ISBT, Dehradun",
    distanceKm: 1.2,
    rating: 4.8,
    reviews: 94,
    priceFrom: 299,
    tags: ["Bath", "Haircut", "Nail Trim"],
    petTypes: ["dog", "cat"] as ("dog" | "cat")[],
    homeService: true,
    clinicVisit: true,
    image: null,
  },
  {
    id: "2",
    name: "FurEver Clean Grooming",
    address: "Clement Town, Dehradun",
    distanceKm: 2.1,
    rating: 4.5,
    reviews: 67,
    priceFrom: 249,
    tags: ["Full Package", "Bath", "Ear Cleaning"],
    petTypes: ["dog"] as ("dog")[],
    homeService: true,
    clinicVisit: false,
    image: null,
  },
  {
    id: "3",
    name: "The Kitty Spa",
    address: "Ballupur, Dehradun",
    distanceKm: 3.8,
    rating: 4.7,
    reviews: 45,
    priceFrom: 349,
    tags: ["Cat Specialist", "Bath", "Nail Trim"],
    petTypes: ["cat"] as ("cat")[],
    homeService: false,
    clinicVisit: true,
    image: null,
  },
  {
    id: "4",
    name: "Happy Tails Studio",
    address: "Race Course, Dehradun",
    distanceKm: 4.4,
    rating: 4.3,
    reviews: 38,
    priceFrom: 199,
    tags: ["Budget-friendly", "Bath", "Haircut"],
    petTypes: ["dog", "cat"] as ("dog" | "cat")[],
    homeService: true,
    clinicVisit: true,
    image: null,
  },
];

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "05:00 PM", "06:00 PM",
];

type BookingStep = 1 | 2 | 3 | 4;

interface BookingData {
  date: string;
  time: string;
  petName: string;
  petType: string;
  petBreed: string;
  petAge: string;
  notes: string;
}

// ─── Multi-step booking modal ────────────────────────────────────────────────
function BookingModal({
  vendor,
  serviceType,
  open,
  onClose,
}: {
  vendor: (typeof VENDORS)[0];
  serviceType: "home" | "clinic";
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<BookingStep>(1);
  const [data, setData] = useState<BookingData>({
    date: "",
    time: "",
    petName: "",
    petType: "",
    petBreed: "",
    petAge: "",
    notes: "",
  });
  const { toast } = useToast();

  function update(field: keyof BookingData, val: string) {
    setData((d) => ({ ...d, [field]: val }));
  }

  function handleConfirm() {
    toast({
      title: "Booking confirmed!",
      description: `${vendor.name} on ${data.date} at ${data.time}`,
    });
    onClose();
    setStep(1);
    setData({ date: "", time: "", petName: "", petType: "", petBreed: "", petAge: "", notes: "" });
  }

  const STEP_TITLES = ["Select Date & Time", "Pet Details", "Review & Confirm"];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Book {serviceType === "home" ? "Home Service" : "Clinic Visit"} —{" "}
            {vendor.name}
          </DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 pb-2">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 flex-1 rounded transition-colors ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-muted-foreground -mt-1">
          Step {step}: {STEP_TITLES[step - 1]}
        </p>

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Appointment date</Label>
              <Input
                type="date"
                value={data.date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => update("date", e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Time slot</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => update("time", t)}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                      data.time === t
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Pet details */}
        {step === 2 && (
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Pet name</Label>
                <Input
                  placeholder="Buddy"
                  value={data.petName}
                  onChange={(e) => update("petName", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Pet type</Label>
                <Select value={data.petType} onValueChange={(v) => update("petType", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
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
                <Input
                  placeholder="Golden Retriever"
                  value={data.petBreed}
                  onChange={(e) => update("petBreed", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Age (years)</Label>
                <Input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  placeholder="2"
                  value={data.petAge}
                  onChange={(e) => update("petAge", e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Notes (optional)</Label>
              <Input
                placeholder="Any special requirements…"
                value={data.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="rounded-xl border bg-muted/40 p-4 grid gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor</span>
              <span className="font-medium">{vendor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service type</span>
              <span className="font-medium capitalize">{serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & time</span>
              <span className="font-medium">{data.date} · {data.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pet</span>
              <span className="font-medium">
                {data.petName} ({data.petType}{data.petBreed ? `, ${data.petBreed}` : ""})
              </span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-muted-foreground">Estimated price</span>
              <span className="font-bold text-primary">₹{vendor.priceFrom}+</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as BookingStep)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as BookingStep)}
              disabled={
                (step === 1 && (!data.date || !data.time)) ||
                (step === 2 && (!data.petName || !data.petType))
              }
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
              Confirm booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Vendor card ──────────────────────────────────────────────────────────────
function VendorCard({
  vendor,
  activeTab,
}: {
  vendor: (typeof VENDORS)[0];
  activeTab: "home" | "clinic";
}) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const available =
    activeTab === "home" ? vendor.homeService : vendor.clinicVisit;

  if (!available) return null;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {/* Image placeholder */}
        <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <span className="text-4xl">🐾</span>
        </div>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-base">{vendor.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3" />
                {vendor.address} · {vendor.distanceKm} km
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{vendor.rating}</span>
              <span className="text-xs text-muted-foreground">({vendor.reviews})</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <div className="flex flex-wrap gap-1.5">
            {vendor.tags.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {vendor.homeService && (
              <span className="flex items-center gap-1">
                <Home className="h-3.5 w-3.5 text-primary" /> Home
              </span>
            )}
            {vendor.clinicVisit && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Clinic
              </span>
            )}
            <span className="flex items-center gap-1 ml-auto">
              <Clock className="h-3.5 w-3.5" /> 30–90 min
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="text-sm">
              From <strong className="text-primary">₹{vendor.priceFrom}</strong>
            </span>
            <Button size="sm" onClick={() => setBookingOpen(true)}>
              Book now
            </Button>
          </div>
        </CardContent>
      </Card>
      <BookingModal
        vendor={vendor}
        serviceType={activeTab}
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function GroomingPage() {
  const [activeTab, setActiveTab] = useState<"home" | "clinic">("home");
  const [petFilter, setPetFilter] = useState<"all" | "dog" | "cat">("all");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = VENDORS.filter((v) => {
    const serviceOk = activeTab === "home" ? v.homeService : v.clinicVisit;
    const petOk = petFilter === "all" || v.petTypes.includes(petFilter as "dog" | "cat");
    const priceOk = v.priceFrom <= maxPrice;
    return serviceOk && petOk && priceOk;
  });

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Pet Grooming & Spa</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Verified groomers near ISBT / Clement Town, Dehradun
          </p>
        </div>

        {/* Service type toggle */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "home" | "clinic")}
          className="mb-5"
        >
          <TabsList className="w-full">
            <TabsTrigger value="home" className="flex-1 gap-2">
              <Home className="h-4 w-4" /> Home Service at Doorstep
            </TabsTrigger>
            <TabsTrigger value="clinic" className="flex-1 gap-2">
              <Building2 className="h-4 w-4" /> Book Clinic Visit
            </TabsTrigger>
          </TabsList>

          {/* Filters bar */}
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {/* Pet type filter */}
            <div className="flex rounded-lg border overflow-hidden text-sm">
              {(["all", "dog", "cat"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPetFilter(p)}
                  className={`px-3 py-1.5 font-medium transition-colors capitalize ${
                    petFilter === p
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {p === "all" ? "All pets" : p === "dog" ? "🐶 Dogs" : "🐱 Cats"}
                </button>
              ))}
            </div>

            {/* Price filter toggle */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Price: ≤₹{maxPrice}
            </button>
          </div>

          {/* Expanded price filter */}
          {filtersOpen && (
            <div className="mt-3 rounded-xl border bg-muted/40 p-4">
              <Label className="text-sm font-semibold">Max price: ₹{maxPrice}</Label>
              <input
                type="range"
                min={100}
                max={2000}
                step={50}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-2 w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>₹100</span><span>₹2,000</span>
              </div>
            </div>
          )}

          <TabsContent value="home" className="mt-5">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No home service vendors match your filters.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((v) => (
                  <VendorCard key={v.id} vendor={v} activeTab="home" />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="clinic" className="mt-5">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-muted-foreground">
                No clinic vendors match your filters.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filtered.map((v) => (
                  <VendorCard key={v.id} vendor={v} activeTab="clinic" />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
