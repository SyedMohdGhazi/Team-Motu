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

export default function MedicalStoreRegisterPage() {
  const [form, setForm] = useState({
    store_name: "",
    description: "",
    address: "",
    city: "Dehradun",
    state: "Uttarakhand",
    phone: "",
    email: "",
    website_url: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  function update(field: string, value: string) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("medical_stores") as any).insert({
      user_id: user.id,
      store_name: form.store_name,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      country: "India",
      phone: form.phone || null,
      email: form.email || null,
      website_url: form.website_url || null,
      is_active: true,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Store registered!", description: "Your store is now listed on Team Motu." });
      router.push("/medical-store");
    }
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link
            href="/medical-store"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to medical store
          </Link>
          <h1 className="text-2xl font-bold">Register your Pet Medical Store</h1>
          <p className="text-sm text-muted-foreground mt-1">
            List your pharmacy, veterinary supply shop, or pet store on Team Motu.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <Card>
            <CardHeader><CardTitle className="text-base">Store Information</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Store name *</Label>
                <Input
                  placeholder="e.g. Pet Care Pharmacy Dehradun"
                  value={form.store_name}
                  onChange={(e) => update("store_name", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label>About your store</Label>
                <textarea
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="What products do you carry? Any specialities — vet medicines, pet food, grooming supplies?"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>
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
                  <Input type="email" placeholder="store@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Website <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input type="url" placeholder="https://yourstore.com" value={form.website_url} onChange={(e) => update("website_url", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || !form.store_name} size="lg">
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Registering…</>
              : <><Save className="h-4 w-4 mr-2" />Register store</>
            }
          </Button>
        </form>
      </main>
    </>
  );
}
