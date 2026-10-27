"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

export default function AddPetPage() {
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    gender: "",
    age_years: "",
    description: "",
    is_vaccinated: false,
    is_neutered: false,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Photo too large", description: "Max size is 5 MB.", variant: "destructive" });
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
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

    let image_url: string | null = null;

    // Upload photo if provided
    if (photo) {
      const ext = photo.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pet-photos")
        .upload(path, photo, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        toast({
          title: "Photo upload failed",
          description: "Could not upload photo. Make sure the 'pet-photos' storage bucket exists in Supabase.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("pet-photos")
        .getPublicUrl(uploadData.path);
      image_url = publicUrl;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("shelter_animals") as any).insert({
      shelter_id: null,
      posted_by_user_id: user.id,
      name: form.name,
      species: form.species,
      breed: form.breed || null,
      gender: form.gender || null,
      age_years: form.age_years ? parseFloat(form.age_years) : null,
      description: form.description || null,
      is_vaccinated: form.is_vaccinated,
      is_neutered: form.is_neutered,
      adoption_status: "available",
      image_url,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Failed to add pet", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pet listed for adoption!", description: `${form.name} is now visible to adopters.` });
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
          <h1 className="text-2xl font-bold">List a Pet for Adoption</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your pet will appear in the adoption directory once submitted.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          {/* Photo upload */}
          <Card>
            <CardHeader><CardTitle className="text-base">Pet Photo <span className="text-muted-foreground font-normal text-sm">(optional, max 5 MB)</span></CardTitle></CardHeader>
            <CardContent>
              {photoPreview ? (
                <div className="relative w-full max-w-xs">
                  <img src={photoPreview} alt="Preview" className="rounded-xl w-full h-48 object-cover border" />
                  <button
                    type="button"
                    onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                    className="absolute top-2 right-2 rounded-full bg-background border p-1 shadow hover:bg-accent transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload a photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP — max 5 MB</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Basic details */}
          <Card>
            <CardHeader><CardTitle className="text-base">Pet Details</CardTitle></CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Pet name *</Label>
                  <Input placeholder="e.g. Buddy" value={form.name} onChange={(e) => update("name", e.target.value)} required />
                </div>
                <div className="grid gap-1.5">
                  <Label>Species *</Label>
                  <Select value={form.species} onValueChange={(v) => update("species", v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog 🐶</SelectItem>
                      <SelectItem value="cat">Cat 🐱</SelectItem>
                      <SelectItem value="rabbit">Rabbit 🐰</SelectItem>
                      <SelectItem value="bird">Bird 🐦</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Breed <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Input placeholder="e.g. Labrador, Indie" value={form.breed} onChange={(e) => update("breed", e.target.value)} />
                </div>
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
              </div>

              <div className="grid gap-1.5">
                <Label>Age <span className="text-muted-foreground text-xs">(years — e.g. 0.5 for 6 months)</span></Label>
                <Input
                  type="number" min="0" max="30" step="0.5"
                  placeholder="2"
                  value={form.age_years}
                  onChange={(e) => update("age_years", e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>About this pet</Label>
                <textarea
                  className="flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  placeholder="Describe the pet's personality, behaviour, and any special needs…"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Health */}
          <Card>
            <CardHeader><CardTitle className="text-base">Health Status</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {[
                { key: "is_vaccinated", label: "Vaccinated" },
                { key: "is_neutered", label: "Spayed / Neutered" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => update(key, e.target.checked)}
                    className="accent-primary h-4 w-4"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading || !form.name || !form.species} size="lg">
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Listing pet…</>
              : <><Save className="h-4 w-4 mr-2" />List for adoption</>
            }
          </Button>
        </form>
      </main>
    </>
  );
}
