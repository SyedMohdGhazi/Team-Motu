"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, XCircle, Clock, TrendingUp, Star, Home, Building2,
  Plus, Pencil, MapPin, IndianRupee, Percent, Loader2, Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const PLATFORM_COMMISSION_PCT = 15;

type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

interface Booking {
  id: string;
  pet_name: string;
  pet_type: string;
  appointment_date: string;
  appointment_time: string;
  booking_type: string;
  status: BookingStatus;
  total_price: number;
  notes: string | null;
  users?: { full_name: string | null; email: string };
  services?: { name: string };
}

interface VendorProfile {
  id?: string;
  business_name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  offers_home_service: boolean;
  offers_clinic_visit: boolean;
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  in_progress: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

function AddServiceDialog({ vendorId, open, onClose, onAdded }: {
  vendorId: string; open: boolean; onClose: () => void; onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [petType, setPetType] = useState("both");
  const [serviceType, setServiceType] = useState("both");
  const [category, setCategory] = useState("bath");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  async function handleAdd() {
    if (!name || !price || !duration) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("services") as any).insert({
      vendor_id: vendorId, name, price: parseFloat(price),
      duration_minutes: parseInt(duration), category,
      pet_type: petType as "dog" | "cat" | "both",
      service_type: serviceType as "home" | "clinic" | "both",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Failed to add service", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Service added!" });
      onAdded(); onClose();
      setName(""); setPrice(""); setDuration("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Service</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label>Service name</Label>
            <Input placeholder="e.g. Full Grooming Package" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["bath","haircut","nail_trim","ear_cleaning","full_package","other"].map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c.replace("_"," ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Price (₹)</Label>
              <Input type="number" placeholder="499" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Duration (mins)</Label>
              <Input type="number" placeholder="60" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Pet type</Label>
              <Select value={petType} onValueChange={setPetType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dogs</SelectItem>
                  <SelectItem value="cat">Cats</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Service type</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
          <Button onClick={handleAdd} disabled={loading || !name || !price || !duration}>
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Add service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function VendorDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<{ id: string; name: string; price: number; duration_minutes: number; pet_type: string; service_type: string }[]>([]);
  const [profile, setProfile] = useState<VendorProfile>({
    business_name: "", description: "", address: "", city: "Dehradun",
    phone: "", email: "", latitude: "", longitude: "",
    offers_home_service: true, offers_clinic_visit: true,
  });
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected" | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Load vendor profile
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: vendor } = await (supabase.from("grooming_vendors") as any)
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (vendor) {
        setVendorId(vendor.id);
        setApprovalStatus(vendor.approval_status ?? "pending");
        setProfile({
          id: vendor.id,
          business_name: vendor.business_name ?? "",
          description: vendor.description ?? "",
          address: vendor.address ?? "",
          city: vendor.city ?? "Dehradun",
          phone: vendor.phone ?? "",
          email: vendor.email ?? "",
          latitude: vendor.latitude?.toString() ?? "",
          longitude: vendor.longitude?.toString() ?? "",
          offers_home_service: vendor.offers_home_service,
          offers_clinic_visit: vendor.offers_clinic_visit,
        });

        // Load bookings and services
        const [{ data: bookingData }, { data: serviceData }] = await Promise.all([
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from("bookings") as any).select("*, users(full_name, email), services(name)").eq("vendor_id", vendor.id).order("appointment_date", { ascending: false }),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (supabase.from("services") as any).select("*").eq("vendor_id", vendor.id).eq("is_active", true),
        ]);
        setBookings((bookingData as Booking[]) ?? []);
        setServices(serviceData ?? []);
      } else {
        // Pre-fill email from auth
        setProfile((p) => ({ ...p, email: user.email ?? "" }));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSavingProfile(false); return; }

    const payload = {
      user_id: user.id,
      business_name: profile.business_name,
      description: profile.description || null,
      address: profile.address || null,
      city: profile.city || null,
      phone: profile.phone || null,
      email: profile.email || null,
      latitude: profile.latitude ? parseFloat(profile.latitude) : null,
      longitude: profile.longitude ? parseFloat(profile.longitude) : null,
      offers_home_service: profile.offers_home_service,
      offers_clinic_visit: profile.offers_clinic_visit,
      is_active: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = vendorId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? await (supabase.from("grooming_vendors") as any).update(payload).eq("id", vendorId).select().single()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : await (supabase.from("grooming_vendors") as any).insert(payload).select().single();

    setSavingProfile(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      if (!vendorId) setVendorId(data.id);
      toast({ title: "Profile saved!", description: "Your business is now live on Team Motu." });
      // Also update user role to vendor
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from("users") as any).update({ role: "vendor" }).eq("id", user.id);
    }
  }

  async function updateBookingStatus(id: string, status: BookingStatus) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("bookings") as any).update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
      toast({ title: `Booking ${status}` });
    }
  }

  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce((s, b) => s + b.total_price, 0);
  const totalPayout = Math.round(totalRevenue * (1 - PLATFORM_COMMISSION_PCT / 100));
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-4xl px-4 py-6">
        {/* Approval status banner */}
        {approvalStatus && approvalStatus !== "approved" && (
          <div className={`mb-6 rounded-xl border p-4 text-sm flex items-start gap-3 ${
            approvalStatus === "pending"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
              : "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
          }`}>
            {approvalStatus === "pending" ? (
              <>
                <Clock className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Your listing is under review</p>
                  <p className="text-xs mt-0.5 opacity-80">
                    Our team will review and approve your profile shortly. You won&apos;t be visible to customers until approved.
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Your listing was not approved</p>
                  <p className="text-xs mt-0.5 opacity-80">
                    Please update your profile information and contact support if you think this is a mistake.
                  </p>
                </div>
              </>
            )}
          </div>
        )}
        {approvalStatus === "approved" && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm flex items-center gap-3 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <p className="font-semibold">Your listing is live and visible to customers</p>
          </div>
        )}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {vendorId ? profile.business_name : "Set up your business profile to get started"}
            </p>
          </div>
          {vendorId && <Badge variant="secondary" className="shrink-0 gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />Active</Badge>}
        </div>

        {vendorId && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
              {[
                { icon: Clock, label: "Pending", value: pendingCount, color: "text-amber-600" },
                { icon: TrendingUp, label: "Completed", value: completedBookings.length, color: "text-emerald-600" },
                { icon: IndianRupee, label: "Revenue", value: `₹${totalRevenue}`, color: "text-primary" },
                { icon: Percent, label: `Payout (${100 - PLATFORM_COMMISSION_PCT}%)`, value: `₹${totalPayout}`, color: "text-emerald-600" },
              ].map(({ icon: Icon, label, value, color }) => (
                <Card key={label}><CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1"><Icon className={`h-4 w-4 ${color}`} /><span className="text-xs text-muted-foreground">{label}</span></div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                </CardContent></Card>
              ))}
            </div>
            <div className="mb-6 rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm">
              <div className="flex items-center gap-2 font-semibold text-primary mb-1"><Percent className="h-4 w-4" />Platform Commission: {PLATFORM_COMMISSION_PCT}%</div>
              <p className="text-muted-foreground text-xs">Team Motu charges {PLATFORM_COMMISSION_PCT}% on completed bookings. Your payout ({100 - PLATFORM_COMMISSION_PCT}%) is transferred within 48 hours.</p>
            </div>
          </>
        )}

        <Tabs defaultValue={vendorId ? "bookings" : "profile"}>
          <TabsList className="w-full mb-5">
            <TabsTrigger value="bookings" className="flex-1">
              Bookings {pendingCount > 0 && <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5">{pendingCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="services" className="flex-1">Services</TabsTrigger>
            <TabsTrigger value="profile" className="flex-1">Business Profile</TabsTrigger>
          </TabsList>

          {/* Bookings */}
          <TabsContent value="bookings" className="grid gap-3">
            {!vendorId ? (
              <p className="py-12 text-center text-muted-foreground">Set up your business profile first to receive bookings.</p>
            ) : bookings.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <p className="text-4xl mb-3">📅</p>
                <p className="font-medium">No bookings yet</p>
                <p className="text-sm mt-1">Share your profile link with customers to start receiving appointments.</p>
              </div>
            ) : (
              bookings.map((b) => {
                const commission = Math.round(b.total_price * PLATFORM_COMMISSION_PCT / 100);
                return (
                  <div key={b.id} className="rounded-xl border p-4 grid gap-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{b.users?.full_name ?? b.users?.email ?? "Customer"}</span>
                          <span className={`text-xs font-medium rounded-full px-2 py-0.5 ${STATUS_STYLES[b.status]}`}>{b.status}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{b.pet_name} ({b.pet_type}) · {b.services?.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <Clock className="h-3 w-3 inline mr-1" />{b.appointment_date} at {b.appointment_time} · {b.booking_type === "home" ? "🏠 Home" : "🏥 Clinic"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">₹{b.total_price}</p>
                        {b.status === "completed" && (
                          <div className="text-xs text-muted-foreground mt-0.5">
                            <p>Commission: <span className="text-red-500">-₹{commission}</span></p>
                            <p className="font-semibold text-emerald-600">Payout: ₹{b.total_price - commission}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {b.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50" onClick={() => updateBookingStatus(b.id, "confirmed")}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => updateBookingStatus(b.id, "cancelled")}>
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    {b.status === "confirmed" && (
                      <Button size="sm" variant="outline" className="w-fit border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => updateBookingStatus(b.id, "completed")}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Mark completed
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </TabsContent>

          {/* Services */}
          <TabsContent value="services">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold">Your Services</h2>
              <Button size="sm" onClick={() => setAddServiceOpen(true)} disabled={!vendorId}>
                <Plus className="h-4 w-4 mr-1" /> Add service
              </Button>
            </div>
            {!vendorId ? (
              <p className="py-8 text-center text-muted-foreground text-sm">Save your business profile first to add services.</p>
            ) : services.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p className="text-4xl mb-3">✂️</p>
                <p className="font-medium">No services added yet</p>
                <p className="text-sm mt-1">Add your services so customers can see what you offer.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl border p-4">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.duration_minutes} min · {s.pet_type} · {s.service_type} service</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">₹{s.price}</span>
                      <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile">
            <div className="grid gap-4">
              {!vendorId && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-primary font-medium">
                  Fill in your details below to register your business and appear on the grooming listings.
                </div>
              )}
              <Card>
                <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label>Business name *</Label>
                    <Input placeholder="Paws & Polish" value={profile.business_name} onChange={(e) => setProfile((p) => ({ ...p, business_name: e.target.value }))} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Description</Label>
                    <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none" placeholder="Tell customers about your experience and services…" value={profile.description} onChange={(e) => setProfile((p) => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Phone</Label>
                      <Input placeholder="+91-XXXXX-XXXXX" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Email</Label>
                      <Input type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Address</Label>
                    <Input placeholder="Near ISBT, Dehradun" value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label>Latitude <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input type="number" placeholder="30.3165" value={profile.latitude} onChange={(e) => setProfile((p) => ({ ...p, latitude: e.target.value }))} />
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Longitude <span className="text-muted-foreground text-xs">(optional)</span></Label>
                      <Input type="number" placeholder="78.0322" value={profile.longitude} onChange={(e) => setProfile((p) => ({ ...p, longitude: e.target.value }))} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Service Settings</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                  {[
                    { key: "offers_home_service" as const, icon: Home, label: "Offer Home Service (at doorstep)" },
                    { key: "offers_clinic_visit" as const, icon: Building2, label: "Offer Clinic Visits" },
                  ].map(({ key, icon: Icon, label }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={profile[key]} onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.checked }))} className="accent-primary h-4 w-4" />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {vendorId && (
                <Card>
                  <CardHeader><CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-amber-400 fill-amber-400" />Reviews & Ratings</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Ratings will appear here once customers leave reviews.</p>
                  </CardContent>
                </Card>
              )}

              <Button onClick={saveProfile} disabled={savingProfile || !profile.business_name} className="w-full sm:w-fit">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {vendorId ? "Save changes" : "Register my business"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      {vendorId && <AddServiceDialog vendorId={vendorId} open={addServiceOpen} onClose={() => setAddServiceOpen(false)} onAdded={() => { /* refetch services */ }} />}
    </>
  );
}
