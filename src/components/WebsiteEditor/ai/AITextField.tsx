import { useState, useRef, useEffect } from "react";
import { useAIField } from "./useAIField";
import { AIFieldToolbar } from "./AIFieldToolbar";
import { useAIEditorContext } from "./AIEditorContext";

// ─── Shared styles (match the rest of the editors) ────────────────────────────

const BASE_INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors";

const BASE_TEXTAREA =
  "w-full px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors resize-none py-2 leading-relaxed";

// ─── Loading shimmer (overlaid on the field while AI is running) ──────────────

const SHIMMER_STYLE = `
@keyframes aiFieldShimmer {
  0%   { background-position:  200% center; }
  100% { background-position: -200% center; }
}`;

function LoadingShimmer() {
  return (
    <>
      <style>{SHIMMER_STYLE}</style>
      <div
        className="absolute inset-0 rounded-md pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.07) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          animation: "aiFieldShimmer 1.4s linear infinite",
        }}
      />
    </>
  );
}

// ─── AITextField ──────────────────────────────────────────────────────────────

interface AITextFieldProps {
  value:       string;
  onChange:    (v: string) => void;
  /** Dot-separated field key passed to the AI engine, e.g. "headline", "services.title" */
  fieldKey:    string;
  placeholder?: string;
  className?:  string;
  type?:       string;
  disabled?:   boolean;
}

export function AITextField({
  value,
  onChange,
  fieldKey,
  placeholder,
  className,
  type = "text",
  disabled,
}: AITextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { run, isLoading, loadingAction, canUndo, undo } = useAIField({
    value,
    onChange,
    fieldKey,
  });

  // ── Preview click-to-target: auto-focus when pendingFocusKey matches ──────
  const inputRef = useRef<HTMLInputElement>(null);
  const { pendingFocusKey, requestFieldFocus } = useAIEditorContext();
  useEffect(() => {
    if (pendingFocusKey !== fieldKey) return;
    requestFieldFocus(null); // clear immediately so no other field reacts
    const t = setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(t);
  }, [pendingFocusKey, fieldKey, requestFieldFocus]);

  const showToolbar = isFocused || isLoading;

  return (
    <div>
      {/* Field */}
      <div className="relative">
        <input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={className ?? BASE_INPUT}
          aria-busy={isLoading}
        />
        {isLoading && <LoadingShimmer />}
      </div>

      {/* AI action toolbar — smooth height transition */}
      <AIFieldToolbar
        isVisible={showToolbar}
        isLoading={isLoading}
        loadingAction={loadingAction}
        canUndo={canUndo}
        multiline={false}
        onAction={run}
        onUndo={undo}
      />
    </div>
  );
}

// ─── AITextarea ───────────────────────────────────────────────────────────────

interface AITextareaProps {
  value:       string;
  onChange:    (v: string) => void;
  fieldKey:    string;
  placeholder?: string;
  rows?:       number;
  maxLength?:  number;
  className?:  string;
  disabled?:   boolean;
}

export function AITextarea({
  value,
  onChange,
  fieldKey,
  placeholder,
  rows = 3,
  maxLength,
  className,
  disabled,
}: AITextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const { run, isLoading, loadingAction, canUndo, undo } = useAIField({
    value,
    onChange,
    fieldKey,
  });

  // ── Preview click-to-target: auto-focus when pendingFocusKey matches ──────
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { pendingFocusKey, requestFieldFocus } = useAIEditorContext();
  useEffect(() => {
    if (pendingFocusKey !== fieldKey) return;
    requestFieldFocus(null);
    const t = setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => clearTimeout(t);
  }, [pendingFocusKey, fieldKey, requestFieldFocus]);

  const showToolbar = isFocused || isLoading;

  return (
    <div>
      {/* Field */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled || isLoading}
          className={className ?? BASE_TEXTAREA}
          aria-busy={isLoading}
        />
        {isLoading && <LoadingShimmer />}
      </div>

      {/* AI action toolbar — smooth height transition, multiline = shows shorten+expand */}
      <AIFieldToolbar
        isVisible={showToolbar}
        isLoading={isLoading}
        loadingAction={loadingAction}
        canUndo={canUndo}
        multiline={true}
        onAction={run}
        onUndo={undo}
      />
    </div>
  );
}
