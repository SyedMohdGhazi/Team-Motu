"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MapPin, Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface Walker {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  service_area: string | null;
  pet_types: string | null;
  bio: string | null;
}

const PET_TYPE_LABEL: Record<string, string> = {
  dogs: "🐶 Dogs",
  cats: "🐱 Cats",
  both: "🐶🐱 Dogs & Cats",
};

const TIME_SLOTS = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM",
];

type BookingStep = 1 | 2 | 3;

function WalkBookingModal({ walker, open, onClose }: {
  walker: Walker; open: boolean; onClose: () => void;
}) {
  const [step, setStep] = useState<BookingStep>(1);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [petName, setPetName] = useState("");
  const [petType, setPetType] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  function handleClose() {
    onClose();
    setStep(1); setDate(""); setTime(""); setPetName(""); setPetType(""); setNotes("");
  }

  async function handleConfirm() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in to book a walk", variant: "destructive" });
      setLoading(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("walker_bookings") as any).insert({
      user_id: user.id,
      walker_id: walker.id,
      pet_name: petName,
      pet_type: petType,
      walk_date: date,
      walk_time: time,
      notes: notes || null,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Booking failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Walk request sent!",
        description: `${walker.full_name} will confirm your walk on ${date} at ${time}.`,
      });
      handleClose();
    }
  }

  const STEP_TITLES = ["Pick Date & Time", "Pet Details", "Review & Confirm"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book a walk with {walker.full_name}</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
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
              <Label>Walk date</Label>
              <Input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Preferred time</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTime(t)}
                    className={`rounded-lg border py-2 text-sm font-medium transition-colors ${time === t ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Pet name</Label>
              <Input placeholder="e.g. Bruno" value={petName} onChange={(e) => setPetName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Pet type</Label>
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger><SelectValue placeholder="Select pet type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">🐶 Dog</SelectItem>
                  <SelectItem value="cat">🐱 Cat</SelectItem>
                  <SelectItem value="other">🐾 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Notes for walker <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input placeholder="e.g. prefers morning routes, leash puller…" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-xl border bg-muted/40 p-4 grid gap-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Walker</span><span className="font-medium">{walker.full_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span className="font-medium">{time}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pet</span><span className="font-medium">{petName} ({petType})</span></div>
            {notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="font-medium max-w-[60%] text-right">{notes}</span></div>}
            <p className="text-xs text-muted-foreground border-t pt-3">The walker will review and confirm your booking. You&apos;ll be contacted directly.</p>
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
              disabled={(step === 1 && (!date || !time)) || (step === 2 && (!petName || !petType))}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={loading}
              className="bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:opacity-90"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Confirm booking
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WalkerCard({ walker }: { walker: Walker }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const initials = walker.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const petLabel = walker.pet_types ? (PET_TYPE_LABEL[walker.pet_types] ?? walker.pet_types) : null;

  return (
    <>
      <div className="rounded-2xl border bg-card hover:shadow-md transition-shadow overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-amber-500/15 to-orange-400/10 flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-white text-xl font-bold shadow-md">
            {initials}
          </div>
        </div>
        <div className="p-4 grid gap-2.5">
          <div>
            <h3 className="font-bold text-base">{walker.full_name}</h3>
            {petLabel && (
              <span className="inline-block mt-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium">
                {petLabel}
              </span>
            )}
          </div>

          {walker.service_area && (
            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {walker.service_area}
            </p>
          )}

          {walker.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">{walker.bio}</p>
          )}

          <Button
            onClick={() => setBookingOpen(true)}
            className="mt-1 w-full bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:opacity-90"
          >
            Book a walk
          </Button>
        </div>
      </div>

      {bookingOpen && (
        <WalkBookingModal walker={walker} open={bookingOpen} onClose={() => setBookingOpen(false)} />
      )}
    </>
  );
}

export default function PetWalkingPage() {
  const [walkers, setWalkers] = useState<Walker[]>([]);
  const [petFilter, setPetFilter] = useState<"all" | "dogs" | "cats">("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("pet_walkers") as any)
        .select("id, user_id, full_name, phone, service_area, pet_types, bio")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setWalkers((data as Walker[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = walkers.filter((w) => {
    if (petFilter === "all") return true;
    if (!w.pet_types) return true;
    return w.pet_types === petFilter || w.pet_types === "both";
  });

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Daily Walkies</h1>
          <p className="text-sm text-muted-foreground mt-1">Certified pet walkers near Dehradun</p>
        </div>

        <div className="flex rounded-lg border overflow-hidden text-sm mb-6 w-fit">
          {(["all", "dogs", "cats"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPetFilter(p)}
              className={`px-4 py-2 font-medium transition-colors capitalize ${petFilter === p ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
            >
              {p === "all" ? "All pets" : p === "dogs" ? "🐶 Dogs" : "🐱 Cats"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="text-4xl mb-3">🦮</p>
            <p className="font-medium">No walkers listed yet</p>
            <p className="text-sm mt-1">Check back soon — we&apos;re onboarding walkers in Dehradun.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((w) => <WalkerCard key={w.id} walker={w} />)}
          </div>
        )}
      </main>
    </>
  );
}
