"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("users") as any)
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      toast({
        title: "Access denied",
        description: "This portal is restricted to administrators.",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800 border border-zinc-700">
            <ShieldCheck className="h-7 w-7 text-zinc-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-100">Team Motu Admin</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Restricted access only</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label className="text-zinc-400 text-xs">Email</Label>
            <Input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-zinc-400 text-xs">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-zinc-500"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 mt-1"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
