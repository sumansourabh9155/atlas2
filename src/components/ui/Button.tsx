/**
 * Button — Unified button primitive for the Atlas design system.
 *
 * Variants:
 *  - primary   → solid teal CTA
 *  - secondary → bordered neutral
 *  - ghost     → no border, subtle hover
 *  - danger    → red destructive
 *  - soft      → teal background (light)
 *
 * Sizes: sm | md | lg
 *
 * Renders <button> by default. Passes all native button props.
 */

import React from "react";
import type { LucideIcon } from "lucide-react";

/* ── Variant class maps ─────────────────────────────────────────── */

const VARIANT = {
  primary:
    "bg-teal-600 text-white border border-teal-600 hover:bg-teal-700 active:bg-teal-800",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100",
  ghost:
    "bg-transparent text-gray-600 border border-transparent hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200",
  danger:
    "bg-white text-red-600 border border-red-300 hover:bg-red-50 active:bg-red-100",
  soft:
    "bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 active:bg-teal-200",
} as const;

const SIZE = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-5 py-3 text-sm gap-2",
} as const;

const ICON_SIZE = { sm: 13, md: 15, lg: 16 } as const;

/* ── Props ──────────────────────────────────────────────────────── */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  keyof typeof VARIANT;
  size?:     keyof typeof SIZE;
  icon?:     LucideIcon;
  iconRight?: LucideIcon;
  /** Full-width button */
  fluid?:    boolean;
  /** Loading state — disables and shows spinner */
  loading?:  boolean;
}

/* ── Component ──────────────────────────────────────────────────── */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button({
  variant = "primary",
  size = "md",
  icon: LeftIcon,
  iconRight: RightIcon,
  fluid = false,
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps, ref) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-medium rounded-lg",
        "transition-colors duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
        VARIANT[variant],
        SIZE[size],
        fluid ? "w-full" : "",
        isDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {!loading && LeftIcon && (
        <LeftIcon size={ICON_SIZE[size]} className="flex-shrink-0" aria-hidden="true" />
      )}
      {children}
      {RightIcon && (
        <RightIcon size={ICON_SIZE[size]} className="flex-shrink-0" aria-hidden="true" />
      )}
    </button>
  );
});

/* ── IconButton — square icon-only variant ──────────────────────── */

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon:      LucideIcon;
  size?:     "sm" | "md" | "lg";
  variant?:  "ghost" | "danger";
  label:     string;
}

const ICON_BTN_SIZE = {
  sm: { pad: "p-1.5", icon: 13 },
  md: { pad: "p-2",   icon: 15 },
  lg: { pad: "p-2.5", icon: 18 },
} as const;

const ICON_BTN_VARIANT = {
  ghost:  "text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:bg-gray-200",
  danger: "text-gray-400 hover:text-red-500 hover:bg-red-50 active:bg-red-100",
} as const;

export function IconButton({
  icon: Icon,
  size = "md",
  variant = "ghost",
  label,
  className = "",
  ...rest
}: IconButtonProps) {
  const s = ICON_BTN_SIZE[size];
  return (
    <button
      title={label}
      aria-label={label}
      className={[
        "rounded-md transition-colors duration-150",
        "focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1 outline-none",
        s.pad,
        ICON_BTN_VARIANT[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      <Icon size={s.icon} aria-hidden="true" />
    </button>
  );
}
