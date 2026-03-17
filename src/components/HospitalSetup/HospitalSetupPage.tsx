import { useState, useCallback } from "react";
import {
  Type, Tags, MapPin, Clock,
  CheckCircle2, Circle, Save, ChevronRight,
  Building2, AlertCircle, Zap,
} from "lucide-react";
import { BasicInfoSection, toSlug, type BasicInfoData } from "./sections/BasicInfoSection";
import { TaxonomySection, type TaxonomyData } from "./sections/TaxonomySection";
import { ContactSection, type ContactData } from "./sections/ContactSection";
import { OperatingHoursSection } from "./sections/OperatingHoursSection";
import { WebsiteMigrationPanel, type ImportPayload } from "./WebsiteMigrationPanel";
import type { WeekSchedule } from "./ui/OperatingHoursEditor";
import type { HospitalType, PetType } from "../../types/clinic";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId = "basic" | "taxonomy" | "contact" | "hours";

interface FormState {
  basic: BasicInfoData;
  taxonomy: TaxonomyData;
  contact: ContactData;
  hours: WeekSchedule | undefined;
}

// ─── Section config ───────────────────────────────────────────────────────────

const SECTIONS: {
  id: SectionId;
  label: string;
  description: string;
  Icon: React.ElementType;
}[] = [
  {
    id: "basic",
    label: "Basic Information",
    description: "Name, slug, colors & logo",
    Icon: Type,
  },
  {
    id: "taxonomy",
    label: "Clinic Type & Pets",
    description: "Hospital type & species treated",
    Icon: Tags,
  },
  {
    id: "contact",
    label: "Location & Contact",
    description: "Address, phone & email",
    Icon: MapPin,
  },
  {
    id: "hours",
    label: "Operating Hours",
    description: "Weekly availability schedule",
    Icon: Clock,
  },
];

// ─── Completion heuristics ────────────────────────────────────────────────────

function isSectionComplete(id: SectionId, state: FormState): boolean {
  switch (id) {
    case "basic":
      return (
        state.basic.general.name.trim().length >= 2 &&
        state.basic.general.slug.length >= 2 &&
        /^#[0-9A-Fa-f]{6}$/.test(state.basic.general.primaryColor)
      );
    case "taxonomy":
      return state.taxonomy.petTypes.length > 0;
    case "contact":
      return (
        state.contact.address.street.trim().length > 0 &&
        state.contact.address.city.trim().length > 0 &&
        state.contact.phone.trim().length > 0 &&
        state.contact.email.trim().length > 0
      );
    case "hours":
      return state.hours !== undefined;
    default:
      return false;
  }
}

// ─── Default state ────────────────────────────────────────────────────────────

const INITIAL_STATE: FormState = {
  basic: {
    general: {
      name: "",
      slug: "",
      primaryColor: "#0F766E",
      secondaryColor: "#F59E0B",
      logoUrl: undefined,
      tagline: "",
      metaDescription: "",
    },
    hospitalType: "general_practice" as HospitalType,
  },
  taxonomy: {
    petTypes: [] as PetType[],
  },
  contact: {
    address: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
    },
    phone: "",
    email: "",
  },
  hours: undefined,
};

// ─── SaveButton ───────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveButton({
  state,
  onClick,
}: {
  state: SaveState;
  onClick: () => void;
}) {
  const label =
    state === "saving" ? "Saving…"
    : state === "saved"  ? "Saved"
    : state === "error"  ? "Error — retry"
    : "Save changes";

  const icon =
    state === "saved"  ? <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
    : state === "error" ? <AlertCircle  className="w-4 h-4" aria-hidden="true" />
    : <Save className="w-4 h-4" aria-hidden="true" />;

  const cls =
    state === "saved"   ? "bg-green-600 border-green-600"
    : state === "error" ? "bg-red-600   border-red-600"
    : "bg-[#003459] border-[#003459] hover:bg-[#002845]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "saving"}
      className={[
        "inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white",
        "border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003459]",
        "focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed",
        cls,
      ].join(" ")}
      aria-live="polite"
    >
      {icon}
      {label}
    </button>
  );
}

