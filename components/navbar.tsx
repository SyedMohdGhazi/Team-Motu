"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PawPrint, User, LogOut, LayoutDashboard, Store, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<"customer" | "vendor" | "admin" | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase.from("users") as any)
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role ?? "customer");
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase.from("users") as any)
          .select("role")
          .eq("id", session.user.id)
          .single();
        setRole(profile?.role ?? "customer");
      } else {
        setRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setRole(null);
    router.push("/");
    router.refresh();
  }

  const isVendor = role === "vendor";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <PawPrint className="h-6 w-6 text-primary" />
          <span>Team Motu</span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          <ThemeToggle />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium hover:bg-accent transition-colors ${isVendor ? "border-primary/40 text-primary" : ""}`}
              >
                {isVendor ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {isVendor ? "Vendor" : user.email?.split("@")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-md py-1">
                  {isVendor ? (
                    <Link
                      href="/vendor/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <Store className="h-4 w-4" /> Vendor Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  )}
                  <div className="border-t my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" asChild>
                <Link href="/vendor/login">Vendors</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase.from("users") as any)
          .select("role")
          .eq("id", user.id)
          .single();
        setRole(profile?.role ?? "customer");
      }
    }
    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase.from("users") as any)
          .select("role")
          .eq("id", session.user.id)
          .single();
        setRole(profile?.role ?? "customer");
      } else {
        setRole(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setRole(null);
    router.push("/");
    router.refresh();
  }

  const isVendor = role === "vendor";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <PawPrint className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">Team Motu</span>
        </Link>

        {/* Location + radius */}
        <div className="flex items-center gap-2 mx-4 flex-1 justify-center max-w-xs">
          <button className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-none">
              Dehradun
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setRadiusOpen((o) => !o)}
              className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              {radius}
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
            {radiusOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-24 rounded-lg border bg-popover shadow-md py-1">
                {RADIUS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRadius(r); setRadiusOpen(false); }}
                    className={`w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors ${r === radius ? "text-primary font-semibold" : ""}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1 shrink-0">
          <ThemeToggle />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium hover:bg-accent transition-colors ${isVendor ? "border-primary/40 text-primary" : ""}`}
              >
                {isVendor ? <Store className="h-4 w-4" /> : <User className="h-4 w-4" />}
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {isVendor ? "Vendor" : user.email?.split("@")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-md py-1">
                  {isVendor ? (
                    <Link
                      href="/vendor/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <Store className="h-4 w-4" /> Vendor Dashboard
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  )}
                  <div className="border-t my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-accent transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" asChild>
                <Link href="/vendor/login">Vendors</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
