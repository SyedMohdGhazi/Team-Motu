"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, CalendarDays, Clock, PawPrint, Phone, MessageCircle } from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

interface Booking {
  id: string;
  pet_name: string;
  pet_type: string;
  pet_breed: string | null;
  appointment_date: string;
  appointment_time: string;
  booking_type: string;
  status: BookingStatus;
  total_price: number;
  rejection_reason: string | null;
  created_at: string;
  grooming_vendors?: { business_name: string; phone: string | null; is_whatsapp: boolean } | null;
}

const STATUS: Record<BookingStatus, { label: string; className: string }> = {
  pending:     { label: "Pending",     className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  confirmed:   { label: "Accepted",   className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  in_progress: { label: "In Progress", className: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  completed:   { label: "Completed",  className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  cancelled:   { label: "Rejected",   className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("bookings") as any)
        .select("*, grooming_vendors(business_name, phone, is_whatsapp)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      const list = (data ?? []) as Booking[];
      setBookings(list);
      // Mark confirmed/cancelled bookings as seen so dashboard notification clears
      const seenIds = list
        .filter((b) => b.status === "confirmed" || b.status === "cancelled")
        .map((b) => b.id);
      localStorage.setItem("tm-seen-booking-ids", JSON.stringify(seenIds));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-bold mb-1">My Bookings</h1>
        <p className="text-sm text-muted-foreground mb-6">All your grooming appointments and their status</p>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : bookings.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <PawPrint className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bookings yet</p>
            <p className="text-sm mt-1">
              <Link href="/grooming" className="text-primary hover:underline">Browse grooming services →</Link>
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => {
              const st = STATUS[b.status] ?? STATUS.pending;
              return (
                <div key={b.id} className="rounded-xl border bg-card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {b.grooming_vendors?.business_name ?? "Grooming Service"}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.className}`}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(b.appointment_date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {b.appointment_time}
                      </span>
                      <span className="capitalize">{b.booking_type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {b.pet_name} · {b.pet_type}{b.pet_breed ? ` · ${b.pet_breed}` : ""}
                    </p>
                    {b.status === "cancelled" && b.rejection_reason && (
                      <p className="text-xs rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-2 mt-1">
                        <span className="font-semibold">Reason: </span>{b.rejection_reason}
                      </p>
                    )}
                    {(b.status === "confirmed" || b.status === "in_progress" || b.status === "completed") && b.grooming_vendors?.phone && (
                      <div className="mt-1 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
                        <span className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                          <Phone className="h-4 w-4 shrink-0" />
                          {b.grooming_vendors.phone}
                        </span>
                        {b.grooming_vendors.is_whatsapp && (
                          <a
                            href={whatsappUrl(b.grooming_vendors.phone, `Hi, I have a booking for ${b.pet_name} on ${formatDate(b.appointment_date)} at ${b.appointment_time}`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Message on WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-bold text-primary shrink-0">
                    ₹{b.total_price}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
