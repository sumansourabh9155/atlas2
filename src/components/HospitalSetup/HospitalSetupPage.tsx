import { useState, useCallback, useEffect, useRef } from "react";
import {
  Type, Tags, MapPin, Clock,
  CheckCircle2, Save, ChevronRight,
  AlertCircle, Zap, Settings, FileText,
  Briefcase, Users,
} from "lucide-react";
import { BasicInfoSection, toSlug, type BasicInfoData } from "./sections/BasicInfoSection";
import { TaxonomySection, type TaxonomyData } from "./sections/TaxonomySection";
import { ContactSection, type ContactData } from "./sections/ContactSection";
import { OperatingHoursSection } from "./sections/OperatingHoursSection";
import { ServicesSection } from "./sections/ServicesSection";
import { VetsSection } from "./sections/VetsSection";
import { IntegrationsSection } from "./sections/IntegrationsSection";
import { FooterPoliciesSection } from "./sections/FooterPoliciesSection";
import { WebsiteMigrationPanel, type ImportPayload } from "./WebsiteMigrationPanel";
import type { WeekSchedule } from "./ui/OperatingHoursEditor";
import { useClinic } from "../../context/ClinicContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId = "basic" | "taxonomy" | "contact" | "hours" | "services" | "vets" | "integrations" | "footer";

/** View-layer form shape — derived from context, passed to section components unchanged. */
interface FormView {
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
  { id: "basic",        label: "Basic Information",  description: "Name, slug, colors & logo",       Icon: Type     },
  { id: "taxonomy",     label: "Clinic Type & Pets", description: "Hospital type & species treated",  Icon: Tags     },
  { id: "contact",      label: "Location & Contact", description: "Address, phone & email",           Icon: MapPin   },
  { id: "hours",        label: "Operating Hours",    description: "Weekly availability schedule",     Icon: Clock      },
  { id: "services",     label: "Available Services", description: "Services offered at this location", Icon: Briefcase  },
  { id: "vets",         label: "Veterinarians",       description: "Team members at this location",    Icon: Users      },
  { id: "integrations", label: "Integrations",        description: "Tracking, chatbots & consent",    Icon: Settings   },
  { id: "footer",       label: "Footer & Policies",   description: "Links, subscription & legal",      Icon: FileText   },
];

const STICKY_BAR_HEIGHT = 57; // px — height of the sticky save bar

// ─── Completion heuristics ────────────────────────────────────────────────────

function isSectionComplete(id: SectionId, form: FormView): boolean {
  switch (id) {
    case "basic":
      return (
        form.basic.general.name.trim().length >= 2 &&
        form.basic.general.slug.length >= 2 &&
        /^#[0-9A-Fa-f]{6}$/.test(form.basic.general.primaryColor)
      );
    case "taxonomy":
      return form.taxonomy.petTypes.length > 0;
    case "contact":
      return (
        form.contact.address.street.trim().length > 0 &&
        form.contact.address.city.trim().length > 0 &&
        form.contact.phone.trim().length > 0 &&
        form.contact.email.trim().length > 0
      );
    case "hours":
      return form.hours !== undefined;
    case "services":
    case "vets":
    case "integrations":
    case "footer":
      return true; // All optional — always green
  }
}

