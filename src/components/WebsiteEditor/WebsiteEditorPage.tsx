import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { LeftPanel } from "./LeftPanel";
import { LivePreviewPane } from "./LivePreviewPane";
import { RightPanel } from "./RightPanel";
import { mockClinicData } from "../../data/mockClinic";
import { VET_CATALOGUE, SERVICE_CATALOGUE } from "../../data/catalogue";
import type { PreviewTheme } from "./LivePreviewPane";
import { useClinic } from "../../context/ClinicContext";
import { AIEditorContext, SECTION_LABELS } from "./ai/AIEditorContext";
import { runToneRewrite, type TonePreset, type AllSectionContent } from "./ai/mockAI";
import { FillFromScratchWizard } from "./ai/FillFromScratchWizard";
import { ConsistencyPanel } from "./ai/ConsistencyPanel";
import { SmartModesPanel } from "./ai/SmartModesPanel";
import { type CampaignPlan } from "./ai/campaignBuilder";
import {
  DEFAULT_SMART_MODES_STATE,
  computeActiveMode,
  type SmartModesState,
  type ActiveModeResult,
} from "../../types/smartModes";
import {
  type AddableSectionType,
  type DynamicSectionRegistry,
  type DynamicSectionState,
  createDefaultSection,
} from "./sections";

// ─── Shared state types ────────────────────────────────────────────────────────

export interface CtaState {
  enabled: boolean;
  label: string;
  href: string;
}

export interface HeroEditorState {
  headline: string;
  subheadline: string;
  badgeText: string;
  backgroundValue: string;
  overlayOpacity: number;
  layout: "centered" | "left_aligned" | "split_image_right" | "split_image_left";
  primaryCta: CtaState;
  secondaryCta: CtaState;
}

export interface ServicesEditorState {
  sectionTitle: string;
  sectionSubtitle: string;
  displayStyle: "grid_cards" | "icon_list" | "carousel";
  gridColumns: 2 | 3 | 4;
  showPricing: boolean;
}

export interface TeamsEditorState {
  sectionTitle: string;
  sectionSubtitle: string;
  showBio: boolean;
  showSpecializations: boolean;
  layout: "grid_cards" | "carousel";
}

export interface LocationsEditorState {
  showAnimals: boolean;
  showMap: boolean;
  showBookingWidget: boolean;
  nextAvailable: string;
}

export interface TestimonialsEditorState {
  sectionTitle: string;
  subtitle: string;
  totalReviews: string;
  rating: string;
}

export interface JoinTeamEditorState {
  heading: string;
  description: string;
  ctaLabel: string;
}

export interface FAQEditorState {
  sectionTitle: string;
  subtitle: string;
}

export interface NewsletterEditorState {
  promptText: string;
  ctaLabel: string;
}

export interface SEOState {
  metaTitle: string;
  metaDescription: string;
  ogImageUrl: string;
  canonicalUrl: string;
  robots: string;
  focusKeyword: string;
}

/** Core section IDs (always present). */
export type SectionId =
  | "hero" | "quicklinks" | "services" | "locations" | "awards"
  | "teams" | "testimonials" | "jointeam" | "faq" | "newsletter" | "footer";

/** Dynamic section instance IDs follow the pattern "{type}-{n}" e.g. "stats-0". */
export type InstanceId = string;

/** Any block that can be open in the editor — core or dynamic. */
export type OpenBlock = SectionId | InstanceId | null;

export const INITIAL_SECTION_ORDER: SectionId[] = [
  "hero", "quicklinks", "services", "locations", "awards",
  "teams", "testimonials", "jointeam", "faq", "newsletter", "footer",
];

export type ViewportMode = "desktop" | "tablet" | "mobile";

// ─── Initial states ────────────────────────────────────────────────────────────

// Hero defaults — clinic name/tagline will be seeded via useEffect once context loads
const INITIAL_HERO: HeroEditorState = {
  headline:        "Compassionate Care for Your Beloved Pets",
  subheadline:     "Trusted veterinary expertise — right in your neighborhood.",
  badgeText:       "",
  backgroundValue: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&auto=format&fit=crop&q=80",
  overlayOpacity:  0.55,
  layout:          "centered",
  primaryCta: {
    enabled: true,
    label:   "Book an Appointment",
    href:    "#contact",
  },
  secondaryCta: {
    enabled: true,
    label:   "Explore Our Services",
    href:    "#services",
  },
};