// ─── HospitalSetupPage ────────────────────────────────────────────────────────

export function HospitalSetupPage() {
  const [activeSection, setActiveSection]   = useState<SectionId>("basic");
  const [form, setForm]                     = useState<FormState>(INITIAL_STATE);
  const [saveState, setSaveState]           = useState<SaveState>("idle");
  const [lastSaved, setLastSaved]           = useState<Date | null>(null);
  const [migrationOpen, setMigrationOpen]   = useState(false);

  // ── Patch helpers ──────────────────────────────────────────────────────────

  const patchBasic = useCallback((updates: Partial<BasicInfoData>) => {
    setForm((prev) => {
      const next = { ...prev, basic: { ...prev.basic, ...updates } };
      // Keep slug in sync with name unless it was already customised
      if (updates.general?.name !== undefined) {
        const autoSlug = toSlug(updates.general.name);
        if (!next.basic.general.slug || next.basic.general.slug === toSlug(prev.basic.general.name)) {
          next.basic.general.slug = autoSlug;
        }
      }
      return next;
    });
    setSaveState("idle");
  }, []);

  const patchTaxonomy = useCallback((updates: Partial<TaxonomyData>) => {
    setForm((prev) => ({ ...prev, taxonomy: { ...prev.taxonomy, ...updates } }));
    setSaveState("idle");
  }, []);

  const patchContact = useCallback((updates: Partial<ContactData>) => {
    setForm((prev) => ({ ...prev, contact: { ...prev.contact, ...updates } }));
    setSaveState("idle");
  }, []);

  const patchHours = useCallback((hours: WeekSchedule) => {
    setForm((prev) => ({ ...prev, hours }));
    setSaveState("idle");
  }, []);

  // ── Website migration import ────────────────────────────────────────────────

  const handleImport = useCallback((payload: ImportPayload) => {
    setForm(prev => {
      let next = { ...prev };

      if (payload.basic) {
        const generalPatch = payload.basic.general ?? {};
        next = {
          ...next,
          basic: {
            ...next.basic,
            ...(payload.basic.hospitalType ? { hospitalType: payload.basic.hospitalType } : {}),
            general: {
              ...next.basic.general,
              ...generalPatch,
              // Auto-derive slug from imported name unless already customised
              ...(generalPatch.name
                ? { slug: next.basic.general.slug || toSlug(generalPatch.name) }
                : {}),
            },
          },
        };
      }

      if (payload.taxonomy) {
        next = { ...next, taxonomy: { ...next.taxonomy, ...payload.taxonomy } };
      }

      if (payload.contact) {
        next = {
          ...next,
          contact: {
            ...next.contact,
            ...payload.contact,
            address: { ...next.contact.address, ...(payload.contact.address ?? {}) },
          },
        };
      }

      if (payload.hours) {
        next = { ...next, hours: payload.hours };
      }

      return next;
    });
    setSaveState("idle");
    setMigrationOpen(false);
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────────

  async function handleSave() {
    setSaveState("saving");
    // Simulate API round-trip — wire to your actual endpoint here
    await new Promise((r) => setTimeout(r, 900));
    setSaveState("saved");
    setLastSaved(new Date());
    setTimeout(() => setSaveState("idle"), 2500);
  }

  // ── Active section renderer ────────────────────────────────────────────────

  function renderSection() {
    switch (activeSection) {
      case "basic":
        return (
          <BasicInfoSection
            data={form.basic}
            onChange={patchBasic}
          />
        );
      case "taxonomy":
        return (
          <TaxonomySection
            data={form.taxonomy}
            onChange={patchTaxonomy}
          />
        );
      case "contact":
        return (
          <ContactSection
            data={form.contact}
            onChange={patchContact}
          />
        );
      case "hours":
        return (
          <OperatingHoursSection
            value={form.hours}
            onChange={patchHours}
          />
        );
    }
  }

  const completedCount = SECTIONS.filter((s) =>
    isSectionComplete(s.id, form)
  ).length;

  const activeConfig = SECTIONS.find((s) => s.id === activeSection)!;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans antialiased">
      {/* ── Sidebar ── */}
      <aside
        className="w-72 shrink-0 bg-white border-r border-gray-200 flex flex-col"
        aria-label="Setup navigation"
      >
        {/* Clinic identity */}
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: form.basic.general.primaryColor }}
              aria-hidden="true"
            >
              {form.basic.general.name
                ? form.basic.general.name.slice(0, 2).toUpperCase()
                : "VC"}
            </span>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {form.basic.general.name || "New Clinic"}
              </p>
              <p className="text-xs text-gray-400 truncate font-mono">
                {form.basic.general.slug || "your-slug"}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">Setup progress</span>
              <span className="text-xs font-semibold text-gray-700">
                {completedCount}/{SECTIONS.length}
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(completedCount / SECTIONS.length) * 100}%`,
                  backgroundColor: form.basic.general.primaryColor,
                }}
                role="progressbar"
                aria-valuenow={completedCount}
                aria-valuemin={0}
                aria-valuemax={SECTIONS.length}
                aria-label="Setup completion"
              />
            </div>
          </div>
        </div>

        {/* Section nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto" aria-label="Setup sections">
          <ul className="flex flex-col gap-0.5" role="list">
            {SECTIONS.map((section, index) => {
              const isActive = section.id === activeSection;
              const isDone = isSectionComplete(section.id, form);

              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-left",
                      "transition-colors focus:outline-none focus-visible:ring-2",
                      "focus-visible:ring-[#003459]",
                      isActive
                        ? "bg-blue-50 text-[#003459]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    ].join(" ")}
                  >
                    {/* Step number / check */}
                    <span
                      className={[
                        "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isDone
                          ? "bg-green-100 text-green-600"
                          : isActive
                          ? "bg-blue-100 text-[#003459]"
                          : "bg-gray-100 text-gray-400",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-[#003459]" : ""
                        }`}
                      >
                        {section.label}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {section.description}
                      </p>
                    </div>

                    {isActive && (
                      <ChevronRight
                        className="w-3.5 h-3.5 text-[#003459] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Import from existing site CTA */}
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => setMigrationOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-[#003459]/30 bg-[#003459]/4 hover:bg-[#003459]/8 hover:border-[#003459]/50 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#003459] to-[#0369A1] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-[#003459] leading-tight">Import from existing site</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Auto-fill from your live website</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#003459]/50 group-hover:text-[#003459] transition-colors" />
          </button>
        </div>

        {/* Bottom: last-saved + publish hint */}
        <div className="px-4 py-4 border-t border-gray-100">
          {lastSaved ? (
            <p className="text-xs text-gray-400 mb-3">
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mb-3">Not yet saved</p>
          )}
          {completedCount === SECTIONS.length ? (
            <button
              type="button"
              className="w-full py-2 rounded-md text-sm font-semibold text-white transition-colors bg-[#003459] hover:bg-[#002845]"
            >
              Publish Site →
            </button>
          ) : (
            <p className="text-xs text-gray-400 text-center">
              Complete all sections to publish
            </p>
          )}
        </div>
      </aside>

      {/* ── Migration panel ── */}
      {migrationOpen && (
        <WebsiteMigrationPanel
          onClose={() => setMigrationOpen(false)}
          onImport={handleImport}
        />
      )}

      {/* ── Content area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Section top bar */}
        <header className="shrink-0 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-500">
              <activeConfig.Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-base font-semibold text-gray-900 leading-tight">
                {activeConfig.label}
              </h1>
              <p className="text-xs text-gray-500">{activeConfig.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Next section shortcut */}
            {(() => {
              const idx = SECTIONS.findIndex((s) => s.id === activeSection);
              const next = SECTIONS[idx + 1];
              return next ? (
                <button
                  type="button"
                  onClick={() => setActiveSection(next.id)}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Next: {next.label}
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              ) : null;
            })()}

            <SaveButton state={saveState} onClick={handleSave} />
          </div>
        </header>

        {/* Scrollable form content */}
        <main
          id="setup-content"
          className="flex-1 overflow-y-auto px-8 py-8 bg-gray-50/50"
          aria-label={`${activeConfig.label} form`}
        >
          <div className="max-w-2xl mx-auto pb-12">
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
