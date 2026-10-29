"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Clock } from "lucide-react";

type ExistingStatus = "pending" | "approved" | "rejected" | null;

export default function PetWalkerRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [petTypes, setPetTypes] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingStatus, setExistingStatus] = useState<ExistingStatus>(null);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to your vendor account first.", variant: "destructive" });
        router.push("/vendor/login");
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profile } = await (supabase.from("users") as any)
        .select("role").eq("id", user.id).single();
      if (profile?.role !== "vendor") {
        toast({
          title: "Vendor account required",
          description: "Only vendors can register as pet walkers. Please create a vendor account first.",
          variant: "destructive",
        });
        router.push("/vendor/register");
        return;
      }

      // Check if already registered
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existing } = await (supabase.from("pet_walkers") as any)
        .select("approval_status")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        setExistingStatus(existing.approval_status ?? "pending");
      }

      setChecking(false);
    }
    checkAuth();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Please sign in first", variant: "destructive" });
      router.push("/vendor/login");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("pet_walkers") as any).insert({
      user_id: user.id,
      full_name: fullName,
      phone,
      service_area: area,
      pet_types: petTypes || null,
      bio: bio || null,
      is_active: false,
      approval_status: "pending",
    });

    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Profile submitted!",
        description: "We'll review your walker profile and activate it shortly.",
      });
      router.push("/vendor/dashboard");
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Already submitted — show status instead of form
  if (existingStatus !== null) {
    const statusConfig = {
      pending: {
        icon: "⏳",
        title: "Application under review",
        desc: "Your pet walker profile has been submitted and is waiting for admin approval. We'll activate it shortly.",
        cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      },
      approved: {
        icon: "✅",
        title: "You're an approved walker!",
        desc: "Your walker profile is live. You can manage it from your vendor dashboard.",
        cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      rejected: {
        icon: "❌",
        title: "Application not approved",
        desc: "Your walker application was not approved. Please contact support for more details.",
        cls: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
      },
    };
    const cfg = statusConfig[existingStatus] ?? statusConfig.pending;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-500/10 to-background px-4 py-12">
        <div className="w-full max-w-sm">
          <Link href="/pet-walking" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <div className={`rounded-2xl border p-6 ${cfg.cls}`}>
            <p className="text-3xl mb-3">{cfg.icon}</p>
            <h2 className="font-bold text-lg mb-1">{cfg.title}</h2>
            <p className="text-sm opacity-80 mb-4">{cfg.desc}</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/vendor/dashboard">Go to dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-amber-500/10 to-background px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/pet-walking" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-400 text-2xl shadow-md">
            🦮
          </div>
          <div>
            <h1 className="text-xl font-bold">Register as a Walker</h1>
            <p className="text-sm text-muted-foreground">Daily Walkies · Team Motu</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your walker profile</CardTitle>
            <CardDescription>We&apos;ll review and activate your listing shortly.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" placeholder="Riya Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Phone number</Label>
                <Input id="phone" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="area">Service area</Label>
                <Input id="area" placeholder="e.g. Rajpur Road, Clement Town" value={area} onChange={(e) => setArea(e.target.value)} required />
              </div>
              <div className="grid gap-1.5">
                <Label>Animals you walk</Label>
                <Select value={petTypes} onValueChange={setPetTypes} required>
                  <SelectTrigger><SelectValue placeholder="Select animal type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dogs">🐶 Dogs only</SelectItem>
                    <SelectItem value="cats">🐱 Cats only</SelectItem>
                    <SelectItem value="both">🐶🐱 Both dogs & cats</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="bio">About you (optional)</Label>
                <Textarea id="bio" placeholder="Years of experience, breeds you work with, walk schedule..." rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-400 text-white hover:opacity-90"
                disabled={loading || !petTypes}
              >
                {loading
                  ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                  : "Submit for review"
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
