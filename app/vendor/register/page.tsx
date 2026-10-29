"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Store, Loader2, AlertCircle } from "lucide-react";
import { checkEmailIsCustomer } from "./actions";

export default function VendorRegisterPage() {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [blocked, setBlocked] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase.from("users") as any)
          .select("role").eq("id", user.id).single();
        if (profile?.role === "vendor") {
          router.push("/vendor/dashboard");
          return;
        }
        if (profile?.role === "customer") {
          setBlocked(true);
          setChecking(false);
          return;
        }
      }
      setChecking(false);
    }
    checkSession();
  }, []);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Block if this email is already a customer account
    const isCustomerEmail = await checkEmailIsCustomer(email);
    if (isCustomerEmail) {
      setLoading(false);
      toast({
        title: "Email already registered as customer",
        description: "This email belongs to a customer account and cannot be used to register as a vendor. Please use a different email address.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: businessName,
          is_vendor: true,
        },
      },
    });

    setLoading(false);

    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Account created!",
        description: "Check your email to confirm, then sign in to set up your business.",
      });
      router.push("/vendor/login");
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4">
        <div className="w-full max-w-sm rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-3" />
          <h2 className="font-bold text-lg mb-1">Customer account detected</h2>
          <p className="text-sm text-muted-foreground mb-4">
            You&apos;re signed in with a customer account. Customer emails cannot be used to register as a vendor — vendor accounts require a separate email address.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard">Back to my dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-primary/10 to-background px-4">
      <Link href="/" className="mb-8 flex items-center gap-2 text-xl font-bold">
        <Store className="h-7 w-7 text-primary" />
        Team Motu — Vendor Portal
      </Link>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Register as Vendor</CardTitle>
          <CardDescription>List your grooming salon, shelter, or medical store</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Business / Your name</Label>
              <Input
                id="name"
                placeholder="e.g. Paws & Claws Grooming"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />
            </div>
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
                placeholder="8+ characters"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account…" : "Create vendor account"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link href="/vendor/login" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Looking to adopt or book?{" "}
            <Link href="/register" className="text-primary underline-offset-4 hover:underline">
              Customer sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