const INITIAL_SERVICES: ServicesEditorState = {
  sectionTitle:    "Specialty Services",
  sectionSubtitle: "From routine diagnostics to complex surgery, our board-certified team has the expertise your pet deserves.",
  displayStyle:    "grid_cards",
  gridColumns:     3,
  showPricing:     true,
};

const INITIAL_TEAMS: TeamsEditorState = {
  sectionTitle:        "Meet Our Specialists",
  sectionSubtitle:     "Every patient is cared for by a board-certified specialist with deep expertise in their field.",
  showBio:             true,
  showSpecializations: true,
  layout:              "grid_cards",
};

const INITIAL_LOCATIONS: LocationsEditorState = {
  showAnimals: true,
  showMap: true,
  showBookingWidget: true,
  nextAvailable: "Today, 3:00 PM",
};

const INITIAL_TESTIMONIALS: TestimonialsEditorState = {
  sectionTitle: "Hear From Happy Pet Owners",
  subtitle: "Real stories from our valued clients—because your trust means everything to us. See why pet parents love our care!",
  totalReviews: "100",
  rating: "4.7",
};

const INITIAL_JOIN_TEAM: JoinTeamEditorState = {
  heading: "Join Our Team",
  description: "This isn't just a job for us, it's our way of life! We're always looking for outstanding people to join our team. If you're passionate about pets, people, and fun, we welcome you to browse our current openings and apply.",
  ctaLabel: "View Careers",
};

const INITIAL_FAQ: FAQEditorState = {
  sectionTitle: "Your Questions, Answered",
  subtitle: "We've compiled answers to the questions we get asked most by pet owners, clinic partners, and team members.",
};

const INITIAL_NEWSLETTER: NewsletterEditorState = {
  promptText: "Subscribe Now To Receive Updates From",
  ctaLabel: "Subscribe Now",
};

const INITIAL_SEO: SEOState = {
  metaTitle: "",
  metaDescription: "",
  ogImageUrl: "",
  canonicalUrl: "",
  robots: "index,follow",
  focusKeyword: "",
};

// ─── WebsiteEditorPage ────────────────────────────────────────────────────────

interface WebsiteEditorPageProps {
  onNavigateToSetup: () => void;
  onNext?: () => void;
}

