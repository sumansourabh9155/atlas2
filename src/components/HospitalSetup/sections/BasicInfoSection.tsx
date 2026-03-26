import { useState, useRef, useEffect } from "react";
import {
  Link2, RefreshCw, CheckCircle2, AlertCircle,
  Palette, Image, Type, FileText,
} from "lucide-react";
import { FormField } from "../ui/FormField";
import type { ClinicGeneralDetails, HospitalType } from "../../../types/clinic";

// ─── Slug helpers ─────────────────────────────────────────────────────────────

function toSlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2;
}

// ─── Color presets ────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  { hex: "#0F766E", label: "Teal" },
  { hex: "#0284C7", label: "Sky Blue" },
  { hex: "#16A34A", label: "Green" },
  { hex: "#7C3AED", label: "Violet" },
  { hex: "#DC2626", label: "Red" },
  { hex: "#D97706", label: "Amber" },
  { hex: "#0891B2", label: "Cyan" },
  { hex: "#1D4ED8", label: "Blue" },
];

const HOSPITAL_TYPES: { value: HospitalType; label: string }[] = [
  { value: "general_practice",       label: "General Practice / Retail"     },
  { value: "specialty_referral",     label: "Specialty & Referral"          },
  { value: "emergency_critical_care",label: "Emergency & Critical Services" },
  { value: "mobile_clinic",          label: "Mobile / On-Demand"            },
  { value: "exotic_animal",          label: "Niche / Exotic"                },
  { value: "rehabilitation",         label: "Rehabilitation / Wellness"     },
  { value: "shelter_humane",         label: "Non-Profit / Community"        },
];

// ─── Shared input style ───────────────────────────────────────────────────────

const INPUT =
  "w-full h-9 px-3 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 " +
  "focus:border-teal-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400";

const CARD =
  "bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-5";

// ─── SectionCard ─────────────────────────────────────────────────────────────

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
        <span className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

// ─── SlugField ────────────────────────────────────────────────────────────────

interface SlugFieldProps {
  value: string;
  onChange: (slug: string) => void;
  name?: string;
}

function SlugField({ value, onChange, name = "slug" }: SlugFieldProps) {
  const [isManual, setIsManual] = useState(false);
  const valid = isValidSlug(value);

  function handleChange(raw: string) {
    setIsManual(true);
    onChange(toSlug(raw));
  }

  function resetToAuto(name: string) {
    setIsManual(false);
    onChange(toSlug(name));
  }

  const StatusIcon = valid ? CheckCircle2 : AlertCircle;
  const statusColor = valid ? "text-green-500" : "text-red-400";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor="slug"
          className="text-sm font-medium text-gray-700 leading-none"
        >
          URL Slug
          <span className="ml-1 text-red-500" aria-hidden="true">*</span>
        </label>
        {isManual && (
          <button
            type="button"
            onClick={() => resetToAuto(value)}
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition-colors"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            Reset to auto
          </button>
        )}
      </div>

      {/* Input with status icon */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Link2 className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          id="slug"
          name={name}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className={`${INPUT} pl-8 pr-8 font-mono text-xs`}
          placeholder="your-business-name"
          aria-describedby="slug-hint slug-status"
          aria-invalid={!valid && value.length > 0}
        />
        {value.length > 0 && (
          <div
            className="absolute inset-y-0 right-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
          </div>
        )}
      </div>

      {/* Preview URL */}
      <div
        id="slug-hint"
        className="flex items-center gap-1 text-xs text-gray-400 font-mono"
      >
        <span>yourbusiness.com/</span>
        <span className={valid ? "text-teal-600 font-semibold" : "text-gray-400"}>
          {value || "your-slug"}
        </span>
        {!isManual && value && (
          <span className="ml-1 font-sans font-normal text-gray-300">(auto)</span>
        )}
      </div>

      {!valid && value.length > 0 && (
        <p id="slug-status" className="text-xs text-red-500" role="alert">
          Slug must be lowercase, use hyphens only, and be at least 2 characters.
        </p>
      )}
    </div>
  );
}

// ─── ColorPickerField ─────────────────────────────────────────────────────────

