"use client";

import { useEffect, useRef } from "react";

const PETS = [
  { t: "🐱", x: 6,  y: 10, s: 80, d: 0,   sp: 16, px: 60, r: -12 },
  { t: "🐶", x: 83, y: 6,  s: 96, d: 2.5, sp: 20, px: 80, r:  10 },
  { t: "🐾", x: 76, y: 56, s: 54, d: 4.5, sp: 18, px: 40, r:   0 },
  { t: "🐱", x: 9,  y: 64, s: 68, d: 6.5, sp: 22, px: 55, r:  15 },
  { t: "🐶", x: 88, y: 73, s: 46, d: 1,   sp: 17, px: 35, r:  -8 },
  { t: "🐾", x: 45, y: 3,  s: 42, d: 3.5, sp: 19, px: 30, r:   5 },
  { t: "🐱", x: 26, y: 34, s: 50, d: 6,   sp: 21, px: 45, r: -15 },
  { t: "🐶", x: 60, y: 80, s: 62, d: 8,   sp: 15, px: 50, r:   8 },
  { t: "🐾", x: 18, y: 84, s: 36, d: 3,   sp: 24, px: 25, r:  -5 },
  { t: "🐱", x: 52, y: 44, s: 44, d: 9,   sp: 13, px: 38, r:  20 },
];

export function HomeBg() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = ref.current?.querySelectorAll<HTMLElement>("[data-px]");
    if (!els?.length) return;
    let raf: number;

    function onMove(e: MouseEvent) {
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        els.forEach((el) => {
          const px = parseFloat(el.dataset.px ?? "40");
          el.style.transform = `translate(${mx * px}px, ${my * px}px)`;
        });
      });
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes pet-float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-16px); }
        }
        @keyframes blob-pulse {
          0%,100% { transform: scale(1);    opacity: .55; }
          50%     { transform: scale(1.18); opacity: .75; }
        }
      `}</style>

      <div ref={ref} aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
        {/* Ambient colour blobs */}
        <div
          className="absolute -top-48 -left-48 h-[560px] w-[560px] rounded-full bg-violet-500/25 blur-[130px]"
          style={{ animation: "blob-pulse 9s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-pink-500/20 blur-[120px]"
          style={{ animation: "blob-pulse 11s ease-in-out infinite 3.5s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full bg-amber-400/15 blur-[110px]"
          style={{ animation: "blob-pulse 13s ease-in-out infinite 7s" }}
        />

        {/* Floating pets with mouse parallax */}
        {PETS.map((p, i) => (
          <div
            key={i}
            data-px={p.px}
            className="absolute transition-transform duration-700 ease-out"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          >
            <div style={{ animation: `pet-float ${p.sp}s ${p.d}s ease-in-out infinite both` }}>
              <span
                style={{
                  display: "block",
                  transform: `rotate(${p.r}deg)`,
                  fontSize: `${p.s}px`,
                  lineHeight: 1,
                  opacity: 0.08,
                  filter: "saturate(0) brightness(0.35)",
                }}
              >
                {p.t}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
