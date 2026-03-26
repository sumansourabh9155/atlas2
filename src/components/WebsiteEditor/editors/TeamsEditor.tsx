import { Settings2 } from "lucide-react";
import type { TeamsEditorState } from "../WebsiteEditorPage";
import type { ClinicWebsite } from "../../../types/clinic";
import { AITextField, AITextarea } from "../ai/AITextField";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

function MiniToggle({
  label,
  checked,
  onChange,
}: {
  label:    string;
  checked:  boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-xs text-gray-600">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-4 w-7 rounded-full border-2 border-transparent
          transition-colors ${checked ? "bg-teal-600" : "bg-gray-200"}`}
      >
        <span
          className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform
            ${checked ? "translate-x-3" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

interface Props {
  state:              TeamsEditorState;
  onChange:           (updates: Partial<TeamsEditorState>) => void;
  clinic:             ClinicWebsite;
  onNavigateToSetup:  () => void;
}

export function TeamsEditor({ state, onChange, clinic, onNavigateToSetup }: Props) {
  const visibleVets = clinic.veterinarians.filter((v) => v.isVisible);

  return (
    <div className="flex flex-col gap-4 px-4 pb-5 pt-1">

      {/* Section title — AI-powered */}
      <div>
        <label className={LABEL}>Section heading</label>
        <AITextField
          value={state.sectionTitle}
          onChange={(v) => onChange({ sectionTitle: v })}
          fieldKey="teams.title"
          placeholder="Meet Our Team"
        />
      </div>

      {/* Subtitle — AI-powered */}
      <div>
        <label className={LABEL}>Subtitle</label>
        <AITextarea
          value={state.sectionSubtitle}
          onChange={(v) => onChange({ sectionSubtitle: v })}
          fieldKey="teams.subtitle"
          rows={2}
          placeholder="Our dedicated team of specialists…"
        />
      </div>

      {/* Layout toggle */}
      <div>
        <label className={LABEL}>Layout</label>
        <div className="flex gap-1.5 mt-1">
          {(["grid_cards", "carousel"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onChange({ layout: v })}
              aria-pressed={state.layout === v}
              className={[
                "flex-1 h-8 rounded-lg border text-xs font-medium transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
                state.layout === v
                  ? "border-teal-600 bg-blue-50 text-teal-600"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300",
              ].join(" ")}
            >
              {v === "grid_cards" ? "Grid" : "Carousel"}
            </button>
          ))}
        </div>
      </div>

      {/* Display toggles */}
      <div className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
        <MiniToggle
          label="Show biography"
          checked={state.showBio}
          onChange={(v) => onChange({ showBio: v })}
        />
        <MiniToggle
          label="Show specializations"
          checked={state.showSpecializations}
          onChange={(v) => onChange({ showSpecializations: v })}
        />
      </div>

      {/* ── Data source callout ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 flex flex-col gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
            <Settings2 className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-semibold text-gray-700 leading-snug">
              Team members are managed in Hospital Details
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
              Names, photos, bios, and credentials are pulled directly from your relational data — not typed here.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[11px] font-medium text-teal-600">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden="true" />
            {visibleVets.length} active team member{visibleVets.length !== 1 ? "s" : ""} configured
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateToSetup}
          className={[
            "w-full flex items-center justify-center gap-2 h-9 rounded-lg border",
            "text-xs font-semibold text-gray-700 bg-white border-gray-200",
            "hover:bg-gray-100 hover:border-gray-300 transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
            "shadow-sm",
          ].join(" ")}
        >
          <Settings2 className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
          Configure Team in Hospital Details
        </button>
      </div>
    </div>
  );
}
