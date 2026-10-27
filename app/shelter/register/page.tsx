"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function ShelterRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "Dehradun",
    state: "Uttarakhand",
    phone: "",
    email: "",
    website_url: "",
    emergency_helpline: "",
    capacity: "",
    is_ngo: false,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      router.push("/login");
      return;
    }

    const { error } = await supabase.from("shelters").insert({
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: "India",
      phone: form.phone || null,
      email: form.email || null,
      website_url: form.website_url || null,
      emergency_helpline: form.emergency_helpline || null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      current_occupancy: 0,
      is_ngo: form.is_ngo,
      is_active: true,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Shelter registered!",
        description: "Your shelter is now live on Team Motu.",
      });
      router.push("/shelters");
    }
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/shelters"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to shelters
          </Link>
          <h1 className="text-2xl font-bold">Register your Shelter or Foster Home</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your listing will appear on the Team Motu shelters directory once submitted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Shelter / Organisation name *</Label>
                <Input
                  placeholder="e.g. Paws Rescue Dehradun"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label>About your shelter</Label>
                <textarea
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Tell people what you do, how long you've been operating, and what animals you care for…"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_ngo}
                  onChange={(e) => update("is_ngo", e.target.checked)}
                  className="accent-primary h-4 w-4"
                />
                <span className="text-sm">We are a registered NGO</span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Location & Contact</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Address</Label>
                <Input
                  placeholder="Street / Area / Landmark"
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => update("state", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="+91-XXXXX-XXXXX" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="shelter@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Website <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input type="url" placeholder="https://yoursite.com" value={form.website_url} onChange={(e) => update("website_url", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Emergency & Capacity</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Emergency helpline number <span className="text-muted-foreground text-xs">(shown prominently to users)</span></Label>
                <Input
                  placeholder="+91-XXXXX-XXXXX"
                  value={form.emergency_helpline}
                  onChange={(e) => update("emergency_helpline", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Total capacity <span className="text-muted-foreground text-xs">(number of animals you can house)</span></Label>
                <Input
                  type="number"
                  min="1"
                  placeholder="50"
                  value={form.capacity}
                  onChange={(e) => update("capacity", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || !form.name} size="lg">
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Registering…</>
              : <><Save className="h-4 w-4 mr-2" />Register shelter</>
            }
          </Button>
        </form>
      </main>
    </>
  );
}
