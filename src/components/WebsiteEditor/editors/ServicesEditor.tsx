import { LayoutGrid, List, GalleryHorizontal } from "lucide-react";
import type { ServicesEditorState } from "../WebsiteEditorPage";
import type { ClinicWebsite } from "../../../types/clinic";
import { AITextField, AITextarea } from "../ai/AITextField";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] " +
  "focus:border-[#003459] transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

const DISPLAY_STYLES: {
  value: ServicesEditorState["displayStyle"];
  label: string;
  Icon:  React.ElementType;
}[] = [
  { value: "grid_cards", label: "Grid",     Icon: LayoutGrid },
  { value: "icon_list",  label: "List",     Icon: List },
  { value: "carousel",   label: "Carousel", Icon: GalleryHorizontal },
];

interface Props {
  state:    ServicesEditorState;
  onChange: (updates: Partial<ServicesEditorState>) => void;
  clinic:   ClinicWebsite;
}

export function ServicesEditor({ state, onChange, clinic }: Props) {
  const visibleServices = clinic.services.filter((s) => s.isVisible);

  return (
    <div className="flex flex-col gap-4 px-4 pb-5 pt-1">

      {/* Section title — AI-powered */}
      <div>
        <label className={LABEL}>Section heading</label>
        <AITextField
          value={state.sectionTitle}
          onChange={(v) => onChange({ sectionTitle: v })}
          fieldKey="services.title"
          placeholder="Our Services"
        />
      </div>

      {/* Subtitle — AI-powered */}
      <div>
        <label className={LABEL}>Subtitle</label>
        <AITextarea
          value={state.sectionSubtitle}
          onChange={(v) => onChange({ sectionSubtitle: v })}
          fieldKey="services.subtitle"
          rows={2}
          placeholder="A brief description of your services."
        />
      </div>

      {/* Display style */}
      <div>
        <label className={LABEL}>Display style</label>
        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {DISPLAY_STYLES.map(({ value, label, Icon }) => {
            const active = state.displayStyle === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onChange({ displayStyle: value })}
                aria-pressed={active}
                className={[
                  "flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
                  active
                    ? "border-[#003459] bg-blue-50 text-[#003459]"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid columns (only for grid_cards) */}
      {state.displayStyle === "grid_cards" && (
        <div>
          <label className={LABEL}>Columns</label>
          <div className="flex gap-1.5">
            {([2, 3, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ gridColumns: n })}
                aria-pressed={state.gridColumns === n}
                className={[
                  "flex-1 h-8 rounded-lg border text-sm font-semibold transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
                  state.gridColumns === n
                    ? "border-[#003459] bg-blue-50 text-[#003459]"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show pricing toggle */}
      <div className="flex items-center justify-between py-1">
        <span className="text-xs font-medium text-gray-600">Show pricing</span>
        <button
          type="button"
          role="switch"
          aria-checked={state.showPricing}
          onClick={() => onChange({ showPricing: !state.showPricing })}
          className={`relative inline-flex h-4 w-7 rounded-full border-2 border-transparent
            transition-colors ${state.showPricing ? "bg-[#003459]" : "bg-gray-200"}`}
        >
          <span
            className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition-transform
              ${state.showPricing ? "translate-x-3" : "translate-x-0"}`}
          />
        </button>
      </div>

      {/* Services summary */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {visibleServices.length} services configured
        </span>
        {visibleServices.slice(0, 4).map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-md px-2.5 py-1.5 border border-gray-100"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#003459] shrink-0"
              aria-hidden="true"
            />
            {s.name}
          </div>
        ))}
        {visibleServices.length > 4 && (
          <p className="text-xs text-gray-400 pl-1">
            +{visibleServices.length - 4} more
          </p>
        )}
      </div>
    </div>
  );
}
