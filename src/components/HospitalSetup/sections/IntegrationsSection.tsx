import {
  Activity, MessageSquare, Calendar, BarChart2,
  Cookie, Zap,
} from "lucide-react";
import { Toggle } from "../ui/Toggle";
import type { ClinicIntegrations } from "../../../context/ClinicContext";

// ─── Shared styles (design system tokens) ────────────────────────────────────

import { input as inputTokens, surface } from "../../../lib/styles/tokens";

const INPUT    = inputTokens.base;
const TEXTAREA = inputTokens.textarea + " font-mono text-xs leading-relaxed";
const CARD     = surface.section;

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

// ─── ToggleRow ────────────────────────────────────────────────────────────────
// Toggle + label/description row; reveals children when checked.

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
        <div className="ml-0 pl-0">{children}</div>
      )}
    </div>
  );
}

// ─── IntegrationsSection ─────────────────────────────────────────────────────

interface Props {
  data: ClinicIntegrations;
  onChange: (patch: Partial<ClinicIntegrations>) => void;
}

export function IntegrationsSection({ data, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6">

      {/* ── Tracking & Analytics ── */}
      <SectionCard
        icon={Activity}
        title="Tracking & Analytics"
        description="Monitor visitor behaviour to improve your site performance and marketing ROI."
      >
        <ToggleRow
          label="Pixel Tracking"
          description="Enable pixel tracking to monitor user behaviour after the site launches."
          checked={data.pixelTrackingEnabled}
          onChange={(v) => onChange({ pixelTrackingEnabled: v })}
        />

        <div className="h-px bg-gray-100" />

        <ToggleRow
          label="Google Tag Manager"
          description="Load third-party tags without touching code. Paste your GTM container ID in the script snippet."
          checked={data.googleTagManagerEnabled}
          onChange={(v) => onChange({ googleTagManagerEnabled: v })}
        />

        <div className="h-px bg-gray-100" />

        <ToggleRow
          label="Facebook Pixel"
          description="Track conversions and build custom audiences for Facebook & Instagram ads."
          checked={data.facebookPixelEnabled}
          onChange={(v) => onChange({ facebookPixelEnabled: v })}
        />

        <div className="h-px bg-gray-100" />

        <ToggleRow
          label="Microsoft Clarity"
          description="Free session recordings and heatmaps to understand how visitors use your site."
          checked={data.microsoftClarityEnabled}
          onChange={(v) => onChange({ microsoftClarityEnabled: v })}
        />
      </SectionCard>

      {/* ── Chatbot & Booking ── */}
      <SectionCard
        icon={MessageSquare}
        title="Chatbot & Booking Widgets"
        description="Add conversational tools and appointment widgets to improve client engagement."
      >
        <ToggleRow
          label="Otto Chatbot"
          description="Toggle on to enable the Otto floating button for chatbot requests."
          checked={data.ottoEnabled}
          onChange={(v) => onChange({ ottoEnabled: v })}
        >
          <div className="flex flex-col gap-1.5 mt-1">
            <label className="text-xs font-medium text-gray-700">
              Widget Script
              <span className="ml-1 text-red-500" aria-hidden="true">*</span>
            </label>
            <textarea
              value={data.ottoWidgetScript}
              onChange={(e) => onChange({ ottoWidgetScript: e.target.value })}
              rows={6}
              className={TEXTAREA}
              placeholder={"<script>\n(function (id, win, doc) {\n  win.televet = win.televet || { id };\n  win.otto = win.otto || { id };\n  var o = doc.createElement('script');\n  // ... rest of embed code\n}('YOUR_ID', window, document));\n</script>"}
              aria-label="Otto widget embed script"
            />
            <p className="text-xs text-gray-500">
              Paste the full embed script provided by Otto. It will be injected into the page&apos;s{" "}
              <code className="font-mono bg-gray-100 px-1 rounded">&lt;body&gt;</code>.
            </p>
          </div>
        </ToggleRow>

        <div className="h-px bg-gray-100" />

        <ToggleRow
          label="VetStoria Floating Button"
          description="Toggle on to enable the VetStoria floating button for appointment booking."
          checked={data.vetstoriaEnabled}
          onChange={(v) => onChange({ vetstoriaEnabled: v })}
        />
      </SectionCard>

      {/* ── Cookie & Consent ── */}
      <SectionCard
        icon={Cookie}
        title="Cookie & Consent"
        description="Control how cookie banners and consent notices are shown to site visitors."
      >
        <ToggleRow
          label="Cookie Consent Manager"
          description="Toggle on Cookie Consent Manager to display a GDPR-compliant banner to visitors in applicable regions."
          checked={data.cookieConsentEnabled}
          onChange={(v) => onChange({ cookieConsentEnabled: v })}
        />

        {data.cookieConsentEnabled && (
          <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-blue-700 leading-relaxed">
              When enabled, a consent banner will appear on first visit asking users to
              accept or decline non-essential cookies. Your Privacy Policy and Terms of
              Service links will be added automatically — configure them in the{" "}
              <strong>Footer & Policies</strong> section.
            </p>
          </div>
        )}
      </SectionCard>

    </div>
  );
}