export function WebsiteEditorPage({ onNavigateToSetup }: WebsiteEditorPageProps) {
  // Pull shared clinic identity from context
  const { clinic: clinicCtx, updateGeneral, updateSEO } = useClinic();

  // Layout state
  const [selectedPage, setSelectedPage] = useState("home");
  const [openBlock,    setOpenBlock]    = useState<OpenBlock>("hero");
  const [viewport,     setViewport]     = useState<ViewportMode>("desktop");

  // Theme + brand colors — initialise from context, write back on change
  const [theme,          setTheme]          = useState<PreviewTheme>("1");
  const [primaryColor,   setPrimaryColor]   = useState<string>(
    clinicCtx.general.primaryColor || mockClinicData.general.primaryColor
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    clinicCtx.general.secondaryColor || mockClinicData.general.secondaryColor || "#F59E0B"
  );

  // Keep local colors in sync when context changes externally (e.g. after import)
  useEffect(() => {
    if (clinicCtx.general.primaryColor)   setPrimaryColor(clinicCtx.general.primaryColor);
    if (clinicCtx.general.secondaryColor) setSecondaryColor(clinicCtx.general.secondaryColor);
  }, [clinicCtx.general.primaryColor, clinicCtx.general.secondaryColor]);

  // Seed hero headline/subheadline from clinic name & tagline (only when still on defaults)
  const heroSeededRef = useRef(false);
  useEffect(() => {
    if (heroSeededRef.current) return;
    const name    = clinicCtx.general.name?.trim();
    const tagline = clinicCtx.general.tagline?.trim();
    if (!name) return; // wait until the user has filled in the clinic name
    heroSeededRef.current = true;
    setHeroState(prev => ({
      ...prev,
      headline:    name    ? `Welcome to ${name}`                                              : prev.headline,
      subheadline: tagline ? tagline                                                            : prev.subheadline,
      badgeText:   clinicCtx.taxonomy.hospitalType !== "general_practice"
        ? `⭐ ${name}`
        : prev.badgeText,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicCtx.general.name, clinicCtx.general.tagline]);

  // Keep SEO state in sync with context (context is the persistence layer)
  useEffect(() => {
    setSeoState({
      metaTitle:       clinicCtx.seo.metaTitle       || (clinicCtx.general.name ? `${clinicCtx.general.name} | Veterinary Clinic` : ""),
      metaDescription: clinicCtx.seo.metaDescription || clinicCtx.general.metaDescription || "",
      ogImageUrl:      clinicCtx.seo.ogImageUrl      || clinicCtx.general.logoUrl          || "",
      canonicalUrl:    clinicCtx.seo.canonicalUrl    || (clinicCtx.general.slug ? `https://${clinicCtx.general.slug}.vet` : ""),
      robots:          clinicCtx.seo.robots          || "index,follow",
      focusKeyword:    clinicCtx.seo.focusKeyword    || "",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    clinicCtx.seo,
    clinicCtx.general.name,
    clinicCtx.general.metaDescription,
    clinicCtx.general.logoUrl,
    clinicCtx.general.slug,
  ]);

  // Section content states
  const [heroState,         setHeroState]         = useState<HeroEditorState>(INITIAL_HERO);
  const [servicesState,     setServicesState]     = useState<ServicesEditorState>(INITIAL_SERVICES);
  const [teamsState,        setTeamsState]        = useState<TeamsEditorState>(INITIAL_TEAMS);
  const [locationsState,    setLocationsState]    = useState<LocationsEditorState>(INITIAL_LOCATIONS);
  const [testimonialsState, setTestimonialsState] = useState<TestimonialsEditorState>(INITIAL_TESTIMONIALS);
  const [joinTeamState,     setJoinTeamState]     = useState<JoinTeamEditorState>(INITIAL_JOIN_TEAM);
  const [faqState,          setFaqState]          = useState<FAQEditorState>(INITIAL_FAQ);
  const [newsletterState,   setNewsletterState]   = useState<NewsletterEditorState>(INITIAL_NEWSLETTER);
  // SEO: initialise from context so it survives page reloads
  const [seoState, setSeoState] = useState<SEOState>({
    metaTitle:       clinicCtx.seo.metaTitle,
    metaDescription: clinicCtx.seo.metaDescription,
    ogImageUrl:      clinicCtx.seo.ogImageUrl,
    canonicalUrl:    clinicCtx.seo.canonicalUrl,
    robots:          clinicCtx.seo.robots,
    focusKeyword:    clinicCtx.seo.focusKeyword,
  });

  // Section order + visibility (lifted so RightPanel DnD drives preview)
  // Type is string[] so dynamic section instance IDs can be included.
  const [sectionOrder, setSectionOrder] = useState<string[]>(INITIAL_SECTION_ORDER);
  const [sectionVisibility, setSectionVisibility] = useState<Record<string, boolean>>(
    Object.fromEntries(INITIAL_SECTION_ORDER.map(id => [id, true]))
  );

  // Left panel collapse (lifted so spacer width stays in sync)
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  // Dynamic sections added from Section Templates
  const [dynamicSections, setDynamicSections] = useState<DynamicSectionRegistry>({});
  const instanceCounters = useRef<Record<AddableSectionType, number>>({
    stats: 0, ctaband: 0, gallery: 0, contactinfo: 0, teamspotlight: 0,
    heading: 0, paragraph: 0, textblock: 0, blockquote: 0, richtext: 0,
    empty: 0, twocol: 0, threecol: 0,
    cardgrid2: 0, cardgrid3: 0, teamcards: 0,
    herocentered: 0, herosplit: 0,
    contactsplit: 0,
    emailcapture: 0, splitcontent: 0, featuregrid: 0,
  });

  // Dragging template type — lifted so ClinicHomepageTemplate shows drop zones
  const [draggingTemplateType, setDraggingTemplateType] = useState<AddableSectionType | null>(null);

  // AI state
  const [isGenerating, setIsGenerating] = useState(false);

  // Phase 3: wizard + consistency + tone
  const [wizardOpen,      setWizardOpen]      = useState(false);
  const [consistencyOpen, setConsistencyOpen] = useState(false);
  const [isToneLoading,   setIsToneLoading]   = useState(false);
  const [activeTone,      setActiveTone]      = useState<TonePreset | null>(null);

  // Smart Modes
  const [smartModesOpen, setSmartModesOpen] = useState(false);
  const [smartModesState,     setSmartModesState]     = useState<SmartModesState>(DEFAULT_SMART_MODES_STATE);
  const [tick, setTick] = useState(0); // increments every 60s to recompute activeMode

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const activeMode = useMemo<ActiveModeResult | null>(
    () => smartModesState.enabled ? computeActiveMode(smartModesState, new Date()) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [smartModesState, tick]
  );

  // Preview → field focus bridge
  const [pendingFocusKey, setPendingFocusKey] = useState<string | null>(null);
  const requestFieldFocus = useCallback((key: string | null) => setPendingFocusKey(key), []);

  /** Clicking a text element in the live preview opens its section AND focuses the exact field. */
  const handlePreviewFieldClick = useCallback((sectionId: OpenBlock, fieldKey: string) => {
    setOpenBlock(sectionId);
    setPendingFocusKey(fieldKey);
  }, []);

  // ── Effective clinic — fully driven by context, falls back to mock only when empty ──

  // Map selected vet IDs → full Veterinarian objects from the shared catalogue
  const effectiveVets = useMemo(() => {
    const ids = clinicCtx.vetsConfig.selectedVetIds;
    if (ids.length === 0) return mockClinicData.veterinarians;
    return ids
      .map((id, idx) => {
        const vet = VET_CATALOGUE[id];
        if (!vet) return null;
        return { ...vet, order: idx, isVisible: true };
      })
      .filter(Boolean) as typeof mockClinicData.veterinarians;
  }, [clinicCtx.vetsConfig.selectedVetIds]);

  // Map selected service IDs from all enabled groups → unique Service objects
  const effectiveServices = useMemo(() => {
    const allIds: string[] = [];
    clinicCtx.servicesConfig.serviceGroups.forEach((group) => {
      if (group.enabled) {
        group.selectedServiceIds.forEach((id) => {
          if (!allIds.includes(id)) allIds.push(id);
        });
      }
    });
    if (allIds.length === 0) return mockClinicData.services;
    return allIds
      .map((id, idx) => {
        const svc = SERVICE_CATALOGUE[id];
        if (!svc) return null;
        return { ...svc, order: idx, isVisible: true };
      })
      .filter(Boolean) as typeof mockClinicData.services;
  }, [clinicCtx.servicesConfig.serviceGroups]);

  // Convert WeekSchedule → businessHours array format used by the schema
  const effectiveBusinessHours = useMemo(() => {
    const schedule = clinicCtx.hours;
    if (!schedule) return mockClinicData.contact.businessHours;
    const DAYS = ["monday","tuesday","wednesday","thursday","friday","saturday","sunday"] as const;
    return DAYS.map((day) => {
      const s = schedule[day];
      if (!s) return { day, open: "08:00", close: "17:00", isClosed: false };
      return {
        day,
        open:     s.is24Hours ? "00:00" : (s.slots[0]?.open  ?? "08:00"),
        close:    s.is24Hours ? "23:59" : (s.slots[0]?.close ?? "17:00"),
        isClosed: s.isClosed,
      };
    });
  }, [clinicCtx.hours]);

  // Build a live navigation block from context so the preview stays in sync
  // with the pages list + nav config settings.
  const effectiveNavBlock = useMemo(() => ({
    blockId: "blk-nav-0000-0000-000000000001",
    type: "navigation" as const,
    isVisible: true,
    order: 0,
    showClinicName: clinicCtx.navConfig.showClinicName,
    links: clinicCtx.navLinks.map(l => ({
      label: l.label,
      href:  l.href,
      openInNewTab: l.openInNewTab,
    })),
    ctaButton: clinicCtx.navConfig.ctaHref
      ? { label: clinicCtx.navConfig.ctaLabel, href: clinicCtx.navConfig.ctaHref }
      : undefined,
    isSticky:               clinicCtx.navConfig.isSticky,
    isTransparentOnScroll:  clinicCtx.navConfig.isTransparentOnScroll,
    colorScheme:            clinicCtx.navConfig.colorScheme,
  }), [clinicCtx.navLinks, clinicCtx.navConfig]);

  const effectiveClinic = useMemo(
    () => ({
      ...mockClinicData,
      general: {
        ...mockClinicData.general,
        name:            clinicCtx.general.name    || mockClinicData.general.name,
        slug:            clinicCtx.general.slug    || mockClinicData.general.slug,
        tagline:         clinicCtx.general.tagline ?? mockClinicData.general.tagline,
        logoUrl:         clinicCtx.general.logoUrl ?? mockClinicData.general.logoUrl,
        metaDescription: clinicCtx.general.metaDescription ?? mockClinicData.general.metaDescription,
        primaryColor,
        secondaryColor,
      },
      taxonomy: {
        hospitalType: clinicCtx.taxonomy.hospitalType || mockClinicData.taxonomy.hospitalType,
        petTypes: clinicCtx.taxonomy.petTypes.length > 0
          ? clinicCtx.taxonomy.petTypes
          : mockClinicData.taxonomy.petTypes,
      },
      contact: {
        address: {
          ...mockClinicData.contact.address,
          ...clinicCtx.contact.address,
          // Only override individual fields when context has values
          street:      clinicCtx.contact.address.street  || mockClinicData.contact.address.street,
          city:        clinicCtx.contact.address.city    || mockClinicData.contact.address.city,
          state:       clinicCtx.contact.address.state   || mockClinicData.contact.address.state,
          zip:         clinicCtx.contact.address.zip     || mockClinicData.contact.address.zip,
          country:     clinicCtx.contact.address.country || mockClinicData.contact.address.country,
          mapEmbedUrl: clinicCtx.contact.address.mapEmbedUrl || mockClinicData.contact.address.mapEmbedUrl,
        },
        phone:          clinicCtx.contact.phone          || mockClinicData.contact.phone,
        emergencyPhone: clinicCtx.contact.emergencyPhone || mockClinicData.contact.emergencyPhone,
        email:          clinicCtx.contact.email          || mockClinicData.contact.email,
        website:        clinicCtx.contact.website        || mockClinicData.contact.website,
        businessHours:  effectiveBusinessHours,
      },
      veterinarians: effectiveVets,
      services:      effectiveServices,
      // Replace the static nav block with a live one built from context
      blocks: [
        effectiveNavBlock,
        ...mockClinicData.blocks.filter(b => b.type !== "navigation"),
      ],
    }),
    [clinicCtx, primaryColor, secondaryColor, effectiveVets, effectiveServices, effectiveBusinessHours, effectiveNavBlock]
  );

  // ── AI handler ────────────────────────────────────────────────────────────────

  const handleGenerate = useCallback((_prompt: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      setHeroState(prev => ({
        ...prev,
        headline:    "Keep Your Pet's Smile Bright",
        subheadline: "This Dental Health Month, Dr. Smith and our board-certified team are offering complimentary oral exams and discounted dental cleanings for cats and dogs.",
        badgeText:   "🦷 Dental Health Month Special",
      }));
      setOpenBlock("hero");
      setIsGenerating(false);
    }, 3000);
  }, []);

  // ── Updaters ──────────────────────────────────────────────────────────────────

  const updateHero         = useCallback((u: Partial<HeroEditorState>)         => setHeroState(p         => ({ ...p, ...u })), []);
  const updateServices     = useCallback((u: Partial<ServicesEditorState>)     => setServicesState(p     => ({ ...p, ...u })), []);
  const updateTeams        = useCallback((u: Partial<TeamsEditorState>)        => setTeamsState(p        => ({ ...p, ...u })), []);
  const updateLocations    = useCallback((u: Partial<LocationsEditorState>)    => setLocationsState(p    => ({ ...p, ...u })), []);
  const updateTestimonials = useCallback((u: Partial<TestimonialsEditorState>) => setTestimonialsState(p => ({ ...p, ...u })), []);
  const updateJoinTeam     = useCallback((u: Partial<JoinTeamEditorState>)     => setJoinTeamState(p     => ({ ...p, ...u })), []);
  const updateFaq          = useCallback((u: Partial<FAQEditorState>)          => setFaqState(p          => ({ ...p, ...u })), []);
  const updateNewsletter   = useCallback((u: Partial<NewsletterEditorState>)   => setNewsletterState(p   => ({ ...p, ...u })), []);
  const updateSeo = useCallback((u: Partial<SEOState>) => {
    setSeoState(p => ({ ...p, ...u }));
    updateSEO(u); // persist to context → localStorage
  }, [updateSEO]);

  // ── Dynamic section handlers ───────────────────────────────────────────────────

  /** Called when user drops a template onto the preview between sections. */
  const handleTemplateDrop = useCallback((type: AddableSectionType, afterIndex: number) => {
    const n = instanceCounters.current[type] ?? 0;
    instanceCounters.current[type] = n + 1;
    const instanceId = `${type}-${n}`;
    setDynamicSections(prev => ({ ...prev, [instanceId]: createDefaultSection(type) }));
    setSectionOrder(prev => {
      const next = [...prev];
      next.splice(afterIndex + 1, 0, instanceId);
      return next;
    });
    setSectionVisibility(prev => ({ ...prev, [instanceId]: true }));
    setOpenBlock(instanceId);
  }, []);

  /** Updates the state of a dynamic section. */
  const updateDynamicSection = useCallback((instanceId: string, ds: DynamicSectionState) => {
    setDynamicSections(prev => ({ ...prev, [instanceId]: ds }));
  }, []);

  /** Removes a dynamic section from order, visibility, and registry. */
  const handleRemoveDynamicSection = useCallback((instanceId: string) => {
    setSectionOrder(prev => prev.filter(id => id !== instanceId));
    setSectionVisibility(prev => {
      const next = { ...prev };
      delete next[instanceId];
      return next;
    });
    setDynamicSections(prev => {
      const next = { ...prev };
      delete next[instanceId];
      return next;
    });
    setOpenBlock(prev => (prev === instanceId ? null : prev));
  }, []);

  // ── Phase 3: bulk content fill ────────────────────────────────────────────────

  /** Applies a full AllSectionContent snapshot to every section state at once. */
  const handleFillAll = useCallback((content: AllSectionContent) => {
    setHeroState(p => ({
      ...p,
      headline:     content.hero.headline,
      subheadline:  content.hero.subheadline,
      badgeText:    content.hero.badgeText,
      primaryCta:   { ...p.primaryCta,   label: content.hero.primaryCtaLabel },
      secondaryCta: { ...p.secondaryCta, label: content.hero.secondaryCtaLabel },
    }));
    setServicesState(p => ({
      ...p,
      sectionTitle:    content.services.sectionTitle,
      sectionSubtitle: content.services.sectionSubtitle,
    }));
    setTeamsState(p => ({
      ...p,
      sectionTitle:    content.teams.sectionTitle,
      sectionSubtitle: content.teams.sectionSubtitle,
    }));
    setTestimonialsState(p => ({
      ...p,
      sectionTitle: content.testimonials.sectionTitle,
      subtitle:     content.testimonials.subtitle,
    }));
    setJoinTeamState(p => ({
      ...p,
      heading:     content.joinTeam.heading,
      description: content.joinTeam.description,
      ctaLabel:    content.joinTeam.ctaLabel,
    }));
    setFaqState(p => ({
      ...p,
      sectionTitle: content.faq.sectionTitle,
      subtitle:     content.faq.subtitle,
    }));
    setNewsletterState(p => ({
      ...p,
      promptText: content.newsletter.promptText,
      ctaLabel:   content.newsletter.ctaLabel,
    }));
    setOpenBlock("hero");
  }, []);

  /** Rewrites all sections to match the chosen tone preset. */
  const handleTonePreset = useCallback((tone: TonePreset) => {
    setActiveTone(tone);
    setIsToneLoading(true);
    runToneRewrite(tone, effectiveClinic.general.name)
      .then(content => { handleFillAll(content); setIsToneLoading(false); })
      .catch(() => setIsToneLoading(false));
  }, [effectiveClinic.general.name, handleFillAll]);

  /** Routes a consistency-check fix to the correct section setter. */
  const handleApplyFix = useCallback((fieldKey: string, value: string) => {
    switch (fieldKey) {
      case "headline":              updateHero({ headline: value });              break;
      case "subheadline":           updateHero({ subheadline: value });           break;
      case "badgeText":             updateHero({ badgeText: value });             break;
      case "services.title":        updateServices({ sectionTitle: value });      break;
      case "services.subtitle":     updateServices({ sectionSubtitle: value });   break;
      case "teams.title":           updateTeams({ sectionTitle: value });         break;
      case "teams.subtitle":        updateTeams({ sectionSubtitle: value });      break;
      case "testimonials.title":    updateTestimonials({ sectionTitle: value });  break;
      case "testimonials.subtitle": updateTestimonials({ subtitle: value });      break;
      case "jointeam.heading":      updateJoinTeam({ heading: value });           break;
      case "jointeam.description":  updateJoinTeam({ description: value });       break;
      case "jointeam.ctaLabel":     updateJoinTeam({ ctaLabel: value });          break;
      case "faq.title":             updateFaq({ sectionTitle: value });           break;
      case "faq.subtitle":          updateFaq({ subtitle: value });               break;
      case "newsletter.promptText": updateNewsletter({ promptText: value });      break;
      case "newsletter.ctaLabel":   updateNewsletter({ ctaLabel: value });        break;
    }
  }, [updateHero, updateServices, updateTeams, updateTestimonials, updateJoinTeam, updateFaq, updateNewsletter]);

  // ── Campaign Builder apply handler ────────────────────────────────────────────

  const handleApplyCampaign = useCallback((plan: CampaignPlan) => {
    for (const diff of plan.diffs) {
      switch (diff.kind) {

        case "update_hero": {
          const p = diff.payload;
          setHeroState(prev => ({
            ...prev,
            ...(p.headline    !== undefined ? { headline:    p.headline }    : {}),
            ...(p.subheadline !== undefined ? { subheadline: p.subheadline } : {}),
            ...(p.badgeText   !== undefined ? { badgeText:   p.badgeText }   : {}),
          }));
          break;
        }

        case "add_section": {
          const p = diff.payload;
          const type = p.sectionType as AddableSectionType;
          const n = instanceCounters.current[type] ?? 0;
          instanceCounters.current[type] = n + 1;
          const instanceId = `${type}-${n}`;

          setDynamicSections(prev => ({ ...prev, [instanceId]: p.initialState }));
          setSectionOrder(prev => {
            const next    = [...prev];
            const afterIdx = next.indexOf(p.afterId);
            const insertAt = afterIdx >= 0 ? afterIdx + 1 : next.length;
            next.splice(insertAt, 0, instanceId);
            return next;
          });
          setSectionVisibility(prev => ({ ...prev, [instanceId]: true }));
          break;
        }

        case "reorder_sections": {
          setSectionOrder(diff.payload.desiredOrder);
          break;
        }

        case "set_visibility": {
          setSectionVisibility(prev => ({ ...prev, [diff.payload.id]: diff.payload.visible }));
          break;
        }
      }
    }

    // Navigate editor to hero to show the updated headline
    setOpenBlock("hero");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render ────────────────────────────────────────────────────────────────────

  const aiContextValue = useMemo(() => ({
    clinicContext: {
      name:     effectiveClinic.general.name,
      type:     "specialty and emergency veterinary hospital",
      location: effectiveClinic.contact?.address?.city
                  ? `${effectiveClinic.contact.address.city}, ${effectiveClinic.contact.address.state ?? ""}`
                  : "your city",
    },
    activeSectionId:    openBlock,
    activeSectionLabel: openBlock ? (SECTION_LABELS[openBlock] ?? openBlock) : "Whole Page",
    pendingFocusKey,
    requestFieldFocus,
  }), [effectiveClinic, openBlock, pendingFocusKey, requestFieldFocus]);

  return (
    <AIEditorContext.Provider value={aiContextValue}>
    {/* Full-bleed canvas — panels float; spacers reserve their footprint so the preview never renders under them */}
    <div className="relative h-full overflow-hidden bg-gray-100 flex items-stretch">

      {/* ── Left spacer: matches the floating left panel's footprint (margin 12px + panel width) ── */}
      {/* Transitions with the collapse animation so the preview reflows cleanly */}
      <div
        className="shrink-0 transition-all duration-200"
        style={{ width: leftCollapsed ? 48 : 272 }}
        aria-hidden="true"
      />

      {/* ── Live preview fills the visible gap between the two panels ── */}
      <LivePreviewPane
        viewport={viewport}
        onViewportChange={setViewport}
        heroState={heroState}
        servicesState={servicesState}
        teamsState={teamsState}
        locationsState={locationsState}
        testimonialsState={testimonialsState}
        joinTeamState={joinTeamState}
        faqState={faqState}
        newsletterState={newsletterState}
        clinic={effectiveClinic}
        activeBlock={openBlock}
        onBlockClick={setOpenBlock}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        selectedPage={selectedPage}
        theme={theme}
        onThemeChange={setTheme}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        onPrimaryColorChange={(c) => { setPrimaryColor(c);   updateGeneral({ primaryColor: c });   }}
        onSecondaryColorChange={(c) => { setSecondaryColor(c); updateGeneral({ secondaryColor: c }); }}
        sectionOrder={sectionOrder}
        sectionVisibility={sectionVisibility}
        onFieldClick={handlePreviewFieldClick}
        onOpenWizard={() => setWizardOpen(true)}
        onCheckConsistency={() => setConsistencyOpen(true)}
        onTonePreset={handleTonePreset}
        isToneLoading={isToneLoading}
        activeTone={activeTone}
        dynamicSections={dynamicSections}
        draggingTemplateType={draggingTemplateType}
        onTemplateDrop={handleTemplateDrop}
        onApplyCampaign={handleApplyCampaign}
        activeMode={activeMode}
      />

      {/* ── Right spacer: matches the floating right panel's footprint (margin 12px + 300px panel) ── */}
      <div className="w-[312px] shrink-0" aria-hidden="true" />

      {/* ── Floating left panel ── */}
      <div
        className="absolute left-3 top-3 bottom-3 z-30 rounded-2xl overflow-hidden flex"
        style={{
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.11), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <LeftPanel
          selectedPage={selectedPage}
          onPageSelect={setSelectedPage}
          isCollapsed={leftCollapsed}
          onCollapsedChange={setLeftCollapsed}
          onTemplateDragStart={setDraggingTemplateType}
          onTemplateDragEnd={() => setDraggingTemplateType(null)}
          onAddSection={(type) => handleTemplateDrop(type, sectionOrder.length - 1)}
        />
      </div>

      {/* ── Floating right panel ── */}
      <div
        className="absolute right-3 top-3 bottom-3 z-30 rounded-2xl overflow-hidden flex"
        style={{
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.11), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <RightPanel
          activeSection={openBlock}
          onSectionChange={setOpenBlock}
          heroState={heroState}           onHeroChange={updateHero}
          servicesState={servicesState}   onServicesChange={updateServices}
          teamsState={teamsState}         onTeamsChange={updateTeams}
          locationsState={locationsState} onLocationsChange={updateLocations}
          testimonialsState={testimonialsState} onTestimonialsChange={updateTestimonials}
          joinTeamState={joinTeamState}   onJoinTeamChange={updateJoinTeam}
          faqState={faqState}             onFaqChange={updateFaq}
          newsletterState={newsletterState} onNewsletterChange={updateNewsletter}
          seoState={seoState}             onSeoChange={updateSeo}
          clinic={effectiveClinic}
          onNavigateToSetup={onNavigateToSetup}
          primaryColor={primaryColor}
          sectionOrder={sectionOrder}
          onSectionOrderChange={setSectionOrder}
          sectionVisibility={sectionVisibility}
          onSectionVisibilityChange={setSectionVisibility}
          dynamicSections={dynamicSections}
          onUpdateDynamic={updateDynamicSection}
          onRemoveDynamic={handleRemoveDynamicSection}
          onOpenSmartModes={() => setSmartModesOpen(true)}
        />
      </div>

    </div>

    {/* ── Phase 3 overlays ── */}
    {wizardOpen && (
      <FillFromScratchWizard
        onComplete={handleFillAll}
        onClose={() => setWizardOpen(false)}
      />
    )}
    {consistencyOpen && (
      <ConsistencyPanel
        onApplyFix={handleApplyFix}
        onClose={() => setConsistencyOpen(false)}
      />
    )}

    {/* ── Generative Site Builder overlays ── */}
    {smartModesOpen && (
      <SmartModesPanel
        smartModesState={smartModesState}
        onUpdate={(patch) => setSmartModesState(s => ({ ...s, ...patch }))}
        onClose={() => setSmartModesOpen(false)}
      />
    )}

    </AIEditorContext.Provider>
  );
}
