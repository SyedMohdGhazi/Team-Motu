"use client";

import { useState, useEffect } from "react";
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
  breed: string;
  age_years: string;
  notes: string;
}

const EMPTY: PetForm = { name: "", type: "", breed: "", age_years: "", notes: "" };

export default function MyPetPage() {
  const [form, setForm] = useState<PetForm>(EMPTY);
  const [petId, setPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("user_pets") as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setPetId(data.id);
        setForm({
          name: data.name ?? "",
          type: data.type ?? "",
          breed: data.breed ?? "",
          age_years: data.age_years?.toString() ?? "",
          notes: data.notes ?? "",
        });
      }
      setInitializing(false);
    }
    load();
  }, []);

  function update(field: keyof PetForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const payload = {
      user_id: user.id,
      name: form.name,
      type: form.type,
      breed: form.breed || null,
      age_years: form.age_years ? parseFloat(form.age_years) : null,
      notes: form.notes || null,
    };

    let error;
    if (petId) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ error } = await (supabase.from("user_pets") as any).update(payload).eq("id", petId));
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ({ error } = await (supabase.from("user_pets") as any).insert(payload));
    }

    setLoading(false);

    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: petId ? "Pet updated!" : "Pet added!", description: `${form.name}'s profile is saved.` });
      router.push("/dashboard");
    }
  }

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto max-w-md px-4 py-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <h1 className="text-2xl font-bold mb-1">{petId ? "Edit pet details" : "Add your pet"}</h1>
        <p className="text-sm text-muted-foreground mb-6">Your pet&apos;s profile is private — only you can see it.</p>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader><CardTitle className="text-base">Pet info</CardTitle></CardHeader>
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
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Breed <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input
                    placeholder="e.g. Labrador"
                    value={form.breed}
                    onChange={(e) => update("breed", e.target.value)}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Age (years)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    placeholder="2"
                    value={form.age_years}
                    onChange={(e) => update("age_years", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Input
                  placeholder="e.g. allergic to wheat, loves playing fetch"
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading || !form.name || !form.type}
            className="w-full mt-4"
            size="lg"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
              : <><Save className="h-4 w-4 mr-2" />{petId ? "Save changes" : "Add pet"}</>
            }
          </Button>
        </form>
      </main>
    </>
  );
}
