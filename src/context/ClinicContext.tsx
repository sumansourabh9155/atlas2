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
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    /** Google Maps embed URL — used in the contact / location section preview */
    mapEmbedUrl?: string;
  };
  phone: string;
  email: string;
  emergencyPhone?: string;
  /** Existing website URL, if any */
  website?: string;
}

// ─── Navigation state ────────────────────────────────────────────────────────

export interface NavLinkCtx {
  id: string;
  label: string;
  href: string;
  openInNewTab: boolean;
}

export interface NavConfigCtx {
  isSticky: boolean;
  isTransparentOnScroll: boolean;
  colorScheme: "light" | "dark" | "brand";
  showClinicName: boolean;
  ctaLabel: string;
  ctaHref: string;
}

export interface SEOFields {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: string;
  focusKeyword: string;
}

export interface ClinicIntegrations {
  pixelTrackingEnabled: boolean;
  ottoEnabled: boolean;
  ottoWidgetScript: string;
  vetstoriaEnabled: boolean;
  googleTagManagerEnabled: boolean;
  facebookPixelEnabled: boolean;
  microsoftClarityEnabled: boolean;
  cookieConsentEnabled: boolean;
}

export interface ClinicFooterConfig {
  subscriptionEnabled: boolean;
  subscriptionHeading: string;
  subscriptionLink: string;
  additionalLinksEnabled: boolean;
  additionalLinks: { name: string; link: string }[];
  termsOfService: string;
  privacyPolicy: string;
}

// ─── Services & Vets config ───────────────────────────────────────────────────

export interface ServiceGroup {
  id: string;
  enabled: boolean;
  name: string;
  selectedServiceIds: string[];
}

export interface ClinicServicesConfig {
  pricingEnabled: boolean;
  pricingUrl: string;
  serviceGroups: ServiceGroup[];
}

export interface ClinicVetsConfig {
  selectedVetIds: string[];
}

// ─── Internal state shape ──────────────────────────────────────────────────────

interface ClinicState {
  general: ClinicGeneral;
  taxonomy: ClinicTaxonomyCtx;
  contact: ClinicContactCtx;
  hours: WeekSchedule | undefined;
  seo: SEOFields;
  integrations: ClinicIntegrations;
  footerConfig: ClinicFooterConfig;
  servicesConfig: ClinicServicesConfig;
  vetsConfig: ClinicVetsConfig;
  navLinks: NavLinkCtx[];
  navConfig: NavConfigCtx;
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
  updateIntegrations: (patch: Partial<ClinicIntegrations>) => void;
  updateFooterConfig: (patch: Partial<ClinicFooterConfig>) => void;
  updateServicesConfig: (patch: Partial<ClinicServicesConfig>) => void;
  updateVetsConfig: (patch: Partial<ClinicVetsConfig>) => void;
  updateNavLinks: (links: NavLinkCtx[]) => void;
  updateNavConfig: (patch: Partial<NavConfigCtx>) => void;
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
      street2: "",
      city: "",
      state: "",
      zip: "",
      country: "United States",
      mapEmbedUrl: "",
    },
    phone: "",
    email: "",
    emergencyPhone: "",
    website: "",
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
  integrations: {
    pixelTrackingEnabled: false,
    ottoEnabled: false,
    ottoWidgetScript: "",
    vetstoriaEnabled: false,
    googleTagManagerEnabled: false,
    facebookPixelEnabled: false,
    microsoftClarityEnabled: false,
    cookieConsentEnabled: false,
  },
  footerConfig: {
    subscriptionEnabled: false,
    subscriptionHeading: "",
    subscriptionLink: "",
    additionalLinksEnabled: false,
    additionalLinks: [],
    termsOfService: "",
    privacyPolicy: "",
  },
  servicesConfig: {
    pricingEnabled: false,
    pricingUrl: "",
    serviceGroups: [{ id: "grp-1", enabled: true, name: "", selectedServiceIds: [] }],
  },
  vetsConfig: {
    selectedVetIds: [],
  },
  navLinks: [
    { id: "home",             label: "Home",             href: "/",         openInNewTab: false },
    { id: "about-us",         label: "About Us",         href: "/about",    openInNewTab: false },
    { id: "services",         label: "Services",         href: "/services", openInNewTab: false },
    { id: "book-appointment", label: "Book Appointment", href: "/book",     openInNewTab: false },
    { id: "blog",             label: "Blog",             href: "/blog",     openInNewTab: false },
    { id: "faqs",             label: "FAQs",             href: "/faqs",     openInNewTab: false },
    { id: "forums",           label: "Forums",           href: "/forums",   openInNewTab: false },
  ],
  navConfig: {
    isSticky: true,
    isTransparentOnScroll: true,
    colorScheme: "light",
    showClinicName: true,
    ctaLabel: "Book Appointment",
    ctaHref: "#contact",
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
          address: {
            ...DEFAULT_CLINIC.contact.address,
            ...(saved.contact?.address ?? {}),
          },
        },
        seo: { ...DEFAULT_CLINIC.seo, ...(saved.seo ?? {}) },
        integrations: { ...DEFAULT_CLINIC.integrations, ...(saved.integrations ?? {}) },
        footerConfig: {
          ...DEFAULT_CLINIC.footerConfig,
          ...(saved.footerConfig ?? {}),
          additionalLinks: (saved.footerConfig?.additionalLinks ?? DEFAULT_CLINIC.footerConfig.additionalLinks),
        },
        servicesConfig: {
          ...DEFAULT_CLINIC.servicesConfig,
          ...(saved.servicesConfig ?? {}),
          serviceGroups: saved.servicesConfig?.serviceGroups ?? DEFAULT_CLINIC.servicesConfig.serviceGroups,
        },
        vetsConfig: {
          ...DEFAULT_CLINIC.vetsConfig,
          ...(saved.vetsConfig ?? {}),
        },
        navLinks: saved.navLinks ?? DEFAULT_CLINIC.navLinks,
        navConfig: { ...DEFAULT_CLINIC.navConfig, ...(saved.navConfig ?? {}) },
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

  const updateIntegrations = useCallback((patch: Partial<ClinicIntegrations>) => {
    setClinic((prev) => ({ ...prev, integrations: { ...prev.integrations, ...patch } }));
  }, []);

  const updateFooterConfig = useCallback((patch: Partial<ClinicFooterConfig>) => {
    setClinic((prev) => ({
      ...prev,
      footerConfig: { ...prev.footerConfig, ...patch },
    }));
  }, []);

  const updateServicesConfig = useCallback((patch: Partial<ClinicServicesConfig>) => {
    setClinic((prev) => ({ ...prev, servicesConfig: { ...prev.servicesConfig, ...patch } }));
  }, []);

  const updateVetsConfig = useCallback((patch: Partial<ClinicVetsConfig>) => {
    setClinic((prev) => ({ ...prev, vetsConfig: { ...prev.vetsConfig, ...patch } }));
  }, []);

  const updateNavLinks = useCallback((links: NavLinkCtx[]) => {
    setClinic((prev) => ({ ...prev, navLinks: links }));
  }, []);

  const updateNavConfig = useCallback((patch: Partial<NavConfigCtx>) => {
    setClinic((prev) => ({ ...prev, navConfig: { ...prev.navConfig, ...patch } }));
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
        updateIntegrations,
        updateFooterConfig,
        updateServicesConfig,
        updateVetsConfig,
        updateNavLinks,
        updateNavConfig,
        saveStatus,
        triggerSave,
        publish,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
}
