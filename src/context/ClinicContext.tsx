/**
 * ClinicContext — single source of truth for clinic identity data.
 *
 * Both HospitalSetupPage and WebsiteEditorPage read/write here,
 * giving instant cross-tab sync. State is auto-persisted to
 * localStorage (debounced 400 ms) so changes survive page reloads.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import type { HospitalType, PetType, ClinicStatus } from "../types/clinic";
import type { WeekSchedule } from "../components/HospitalSetup/ui/OperatingHoursEditor";

// ─── Public shape types ────────────────────────────────────────────────────────

export interface ClinicGeneral {
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
  tagline?: string;
  metaDescription?: string;
}

export interface ClinicTaxonomyCtx {
  hospitalType: HospitalType;
  petTypes: PetType[];
}

export interface ClinicContactCtx {
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  phone: string;
  email: string;
  emergencyPhone?: string;
}

export interface SEOFields {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: string;
  focusKeyword: string;
}

// ─── Internal state shape ──────────────────────────────────────────────────────

interface ClinicState {
  general: ClinicGeneral;
  taxonomy: ClinicTaxonomyCtx;
  contact: ClinicContactCtx;
  hours: WeekSchedule | undefined;
  seo: SEOFields;
  status: ClinicStatus;
}

// ─── Context value type ────────────────────────────────────────────────────────

interface ClinicContextValue {
  clinic: ClinicState;
  updateGeneral: (patch: Partial<ClinicGeneral>) => void;
  updateTaxonomy: (patch: Partial<ClinicTaxonomyCtx>) => void;
  updateContact: (patch: Partial<ClinicContactCtx>) => void;
  updateHours: (hours: WeekSchedule) => void;
  updateSEO: (patch: Partial<SEOFields>) => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
  triggerSave: () => void;
  publish: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_CLINIC: ClinicState = {
  general: {
    name: "",
    slug: "",
    primaryColor: "#0F766E",
    secondaryColor: "#F59E0B",
  },
  taxonomy: {
    hospitalType: "general_practice",
    petTypes: [],
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
  seo: {
    metaTitle: "",
    metaDescription: "",
    ogImageUrl: "",
    canonicalUrl: "",
    robots: "index,follow",
    focusKeyword: "",
  },
  status: "draft",
};

// ─── localStorage helpers ─────────────────────────────────────────────────────

const STORAGE_KEY = "vet-cms-clinic-v1";

function loadFromStorage(): ClinicState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      // Deep merge so new default keys survive schema additions
      const saved = JSON.parse(raw) as Partial<ClinicState>;
      return {
        ...DEFAULT_CLINIC,
        ...saved,
        general: { ...DEFAULT_CLINIC.general, ...(saved.general ?? {}) },
        taxonomy: { ...DEFAULT_CLINIC.taxonomy, ...(saved.taxonomy ?? {}) },
        contact: {
          ...DEFAULT_CLINIC.contact,
          ...(saved.contact ?? {}),
          address: { ...DEFAULT_CLINIC.contact.address, ...(saved.contact?.address ?? {}) },
        },
        seo: { ...DEFAULT_CLINIC.seo, ...(saved.seo ?? {}) },
      };
    }
  } catch {
    // Corrupt storage — start fresh
  }
  return DEFAULT_CLINIC;
}

function persistToStorage(state: ClinicState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded or private browsing — ignore
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ClinicContext = createContext<ClinicContextValue | null>(null);

export function useClinic(): ClinicContextValue {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used inside <ClinicProvider>");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [clinic, setClinic] = useState<ClinicState>(() => loadFromStorage());
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-persist to localStorage on every state change (debounced 400 ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => persistToStorage(clinic), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [clinic]);

  const updateGeneral = useCallback((patch: Partial<ClinicGeneral>) => {
    setClinic((prev) => ({ ...prev, general: { ...prev.general, ...patch } }));
  }, []);

  const updateTaxonomy = useCallback((patch: Partial<ClinicTaxonomyCtx>) => {
    setClinic((prev) => ({ ...prev, taxonomy: { ...prev.taxonomy, ...patch } }));
  }, []);

  const updateContact = useCallback((patch: Partial<ClinicContactCtx>) => {
    setClinic((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        ...patch,
        // Nested address needs explicit merge so partial address patches don't wipe other fields
        address: { ...prev.contact.address, ...(patch.address ?? {}) },
      },
    }));
  }, []);

  const updateHours = useCallback((hours: WeekSchedule) => {
    setClinic((prev) => ({ ...prev, hours }));
  }, []);

  const updateSEO = useCallback((patch: Partial<SEOFields>) => {
    setClinic((prev) => ({ ...prev, seo: { ...prev.seo, ...patch } }));
  }, []);

  const triggerSave = useCallback(() => {
    setSaveStatus("saving");
    // Flush debounced write immediately, then show confirmation
    if (debounceRef.current) clearTimeout(debounceRef.current);
    persistToStorage(clinic);
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 600);
  }, [clinic]);

  const publish = useCallback(() => {
    setClinic((prev) => ({ ...prev, status: "published" }));
    setSaveStatus("saving");
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 600);
  }, []);

  return (
    <ClinicContext.Provider
      value={{
        clinic,
        updateGeneral,
        updateTaxonomy,
        updateContact,
        updateHours,
        updateSEO,
        saveStatus,
        triggerSave,
        publish,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}
