"use client";

import { motion } from "framer-motion";

const PINS = [
  { x: "18%", y: "42%", delay: 0 },
  { x: "72%", y: "28%", delay: 0.4 },
  { x: "55%", y: "62%", delay: 0.8 },
  { x: "35%", y: "55%", delay: 1.2 },
];

export function HeroMapBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#e7e5e4_0%,_transparent_55%)]" />
      <svg className="absolute inset-0 h-full w-full text-stone-300/50" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {PINS.map((pin) => (
        <motion.span
          key={`${pin.x}-${pin.y}`}
          className="absolute h-2 w-2 rounded-full bg-stone-400/80 shadow-sm"
          style={{ left: pin.x, top: pin.y }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: pin.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
