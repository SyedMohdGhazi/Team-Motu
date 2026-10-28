"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save, Camera, X as XIcon, ImagePlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTOS = 4;

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
  const [photos, setPhotos] = useState<Array<{ file: File; preview: string }>>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_PHOTOS - photos.length;
    const toAdd = files.slice(0, remaining).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((p) => [...p, ...toAdd]);
    if (e.target) e.target.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos((p) => {
      URL.revokeObjectURL(p[idx].preview);
      return p.filter((_, i) => i !== idx);
    });
  }

  async function uploadPhotos(userId: string): Promise<string[]> {
    const urls: string[] = [];
    for (const { file } of photos) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("shelter-photos")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("shelter-photos").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
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

    let photoUrls: string[] = [];
    if (photos.length > 0) {
      try {
        photoUrls = await uploadPhotos(user.id);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast({ title: "Photo upload failed", description: msg, variant: "destructive" });
        setLoading(false);
        return;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("shelters") as any).insert({
      user_id: user.id,
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
      is_active: false,
      approval_status: "pending",
      photos: photoUrls,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Shelter registered!",
        description: "Your listing is under review. You'll go live once approved.",
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
            Your listing will appear on Team Motu after admin review.
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

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-4 w-4" /> Shelter Photos
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  (up to {MAX_PHOTOS})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-xs text-muted-foreground">
                Show potential fosters and pet owners what your space looks like. Good photos increase enquiries.
              </p>
              <div className="grid grid-cols-4 gap-2">
                {photos.map(({ preview }, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img src={preview} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-1 text-muted-foreground/50 hover:text-muted-foreground"
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="text-[10px]">Add photo</span>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoSelect}
              />
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
