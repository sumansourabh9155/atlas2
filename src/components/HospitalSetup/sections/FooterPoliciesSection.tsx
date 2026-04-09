import { useState } from "react";
import { Plus, X, FileText } from "lucide-react";
import { Toggle } from "../ui/Toggle";
import { FormField } from "../ui/FormField";
import type { ClinicFooterConfig } from "../../../context/ClinicContext";

// ─── Shared styles (design system tokens) ────────────────────────────────────

import { input as inputTokens, surface } from "../../../lib/styles/tokens";

const INPUT = inputTokens.base;
const CARD  = surface.section;

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
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  children,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
        <Toggle checked={checked} onChange={onChange} label={label} />
      </div>
      {checked && children && (
        <div className="flex flex-col gap-4 pt-1">{children}</div>
      )}
    </div>
  );
}

// ─── FooterPoliciesSection ────────────────────────────────────────────────────

interface Props {
  data: ClinicFooterConfig;
  onChange: (patch: Partial<ClinicFooterConfig>) => void;
}

// Placeholder legal page options — in production these would be populated from the CMS pages list
const TERMS_OPTIONS = [
  { value: "", label: "Select Terms" },
  { value: "terms-of-service", label: "Terms of Service" },
  { value: "client-agreement", label: "Client Agreement" },
  { value: "service-policy", label: "Service Policy" },
];

const POLICY_OPTIONS = [
  { value: "", label: "Select Policy" },
  { value: "privacy-policy", label: "Privacy Policy" },
  { value: "data-protection", label: "Data Protection Notice" },
  { value: "hipaa-notice", label: "HIPAA Privacy Notice" },
];

export function FooterPoliciesSection({ data, onChange }: Props) {
  // Local draft index for removing links by index
  const [, forceUpdate] = useState(0);

  function addLink() {
    const next = [...data.additionalLinks, { name: "", link: "" }];
    onChange({ additionalLinks: next });
  }

  function removeLink(idx: number) {
    const next = data.additionalLinks.filter((_, i) => i !== idx);
    onChange({ additionalLinks: next });
  }

  function updateLink(idx: number, field: "name" | "link", value: string) {
    const next = data.additionalLinks.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    onChange({ additionalLinks: next });
    forceUpdate(n => n + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        icon={FileText}
        title="Footer Configuration"
        description="Customise the links, newsletter signup, and legal pages shown in your site footer."
      >
        {/* ── Subscription ── */}
        <ToggleRow
          label="Subscription"
          description="Add a newsletter or email subscription prompt to the footer."
          checked={data.subscriptionEnabled}
          onChange={(v) => onChange({ subscriptionEnabled: v })}
        >
          <FormField label="Heading" htmlFor="sub-heading">
            <input
              id="sub-heading"
              type="text"
              value={data.subscriptionHeading}
              onChange={(e) => onChange({ subscriptionHeading: e.target.value })}
              className={INPUT}
              placeholder="Subscribe now to Receive Updates from Happy Tails"
            />
          </FormField>
          <FormField label="Link" htmlFor="sub-link">
            <input
              id="sub-link"
              type="url"
              value={data.subscriptionLink}
              onChange={(e) => onChange({ subscriptionLink: e.target.value })}
              className={INPUT}
              placeholder="https://"
            />
          </FormField>
        </ToggleRow>

        <div className="h-px bg-gray-100" />

        {/* ── Additional Footer Links ── */}
        <ToggleRow
          label="Additional Footer Links"
          description="Display extra navigation links in your footer (e.g. Careers, Blog, Press)."
          checked={data.additionalLinksEnabled}
          onChange={(v) => onChange({ additionalLinksEnabled: v })}
        >
          <div className="flex flex-col gap-3">
            {data.additionalLinks.length === 0 && (
              <p className="text-xs text-gray-400 italic">No links added yet. Click below to add one.</p>
            )}

            {data.additionalLinks.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateLink(idx, "name", e.target.value)}
                  className={INPUT}
                  placeholder="Footer Link Name"
                  aria-label={`Link ${idx + 1} name`}
                />
                <input
                  type="url"
                  value={item.link}
                  onChange={(e) => updateLink(idx, "link", e.target.value)}
                  className={INPUT}
                  placeholder="Enter Link"
                  aria-label={`Link ${idx + 1} URL`}
                />
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border border-gray-200"
                  aria-label={`Remove link ${idx + 1}`}
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addLink}
              className="mt-1 flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors self-center"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              Add Another Link
            </button>
          </div>
        </ToggleRow>

        <div className="h-px bg-gray-100" />

        {/* ── Legal Pages ── */}
        <FormField
          label="Terms of Service"
          htmlFor="tos"
          hint="Select the page that contains your terms of service. Linked in cookie banners and footer."
          optional
        >
          <select
            id="tos"
            value={data.termsOfService}
            onChange={(e) => onChange({ termsOfService: e.target.value })}
            className={INPUT}
          >
            {TERMS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Privacy Policy"
          htmlFor="privacy"
          hint="Select the page that contains your privacy policy. Required for GDPR cookie banners."
          optional
        >
          <select
            id="privacy"
            value={data.privacyPolicy}
            onChange={(e) => onChange({ privacyPolicy: e.target.value })}
            className={INPUT}
          >
            {POLICY_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FormField>
      </SectionCard>
    </div>
  );
}