// ─── SaveButton ───────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveButton({ state, onClick }: { state: SaveState; onClick: () => void }) {
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
    : "bg-teal-600 border-teal-600 hover:bg-teal-700";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "saving"}
      className={[
        "inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold text-white",
        "border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
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

// ─── SectionHeader ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  label,
  description,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="p-2 rounded-xl bg-white border border-gray-200 text-gray-500 shadow-sm shrink-0">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-gray-900 leading-tight">{label}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// ─── HospitalSetupPage ────────────────────────────────────────────────────────

interface HospitalSetupPageProps {
  onNext?: () => void;
}

export function HospitalSetupPage({ onNext }: HospitalSetupPageProps) {
  const {
    clinic,
    updateGeneral,
    updateTaxonomy,
    updateContact,
    updateHours,
    updateIntegrations,
    updateFooterConfig,
    updateServicesConfig,
    updateVetsConfig,
    saveStatus,
    triggerSave,
  } = useClinic();

  const [activeSection, setActiveSection] = useState<SectionId>("basic");
  const [lastSaved, setLastSaved]         = useState<Date | null>(null);
  const [migrationOpen, setMigrationOpen] = useState(false);

  const sectionRefs      = useRef<(HTMLElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Track last-saved timestamp when the global save succeeds
  useEffect(() => {
    if (saveStatus === "saved") setLastSaved(new Date());
  }, [saveStatus]);

  // ── Scroll-linked active nav via IntersectionObserver ─────────────────────

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Take the first intersecting entry (topmost visible section)
        const intersecting = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (intersecting.length > 0) {
          const id = intersecting[0].target.getAttribute("data-section-id") as SectionId | null;
          if (id) setActiveSection(id);
        }
      },
      {
        root: container,
        rootMargin: "-8% 0px -75% 0px",
        threshold: 0,
      }
    );

    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — refs are stable and sections are static

  function scrollToSection(id: SectionId) {
    const idx = SECTIONS.findIndex((s) => s.id === id);
    const el  = sectionRefs.current[idx];
    const container = scrollContainerRef.current;
    if (!el || !container) return;

    const containerRect = container.getBoundingClientRect();
    const elRect        = el.getBoundingClientRect();
    const newScrollTop  = container.scrollTop + (elRect.top - containerRect.top) - STICKY_BAR_HEIGHT - 8;
    container.scrollTo({ top: Math.max(0, newScrollTop), behavior: "smooth" });
  }

  // ── Derive form view from context ─────────────────────────────────────────

  const form: FormView = {
    basic: {
      general: {
        name:            clinic.general.name,
        slug:            clinic.general.slug,
        primaryColor:    clinic.general.primaryColor,
        secondaryColor:  clinic.general.secondaryColor,
        logoUrl:         clinic.general.logoUrl,
        tagline:         clinic.general.tagline ?? "",
        metaDescription: clinic.general.metaDescription ?? "",
      },
      hospitalType: clinic.taxonomy.hospitalType,
    },
    taxonomy: { petTypes: clinic.taxonomy.petTypes },
    contact: {
      address: { ...clinic.contact.address },
      phone:   clinic.contact.phone,
      email:   clinic.contact.email,
    },
    hours: clinic.hours,
  };

  // ── Patch helpers ─────────────────────────────────────────────────────────

  const patchBasic = useCallback((updates: Partial<BasicInfoData>) => {
    if (updates.general) {
      const g = updates.general;
      const autoSlug =
        g.name !== undefined &&
        (!clinic.general.slug || clinic.general.slug === toSlug(clinic.general.name ?? ""))
          ? toSlug(g.name)
          : g.slug;
      updateGeneral({ ...g, ...(autoSlug !== undefined ? { slug: autoSlug } : {}) });
    }
    if (updates.hospitalType !== undefined) {
      updateTaxonomy({ hospitalType: updates.hospitalType });
    }
  }, [clinic.general, updateGeneral, updateTaxonomy]);

  const patchTaxonomy = useCallback((updates: Partial<TaxonomyData>) => {
    if (updates.petTypes !== undefined) updateTaxonomy({ petTypes: updates.petTypes });
  }, [updateTaxonomy]);

  const patchContact = useCallback((updates: Partial<ContactData>) => {
    updateContact(updates);
  }, [updateContact]);

  const patchHours = useCallback((hours: WeekSchedule) => {
    updateHours(hours);
  }, [updateHours]);

  // ── Website migration import ───────────────────────────────────────────────

  const handleImport = useCallback((payload: ImportPayload) => {
    if (payload.basic) {
      const g = payload.basic.general ?? {};
      const hasName = !!g.name;
      const autoSlug =
        hasName && (!clinic.general.slug || clinic.general.slug === toSlug(clinic.general.name ?? ""))
          ? toSlug(g.name!)
          : undefined;
      updateGeneral({ ...g, ...(autoSlug ? { slug: autoSlug } : {}) });
      if (payload.basic.hospitalType) updateTaxonomy({ hospitalType: payload.basic.hospitalType });
    }
    if (payload.taxonomy) updateTaxonomy(payload.taxonomy);
    if (payload.contact)  updateContact(payload.contact);
    if (payload.hours)    updateHours(payload.hours);
    setMigrationOpen(false);
  }, [clinic.general, updateGeneral, updateTaxonomy, updateContact, updateHours]);

  // ── Derived state ─────────────────────────────────────────────────────────

  const completedCount = SECTIONS.filter((s) => isSectionComplete(s.id, form)).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative h-screen overflow-hidden bg-gray-100 flex font-sans antialiased">

      {/* ── Left spacer — reserves floating panel footprint ── */}
      <div className="shrink-0" style={{ width: 284 }} aria-hidden="true" />

      {/* ── Floating Left Panel ── */}
      <aside
        className="absolute left-3 top-3 bottom-16 z-30 w-[260px] rounded-2xl overflow-hidden bg-white flex flex-col"
        style={{
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.11), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
        aria-label="Setup navigation"
      >
        {/* Clinic identity */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100 shrink-0">
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
                /{form.basic.general.slug || "your-slug"}
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

        {/* Scroll-linked section nav */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto min-h-0" aria-label="Setup sections">
          <ul className="flex flex-col gap-0.5" role="list">
            {SECTIONS.map((section, index) => {
              const isActive = section.id === activeSection;
              const isDone   = isSectionComplete(section.id, form);

              return (
                <li key={section.id}>
                  <button
                    type="button"
                    onClick={() => scrollToSection(section.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                      "transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-600",
                      isActive
                        ? "bg-blue-50/80 text-teal-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    ].join(" ")}
                  >
                    {/* Step number / check icon */}
                    <span
                      className={[
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isDone
                          ? "bg-green-100 text-green-600"
                          : isActive
                          ? "bg-teal-600/10 text-teal-600"
                          : "bg-gray-100 text-gray-400",
                      ].join(" ")}
                      aria-hidden="true"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        index + 1
                      )}
                    </span>

                    <div className="flex-1 overflow-hidden">
                      <p
                        className={[
                          "text-xs font-semibold truncate",
                          isActive ? "text-teal-600" : "text-gray-800",
                        ].join(" ")}
                      >
                        {section.label}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {section.description}
                      </p>
                    </div>

                    <span className="ml-auto shrink-0">
                      {isActive && (
                        <ChevronRight
                          className="w-3.5 h-3.5 text-teal-600"
                          aria-hidden="true"
                        />
                      )}
                      {isDone && !isActive && (
                        <CheckCircle2
                          className="w-3 h-3 text-green-500"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Import from existing site CTA */}
        <div className="px-3 pb-2 shrink-0">
          <button
            type="button"
            onClick={() => setMigrationOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-dashed border-teal-600/30 bg-teal-600/[0.03] hover:bg-teal-600/[0.07] hover:border-teal-600/50 transition-all group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-600 to-[#0369A1] flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-teal-600 leading-tight">Import from existing site</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Auto-fill from your live website</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-teal-600/50 group-hover:text-teal-600 transition-colors" />
          </button>
        </div>

        {/* Save timestamp */}
        <div className="px-4 py-2 border-t border-gray-100 shrink-0">
          <p className="text-[10px] text-gray-400">
            {lastSaved
              ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Not yet saved"}
          </p>
        </div>
      </aside>

      {/* ── Migration panel overlay ── */}
      {migrationOpen && (
        <WebsiteMigrationPanel
          onClose={() => setMigrationOpen(false)}
          onImport={handleImport}
        />
      )}

      {/* ── Main scroll container ── */}
      <main
        ref={(el) => { scrollContainerRef.current = el; }}
        className="flex-1 overflow-y-auto bg-gray-100"
        aria-label="Hospital setup form"
      >
        {/* All sections stacked vertically */}
        <div className="max-w-2xl mx-auto px-8 py-10">

          {/* ── 1. Basic Information ── */}
          <section
            ref={(el) => { sectionRefs.current[0] = el; }}
            data-section-id="basic"
            className="scroll-mt-[72px] pb-16"
          >
            <SectionHeader
              icon={Type}
              label="Basic Information"
              description="Name, slug, brand colours & logo"
            />
            <BasicInfoSection data={form.basic} onChange={patchBasic} />
          </section>

          {/* ── 2. Clinic Type & Pets ── */}
          <section
            ref={(el) => { sectionRefs.current[1] = el; }}
            data-section-id="taxonomy"
            className="scroll-mt-[72px] pb-16"
          >
            <SectionHeader
              icon={Tags}
              label="Clinic Type & Pets"
              description="Hospital type & species treated"
            />
            <TaxonomySection data={form.taxonomy} onChange={patchTaxonomy} />
          </section>

          {/* ── 3. Location & Contact ── */}
          <section
            ref={(el) => { sectionRefs.current[2] = el; }}
            data-section-id="contact"
            className="scroll-mt-[72px] pb-16"
          >
            <SectionHeader
              icon={MapPin}
              label="Location & Contact"
              description="Address, phone & email"
            />
            <ContactSection data={form.contact} onChange={patchContact} />
          </section>

          {/* ── 4. Operating Hours ── */}
          <section
            ref={(el) => { sectionRefs.current[3] = el; }}
            data-section-id="hours"
            className="scroll-mt-[72px] pb-16"
          >
            <SectionHeader
              icon={Clock}
              label="Operating Hours"
              description="Weekly availability schedule"
            />
            <OperatingHoursSection value={form.hours} onChange={patchHours} />
          </section>

          {/* ── 5. Available Services ── */}
          <section
            ref={(el) => { sectionRefs.current[4] = el; }}
            data-section-id="services"
            className="scroll-mt-[72px] pb-16"
          >
            <SectionHeader
              icon={Briefcase}
              label="Available Services"
              description="Services offered at this location"
            />
            <ServicesSection
              data={clinic.servicesConfig}
              onChange={updateServicesConfig}
            />
          </section>

          {/* ── 6. Veterinarians ── */}
          <section
            ref={(el) => { sectionRefs.current[5] = el; }}
            data-section-id="vets"
            className="scroll-mt-[72px] pb-16"
          >
            <SectionHeader
              icon={Users}
              label="Veterinarians"
              description="Team members at this location"
            />
            <VetsSection
              data={clinic.vetsConfig}
              onChange={updateVetsConfig}
            />
          </section>

          {/* ── 7. Integrations ── */}
          <section
            ref={(el) => { sectionRefs.current[6] = el; }}
            data-section-id="integrations"
            className="scroll-mt-[72px] pb-16"
          >
            <SectionHeader
              icon={Settings}
              label="Integrations"
              description="Tracking, chatbots & consent management"
            />
            <IntegrationsSection
              data={clinic.integrations}
              onChange={updateIntegrations}
            />
          </section>

          {/* ── 8. Footer & Policies ── */}
          <section
            ref={(el) => { sectionRefs.current[7] = el; }}
            data-section-id="footer"
            className="scroll-mt-[72px] pb-24"
          >
            <SectionHeader
              icon={FileText}
              label="Footer & Policies"
              description="Links, newsletter subscription & legal pages"
            />
            <FooterPoliciesSection
              data={clinic.footerConfig}
              onChange={updateFooterConfig}
            />
          </section>

        </div>
      </main>
    </div>
  );
}
