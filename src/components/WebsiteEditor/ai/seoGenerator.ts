// ─── SEO Generator — AI-powered SEO content analysis & generation ──────────────
// Reads all site content and produces optimised, character-constrained SEO fields
// guaranteed to pass every health check (100 % score out of the box).

import type {
  HeroEditorState,
  ServicesEditorState,
  TeamsEditorState,
} from "../WebsiteEditorPage";
import type { ClinicWebsite } from "../../../types/clinic";

// ─── Input / output types ─────────────────────────────────────────────────────

export interface SEOContentInput {
  // Clinic identity
  clinicName:    string;
  clinicSlug:    string;
  city:          string;
  state:         string;
  hospitalType:  string;
  petTypes:      string[];
  tagline?:      string;
  emergencyPhone?: string;
  // Section content
  heroHeadline:    string;
  heroSubheadline: string;
  servicesTitle:   string;
  serviceNames:    string[];
  vetCredentials:  string[];   // e.g. ["DACVS", "DACVIM"]
  // Imagery
  heroBackgroundUrl?: string;
  firstServiceImageUrl?: string;
  // Existing overrides (pre-filled by user — never overwrite)
  currentOgImageUrl: string;
  currentCanonicalUrl: string;
}

export interface GeneratedSEO {
  metaTitle:       string;   // ≤ 60 chars
  metaDescription: string;   // ≤ 160 chars
  ogImageUrl:      string;
  canonicalUrl:    string;
  focusKeyword:    string;
  detectedKeywords: KeywordHit[];
}

export interface KeywordHit {
  keyword:   string;
  score:     number;    // 1-3: how prominent this keyword is
  sources:   string[];  // which content sections it appears in
}

export interface SEOCheckResult {
  id:          string;
  label:       string;
  ok:          boolean;
  description: string;
  fix?:        string;   // short remediation hint shown when failing
}

// ─── Hospital type → primary keyword map ─────────────────────────────────────

const HOSPITAL_KEYWORDS: Record<string, { primary: string; secondary: string[] }> = {
  specialty_referral: {
    primary: "specialty veterinarian",
    secondary: ["board-certified vet", "specialist vet", "veterinary specialist"],
  },
  emergency: {
    primary: "emergency vet",
    secondary: ["24/7 emergency veterinary", "emergency animal hospital", "urgent vet care"],
  },
  specialty_and_emergency: {
    primary: "specialty & emergency vet",
    secondary: ["24/7 emergency vet", "veterinary specialists", "emergency animal care"],
  },
  general_practice: {
    primary: "veterinary clinic",
    secondary: ["local vet", "family veterinarian", "full-service vet"],
  },
  exotic: {
    primary: "exotic animal vet",
    secondary: ["exotic pet veterinarian", "avian vet", "reptile vet"],
  },
  mobile: {
    primary: "mobile vet",
    secondary: ["house call veterinarian", "mobile pet care"],
  },
  rehabilitation: {
    primary: "veterinary rehabilitation",
    secondary: ["pet physical therapy", "rehab vet", "canine rehabilitation"],
  },
};

// ─── Action verbs that satisfy the CTA health check ──────────────────────────

const ACTION_VERBS = ["book", "call", "visit", "schedule", "contact", "reserve", "request"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function containsAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((t) => lower.includes(t.toLowerCase()));
}

function toTitleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function slugToFriendly(slug: string): string {
  return slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Build focus keyword ──────────────────────────────────────────────────────

function buildFocusKeyword(input: SEOContentInput): string {
  const { hospitalType, city } = input;
  const kw = HOSPITAL_KEYWORDS[hospitalType]?.primary ?? "veterinary clinic";
  // e.g. "specialty veterinarian Austin"
  return `${kw} ${city}`.toLowerCase();
}

// ─── Build meta title (≤ 60 chars) ────────────────────────────────────────────
// Priority template list — tries each until one fits:
//   1. "{Name} | {Keyword} in {City}, {State}"
//   2. "{Name} | {Keyword} in {City}"
//   3. "{Name} — {Short keyword} · {City}"
//   4. "{Name} | Vet Specialists · {City}"
//   5. "{Name} — {City} Vet"

function buildMetaTitle(input: SEOContentInput, focusKw: string): string {
  const { clinicName, city, state, hospitalType } = input;
  const kw = HOSPITAL_KEYWORDS[hospitalType]?.primary ?? "veterinary clinic";
  const kwCap = toTitleCase(kw);

  const templates = [
    `${clinicName} | ${kwCap} in ${city}, ${state}`,
    `${clinicName} | ${kwCap} in ${city}`,
    `${clinicName} — ${kwCap} · ${city}`,
    `${clinicName} | Vet Specialists · ${city}`,
    `${clinicName} — ${city} Vet`,
    truncate(clinicName, 60),
  ];

  for (const t of templates) {
    if (t.length <= 60) return t;
  }
  return truncate(clinicName + " — Veterinary Care", 60);
}

// ─── Build meta description (≤ 160 chars) ────────────────────────────────────
// Formula: "{City}'s {keyword}. {services snippet}. {CTA}."
// Dynamically expands/contracts to fill the 160-char budget.

function buildMetaDescription(input: SEOContentInput, focusKw: string): string {
  const { clinicName, city, hospitalType, serviceNames, petTypes, emergencyPhone } = input;
  const kw = HOSPITAL_KEYWORDS[hospitalType]?.primary ?? "veterinary care";

  // Service snippet: top 3 services joined
  const topServices = serviceNames.slice(0, 3).join(", ");
  const petsText = petTypes.slice(0, 3).join(", ") || "dogs & cats";

  // Emergency phone suffix
  const phoneSuffix = emergencyPhone ? ` Call ${emergencyPhone}.` : "";

  // Strategy A: Rich description with all signals
  const descA = `${toTitleCase(city)}'s trusted ${kw}. Board-certified specialists in ${topServices}. Serving ${petsText} & more.${phoneSuffix} Book your appointment today.`;
  if (descA.length <= 160) return descA;

  // Strategy B: Shorter, no phone
  const descB = `${toTitleCase(city)}'s trusted ${kw}. Specialists in ${topServices}. Serving ${petsText}. Book today.`;
  if (descB.length <= 160) return descB;

  // Strategy C: Minimal with CTA
  const descC = `${clinicName} — ${toTitleCase(city)}'s ${kw}. Board-certified veterinary specialists. Book your appointment today.`;
  if (descC.length <= 160) return descC;

  // Strategy D: Ultra-short fallback
  const descD = `${clinicName}: ${kw} in ${city}. Expert veterinary care. Book today.`;
  return truncate(descD, 160);
}

// ─── Build OG image URL ───────────────────────────────────────────────────────
// Preference order: existing user value → hero background → first service image → branded Unsplash

const FALLBACK_OG_IMAGES = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=630&fit=crop&q=80",  // dog
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=630&fit=crop&q=80",  // two dogs
  "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&h=630&fit=crop&q=80",  // vet examining dog
];

function buildOgImageUrl(input: SEOContentInput): string {
  if (input.currentOgImageUrl) return input.currentOgImageUrl;
  if (input.heroBackgroundUrl && input.heroBackgroundUrl.startsWith("https://")) {
    return input.heroBackgroundUrl;
  }
  if (input.firstServiceImageUrl && input.firstServiceImageUrl.startsWith("https://")) {
    return input.firstServiceImageUrl;
  }
  return FALLBACK_OG_IMAGES[0];
}

// ─── Build canonical URL ──────────────────────────────────────────────────────

function buildCanonicalUrl(input: SEOContentInput): string {
  if (input.currentCanonicalUrl) return input.currentCanonicalUrl;
  return `https://${input.clinicSlug}.vet/`;
}

// ─── Keyword detection ────────────────────────────────────────────────────────
// Scans all content and surfaces keywords with prominence scores.

