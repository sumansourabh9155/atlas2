/**
 * Input, Textarea, SearchInput — Form input primitives.
 *
 * Single consistent input style across the platform:
 *  - h-9, border-gray-300, rounded-lg, teal focus ring
 *  - Disabled state: bg-gray-50, text-gray-400
 *  - Error state: border-red-400, focus ring red
 */

import React from "react";
import type { LucideIcon } from "lucide-react";
import { Search } from "lucide-react";

/* ── Shared class constants ─────────────────────────────────────── */

const BASE = [
  "w-full text-sm text-gray-900 bg-white",
  "border border-gray-300 rounded-lg",
  "placeholder:text-gray-400",
  "transition-colors",
  "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
].join(" ");

const FOCUS = "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500";
const ERROR_FOCUS = "focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400";

/* ═══════════════════════════════════════════════════════════════════
   Input
   ═══════════════════════════════════════════════════════════════════ */

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?:     boolean;
  icon?:      LucideIcon;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, icon: Icon, className = "", ...rest }, ref) => (
    <div className={Icon ? "relative" : ""}>
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          aria-hidden="true"
        />
      )}
      <input
        ref={ref}
        className={[
          "h-9 px-3",
          BASE,
          error ? "border-red-400" : "",
          error ? ERROR_FOCUS : FOCUS,
          Icon ? "pl-9" : "",
          className,
        ].filter(Boolean).join(" ")}
        {...rest}
      />
    </div>
  ),
);
Input.displayName = "Input";

/* ═══════════════════════════════════════════════════════════════════
   Textarea
   ═══════════════════════════════════════════════════════════════════ */

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className = "", ...rest }, ref) => (
    <textarea
      ref={ref}
      className={[
        "px-3 py-2.5 resize-none",
        BASE,
        error ? "border-red-400" : "",
        error ? ERROR_FOCUS : FOCUS,
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    />
  ),
);
Textarea.displayName = "Textarea";

/* ═══════════════════════════════════════════════════════════════════
   SearchInput — Input with built-in search icon
   ═══════════════════════════════════════════════════════════════════ */

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Container className for width control */
  wrapperClassName?: string;
}

export function SearchInput({
  wrapperClassName = "",
  className = "",
  ...rest
}: SearchInputProps) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <Search
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="text"
        className={[
          "w-full h-9 pl-9 pr-4 text-sm bg-white",
          "border border-gray-200 rounded-lg",
          "placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
          "transition-colors",
          className,
        ].join(" ")}
        {...rest}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Select
   ═══════════════════════════════════════════════════════════════════ */

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error = false, className = "", children, ...rest }, ref) => (
    <select
      ref={ref}
      className={[
        "appearance-none h-9 pl-3 pr-8 cursor-pointer",
        BASE,
        error ? "border-red-400" : "",
        error ? ERROR_FOCUS : FOCUS,
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
