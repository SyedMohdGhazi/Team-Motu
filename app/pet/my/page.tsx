"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";

interface UserPet {
  id: string;
  name: string;
  type: string;
  breed: string | null;
  age_years: number | null;
  gender: string | null;
  weight_kg: number | null;
}

const PET_EMOJI: Record<string, string> = {
  dog: "🐶", cat: "🐱", rabbit: "🐰", bird: "🐦", other: "🐾",
};

export default function MyPetsPage() {
  const [pets, setPets] = useState<UserPet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase.from("user_pets") as any)
        .select("id, name, type, breed, age_years, gender, weight_kg")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setPets((data as UserPet[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function deletePet(pet: UserPet) {
    if (!confirm(`Remove ${pet.name}? This cannot be undone.`)) return;
    setDeletingId(pet.id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("user_pets") as any).delete().eq("id", pet.id);

    if (error) {
      toast({ title: "Could not remove pet", description: error.message, variant: "destructive" });
    } else {
      setPets((prev) => prev.filter((p) => p.id !== pet.id));
      toast({ title: `${pet.name} removed` });
    }
    setDeletingId(null);
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
      <main className="container mx-auto max-w-md px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">My Pets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {pets.length === 0 ? "No pets added yet" : `${pets.length} pet${pets.length > 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/pet/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add pet
            </Button>
          </Link>
        </div>

        {pets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center py-12 gap-4 text-center">
              <span className="text-5xl">🐾</span>
              <div>
                <p className="font-semibold">No pets yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your pet to personalise your experience</p>
              </div>
              <Link href="/pet/new">
                <Button className="gap-1.5">
                  <Plus className="h-4 w-4" /> Add your first pet
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {pets.map((pet) => (
              <Card key={pet.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#62C995]/40 bg-[#62C995]/10 text-3xl">
                    {PET_EMOJI[pet.type] ?? "🐾"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{pet.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {[
                        pet.breed,
                        pet.age_years != null ? `${pet.age_years}y` : null,
                        pet.weight_kg != null ? `${pet.weight_kg} kg` : null,
                        pet.gender && pet.gender !== "unknown" ? pet.gender : null,
                      ].filter(Boolean).join(" · ") || pet.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/pet/${pet.id}`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deletePet(pet)}
                      disabled={deletingId === pet.id}
                    >
                      {deletingId === pet.id
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Trash2 className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
