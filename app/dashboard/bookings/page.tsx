"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Loader2, CalendarDays, Clock, PawPrint } from "lucide-react";

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
  created_at: string;
  grooming_vendors?: { business_name: string } | null;
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("bookings") as any)
        .select("*, grooming_vendors(business_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setBookings(data ?? []);
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
