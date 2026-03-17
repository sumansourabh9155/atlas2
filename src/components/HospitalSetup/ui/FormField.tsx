import type { ReactNode } from "react";

interface Props {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  optional,
  children,
  className = "",
}: Props) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700 leading-none"
        >
          {label}
          {required && (
            <span className="ml-1 text-red-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {optional && (
          <span className="text-xs text-gray-400 shrink-0">Optional</span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500 leading-relaxed">{hint}</p>
      )}
      {error && (
        <p className="text-xs text-red-500" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
