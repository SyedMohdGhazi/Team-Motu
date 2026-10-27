"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Star,
  Home,
  Building2,
  Plus,
  Pencil,
  MapPin,
  IndianRupee,
  Percent,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Mock data ────────────────────────────────────────────────────────────────
const PLATFORM_COMMISSION_PCT = 15;

const MOCK_BOOKINGS = [
  { id: "b1", customerName: "Ananya Sharma", petName: "Bruno", petType: "dog", service: "Full Grooming Package", date: "2026-10-28", time: "10:00 AM", type: "home", status: "pending" as const, amount: 799 },
  { id: "b2", customerName: "Rohit Mehta", petName: "Whiskers", petType: "cat", service: "Bath & Dry", date: "2026-10-28", time: "02:00 PM", type: "clinic", status: "confirmed" as const, amount: 399 },
  { id: "b3", customerName: "Priya Singh", petName: "Max", petType: "dog", service: "Nail Trim + Ear Cleaning", date: "2026-10-27", time: "11:00 AM", type: "home", status: "completed" as const, amount: 349 },
  { id: "b4", customerName: "Vikram Nair", petName: "Mittens", petType: "cat", service: "Full Grooming Package", date: "2026-10-26", time: "03:00 PM", type: "clinic", status: "completed" as const, amount: 699 },
  { id: "b5", customerName: "Kavya Reddy", petName: "Coco", petType: "dog", service: "Bath & Dry", date: "2026-10-25", time: "09:00 AM", type: "home", status: "cancelled" as const, amount: 399 },
];

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

