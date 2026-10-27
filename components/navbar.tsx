"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, PawPrint, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const RADIUS_OPTIONS = ["5 km", "7 km", "10 km", "15 km"] as const;
type Radius = (typeof RADIUS_OPTIONS)[number];

export function Navbar() {
  const [radius, setRadius] = useState<Radius>("5 km");
  const [radiusOpen, setRadiusOpen] = useState(false);

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
          <button
            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
          >
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate max-w-[160px] sm:max-w-none">
              ISBT / Clement Town, Dehradun
            </span>
          </button>

          {/* Radius dropdown */}
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
                    className={`w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors ${
                      r === radius ? "text-primary font-semibold" : ""
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/login">
              <User className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