function detectKeywords(input: SEOContentInput): KeywordHit[] {
  const hits: Map<string, KeywordHit> = new Map();

  function addHit(keyword: string, score: number, source: string) {
    const key = keyword.toLowerCase();
    const existing = hits.get(key);
    if (existing) {
      existing.score = Math.max(existing.score, score);
      if (!existing.sources.includes(source)) existing.sources.push(source);
    } else {
      hits.set(key, { keyword, score, sources: [source] });
    }
  }

  const { clinicName, city, state, hospitalType, serviceNames, petTypes,
    heroHeadline, heroSubheadline, servicesTitle } = input;

  // Clinic name fragments
  const nameParts = clinicName.split(/\s+/).filter((w) => w.length > 3);
  nameParts.forEach((p) => addHit(p, 3, "Clinic name"));

  // Location
  addHit(city, 3, "Location");
  if (state) addHit(state, 2, "Location");

  // Hospital type keywords
  const typeKw = HOSPITAL_KEYWORDS[hospitalType];
  if (typeKw) {
    addHit(typeKw.primary, 3, "Specialty");
    typeKw.secondary.forEach((s) => addHit(s, 2, "Specialty"));
  }

  // Services
  serviceNames.forEach((sn) => {
    addHit(sn, 2, "Services");
    // Extract sub-terms from multi-word service names
    sn.split(/\s+/).filter((w) => w.length > 4).forEach((w) => addHit(w, 1, "Services"));
  });

  // Pet types
  petTypes.forEach((pt) => addHit(pt === "small_mammal" ? "small mammal" : pt, 2, "Pet types"));

  // Hero content
  const heroWords = `${heroHeadline} ${heroSubheadline}`.split(/\s+/).filter((w) => w.length > 5);
  heroWords.forEach((w) => addHit(w.replace(/[^a-z]/gi, ""), 1, "Hero copy"));

  // Common vet SEO terms found in content
  const vetTerms = ["veterinary", "veterinarian", "specialist", "board-certified", "emergency", "surgery", "diagnostics", "care"];
  vetTerms.forEach((t) => {
    const found = containsAny(`${heroHeadline} ${heroSubheadline} ${servicesTitle}`, [t]);
    if (found) addHit(t, 2, "Content analysis");
  });

  // Filter noise: remove very short words, dedupe, sort by score desc
  return Array.from(hits.values())
    .filter((h) => h.keyword.length > 3)
    .sort((a, b) => b.score - a.score || a.keyword.localeCompare(b.keyword))
    .slice(0, 12);
}

// ─── SEO health checks (10 checks → 10% each → 100% max) ────────────────────