function ColorPickerField({
  value,
  onChange,
  name = "primaryColor",
}: {
  value: string;
  onChange: (hex: string) => void;
  name?: string;
}) {
  const [hex, setHex] = useState(value);
  const nativeRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHex(value); }, [value]);

  function handleHexInput(raw: string) {
    const clean = raw.startsWith("#") ? raw : `#${raw}`;
    setHex(clean);
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) onChange(clean);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Preset swatches */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Color presets"
      >
        {PRESET_COLORS.map(({ hex: c, label }) => (
          <button
            key={c}
            type="button"
            onClick={() => { onChange(c); setHex(c); }}
            className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1"
            style={{
              backgroundColor: c,
              borderColor: hex === c ? "#0F766E" : "transparent",
              boxShadow: hex === c ? "0 0 0 3px white, 0 0 0 5px " + c : undefined,
            }}
            aria-label={`${label} (${c})`}
            aria-pressed={hex === c}
          />
        ))}
        {/* Custom color circle */}
        <button
          type="button"
          onClick={() => nativeRef.current?.click()}
          className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Pick custom color"
        >
          <Palette className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <input
          ref={nativeRef}
          type="color"
          value={hex}
          name={name}
          onChange={(e) => { onChange(e.target.value); setHex(e.target.value); }}
          className="sr-only"
          aria-label="Custom color picker"
          tabIndex={-1}
        />
      </div>

      {/* Hex text input + live preview */}
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-md border border-gray-200 shrink-0 shadow-sm"
          style={{ backgroundColor: hex }}
          aria-hidden="true"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => handleHexInput(e.target.value)}
          maxLength={7}
          className="w-28 h-8 px-2.5 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          aria-label="Hex color value"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// ─── BasicInfoSection ─────────────────────────────────────────────────────────

export interface BasicInfoData {
  general: Pick<
    ClinicGeneralDetails,
    "name" | "slug" | "primaryColor" | "secondaryColor" | "logoUrl" | "tagline" | "metaDescription"
  >;
  hospitalType: HospitalType;
}

interface Props {
  data: BasicInfoData;
  onChange: (updates: Partial<BasicInfoData>) => void;
}

export function BasicInfoSection({ data, onChange }: Props) {
  const { general, hospitalType } = data;

  function setGeneral(updates: Partial<BasicInfoData["general"]>) {
    onChange({ general: { ...general, ...updates } });
  }

  // When name changes, auto-update slug if not manually overridden
  function handleNameChange(name: string) {
    setGeneral({ name });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Identity ── */}
      <SectionCard
        icon={Type}
        title="Business Identity"
        description="This information appears in your site header, browser tab, and search results."
      >
        <FormField label="Business Name" htmlFor="name" required>
          <input
            id="name"
            name="name"
            type="text"
            value={general.name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={INPUT}
            placeholder="e.g. Luminary Salon & Spa"
            autoComplete="organization"
          />
        </FormField>

        {/* Auto-slug */}
        <SlugField
          value={general.slug}
          onChange={(slug) => setGeneral({ slug })}
          name="slug"
        />

        <FormField
          label="Business Type"
          htmlFor="hospitalType"
          hint="Used to categorise your business in the directory."
          required
        >
          <select
            id="hospitalType"
            name="hospitalType"
            value={hospitalType}
            onChange={(e) => onChange({ hospitalType: e.target.value as HospitalType })}
            className={INPUT}
          >
            {HOSPITAL_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Tagline"
          htmlFor="tagline"
          hint="A short phrase shown in the hero section and site footer."
          optional
        >
          <div className="relative">
            <input
              id="tagline"
              name="tagline"
              type="text"
              value={general.tagline ?? ""}
              onChange={(e) => setGeneral({ tagline: e.target.value })}
              maxLength={160}
              className={`${INPUT} pr-14`}
              placeholder="e.g. Excellence in every service, every visit."
            />
            <span className="absolute inset-y-0 right-3 flex items-center text-xs text-gray-400 pointer-events-none">
              {(general.tagline ?? "").length}/160
            </span>
          </div>
        </FormField>

        <FormField
          label="Meta Description"
          htmlFor="metaDescription"
          hint="Shown in Google search results. Aim for 120–160 characters."
          optional
        >
          <div className="relative">
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={general.metaDescription ?? ""}
              onChange={(e) => setGeneral({ metaDescription: e.target.value })}
              rows={3}
              maxLength={320}
              className={`${INPUT} h-auto py-2 resize-none`}
              placeholder="e.g. We offer premium services with expert professionals..."
            />
            <span className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
              {(general.metaDescription ?? "").length}/320
            </span>
          </div>
        </FormField>
      </SectionCard>

      {/* ── Logo ── */}
      <SectionCard
        icon={Image}
        title="Logo"
        description="Paste a CDN URL for your logo. SVG or high-resolution PNG recommended."
      >
        <FormField
          label="Logo URL"
          htmlFor="logoUrl"
          hint="Use an HTTPS URL. Ideal dimensions: 320×80px or wider SVG."
          optional
        >
          <input
            id="logoUrl"
            name="logoUrl"
            type="url"
            value={general.logoUrl ?? ""}
            onChange={(e) => setGeneral({ logoUrl: e.target.value })}
            className={INPUT}
            placeholder="https://cdn.example.com/logo.svg"
          />
        </FormField>

        {/* Live logo preview */}
        {general.logoUrl && (
          <div className="flex items-center justify-center h-16 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
            <img
              src={general.logoUrl}
              alt="Logo preview"
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// Export the toSlug helper so HospitalSetupPage can use it for initial slug gen
export { toSlug };
