/**
 * Avatar — Gradient circle with initials.
 *
 * Used in user tables, activity feeds, profile sections.
 * Consistent sizing, font, and shape across the platform.
 */

import React from "react";

/* ── Size map ───────────────────────────────────────────────────── */

const SIZE = {
  xs: { box: "w-6 h-6",   text: "text-[9px]",  radius: "rounded-md"  },
  sm: { box: "w-7 h-7",   text: "text-[10px]",  radius: "rounded-lg"  },
  md: { box: "w-8 h-8",   text: "text-[11px]",  radius: "rounded-lg"  },
  lg: { box: "w-10 h-10", text: "text-xs",       radius: "rounded-lg"  },
  xl: { box: "w-12 h-12", text: "text-sm",       radius: "rounded-xl"  },
} as const;

/* ── Props ──────────────────────────────────────────────────────── */

export interface AvatarProps {
  /** 2-char initials (auto-uppercased) */
  initials:     string;
  /** Tailwind gradient string, e.g. "from-violet-500 to-violet-700" */
  gradient?:    string;
  size?:        keyof typeof SIZE;
  className?:   string;
}

/* ── Default gradients palette ──────────────────────────────────── */

export const AVATAR_GRADIENTS = [
  "from-violet-500 to-violet-700",
  "from-blue-400 to-blue-600",
  "from-teal-500 to-teal-700",
  "from-pink-400 to-pink-600",
  "from-indigo-500 to-indigo-700",
  "from-teal-400 to-emerald-600",
] as const;

/** Deterministic gradient from a string (name, email, etc.) */
export function gradientFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

/* ── Component ──────────────────────────────────────────────────── */

export function Avatar({
  initials,
  gradient = "from-teal-500 to-teal-700",
  size = "md",
  className = "",
}: AvatarProps) {
  const s = SIZE[size];

  return (
    <div
      className={[
        s.box,
        s.radius,
        "bg-gradient-to-br",
        gradient,
        "flex-shrink-0 flex items-center justify-center shadow-sm",
        className,
      ].join(" ")}
    >
      <span className={`text-white ${s.text} font-bold select-none`}>
        {initials.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
}
