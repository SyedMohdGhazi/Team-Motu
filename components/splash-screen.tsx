"use client";

import { useState, useEffect } from "react";

export function SplashScreen() {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    if (sessionStorage.getItem("tm-splash")) {
      setPhase("gone");
      return;
    }
    sessionStorage.setItem("tm-splash", "1");
    const fadeTimer = setTimeout(() => setPhase("fading"), 1500);
    const hideTimer = setTimeout(() => setPhase("gone"),   1850);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-350 ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Pets */}
      <div className="flex items-end gap-6">
        <span
          className="animate-pop-in text-[88px] leading-none select-none"
          style={{ animationDelay: "80ms" }}
        >
          🐶
        </span>
        <span
          className="animate-pop-in text-[72px] leading-none select-none"
          style={{ animationDelay: "220ms" }}
        >
          🐱
        </span>
      </div>

      {/* App name */}
      <p
        className="mt-5 text-2xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-purple-400 bg-clip-text text-transparent animate-fade-up"
        style={{ animationDelay: "480ms" }}
      >
        Team Motu
      </p>
      <p
        className="mt-1 text-xs text-muted-foreground animate-fade-up"
        style={{ animationDelay: "600ms" }}
      >
        Pet services · Dehradun
      </p>
    </div>
  );
}
