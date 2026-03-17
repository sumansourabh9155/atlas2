// ─── WebsiteMigrationPanel ─────────────────────────────────────────────────────
// Scrapes an existing vet clinic website and pre-fills the Hospital Setup form.
// 4 stages: URL Entry → Scanning → Review & Select → Done

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X, Globe, ArrowRight, Check, Loader2, AlertTriangle,
  Building2, Phone, MapPin, Clock, Tag, Search,
  ChevronDown, ChevronUp, Sparkles, ExternalLink,
  Shield, Wifi, Image as ImageIcon, Type, Mail,
  Zap, RefreshCw,
} from "lucide-react";
import type { HospitalType, PetType } from "../../types/clinic";
import type { WeekSchedule } from "./ui/OperatingHoursEditor";
import type { BasicInfoData } from "./sections/BasicInfoSection";
import type { TaxonomyData } from "./sections/TaxonomySection";
import type { ContactData } from "./sections/ContactSection";

// ─── Public import payload ─────────────────────────────────────────────────────

export interface ImportPayload {
  basic?: { general?: Partial<BasicInfoData["general"]>; hospitalType?: HospitalType };
  taxonomy?: { petTypes?: PetType[] };
  contact?: Partial<ContactData>;
  hours?: WeekSchedule;
}

// ─── Internal types ────────────────────────────────────────────────────────────

type Stage = "url" | "scanning" | "review" | "done";
type Confidence = "high" | "medium" | "low";

interface Field<T = string> {
  value: T;
  confidence: Confidence;
  source: string;
  selected: boolean;
}

interface Extraction {
  clinicName:      Field<string>       | null;
  tagline:         Field<string>       | null;
  metaDescription: Field<string>       | null;
  logoUrl:         Field<string>       | null;
  primaryColor:    Field<string>       | null;
  secondaryColor:  Field<string>       | null;
  hospitalType:    Field<HospitalType> | null;
  petTypes:        Field<PetType[]>    | null;
  phone:           Field<string>       | null;
  emergencyPhone:  Field<string>       | null;
  email:           Field<string>       | null;
  street:          Field<string>       | null;
  city:            Field<string>       | null;
  stateCode:       Field<string>       | null;
  zip:             Field<string>       | null;
  hours:           Field<WeekSchedule> | null;
}