const STATUS_STYLES: Record<BookingStatus, { label: string; badge: string }> = {
  pending: { label: "Pending", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  confirmed: { label: "Confirmed", badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  completed: { label: "Completed", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  cancelled: { label: "Cancelled", badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

// ─── Booking management card ──────────────────────────────────────────────────
function BookingRow({ booking, onUpdateStatus }: {
  booking: typeof MOCK_BOOKINGS[0];
  onUpdateStatus: (id: string, status: BookingStatus) => void;
}) {
  const commission = Math.round(booking.amount * PLATFORM_COMMISSION_PCT / 100);
  const payout = booking.amount - commission;
  const style = STATUS_STYLES[booking.status];

  return (
    <div className="rounded-xl border p-4 grid gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{booking.customerName}</span>
            <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${style.badge}`}>
              {style.label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {booking.petName} ({booking.petType}) · {booking.service}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {booking.date} at {booking.time}
            {" · "}
            {booking.type === "home" ? (
              <><Home className="h-3 w-3 inline" /> Home service</>
            ) : (
              <><Building2 className="h-3 w-3 inline" /> Clinic visit</>
            )}
          </p>
        </div>
        {/* Pricing breakdown */}
        <div className="text-right shrink-0">
          <p className="text-sm font-bold">₹{booking.amount}</p>
          {booking.status === "completed" && (
            <div className="text-xs text-muted-foreground mt-0.5">
              <p>Commission ({PLATFORM_COMMISSION_PCT}%): <span className="text-red-500">-₹{commission}</span></p>
              <p className="font-semibold text-emerald-600">Payout: ₹{payout}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {booking.status === "pending" && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => onUpdateStatus(booking.id, "confirmed")}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => onUpdateStatus(booking.id, "cancelled")}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
          </Button>
        </div>
      )}
      {booking.status === "confirmed" && (
        <Button
          size="sm"
          variant="outline"
          className="w-fit border-blue-300 text-blue-700 hover:bg-blue-50"
          onClick={() => onUpdateStatus(booking.id, "completed")}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark completed
        </Button>
      )}
    </div>
  );
}

// ─── Service form dialog ──────────────────────────────────────────────────────
function AddServiceDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast();
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Service name</Label>
            <Input placeholder="e.g. Full Grooming Package" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" placeholder="499" />
            </div>
            <div className="grid gap-1.5">
              <Label>Duration (mins)</Label>
              <Input type="number" placeholder="60" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Pet type</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dogs</SelectItem>
                  <SelectItem value="cat">Cats</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Service type</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">Home only</SelectItem>
                  <SelectItem value="clinic">Clinic only</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { toast({ title: "Service added!" }); onClose(); }}>Add service</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function VendorDashboardPage() {
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const { toast } = useToast();

  function updateStatus(id: string, status: BookingStatus) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    toast({
      title: `Booking ${status}`,
      description: `Appointment has been marked as ${status}.`,
    });
  }

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce((s, b) => s + b.amount, 0);
  const totalCommission = Math.round(totalRevenue * PLATFORM_COMMISSION_PCT / 100);
  const totalPayout = totalRevenue - totalCommission;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your business profile, services, and bookings
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0 gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Verified Vendor
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          {[
            { icon: Clock, label: "Pending", value: pendingCount, color: "text-amber-600" },
            { icon: TrendingUp, label: "Completed", value: completedBookings.length, color: "text-emerald-600" },
            { icon: IndianRupee, label: "Revenue", value: `₹${totalRevenue}`, color: "text-primary" },
            { icon: Percent, label: `My Payout (${100 - PLATFORM_COMMISSION_PCT}%)`, value: `₹${totalPayout}`, color: "text-emerald-600" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform commission note */}
        <div className="mb-6 rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold text-primary mb-1">
            <Percent className="h-4 w-4" />
            Platform Commission: {PLATFORM_COMMISSION_PCT}%
          </div>
          <p className="text-muted-foreground text-xs">
            Team Motu charges a {PLATFORM_COMMISSION_PCT}% commission on each completed booking. Your payout ({100 - PLATFORM_COMMISSION_PCT}%) is transferred within 48 hours of booking completion.
          </p>
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="w-full mb-5">
            <TabsTrigger value="bookings" className="flex-1">
              Bookings
              {pendingCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1">Business Profile</TabsTrigger>
          </TabsList>

          {/* Bookings tab */}
          <TabsContent value="bookings" className="grid gap-3">
            {/* Filter chips */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(["All", "Pending", "Confirmed", "Completed"] as const).map((f) => (
                <span key={f} className="rounded-full border px-2.5 py-1 font-medium cursor-pointer hover:bg-accent transition-colors">
                  {f}
                </span>
              ))}
            </div>
            {bookings.map((b) => (
              <BookingRow key={b.id} booking={b} onUpdateStatus={updateStatus} />
            ))}
          </TabsContent>

          {/* Services tab */}
          <TabsContent value="services">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Your Services</h2>
              <Button size="sm" onClick={() => setAddServiceOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add service
              </Button>
            </div>
            <div className="grid gap-3">
              {[
                { name: "Full Grooming Package", price: 799, duration: 90, pets: "Both", type: "Both" },
                { name: "Bath & Dry", price: 399, duration: 45, pets: "Both", type: "Home" },
                { name: "Nail Trim + Ear Cleaning", price: 349, duration: 30, pets: "Dogs", type: "Home" },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between rounded-xl border p-4">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {s.duration} min · {s.pets} · {s.type} service
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-primary">₹{s.price}</span>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Business profile tab */}
          <TabsContent value="profile">
            <div className="grid gap-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label>Business name</Label>
                    <Input defaultValue="Paws & Polish" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Description</Label>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                      defaultValue="Professional pet grooming with 5+ years of experience. We treat your pets like family."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Phone</Label>
                      <Input defaultValue="+91-9876-543210" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Email</Label>
                      <Input type="email" defaultValue="pawspolish@example.com" />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Address</Label>
                    <Input defaultValue="Near ISBT, Dehradun" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Latitude</Label>
                      <Input type="number" placeholder="30.3165" />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Longitude</Label>
                      <Input type="number" placeholder="78.0322" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Service Settings</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                  {[
                    { icon: Home, label: "Offer Home Service (at doorstep)", checked: true },
                    { icon: Building2, label: "Offer Clinic Visits", checked: true },
                  ].map(({ icon: Icon, label, checked }) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" defaultChecked={checked} className="accent-primary h-4 w-4" />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    Reviews & Ratings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-amber-500">4.8</p>
                      <div className="flex gap-0.5 justify-center mt-1">
                        {[1,2,3,4,5].map((i) => (
                          <Star key={i} className={`h-4 w-4 ${i <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">94 reviews</p>
                    </div>
                    <div className="flex-1 grid gap-1.5">
                      {[[5, 70], [4, 18], [3, 8], [2, 2], [1, 2]].map(([stars, pct]) => (
                        <div key={stars} className="flex items-center gap-2 text-xs">
                          <span className="w-3">{stars}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-muted-foreground w-8">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button className="w-full sm:w-fit">
                <MapPin className="h-4 w-4 mr-2" />
                Save business profile
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <AddServiceDialog open={addServiceOpen} onClose={() => setAddServiceOpen(false)} />
    </>
  );
}
