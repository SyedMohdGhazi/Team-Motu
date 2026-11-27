"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, PawPrint, Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  full_name: string;
  phone: string;
  is_whatsapp: boolean;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
}

const PET_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", rabbit: "🐰", bird: "🐦", other: "🐾",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({ full_name: "", phone: "", is_whatsapp: false });
  const [email, setEmail] = useState("");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");

      const [{ data: userData }, { data: petData }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("users") as any)
          .select("full_name, phone, is_whatsapp")
          .eq("id", user.id)
          .single(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from("user_pets") as any)
          .select("id, name, type, breed, age_years")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true }),
      ]);

      if (userData) {
        setProfile({
          full_name: userData.full_name ?? "",
          phone: userData.phone ?? "",
          is_whatsapp: userData.is_whatsapp ?? false,
        });
      }
      setPets((petData as Pet[]) ?? []);
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("users") as any)
      .update({
        full_name: profile.full_name || null,
        phone: profile.phone || null,
        is_whatsapp: profile.is_whatsapp,
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Profile</h1>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Email</Label>
                <Input value={email} disabled className="bg-muted/40 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
              </div>

              <div className="grid gap-1.5">
                <Label>Full name</Label>
                <Input
                  placeholder="Your full name"
                  value={profile.full_name}
                  onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>
                  Phone number{" "}
                  <span className="text-xs text-destructive font-normal">* required for bookings</span>
                </Label>
                <Input
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
                {!profile.phone && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    You need a phone number on file before you can book a service.
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer rounded-xl border px-4 py-3 hover:bg-accent transition-colors">
                <input
                  type="checkbox"
                  className="accent-primary h-4 w-4 mt-0.5 shrink-0"
                  checked={profile.is_whatsapp}
                  onChange={(e) => setProfile((p) => ({ ...p, is_whatsapp: e.target.checked }))}
                />
                <div>
                  <p className="text-sm font-medium">This number is on WhatsApp</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vendors can message you on WhatsApp after a booking is accepted.
                  </p>
                </div>
              </label>

              <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                <Save className="h-4 w-4 mr-1" />
                Save changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">My Pets</CardTitle>
              <Link href="/pet/my" className="text-xs text-primary hover:underline font-medium">
                Manage →
              </Link>
            </CardHeader>
            <CardContent>
              {pets.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground">
                  <PawPrint className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No pets added yet</p>
                  <Link href="/pet/new" className="text-xs text-primary hover:underline mt-1 inline-block">
                    Add your first pet →
                  </Link>
                </div>
              ) : (
                <div className="grid gap-2">
                  {pets.map((pet) => (
                    <div key={pet.id} className="flex items-center gap-3 rounded-xl border px-4 py-3">
                      <span className="text-2xl">{PET_EMOJI[pet.type] ?? "🐾"}</span>
                      <div>
                        <p className="font-medium text-sm">{pet.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {pet.type}
                          {pet.breed ? ` · ${pet.breed}` : ""}
                          {pet.age_years ? ` · ${pet.age_years}y` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
