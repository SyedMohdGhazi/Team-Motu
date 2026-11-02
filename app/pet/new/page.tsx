"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface PetForm {
  name: string;
  type: string;
  gender: string;
  breed: string;
  age_years: string;
  weight_kg: string;
  allergies: string;
  medications: string;
  notes: string;
}

const EMPTY: PetForm = {
  name: "", type: "", gender: "", breed: "",
  age_years: "", weight_kg: "", allergies: "", medications: "", notes: "",
};

export default function NewPetPage() {
  const [form, setForm] = useState<PetForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  function update(field: keyof PetForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const payload = {
      user_id: user.id,
      name: form.name,
      type: form.type,
      gender: form.gender || null,
      breed: form.breed || null,
      age_years: form.age_years ? parseFloat(form.age_years) : null,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      allergies: form.allergies || null,
      medications: form.medications || null,
      notes: form.notes || null,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("user_pets") as any).insert(payload);
    setLoading(false);

    if (error) {
      toast({ title: "Failed to add pet", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pet added!", description: `${form.name}'s profile has been saved.` });
      router.push("/pet/my");
    }
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-md px-4 py-8">
        <Link
          href="/pet/my"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> My pets
        </Link>

        <h1 className="text-2xl font-bold mb-1">Add a pet</h1>
        <p className="text-sm text-muted-foreground mb-6">Your pet&apos;s profile is private — only you can see it.</p>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Basic info</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Name *</Label>
                  <Input
                    placeholder="e.g. Bruno"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => update("type", v)} required>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">🐶 Dog</SelectItem>
                      <SelectItem value="cat">🐱 Cat</SelectItem>
                      <SelectItem value="rabbit">🐰 Rabbit</SelectItem>
                      <SelectItem value="bird">🐦 Bird</SelectItem>
                      <SelectItem value="other">🐾 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => update("gender", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Breed <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    placeholder="e.g. Labrador"
                    value={form.breed}
                    onChange={(e) => update("breed", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Age (years)</Label>
                  <Input
                    type="number" min="0" max="30" step="0.5"
                    placeholder="e.g. 2"
                    value={form.age_years}
                    onChange={(e) => update("age_years", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number" min="0" max="200" step="0.1"
                    placeholder="e.g. 12.5"
                    value={form.weight_kg}
                    onChange={(e) => update("weight_kg", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Health info <span className="text-muted-foreground font-normal text-sm">(optional)</span></CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Allergies</Label>
                <Input
                  placeholder="e.g. chicken, wheat"
                  value={form.allergies}
                  onChange={(e) => update("allergies", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Medications</Label>
                <Input
                  placeholder="e.g. monthly flea treatment"
                  value={form.medications}
                  onChange={(e) => update("medications", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Notes</Label>
                <Input
                  placeholder="Anything else about your pet"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading || !form.name || !form.type}
            size="lg"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
              : <><Save className="h-4 w-4 mr-2" />Add pet</>
            }
          </Button>
        </form>
      </main>
    </>
  );
}