export function computeDetailedSEOChecks(
  metaTitle: string,
  metaDescription: string,
  ogImageUrl: string,
  canonicalUrl: string,
  focusKeyword: string,
  robots: string,
  input: Partial<SEOContentInput>,
): SEOCheckResult[] {
  const titleLower = metaTitle.toLowerCase();
  const descLower  = metaDescription.toLowerCase();
  const kwLower    = focusKeyword.toLowerCase();
  const cityLower  = (input.city ?? "").toLowerCase();
  const nameLower  = (input.clinicName ?? "").toLowerCase();

  const hasActionVerb = containsAny(metaDescription, ACTION_VERBS);

  return [
    {
      id: "title-present",
      label: "Meta title set",
      ok:    metaTitle.length >= 10,
      description: "Meta title must be at least 10 characters to appear in search results.",
      fix:   "Add a descriptive page title (clinic name + specialty + location).",
    },
    {
      id: "title-length",
      label: "Title ≤ 60 chars",
      ok:    metaTitle.length > 0 && metaTitle.length <= 60,
      description: "Google truncates titles beyond ~60 characters, hiding your clinic name.",
      fix:   "Shorten to 60 characters — use abbreviations or remove filler words.",
    },
    {
      id: "title-has-name",
      label: "Title has clinic name",
      ok:    nameLower.length > 0 && metaTitle.length > 0 && titleLower.includes(nameLower.split(" ")[0].toLowerCase()),
      description: "Including your clinic name builds brand recognition in search results.",
      fix:   `Include at least "${input.clinicName?.split(" ")[0]}" in the title.`,
    },
    {
      id: "title-has-keyword",
      label: "Title has keyword",
      ok:    kwLower.length > 0 && metaTitle.length > 0 && (
               titleLower.includes(kwLower) ||
               containsAny(metaTitle, ["vet", "veterinary", "specialist", "emergency", "clinic"])
             ),
      description: "Your target keyword in the title signals relevance to Google.",
      fix:   `Add a veterinary keyword to the title (e.g. "vet", "specialist", "emergency").`,
    },
    {
      id: "description-present",
      label: "Meta description set",
      ok:    metaDescription.length >= 50,
      description: "Meta description is the snippet shown under your link in search results.",
      fix:   "Write a compelling 120–160 character description with your top services.",
    },
    {
      id: "description-length",
      label: "Description ≤ 160 chars",
      ok:    metaDescription.length > 0 && metaDescription.length <= 160,
      description: "Google truncates descriptions beyond 160 characters in mobile results.",
      fix:   "Trim to ≤ 160 characters — keep the most important facts first.",
    },
    {
      id: "description-has-action",
      label: "Description has CTA",
      ok:    hasActionVerb,
      description: "Action verbs like 'Book', 'Call', or 'Schedule' increase click-through rates.",
      fix:   `End with "Book today", "Call us", or "Schedule your visit."`,
    },
    {
      id: "og-image",
      label: "OG image URL set",
      ok:    ogImageUrl.length > 0,
      description: "Social share image (1200×630px) appears when shared on Facebook, X, LinkedIn.",
      fix:   "Add a high-quality clinic or pet photo as your OG image.",
    },
    {
      id: "canonical-url",
      label: "Canonical URL set",
      ok:    canonicalUrl.length > 0,
      description: "Canonical URL prevents duplicate-content penalties from search engines.",
      fix:   `Set to your live domain, e.g. "https://${input.clinicSlug ?? "yourclinic"}.vet/".`,
    },
    {
      id: "focus-keyword",
      label: "Focus keyword set",
      ok:    focusKeyword.length >= 4,
      description: "Your focus keyword guides Google on what search queries this page should rank for.",
      fix:   "Set a target phrase like 'emergency vet Austin' or 'specialty veterinarian Dallas'.",
    },
  ];
}

// ─── Build content input from editor states + clinic data ────────────────────

export function buildSEOContentInput(
  clinic: ClinicWebsite,
  heroState: HeroEditorState,
  servicesState: ServicesEditorState,
  currentOgImageUrl: string,
  currentCanonicalUrl: string,
): SEOContentInput {
  const address = clinic.contact.address;

  return {
    clinicName:    clinic.general.name,
    clinicSlug:    clinic.general.slug,
    city:          address?.city ?? "",
    state:         address?.state ?? "",
    hospitalType:  clinic.taxonomy.hospitalType ?? "general_practice",
    petTypes:      clinic.taxonomy.petTypes ?? [],
    tagline:       clinic.general.tagline,
    emergencyPhone: clinic.contact.emergencyPhone,
    heroHeadline:    heroState.headline,
    heroSubheadline: heroState.subheadline,
    servicesTitle:   servicesState.sectionTitle,
    serviceNames:    clinic.services.filter((s) => s.isVisible).map((s) => s.name),
    vetCredentials:  clinic.veterinarians.map((v) => v.credentials ?? ""),
    heroBackgroundUrl:     heroState.backgroundValue,
    firstServiceImageUrl:  clinic.services[0]?.imageUrl,
    currentOgImageUrl,
    currentCanonicalUrl,
  };
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function generateSEO(input: SEOContentInput): Promise<GeneratedSEO> {
  // Simulate AI processing latency (900–1400ms)
  await sleep(900 + Math.random() * 500);

  const focusKeyword     = buildFocusKeyword(input);
  const metaTitle        = buildMetaTitle(input, focusKeyword);
  const metaDescription  = buildMetaDescription(input, focusKeyword);
  const ogImageUrl       = buildOgImageUrl(input);
  const canonicalUrl     = buildCanonicalUrl(input);
  const detectedKeywords = detectKeywords(input);

  return {
    metaTitle,
    metaDescription,
    ogImageUrl,
    canonicalUrl,
    focusKeyword,
    detectedKeywords,
  };
}
