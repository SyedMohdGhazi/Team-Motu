"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft, Star, MapPin, Home, Building2, Clock,
  ExternalLink, CheckCircle2, ChevronLeft, ChevronRight, Loader2, CalendarDays,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface VendorDetail {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  rating: number;
  total_reviews: number;
  offers_home_service: boolean;
  offers_clinic_visit: boolean;
  maps_url: string | null;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  category: string;
  pet_type: string;
  service_type: string;
  description: string | null;
}

interface UserPet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
}

const TIME_SLOTS = [
  "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "02:00 PM","03:00 PM","04:00 PM","05:00 PM","06:00 PM",
];

const PET_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", rabbit: "🐰", bird: "🐦", other: "🐾",
};

function formatCategory(c: string) {
  return c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function isSlotAvailable(slot: string, selectedDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  if (selectedDate !== today) return true;
  const now = new Date();
  const [timePart, meridiem] = slot.split(" ");
  const [h, m] = timePart.split(":").map(Number);
  let hour = h;
  if (meridiem === "PM" && h !== 12) hour += 12;
  if (meridiem === "AM" && h === 12) hour = 0;
  const slotTime = new Date();
  slotTime.setHours(hour, m, 0, 0);
  return slotTime > now;
}

type BookingStep = 1 | 2 | 3;

function BookingModal({
  vendor, services, savedPets, open, onClose,
}: {
  vendor: VendorDetail;
  services: Service[];
  savedPets: UserPet[];
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id ?? "");
  const [bookingType, setBookingType] = useState<"home" | "clinic">("home");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petAge, setPetAge] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? services[0];

  function handlePetSelect(petId: string) {
    setSelectedPetId(petId);
    if (petId === "__manual__") {
      setPetName(""); setPetType(""); setPetBreed(""); setPetAge("");
      return;
    }
    const pet = savedPets.find((p) => p.id === petId);
    if (pet) {
      setPetName(pet.name);
      setPetType(pet.type === "rabbit" || pet.type === "bird" ? "other" : pet.type);
      setPetBreed(pet.breed ?? "");
      setPetAge(pet.age_years?.toString() ?? "");
    }
  }

  function handleClose() {
    onClose();
    setStep(1); setDate(""); setTime(""); setSelectedPetId("");
    setPetName(""); setPetType(""); setPetBreed(""); setPetAge("");
  }

  const resolvedBookingType =
    selectedService?.service_type === "both" ? bookingType : (selectedService?.service_type as "home" | "clinic");

  async function handleConfirm() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to book", variant: "destructive" });
      setLoading(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("bookings") as any).insert({
      user_id: user.id,
      vendor_id: vendor.id,
      service_id: selectedService.id,
      pet_name: petName,
      pet_type: petType as "dog" | "cat" | "other",
      pet_breed: petBreed || null,
      pet_age_years: petAge ? parseFloat(petAge) : null,
      appointment_date: date,
      appointment_time: time,
      booking_type: resolvedBookingType,
      total_price: selectedService.price,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Booking confirmed!",
        description: `${vendor.business_name} · ${date} at ${time}`,
      });
      handleClose();
    }
  }

  const STEP_TITLES = ["Select Service & Time", "Pet Details", "Review & Confirm"];

  const step1Valid = !!selectedServiceId && !!date && !!time;
  const step2Valid = !!petName && !!petType;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book with {vendor.business_name}</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 pb-1">
          {([1, 2, 3] as const).map((s) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && <div className={`h-0.5 flex-1 rounded transition-colors ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>
        <p className="text-sm font-medium text-muted-foreground -mt-1 mb-2">Step {step}: {STEP_TITLES[step - 1]}</p>

        {/* Step 1 */}
        {step === 1 && (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label className="font-semibold">Choose a service</Label>
              {services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedServiceId(s.id)}
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                    selectedServiceId === s.id
                      ? "border-primary bg-primary/8 ring-1 ring-primary"
                      : "hover:bg-accent"
                  }`}
                >
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatCategory(s.category)} · {s.duration_minutes} min
                    </p>
                  </div>
                  <span className="font-bold text-primary text-sm shrink-0 ml-3">₹{s.price}</span>
                </button>
              ))}
            </div>

            {selectedService?.service_type === "both" ? (
              <div className="grid gap-1.5">
                <Label className="font-semibold">Visit type</Label>
                <div className="flex rounded-lg border overflow-hidden text-sm">
                  {(["home", "clinic"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setBookingType(t)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 font-medium transition-colors ${
                        bookingType === t ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                    >
                      {t === "home" ? <Home className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                      {t === "home" ? "Home visit" : "Clinic visit"}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-1.5">
                <Label className="font-semibold">Visit type</Label>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
                  {selectedService?.service_type === "home"
                    ? <Home className="h-4 w-4 text-primary" />
                    : <Building2 className="h-4 w-4 text-primary" />}
                  <span className="font-medium capitalize">
                    {selectedService?.service_type === "home" ? "Home visit" : "Clinic visit"}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">Fixed for this service</span>
                </div>
              </div>
            )}

            <div className="grid gap-1.5">
              <Label className="font-semibold">Date</Label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (time && !isSlotAvailable(time, e.target.value)) setTime("");
                }}
              />
            </div>

            <div className="grid gap-1.5">
              <Label className="font-semibold">Time slot</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => {
                  const available = !date || isSlotAvailable(t, date);
                  return (
                    <button
                      key={t}
                      onClick={() => available && setTime(t)}
                      disabled={!available}
                      className={`rounded-lg border py-2 text-sm font-medium transition-colors ${
                        !available
                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                          : time === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "hover:bg-accent"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="grid gap-4">
            {savedPets.length > 0 && (
              <div className="grid gap-1.5">
                <Label className="font-semibold">Use a saved pet</Label>
                <Select value={selectedPetId} onValueChange={handlePetSelect}>
                  <SelectTrigger><SelectValue placeholder="Select a pet…" /></SelectTrigger>
                  <SelectContent>
                    {savedPets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {PET_EMOJI[p.type] ?? "🐾"} {p.name}{p.breed ? ` (${p.breed})` : ""}
                      </SelectItem>
                    ))}
                    <SelectItem value="__manual__">Enter manually…</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
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
                    <SelectItem value="dog">🐶 Dog</SelectItem>
                    <SelectItem value="cat">🐱 Cat</SelectItem>
                    <SelectItem value="other">🐾 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Breed <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <Input placeholder="Golden Retriever" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label>Age (years)</Label>
                <Input type="number" min="0" max="30" step="0.5" placeholder="2" value={petAge} onChange={(e) => setPetAge(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="rounded-xl border bg-muted/40 p-4 grid gap-2.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{vendor.business_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Service</span><span className="font-medium">{selectedService?.name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Visit type</span><span className="font-medium capitalize">{resolvedBookingType}</span></div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & time</span>
              <span className="font-medium">{date} · {time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pet</span>
              <span className="font-medium">{petName} ({petType}{petBreed ? `, ${petBreed}` : ""})</span>
            </div>
            <div className="flex justify-between border-t pt-2.5 mt-1">
              <span className="text-muted-foreground">Price</span>
              <span className="font-bold text-primary text-base">₹{selectedService?.price}</span>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as BookingStep)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          {step < 3 ? (
            <Button
              onClick={() => setStep((s) => (s + 1) as BookingStep)}
              disabled={step === 1 ? !step1Valid : !step2Valid}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleConfirm} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Confirm booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vendor, setVendor] = useState<VendorDetail | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [savedPets, setSavedPets] = useState<UserPet[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      const [
        { data: vendorData },
        { data: serviceData },
        { data: { user } },
      ] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("grooming_vendors") as any)
          .select("id, user_id, business_name, description, address, city, rating, total_reviews, offers_home_service, offers_clinic_visit, maps_url")
          .eq("id", id)
          .single(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("services") as any)
          .select("id, name, price, duration_minutes, category, pet_type, service_type, description")
          .eq("vendor_id", id)
          .eq("is_active", true)
          .order("price", { ascending: true }),
        supabase.auth.getUser(),
      ]);

      setVendor(vendorData ?? null);
      setServices(serviceData ?? []);
      setCurrentUserId(user?.id ?? null);

      if (user) {
        const [{ data: profile }, { data: pets }] = await Promise.all([
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from("users") as any).select("role").eq("id", user.id).single(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from("user_pets") as any)
            .select("id, name, type, breed, age_years")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true }),
        ]);
        setUserRole(profile?.role ?? null);
        setSavedPets(pets ?? []);
      }

      setLoading(false);
    }
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <>
        <Navbar />
        <main className="container mx-auto max-w-2xl px-4 py-12 text-center">
          <p className="text-4xl mb-4">🐾</p>
          <p className="font-semibold text-lg">Vendor not found</p>
          <Link href="/grooming" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-4">
            <ArrowLeft className="h-4 w-4" /> Back to groomers
          </Link>
        </main>
      </>
    );
  }

  const isOwnVendor = currentUserId === vendor.user_id;
  const isVendor = userRole === "vendor";

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Link href="/grooming" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to groomers
        </Link>

        {/* Vendor header */}
        <div className="rounded-2xl border bg-card overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-5xl">🐾</div>
          <div className="p-5 grid gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{vendor.business_name}</h1>
                {vendor.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {vendor.address}{vendor.city ? `, ${vendor.city}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-amber-50 dark:bg-amber-900/20 rounded-xl px-3 py-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-sm">{vendor.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({vendor.total_reviews})</span>
              </div>
            </div>

            {vendor.description && (
              <p className="text-sm text-muted-foreground">{vendor.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {vendor.offers_home_service && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                  <Home className="h-3.5 w-3.5" /> Home service
                </span>
              )}
              {vendor.offers_clinic_visit && (
                <span className="flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 font-medium">
                  <Building2 className="h-3.5 w-3.5" /> Clinic visit
                </span>
              )}
              {vendor.offers_clinic_visit && vendor.maps_url && (
                <a
                  href={vendor.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" /> View on Maps <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            {/* Booking CTA */}
            {isOwnVendor ? (
              <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground flex items-center justify-between">
                <span>This is your business</span>
                <Link href="/vendor/dashboard" className="text-primary text-xs font-semibold hover:underline">
                  Go to dashboard →
                </Link>
              </div>
            ) : isVendor ? (
              <div className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                Vendor accounts cannot make bookings.
              </div>
            ) : (
              <Button
                onClick={() => setBookingOpen(true)}
                disabled={services.length === 0}
                className="w-full"
                size="lg"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {services.length === 0 ? "No services available" : "Book an appointment"}
              </Button>
            )}
          </div>
        </div>

        {/* Services */}
        <h2 className="text-lg font-bold mb-3">Services Offered</h2>
        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed py-10 text-center text-muted-foreground">
            <p className="text-3xl mb-2">✂️</p>
            <p className="text-sm">No services listed yet</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((s) => (
              <div key={s.id} className="rounded-xl border bg-card p-4 grid gap-2 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{s.name}</p>
                    <span className="inline-block mt-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5 font-medium">
                      {formatCategory(s.category)}
                    </span>
                  </div>
                  <span className="font-bold text-primary text-base shrink-0">₹{s.price}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{s.duration_minutes} min</span>
                  <span className="capitalize">{s.pet_type === "both" ? "Dogs & Cats" : s.pet_type + "s"}</span>
                  <span className="flex items-center gap-1 capitalize">
                    {s.service_type === "home" ? <Home className="h-3 w-3" /> : s.service_type === "clinic" ? <Building2 className="h-3 w-3" /> : null}
                    {s.service_type === "both" ? "Home & Clinic" : s.service_type}
                  </span>
                </div>
                {s.description && (
                  <p className="text-xs text-muted-foreground italic">{s.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {bookingOpen && !isOwnVendor && !isVendor && (
        <BookingModal
          vendor={vendor}
          services={services}
          savedPets={savedPets}
          open={bookingOpen}
          onClose={() => setBookingOpen(false)}
        />
      )}
    </>
  );
}