interface ScanStep {
  id: string;
  label: string;
  found: string | null;
  durationMs: number;
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function ConfidenceBadge({ level, source }: { level: Confidence; source: string }) {
  const map: Record<Confidence, { label: string; cls: string }> = {
    high:   { label: "Verified",  cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    medium: { label: "Extracted", cls: "bg-amber-50   text-amber-700   border-amber-200"  },
    low:    { label: "Inferred",  cls: "bg-slate-50   text-slate-500   border-slate-200"  },
  };
  const { label, cls } = map[level];
  return (
    <span title={`Source: ${source}`} className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${cls}`}>
      {level === "high" && <Shield className="w-2.5 h-2.5" />}
      {level === "medium" && <Wifi className="w-2.5 h-2.5" />}
      {level === "low" && <Sparkles className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

// ─── Mock data generator ──────────────────────────────────────────────────────
// Simulates what a real scraper would extract from the website.

function f<T>(value: T, confidence: Confidence, source: string): Field<T> {
  return { value, confidence, source, selected: true };
}

function parseDomainToName(url: string): string {
  try {
    const raw = new URL(url.startsWith("http") ? url : `https://${url}`).hostname
      .replace(/^www\./, "")
      .split(".")[0];
    // Split on common separators and capitalise each word
    return raw
      .replace(/[-_]/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b(vet|pet|animal|clinic|hospital|care|paws|paw|doc|dr)\b/gi, m => m.charAt(0).toUpperCase() + m.slice(1).toLowerCase())
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim() + (raw.toLowerCase().includes("hospital") || raw.toLowerCase().includes("vet") ? "" : " Veterinary");
  } catch {
    return "Your Veterinary Clinic";
  }
}

function getDomainStr(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function generateExtraction(url: string): Extraction {
  const name  = parseDomainToName(url);
  const domain = getDomainStr(url);

  // Deterministic "random" from domain string
  const seed = domain.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = <T,>(arr: T[]) => arr[seed % arr.length];

  const city = pick(["Austin", "Dallas", "Houston", "Denver", "Portland", "Seattle", "Nashville", "Phoenix"]);
  const stateCode = pick(["TX", "TX", "TX", "CO", "OR", "WA", "TN", "AZ"]);
  const zip  = `${78700 + (seed % 299)}`;
  const areaCode = pick(["512", "214", "832", "720", "503", "206", "615", "602"]);
  const phone     = `(${areaCode}) ${Math.floor(400 + seed % 500)}-${String(seed % 10000).padStart(4, "0")}`;
  const emergPhone = `(${areaCode}) ${Math.floor(800 + seed % 199)}-${String((seed + 1337) % 10000).padStart(4, "0")}`;
  const streetNum = 100 + (seed % 8900);
  const streets = ["Main St", "Oak Ave", "Medical Dr", "Park Blvd", "Veterinary Way", "Commerce Dr", "Clinic Rd", "Pet Care Ln"];
  const street = `${streetNum} ${pick(streets)}`;
  const colors = ["#0F766E", "#1D4ED8", "#7C3AED", "#B91C1C", "#047857", "#0369A1", "#9333EA", "#DC2626"];
  const secColors = ["#F59E0B", "#10B981", "#F97316", "#6366F1", "#EC4899", "#14B8A6", "#FB923C", "#A78BFA"];
  const primaryColor   = colors[seed % colors.length];
  const secondaryColor = secColors[(seed + 3) % secColors.length];
  const hospitalTypes: HospitalType[] = ["general_practice", "specialty_referral", "emergency_critical_care", "shelter_humane", "mobile_clinic"];
  const hospitalType = pick(hospitalTypes);
  const allPetTypes: PetType[] = ["dog", "cat", "bird", "rabbit", "reptile", "small_mammal", "exotic"];
  const petTypes: PetType[] = ["dog", "cat", ...(seed % 3 === 0 ? ["bird" as PetType] : []), ...(seed % 5 === 0 ? ["rabbit" as PetType] : [])];
  const taglines = [
    `${city}'s most trusted companion animal care`,
    `Advanced specialty care for the pets you love`,
    `Compassionate veterinary medicine in ${city}`,
    `Where pets are family — serving ${city} since ${1990 + (seed % 30)}`,
    `Expert care, gentle hands — your pet deserves the best`,
  ];
  const tagline = pick(taglines);
  const metaDescriptions = [
    `${name} provides comprehensive veterinary services in ${city}, ${stateCode}. Book an appointment online.`,
    `Award-winning animal hospital in ${city}. Serving dogs, cats, and exotic pets with compassionate care.`,
    `${name} — ${city}'s premier veterinary clinic. Routine exams, surgery, emergency care, and more.`,
  ];
  const logoUrl = `https://${domain}/images/logo.png`;

  // Business hours: typical vet clinic pattern
  const hours: WeekSchedule = {
    monday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
    tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
    wednesday: { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
    thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "20:00" }] },
    friday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
    saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "15:00" }] },
    sunday:    { isClosed: true,  is24Hours: false, slots: [{ open: "10:00", close: "14:00" }] },
  };
  if (hospitalType === "emergency_critical_care") {
    (["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as (keyof WeekSchedule)[])
      .forEach(d => { hours[d] = { isClosed: false, is24Hours: true, slots: [] }; });
  }

  return {
    clinicName:      f(name,              "high",   "og:title + h1 tag"),
    tagline:         f(tagline,           "medium", "hero section subtitle"),
    metaDescription: f(pick(metaDescriptions), "high", "meta[name=description]"),
    logoUrl:         f(logoUrl,           "high",   "og:image + link[rel=icon]"),
    primaryColor:    f(primaryColor,      "medium", "CSS custom property --color-primary"),
    secondaryColor:  f(secondaryColor,    "medium", "CSS custom property --color-secondary"),
    hospitalType:    f(hospitalType,      "medium", "schema.org VeterinaryClinic type"),
    petTypes:        f(petTypes,          "medium", "service listing keywords"),
    phone:           f(phone,             "high",   "schema.org telephone + tel: link"),
    emergencyPhone:  f(emergPhone,        "medium", "emergency contact section"),
    email:           f(`info@${domain}`,  "high",   "mailto: link in footer"),
    street:          f(street,            "high",   "schema.org streetAddress"),
    city:            f(city,              "high",   "schema.org addressLocality"),
    stateCode:       f(stateCode,         "high",   "schema.org addressRegion"),
    zip:             f(zip,               "high",   "schema.org postalCode"),
    hours:           f(hours,             "medium", "openingHours schema + hours section"),
  };
}

// ─── Scan steps definition ────────────────────────────────────────────────────

function buildScanSteps(domain: string): ScanStep[] {
  return [
    { id: "connect",  label: "Connecting to website",             found: null,                          durationMs: 600  },
    { id: "html",     label: "Parsing HTML structure",            found: "3,247 elements indexed",      durationMs: 500  },
    { id: "schema",   label: "Reading Schema.org markup",         found: "VeterinaryClinic schema found", durationMs: 700 },
    { id: "identity", label: "Extracting clinic identity",        found: "Name, logo & tagline found",  durationMs: 650  },
    { id: "colors",   label: "Analysing brand colors",           found: "2 brand colors captured",     durationMs: 550  },
    { id: "contact",  label: "Finding contact details",          found: "Phone, email & address found", durationMs: 600  },
    { id: "services", label: "Discovering services & specialties", found: "8 services identified",     durationMs: 750  },
    { id: "hours",    label: "Reading business hours",           found: "Weekly schedule extracted",    durationMs: 600  },
    { id: "seo",      label: "Extracting SEO metadata",          found: "Title + meta description",    durationMs: 500  },
    { id: "team",     label: "Scanning team pages",              found: `${domain} — 4 vets found`,    durationMs: 800  },
    { id: "validate", label: "Validating & normalising data",    found: "16 fields ready to import",   durationMs: 600  },
  ];
}

// ─── Category card ────────────────────────────────────────────────────────────

interface CategoryCardProps {
  icon: React.ElementType;
  title: string;
  color: string;
  fieldCount: number;
  selectedCount: number;
  onSelectAll: (v: boolean) => void;
  children: React.ReactNode;
}

function CategoryCard({ icon: Icon, title, color, fieldCount, selectedCount, onSelectAll, children }: CategoryCardProps) {
  const [open, setOpen] = useState(true);
  const allSelected = selectedCount === fieldCount;
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <div className={`flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100`}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <div className="flex-1">
          <span className="text-sm font-semibold text-slate-800">{title}</span>
          <span className="ml-2 text-[11px] text-slate-400">{selectedCount}/{fieldCount} selected</span>
        </div>
        <button
          type="button"
          onClick={() => onSelectAll(!allSelected)}
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md transition-colors ${
            allSelected ? "text-[#003459] bg-[#003459]/10" : "text-slate-400 hover:text-slate-600"
          }`}
        >
          {allSelected ? "Deselect all" : "Select all"}
        </button>
        <button type="button" onClick={() => setOpen(v => !v)} className="p-1 text-slate-400 hover:text-slate-600">
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
      {open && <div className="divide-y divide-slate-50">{children}</div>}
    </div>
  );
}

// ─── Field row ────────────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string;
  displayValue: string;
  confidence: Confidence;
  source: string;
  selected: boolean;
  onToggle: () => void;
  preview?: React.ReactNode;
}

function FieldRow({ label, displayValue, confidence, source, selected, onToggle, preview }: FieldRowProps) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selected ? "bg-white" : "bg-slate-50/60 opacity-60"}`}
      onClick={onToggle}
    >
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
        selected ? "bg-[#003459] border-[#003459]" : "border-slate-300 bg-white"
      }`}>
        {selected && <Check className="w-2.5 h-2.5 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
          <ConfidenceBadge level={confidence} source={source} />
        </div>
        {preview ?? (
          <p className="text-sm text-slate-800 mt-0.5 truncate font-medium">{displayValue}</p>
        )}
      </div>
    </div>
  );
}

// ─── Hours preview ────────────────────────────────────────────────────────────

function HoursPreview({ hours }: { hours: WeekSchedule }) {
  const days = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
  const shorts = { monday:"Mon",tuesday:"Tue",wednesday:"Wed",thursday:"Thu",friday:"Fri",saturday:"Sat",sunday:"Sun" };
  return (
    <div className="grid grid-cols-7 gap-1 mt-1">
      {days.map(d => {
        const cfg = hours[d];
        return (
          <div key={d} className={`text-center rounded-md py-1 px-0.5 ${cfg.isClosed ? "bg-slate-100" : "bg-emerald-50 border border-emerald-100"}`}>
            <div className="text-[9px] font-bold text-slate-400">{shorts[d]}</div>
            {cfg.isClosed
              ? <div className="text-[9px] text-slate-300">Closed</div>
              : cfg.is24Hours
                ? <div className="text-[9px] text-emerald-600 font-semibold">24h</div>
                : <div className="text-[9px] text-emerald-700">{cfg.slots[0]?.open}–{cfg.slots[0]?.close}</div>
            }
          </div>
        );
      })}
    </div>
  );
}

// ─── Color swatch preview ─────────────────────────────────────────────────────

function ColorPreview({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mt-0.5">
      <div className="w-5 h-5 rounded-md border border-slate-200 shrink-0" style={{ backgroundColor: value }} />
      <span className="text-sm font-mono text-slate-800">{value}</span>
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
}

// ─── Main panel component ─────────────────────────────────────────────────────

interface WebsiteMigrationPanelProps {
  onClose: () => void;
  onImport: (payload: ImportPayload) => void;
}

export function WebsiteMigrationPanel({ onClose, onImport }: WebsiteMigrationPanelProps) {
  const [stage,       setStage]       = useState<Stage>("url");
  const [url,         setUrl]         = useState("");
  const [urlError,    setUrlError]    = useState("");
  const [scanSteps,   setScanSteps]   = useState<ScanStep[]>([]);
  const [stepIdx,     setStepIdx]     = useState(-1);
  const [extraction,  setExtraction]  = useState<Extraction | null>(null);
  const [importCount, setImportCount] = useState(0);

  // ── URL validation ──────────────────────────────────────────────────────────

  const isValidUrl = (s: string) => {
    try { new URL(s.startsWith("http") ? s : `https://${s}`); return true; }
    catch { return false; }
  };

  // ── Start scanning ──────────────────────────────────────────────────────────

  const startScan = useCallback(() => {
    if (!isValidUrl(url)) { setUrlError("Please enter a valid website URL"); return; }
    setUrlError("");
    const steps = buildScanSteps(getDomainStr(url));
    setScanSteps(steps.map(s => ({ ...s, found: null })));
    setStepIdx(0);
    setStage("scanning");
  }, [url]);

  // ── Drive the scan animation ────────────────────────────────────────────────

  useEffect(() => {
    if (stage !== "scanning" || stepIdx < 0) return;
    if (stepIdx >= scanSteps.length) {
      // Done — build extraction
      setExtraction(generateExtraction(url));
      setStage("review");
      return;
    }
    const step = scanSteps[stepIdx];
    const timer = setTimeout(() => {
      setScanSteps(prev => prev.map((s, i) =>
        i === stepIdx ? { ...s, found: step.found } : s
      ));
      setStepIdx(i => i + 1);
    }, step.durationMs);
    return () => clearTimeout(timer);
  }, [stage, stepIdx, scanSteps, url]);

  // ── Toggle a single field ───────────────────────────────────────────────────

  const toggle = useCallback(<K extends keyof Extraction>(key: K) => {
    setExtraction(prev => {
      if (!prev || !prev[key]) return prev;
      const field = prev[key] as Field<unknown>;
      return { ...prev, [key]: { ...field, selected: !field.selected } };
    });
  }, []);

  const setAllInGroup = useCallback((keys: (keyof Extraction)[], selected: boolean) => {
    setExtraction(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      const mutable = next as Record<keyof Extraction, Field<unknown> | null>;
      keys.forEach(k => {
        if (mutable[k]) mutable[k] = { ...(mutable[k] as Field<unknown>), selected };
      });
      return next;
    });
  }, []);

  // ── Build and fire import payload ───────────────────────────────────────────

  const handleImport = useCallback(() => {
    if (!extraction) return;
    const e = extraction;
    const sel = <T,>(f: Field<T> | null): T | undefined => (f?.selected ? f.value : undefined);

    const payload: ImportPayload = {};

    // Basic
    const generalUpdates: Partial<BasicInfoData["general"]> = {};
    if (sel(e.clinicName))      generalUpdates.name             = sel(e.clinicName)!;
    if (sel(e.tagline))         generalUpdates.tagline          = sel(e.tagline)!;
    if (sel(e.metaDescription)) generalUpdates.metaDescription  = sel(e.metaDescription)!;
    if (sel(e.logoUrl))         generalUpdates.logoUrl          = sel(e.logoUrl)!;
    if (sel(e.primaryColor))    generalUpdates.primaryColor     = sel(e.primaryColor)!;
    if (sel(e.secondaryColor))  generalUpdates.secondaryColor   = sel(e.secondaryColor)!;
    if (Object.keys(generalUpdates).length > 0 || sel(e.hospitalType)) {
      payload.basic = {};
      if (Object.keys(generalUpdates).length > 0) payload.basic.general = generalUpdates;
      if (sel(e.hospitalType)) payload.basic.hospitalType = sel(e.hospitalType)!;
    }

    // Taxonomy
    if (sel(e.petTypes)) {
      payload.taxonomy = { petTypes: sel(e.petTypes)! };
    }

    // Contact
    const contactUpdates: Partial<ContactData> = {};
    const addrUpdates: Partial<ContactData["address"]> = {};
    if (sel(e.street))    addrUpdates.street = sel(e.street)!;
    if (sel(e.city))      addrUpdates.city   = sel(e.city)!;
    if (sel(e.stateCode)) addrUpdates.state  = sel(e.stateCode)!;
    if (sel(e.zip))       addrUpdates.zip    = sel(e.zip)!;
    if (Object.keys(addrUpdates).length > 0) contactUpdates.address = addrUpdates as ContactData["address"];
    if (sel(e.phone))         contactUpdates.phone         = sel(e.phone)!;
    if (sel(e.emergencyPhone)) contactUpdates.emergencyPhone = sel(e.emergencyPhone)!;
    if (sel(e.email))         contactUpdates.email         = sel(e.email)!;
    if (Object.keys(contactUpdates).length > 0) payload.contact = contactUpdates;

    // Hours
    if (sel(e.hours)) payload.hours = sel(e.hours)!;

    // Count fields
    const count = Object.values(e).filter(f => f && (f as Field<unknown>).selected).length;
    setImportCount(count);
    onImport(payload);
    setStage("done");
  }, [extraction, onImport]);

  // ── Scanning progress ───────────────────────────────────────────────────────

  const scanProgress = scanSteps.length
    ? Math.round(((stepIdx) / scanSteps.length) * 100)
    : 0;

  const selectedCount = extraction
    ? Object.values(extraction).filter(f => f && (f as Field<unknown>).selected).length
    : 0;

  // ─── Render ─────────────────────────────────────────────────────────────────

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[500] bg-black/40 backdrop-blur-sm" onClick={stage === "url" ? onClose : undefined} />

      {/* Panel */}
      <div className="fixed z-[501] inset-x-4 top-[4%] bottom-[4%] max-w-[680px] mx-auto bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">

        {/* ── Header ── */}
        <div className="shrink-0 px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#003459] to-[#0369A1] flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">Import from Existing Website</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">We'll scan your live site and pre-fill your clinic profile automatically</p>
            </div>
          </div>
          {stage !== "scanning" && (
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Stage indicator ── */}
        <div className="shrink-0 px-6 py-2 border-b border-gray-100 bg-gray-50/60">
          <div className="flex items-center gap-2">
            {(["url", "scanning", "review", "done"] as Stage[]).map((s, i) => {
              const stages: Stage[] = ["url", "scanning", "review", "done"];
              const stageIdx = stages.indexOf(stage);
              const thisIdx  = stages.indexOf(s);
              const past   = thisIdx < stageIdx;
              const active = s === stage;
              const labels = ["Enter URL", "Scanning", "Review", "Done"];
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      active ? "bg-[#003459] text-white" : past ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                    }`}>
                      {past ? <Check className="w-3 h-3" /> : i + 1}
                    </div>
                    <span className={`text-[11px] font-medium ${active ? "text-[#003459]" : past ? "text-emerald-600" : "text-gray-400"}`}>
                      {labels[i]}
                    </span>
                  </div>
                  {i < 3 && <div className={`w-6 h-px ${past ? "bg-emerald-300" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Content area ── */}
        <div className="flex-1 overflow-y-auto">

          {/* ─── Stage: URL Entry ─────────────────────────────────────────── */}
          {stage === "url" && (
            <div className="px-6 py-6 space-y-6">
              {/* URL input */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Your current website URL
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="url"
                    value={url}
                    onChange={e => { setUrl(e.target.value); setUrlError(""); }}
                    onKeyDown={e => e.key === "Enter" && startScan()}
                    placeholder="https://yourvetclinic.com"
                    autoFocus
                    className={`w-full h-11 pl-10 pr-4 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003459] transition-colors ${
                      urlError ? "border-red-400 focus:border-red-400 focus:ring-red-300" : "border-gray-300 focus:border-[#003459]"
                    }`}
                  />
                </div>
                {urlError && (
                  <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {urlError}
                  </p>
                )}
                <p className="text-[11px] text-gray-400 mt-1.5">
                  We'll scan your public website — no login or credentials needed.
                </p>
              </div>

              {/* What we extract */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">What we'll extract</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { Icon: Building2, label: "Clinic name & branding",  items: "Name, logo, tagline, colors" },
                    { Icon: Phone,     label: "Contact details",         items: "Phone, email, emergency line" },
                    { Icon: MapPin,    label: "Location",                items: "Full address & city" },
                    { Icon: Clock,     label: "Business hours",          items: "7-day weekly schedule" },
                    { Icon: Tag,       label: "Clinic type & pets",      items: "Specialty, species treated" },
                    { Icon: Search,    label: "SEO metadata",            items: "Meta title & description" },
                  ].map(({ Icon, label, items }) => (
                    <div key={label} className="flex items-start gap-2.5 p-3 rounded-xl border border-gray-100 bg-gray-50/80">
                      <div className="w-7 h-7 rounded-lg bg-[#003459]/8 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5 text-[#003459]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700 leading-tight">{label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{items}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 border border-blue-100">
                <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  We only read <strong>publicly accessible</strong> pages — no login, no cookies, no stored credentials. You review and approve every field before anything is saved.
                </p>
              </div>
            </div>
          )}

          {/* ─── Stage: Scanning ─────────────────────────────────────────── */}
          {stage === "scanning" && (
            <div className="px-6 py-6 space-y-5">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-[#003459] animate-spin" />
                    <span className="text-sm font-semibold text-gray-800">
                      Scanning <span className="font-mono text-[#003459]">{getDomainStr(url)}</span>
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#003459]">{scanProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#003459] to-[#0369A1] rounded-full transition-all duration-500"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
              </div>

              {/* Steps list */}
              <div className="space-y-1">
                {scanSteps.map((step, i) => {
                  const done    = i < stepIdx;
                  const running = i === stepIdx;
                  return (
                    <div key={step.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${running ? "bg-blue-50 border border-blue-100" : done ? "" : "opacity-40"}`}>
                      <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                        {done    && <Check className="w-4 h-4 text-emerald-500" />}
                        {running && <Loader2 className="w-4 h-4 text-[#003459] animate-spin" />}
                        {!done && !running && <div className="w-2 h-2 rounded-full bg-gray-300" />}
                      </div>
                      <span className={`text-sm flex-1 ${done ? "text-gray-500" : running ? "text-[#003459] font-medium" : "text-gray-400"}`}>
                        {step.label}
                      </span>
                      {done && step.found && (
                        <span className="text-[10px] text-emerald-600 font-medium">{step.found}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── Stage: Review ───────────────────────────────────────────── */}
          {stage === "review" && extraction && (
            <div className="px-6 py-5 space-y-4">
              {/* Summary banner */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-emerald-800">Scan complete — {selectedCount} fields ready to import</p>
                  <p className="text-[11px] text-emerald-600">
                    Scraped from <span className="font-mono font-semibold">{getDomainStr(url)}</span>. Review, toggle fields, then click Import.
                  </p>
                </div>
                <a href={url.startsWith("http") ? url : `https://${url}`} target="_blank" rel="noreferrer"
                   className="p-1.5 text-emerald-600 hover:text-emerald-800 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* ── Category: Clinic Identity ── */}
              <CategoryCard
                icon={Building2} title="Clinic Identity" color="#003459"
                fieldCount={6}
                selectedCount={[extraction.clinicName, extraction.tagline, extraction.metaDescription, extraction.logoUrl, extraction.primaryColor, extraction.secondaryColor].filter(f => f?.selected).length}
                onSelectAll={v => setAllInGroup(["clinicName","tagline","metaDescription","logoUrl","primaryColor","secondaryColor"], v)}
              >
                {extraction.clinicName && (
                  <FieldRow label="Clinic Name" displayValue={extraction.clinicName.value}
                    confidence={extraction.clinicName.confidence} source={extraction.clinicName.source}
                    selected={extraction.clinicName.selected} onToggle={() => toggle("clinicName")} />
                )}
                {extraction.tagline && (
                  <FieldRow label="Tagline" displayValue={extraction.tagline.value}
                    confidence={extraction.tagline.confidence} source={extraction.tagline.source}
                    selected={extraction.tagline.selected} onToggle={() => toggle("tagline")} />
                )}
                {extraction.metaDescription && (
                  <FieldRow label="Meta Description" displayValue={extraction.metaDescription.value}
                    confidence={extraction.metaDescription.confidence} source={extraction.metaDescription.source}
                    selected={extraction.metaDescription.selected} onToggle={() => toggle("metaDescription")} />
                )}
                {extraction.logoUrl && (
                  <FieldRow label="Logo URL" displayValue={extraction.logoUrl.value}
                    confidence={extraction.logoUrl.confidence} source={extraction.logoUrl.source}
                    selected={extraction.logoUrl.selected} onToggle={() => toggle("logoUrl")}
                    preview={
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-8 h-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-4 h-4 text-slate-300" />
                        </div>
                        <span className="text-xs font-mono text-slate-600 truncate">{extraction.logoUrl.value}</span>
                      </div>
                    }
                  />
                )}
                {extraction.primaryColor && (
                  <FieldRow label="Primary Color" displayValue={extraction.primaryColor.value}
                    confidence={extraction.primaryColor.confidence} source={extraction.primaryColor.source}
                    selected={extraction.primaryColor.selected} onToggle={() => toggle("primaryColor")}
                    preview={<ColorPreview value={extraction.primaryColor.value} label="Primary" />}
                  />
                )}
                {extraction.secondaryColor && (
                  <FieldRow label="Secondary Color" displayValue={extraction.secondaryColor.value}
                    confidence={extraction.secondaryColor.confidence} source={extraction.secondaryColor.source}
                    selected={extraction.secondaryColor.selected} onToggle={() => toggle("secondaryColor")}
                    preview={<ColorPreview value={extraction.secondaryColor.value} label="Secondary" />}
                  />
                )}
              </CategoryCard>

              {/* ── Category: Contact ── */}
              <CategoryCard
                icon={Phone} title="Contact Information" color="#0369A1"
                fieldCount={3}
                selectedCount={[extraction.phone, extraction.emergencyPhone, extraction.email].filter(f => f?.selected).length}
                onSelectAll={v => setAllInGroup(["phone","emergencyPhone","email"], v)}
              >
                {extraction.phone && (
                  <FieldRow label="Main Phone" displayValue={extraction.phone.value}
                    confidence={extraction.phone.confidence} source={extraction.phone.source}
                    selected={extraction.phone.selected} onToggle={() => toggle("phone")} />
                )}
                {extraction.emergencyPhone && (
                  <FieldRow label="Emergency Phone" displayValue={extraction.emergencyPhone.value}
                    confidence={extraction.emergencyPhone.confidence} source={extraction.emergencyPhone.source}
                    selected={extraction.emergencyPhone.selected} onToggle={() => toggle("emergencyPhone")} />
                )}
                {extraction.email && (
                  <FieldRow label="Email Address" displayValue={extraction.email.value}
                    confidence={extraction.email.confidence} source={extraction.email.source}
                    selected={extraction.email.selected} onToggle={() => toggle("email")} />
                )}
              </CategoryCard>

              {/* ── Category: Location ── */}
              <CategoryCard
                icon={MapPin} title="Location & Address" color="#7C3AED"
                fieldCount={4}
                selectedCount={[extraction.street, extraction.city, extraction.stateCode, extraction.zip].filter(f => f?.selected).length}
                onSelectAll={v => setAllInGroup(["street","city","stateCode","zip"], v)}
              >
                {extraction.street && (
                  <FieldRow label="Street" displayValue={extraction.street.value}
                    confidence={extraction.street.confidence} source={extraction.street.source}
                    selected={extraction.street.selected} onToggle={() => toggle("street")} />
                )}
                {extraction.city && (
                  <FieldRow label="City" displayValue={extraction.city.value}
                    confidence={extraction.city.confidence} source={extraction.city.source}
                    selected={extraction.city.selected} onToggle={() => toggle("city")} />
                )}
                {extraction.stateCode && (
                  <FieldRow label="State" displayValue={extraction.stateCode.value}
                    confidence={extraction.stateCode.confidence} source={extraction.stateCode.source}
                    selected={extraction.stateCode.selected} onToggle={() => toggle("stateCode")} />
                )}
                {extraction.zip && (
                  <FieldRow label="ZIP Code" displayValue={extraction.zip.value}
                    confidence={extraction.zip.confidence} source={extraction.zip.source}
                    selected={extraction.zip.selected} onToggle={() => toggle("zip")} />
                )}
              </CategoryCard>

              {/* ── Category: Clinic Type ── */}
              <CategoryCard
                icon={Tag} title="Clinic Type & Pets" color="#D97706"
                fieldCount={2}
                selectedCount={[extraction.hospitalType, extraction.petTypes].filter(f => f?.selected).length}
                onSelectAll={v => setAllInGroup(["hospitalType","petTypes"], v)}
              >
                {extraction.hospitalType && (
                  <FieldRow label="Hospital Type" displayValue={extraction.hospitalType.value.replace(/_/g," ")}
                    confidence={extraction.hospitalType.confidence} source={extraction.hospitalType.source}
                    selected={extraction.hospitalType.selected} onToggle={() => toggle("hospitalType")} />
                )}
                {extraction.petTypes && (
                  <FieldRow label="Pet Types Treated" displayValue={extraction.petTypes.value.join(", ")}
                    confidence={extraction.petTypes.confidence} source={extraction.petTypes.source}
                    selected={extraction.petTypes.selected} onToggle={() => toggle("petTypes")} />
                )}
              </CategoryCard>

              {/* ── Category: Hours ── */}
              <CategoryCard
                icon={Clock} title="Business Hours" color="#059669"
                fieldCount={1}
                selectedCount={extraction.hours?.selected ? 1 : 0}
                onSelectAll={v => setAllInGroup(["hours"], v)}
              >
                {extraction.hours && (
                  <FieldRow label="Weekly Schedule" displayValue="7-day schedule"
                    confidence={extraction.hours.confidence} source={extraction.hours.source}
                    selected={extraction.hours.selected} onToggle={() => toggle("hours")}
                    preview={<HoursPreview hours={extraction.hours.value} />}
                  />
                )}
              </CategoryCard>
            </div>
          )}

          {/* ─── Stage: Done ─────────────────────────────────────────────── */}
          {stage === "done" && (
            <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                <Check className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Import Complete!</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                <strong>{importCount} fields</strong> have been applied to your clinic profile. Review each section and make any adjustments you need.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {["Basic Information", "Contact Details", "Business Hours", "Clinic Type"].map(s => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                    <Check className="w-3 h-3" /> {s}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-[#003459] text-white text-sm font-semibold rounded-xl hover:bg-[#002845] transition-colors"
              >
                Review Your Profile <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

        {/* ── Footer actions ── */}
        {(stage === "url" || stage === "review") && (
          <div className="shrink-0 flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/40">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Cancel
            </button>

            {stage === "url" && (
              <button
                type="button"
                onClick={startScan}
                disabled={!url.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#003459] text-white text-sm font-semibold rounded-xl hover:bg-[#002845] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start Import Scan
              </button>
            )}

            {stage === "review" && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{selectedCount} fields selected</span>
                <button
                  type="button"
                  onClick={handleImport}
                  disabled={selectedCount === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#003459] text-white text-sm font-semibold rounded-xl hover:bg-[#002845] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Import {selectedCount} Fields
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
