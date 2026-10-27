"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ChevronDown, PawPrint, User, LogOut, LayoutDashboard, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const RADIUS_OPTIONS = ["5 km", "7 km", "10 km", "15 km"] as const;
type Radius = (typeof RADIUS_OPTIONS)[number];

export function Navbar() {
  const [radius, setRadius] = useState<Radius>("5 km");
  const [radiusOpen, setRadiusOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  }

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
              ISBT / Clement Town, Dehradun
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
                className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline max-w-[100px] truncate">
                  {user.email?.split("@")[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-lg border bg-popover shadow-md py-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link
                    href="/vendor/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <Store className="h-4 w-4" /> Vendor Portal
                  </Link>
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
            <Button size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
