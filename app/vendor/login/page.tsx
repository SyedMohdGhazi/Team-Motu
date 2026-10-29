"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Store } from "lucide-react";

export default function VendorLoginPage() {
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

    // Check role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from("users") as any)
      .select("role")
      .eq("id", data.user.id)
      .single();

    const role = profile?.role;

    if (role === "admin") {
      router.push("/admin");
      router.refresh();
      return;
    }

    if (role === "vendor") {
      router.push("/vendor/dashboard");
      router.refresh();
      return;
    }

    // customer or no profile — block
    toast({
      title: "Not a vendor account",
      description: "This portal is for vendors only. Please use the main login or register as a vendor.",
      variant: "destructive",
    });
    await supabase.auth.signOut();
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold">
        <Store className="h-7 w-7 text-primary" />
        Team Motu — Vendor Portal
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Vendor Sign In</CardTitle>
          <CardDescription>Access your business dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in as Vendor"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New vendor?{" "}
            <Link href="/vendor/register" className="text-primary underline-offset-4 hover:underline">
              Register your business
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Customer?{" "}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Sign in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
