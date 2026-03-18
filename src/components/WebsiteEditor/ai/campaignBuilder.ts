// ─── Campaign Builder — Mock AI Parser & Page Assembler ───────────────────────
// Parses a natural-language prompt, matches relational vet/service data via
// fuzzy token scoring, and builds a typed diff that WebsiteEditorPage applies.
// Also handles "build a section" mode for natural-language section creation.

import type { ClinicWebsite } from "../../../types/clinic";
import type { TeamSpotlightState } from "../sections/TeamSpotlightSection";
import type { CtaBandState } from "../sections/CtaBandSection";
import type { AddableSectionType, DynamicSectionState } from "../sections";
import { createDefaultContactSplit } from "../sections/ContactSplitSection";
import { createDefaultEmailCapture } from "../sections/EmailCaptureSection";
import { createDefaultSplitContent } from "../sections/SplitContentSection";
import { createDefaultFeatureGrid }  from "../sections/FeatureGridSection";

// ─── Timing ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Build mode detection ─────────────────────────────────────────────────────
// "campaign" → multi-section page assembly
// "section"  → single new section from description

export type BuildMode = "campaign" | "section";

const SECTION_BUILD_VERBS = ["create", "add", "build", "make", "generate", "insert", "put"];
const SECTION_SIGNAL_WORDS = [
  "section", "block", "widget", "component", "area",
  "email", "subscribe", "newsletter", "signup", "sign-up",
  "split", "left", "right", "two column", "image right", "image left",
  "feature", "benefit", "grid", "cards",
];

const CAMPAIGN_SIGNAL_WORDS = [
  "campaign", "landing page", "promotion", "promo", "event",
  "awareness", "month", "seasonal", "new client", "emergency coverage",
  "dental health", "featuring", "showcase",
];

export function detectBuildMode(prompt: string): BuildMode {
  const lower = prompt.toLowerCase();

  const hasVerb = SECTION_BUILD_VERBS.some(v => lower.includes(v));
  const sectionScore = SECTION_SIGNAL_WORDS.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);
  const campaignScore = CAMPAIGN_SIGNAL_WORDS.reduce((n, w) => n + (lower.includes(w) ? 1 : 0), 0);

  // Strong campaign signals win
  if (campaignScore >= 2) return "campaign";

  // Has a section verb + at least one section signal → section mode
  if (hasVerb && sectionScore >= 1) return "section";

  // Explicit section signal words without campaign context
  if (sectionScore >= 2) return "section";

  // Default: campaign (can generate useful page edits from any prompt)
  return "campaign";
}

// ─── Section type detection ────────────────────────────────────────────────────

interface SectionTypeSignal {
  type: AddableSectionType;
  keywords: string[];
  weight: number;
}

const SECTION_TYPE_SIGNALS: SectionTypeSignal[] = [
  // Email capture — highest priority for subscribe/email signals
  { type: "emailcapture",  keywords: ["email", "subscribe", "newsletter", "signup", "sign up", "sign-up", "gmail", "mail", "inbox", "mailing list", "notification", "notify", "updates"], weight: 2 },
  // Split content — left/right layout, rich text + image
  { type: "splitcontent",  keywords: ["split", "left", "right", "two column", "2 column", "image right", "image left", "headline body", "text image", "body left", "text left", "about"], weight: 2 },
  // Feature grid — benefits, features, why choose us
  { type: "featuregrid",   keywords: ["feature", "benefit", "why choose", "why us", "advantage", "icon grid", "cards", "highlight", "grid", "what we offer", "bullet grid", "reasons"], weight: 2 },
  // Team spotlight — doctor / vet / team member
  { type: "teamspotlight", keywords: ["doctor", "vet", "veterinarian", "team member", "specialist", "spotlight", "meet", "our doctor", "our vet", "staff member"], weight: 1.5 },
  // CTA band — call to action, book, promo bar
  { type: "ctaband",       keywords: ["cta", "call to action", "book now", "get started", "promo bar", "banner", "action bar"], weight: 1.5 },
  // Contact split — contact, hours, location
  { type: "contactsplit",  keywords: ["contact", "location", "hours", "address", "phone", "reach us", "find us", "get in touch"], weight: 1.5 },
  // Stats
  { type: "stats",         keywords: ["stats", "statistics", "numbers", "count", "how many", "metric", "record", "milestone"], weight: 1 },
  // Gallery
  { type: "gallery",       keywords: ["gallery", "photos", "images", "pictures", "portfolio", "showcase photos"], weight: 1 },
  // Hero
  { type: "herocentered",  keywords: ["hero", "banner", "header section", "top banner", "above the fold"], weight: 1 },
];

export function detectSectionType(prompt: string): AddableSectionType {
  const lower = prompt.toLowerCase();

  let bestType: AddableSectionType = "splitcontent";
  let bestScore = 0;

  for (const signal of SECTION_TYPE_SIGNALS) {
    const score = signal.keywords.reduce(
      (n, kw) => n + (lower.includes(kw) ? signal.weight : 0),
      0,
    );
    if (score > bestScore) {
      bestScore = score;
      bestType = signal.type;
    }
  }

  return bestType;
}

// ─── Insertion point resolution ───────────────────────────────────────────────
// Parses "above/before X", "after/below X", "at the top/bottom" from prompt.
// Returns the `afterId` to insert after (same semantics as AddSectionPayload.afterId).

const SECTION_LABEL_MAP: Record<string, string> = {
  hero: "hero", header: "hero",
  footer: "footer",
  services: "services", "our services": "services",
  team: "teams", teams: "teams",
  testimonials: "testimonials",
  faq: "faq",
  contact: "contactsplit",
  newsletter: "newsletter",
};

function resolveInsertionPoint(prompt: string, currentSectionOrder: string[]): string {
  const lower = prompt.toLowerCase();

  // "above/before X" → find X in order, insert after the element BEFORE X
  const aboveMatch = lower.match(/\b(?:above|before)\s+(the\s+)?([a-z\s]+?)(?:\s+section)?(?:\s|,|$)/);
  if (aboveMatch) {
    const target = aboveMatch[2].trim();
    const mappedId = SECTION_LABEL_MAP[target] ?? target;
    const idx = currentSectionOrder.findIndex(id => id === mappedId || id.startsWith(mappedId));
    if (idx > 0) return currentSectionOrder[idx - 1];
    if (idx === 0) return "__beginning__";  // special sentinel for "before first"
  }

  // "after/below X" → insert after X
  const afterMatch = lower.match(/\b(?:after|below|under|beneath)\s+(the\s+)?([a-z\s]+?)(?:\s+section)?(?:\s|,|$)/);
  if (afterMatch) {
    const target = afterMatch[2].trim();
    const mappedId = SECTION_LABEL_MAP[target] ?? target;
    const found = currentSectionOrder.find(id => id === mappedId || id.startsWith(mappedId));
    if (found) return found;
  }

  // "at the top" / "beginning" → insert right after hero
  if (/\b(?:top|beginning|start|first)\b/.test(lower)) {
    const heroId = currentSectionOrder.find(id => id === "hero");
    if (heroId) return heroId;
    return currentSectionOrder[0] ?? "hero";
  }

  // "at the bottom" / "end" / "above footer" explicit
  if (/\b(?:bottom|end|last|above footer|before footer)\b/.test(lower)) {
    const footerIdx = currentSectionOrder.findIndex(id => id === "footer");
    if (footerIdx > 0) return currentSectionOrder[footerIdx - 1];
  }

  // Default: insert before footer (above footer)
  const footerIdx = currentSectionOrder.findIndex(id => id === "footer");
  if (footerIdx > 0) return currentSectionOrder[footerIdx - 1];
  return currentSectionOrder[currentSectionOrder.length - 1] ?? "hero";
}

// ─── Section content seeding ───────────────────────────────────────────────────
// Injects clinic-specific content into a new section's default state.

function seedSectionContent(
  type: AddableSectionType,
  prompt: string,
  clinic: ClinicWebsite,
): DynamicSectionState {
  const clinicName = clinic.general?.name || "Our Clinic";
  const tagline    = clinic.general?.tagline || "";
  const lower      = prompt.toLowerCase();

  switch (type) {
    case "emailcapture": {
      const state = createDefaultEmailCapture();
      state.headline  = `Stay Connected with ${clinicName}`;
      state.subtext   = `Get pet health tips, seasonal reminders, and clinic news from ${clinicName} delivered straight to your inbox.`;
      // Detect layout preference
      if (lower.includes("side") || lower.includes("horizontal") || lower.includes("two column")) {
        state.layout = "side_by_side";
      }
      // Detect dark background preference
      if (lower.includes("dark") || lower.includes("navy") || lower.includes("teal")) {
        state.bgStyle = lower.includes("teal") ? "teal" : "navy";
      }
      // Show name field if prompt mentions it
      if (lower.includes("name") || lower.includes("first name")) {
        state.showNameField = true;
      }
      return { type: "emailcapture", state };
    }

    case "splitcontent": {
      const state = createDefaultSplitContent();
      state.headline = tagline
        ? tagline
        : `Compassionate Care at ${clinicName}`;
      state.body = `Our specialists bring decades of experience treating your most loved family members. ` +
                   `From routine wellness to complex emergencies, ${clinicName} is here for every step.`;
      state.eyebrow = "About Our Clinic";
      // Detect image position from prompt
      if (lower.includes("image left") || lower.includes("photo left") || lower.includes("picture left")) {
        state.imagePosition = "left";
      } else {
        state.imagePosition = "right";  // default: image right
      }
      // Seed bullets from services if available
      const visibleServices = (clinic.services ?? []).filter(s => s.isVisible).slice(0, 3);
      if (visibleServices.length > 0) {
        state.bullets = visibleServices.map(s => s.name);
      }
      // Background from prompt
      if (lower.includes("navy") || lower.includes("dark blue")) {
        state.bgStyle = "navy";
      } else if (lower.includes("light") || lower.includes("gray")) {
        state.bgStyle = "light";
      }
      return { type: "splitcontent", state };
    }

    case "featuregrid": {
      const state = createDefaultFeatureGrid();
      state.headline = `Why Choose ${clinicName}`;
      state.subtext  = tagline
        ? tagline
        : `Dedicated to exceptional veterinary care — here's what sets ${clinicName} apart.`;
      // Seed items from services if available
      const visibleServices = (clinic.services ?? []).filter(s => s.isVisible).slice(0, 6);
      if (visibleServices.length >= 2) {
        state.items = visibleServices.map(s => ({
          icon:        s.icon || "🐾",
          title:       s.name,
          description: s.description || `Professional ${s.name.toLowerCase()} service tailored to your pet's needs.`,
        }));
      }
      // Detect columns from prompt
      const colMatch = lower.match(/(\d)\s*(?:col|column)/);
      if (colMatch) {
        const n = parseInt(colMatch[1], 10);
        if (n === 2 || n === 3 || n === 4) state.columns = n as 2 | 3 | 4;
      }
      // Background
      if (lower.includes("navy") || lower.includes("dark")) {
        state.bgStyle = "navy";
      } else if (lower.includes("light") || lower.includes("gray")) {
        state.bgStyle = "light";
      }
      return { type: "featuregrid", state };
    }

    default:
      // For other types, fall through to createDefaultSection equivalent
      return createDefaultSection_shim(type, clinic);
  }
}

/** Minimal shim for non-marketing section types — returns a generic default. */
function createDefaultSection_shim(type: AddableSectionType, clinic: ClinicWebsite): DynamicSectionState {
  // Import dynamically to avoid circular deps — in practice these are already bundled
  // We use a type-safe runtime switch to produce the correct default state
  switch (type) {
    case "contactsplit": {
      const s = createDefaultContactSplit();
      const contact = clinic.contact;
      if (contact?.phone) s.phone = contact.phone;
      if (contact?.email) s.email = contact.email;
      return { type: "contactsplit", state: s };
    }
    default:
      // For all other types, we return a raw marker that handleApplyCampaign
      // will resolve via createDefaultSection() from the registry.
      return { type, state: {} } as unknown as DynamicSectionState;
  }
}

// ─── Build a single-section plan ──────────────────────────────────────────────

function buildSectionPlan(
  intent: ParsedCampaignIntent,
  clinic: ClinicWebsite,
  currentSectionOrder: string[],
): CampaignPlan {
  const sectionType   = detectSectionType(intent.rawPrompt);
  const afterId       = resolveInsertionPoint(intent.rawPrompt, currentSectionOrder);
  const seededState   = seedSectionContent(sectionType, intent.rawPrompt, clinic);

  const SECTION_LABELS: Partial<Record<AddableSectionType, string>> = {
    emailcapture:  "Email Capture",
    splitcontent:  "Split Content (text + image)",
    featuregrid:   "Feature Grid",
    teamspotlight: "Team Spotlight",
    ctaband:       "CTA Band",
    contactsplit:  "Contact + Form",
    stats:         "Stats",
    gallery:       "Gallery",
  };

  const label = SECTION_LABELS[sectionType] ?? sectionType;

  const positionLabel = (() => {
    if (afterId === "__beginning__") return "at the top of the page";
    if (afterId === "footer" || afterId === currentSectionOrder[currentSectionOrder.length - 1]) {
      return "before the footer";
    }
    return `after the "${afterId}" section`;
  })();

  const diff: CampaignDiffEntry = {
    kind:        "add_section",
    description: `Add "${label}" section ${positionLabel}`,
    payload: {
      sectionType,
      afterId,
      initialState: seededState,
    },
  };

  const summary = `Creating a new ${label} section ${positionLabel}${
    intent.promoText ? ` with "${intent.promoText}"` : ""
  }. Pre-filled with ${clinic.general?.name || "your clinic"}'s content — customize in the right panel after applying.`;

  return {
    intent,
    diffs:          [diff],
    previewSummary: summary,
  };
}

// ─── Campaign type detection ──────────────────────────────────────────────────

export type CampaignType = "dental" | "emergency" | "seasonal" | "new_client" | "general";

const DENTAL_KEYWORDS     = ["dental", "teeth", "tooth", "oral", "cleaning", "breath", "gum", "periodon"];
const EMERGENCY_KEYWORDS  = ["emergency", "urgent", "24/7", "critical", "crisis", "trauma", "after hours", "ER", "er ", "immediate"];
const SEASONAL_KEYWORDS   = ["spring", "summer", "fall", "autumn", "winter", "seasonal", "month", "awareness", "week"];
const NEW_CLIENT_KEYWORDS = ["new client", "new patient", "first visit", "first time", "welcome", "new puppy", "new kitten"];

function detectCampaignType(prompt: string): CampaignType {
  const lower = prompt.toLowerCase();
  const score = (kws: string[]) => kws.reduce((n, kw) => n + (lower.includes(kw) ? 1 : 0), 0);

  const scores: Record<CampaignType, number> = {
    dental:     score(DENTAL_KEYWORDS),
    emergency:  score(EMERGENCY_KEYWORDS),
    seasonal:   score(SEASONAL_KEYWORDS),
    new_client: score(NEW_CLIENT_KEYWORDS),
    general:    0,
  };

  const best = (Object.entries(scores) as [CampaignType, number][]).reduce(
    (a, b) => (b[1] > a[1] ? b : a)
  );
  return best[1] > 0 ? best[0] : "general";
}

// ─── Fuzzy vet / service matching ─────────────────────────────────────────────

function tokenScore(name: string, prompt: string): number {
  const lower = prompt.toLowerCase();
  const tokens = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  const hits = tokens.filter(t => t.length > 1 && lower.includes(t));
  return tokens.length > 0 ? hits.length / tokens.length : 0;
}

export interface MatchedVet {
  id: string;
  name: string;
  credentials: string;
  title: string;
  bio: string;
  photoUrl: string;
  specializations: string[];
  score: number;
}

export interface MatchedService {
  id: string;
  name: string;
  description: string;
  score: number;
}

const VET_MATCH_THRESHOLD     = 0.3;
const SERVICE_MATCH_THRESHOLD = 0.3;

function matchVets(prompt: string, clinic: ClinicWebsite): MatchedVet[] {
  return (clinic.veterinarians ?? [])
    .filter(v => v.isVisible)
    .map(v => ({
      id:              v.id,
      name:            v.name,
      credentials:     v.credentials ?? "",
      title:           v.title ?? "",
      bio:             v.bio ?? "",
      photoUrl:        v.photoUrl ?? "",
      specializations: v.specializations ?? [],
      score:           Math.max(tokenScore(v.name, prompt), tokenScore(v.title ?? "", prompt)),
    }))
    .filter(v => v.score >= VET_MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

function matchServices(prompt: string, clinic: ClinicWebsite): MatchedService[] {
  return (clinic.services ?? [])
    .filter(s => s.isVisible)
    .map(s => ({
      id:          s.id,
      name:        s.name,
      description: s.description ?? "",
      score:       Math.max(tokenScore(s.name, prompt), tokenScore(s.description ?? "", prompt)),
    }))
    .filter(s => s.score >= SERVICE_MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score);
}

// ─── Promo text extraction ────────────────────────────────────────────────────

function extractPromoText(prompt: string): string | null {
  const patterns = [
    /(\d+%?\s*off[^,.]*)/i,
    /(free\s+\w+(?:\s+\w+)?)/i,
    /(\$\d+(?:\.\d+)?\s*\w+)/i,
    /(\w+\s+discount[^,.]*)/i,
    /(\w+\s+special[^,.]*)/i,
  ];
  for (const re of patterns) {
    const m = prompt.match(re);
    if (m) return m[1].trim();
  }
  return null;
}

function extractLocation(prompt: string): string | null {
  const m = prompt.match(/(?:at\s+the\s+)(\w[\w\s]+)(?:\s+clinic|\s+location)/i)
         ?? prompt.match(/(?:in\s+)([\w\s]+(?:city|town|ave|street))/i);
  return m ? m[1].trim() : null;
}

// ─── Parsed intent ────────────────────────────────────────────────────────────

export interface ParsedCampaignIntent {
  buildMode:       BuildMode;
  campaignType:    CampaignType;
  matchedVets:     MatchedVet[];
  matchedServices: MatchedService[];
  promoText:       string | null;
  locationHint:    string | null;
  rawPrompt:       string;
}

function parseCampaignIntent(prompt: string, clinic: ClinicWebsite): ParsedCampaignIntent {
  return {
    buildMode:       detectBuildMode(prompt),
    campaignType:    detectCampaignType(prompt),
    matchedVets:     matchVets(prompt, clinic),
    matchedServices: matchServices(prompt, clinic),
    promoText:       extractPromoText(prompt),
    locationHint:    extractLocation(prompt),
    rawPrompt:       prompt,
  };
}

// ─── Diff entries ─────────────────────────────────────────────────────────────

export interface HeroOverridePayload {
  headline?: string;
  subheadline?: string;
  badgeText?: string;
}

export interface AddSectionPayload {
  sectionType: AddableSectionType;
  afterId: string;
  initialState: DynamicSectionState;
}

export interface ReorderPayload {
  desiredOrder: string[];
}

export type CampaignDiffEntry =
  | { kind: "update_hero";       description: string; payload: HeroOverridePayload   }
  | { kind: "add_section";       description: string; payload: AddSectionPayload      }
  | { kind: "reorder_sections";  description: string; payload: ReorderPayload         }
  | { kind: "set_visibility";    description: string; payload: { id: string; visible: boolean } };

export interface CampaignPlan {
  intent: ParsedCampaignIntent;
  diffs: CampaignDiffEntry[];
  previewSummary: string;
}

// ─── Section seed helpers ─────────────────────────────────────────────────────

export function seedTeamSpotlight(vet: MatchedVet): DynamicSectionState {
  const state: TeamSpotlightState = {
    vetName:         vet.name,
    credentials:     vet.credentials,
    title:           vet.title,
    bio:             vet.bio || `${vet.name} is a dedicated member of our veterinary team with deep expertise in their field.`,
    photoUrl:        vet.photoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
    specializations: vet.specializations.join(", ") || "",
    ctaLabel:        `Book with ${vet.name.split(" ")[0]}`,
    imagePosition:   "left",
  };
  return { type: "teamspotlight", state };
}

export function seedCtaBand(intent: ParsedCampaignIntent, clinicName: string): DynamicSectionState {
  const headlines: Record<CampaignType, string> = {
    dental:     intent.promoText ? `Dental Health Month — ${intent.promoText}` : "Dental Health Month — Book Your Cleaning Today",
    emergency:  "24/7 Emergency Care — We're Here When You Need Us Most",
    seasonal:   intent.promoText ? `Seasonal Special — ${intent.promoText}` : "Seasonal Wellness Offer — Limited Time",
    new_client: intent.promoText ? `New Client Welcome — ${intent.promoText}` : "Welcome to the Family — New Client Special",
    general:    `${clinicName} — Book Your Pet's Next Visit`,
  };

  const subtexts: Record<CampaignType, string> = {
    dental:     "Our board-certified team uses the latest techniques for safe, stress-free dental cleanings. Schedule today.",
    emergency:  "Board-certified emergency specialists on-site around the clock. Walk-ins welcome — no appointment needed.",
    seasonal:   "Take advantage of our limited-time seasonal offer. Slots are filling fast.",
    new_client: "First visit? We'll make it a great experience for you and your pet. Book now and get started.",
    general:    "Expert veterinary care from a team that genuinely cares about your pet's health.",
  };

  const state: CtaBandState = {
    headline: headlines[intent.campaignType],
    subtext:  subtexts[intent.campaignType],
    ctaLabel: intent.campaignType === "emergency" ? "Call Emergency Line" : "Book an Appointment",
    ctaHref:  "#",
    style:    intent.campaignType === "emergency" ? "navy" : "teal",
  };
  return { type: "ctaband", state };
}

// ─── Campaign plan builder ────────────────────────────────────────────────────

const HERO_OVERRIDES: Record<CampaignType, (vet: MatchedVet | undefined, promo: string | null, name: string) => HeroOverridePayload> = {
  dental: (vet, promo, name) => ({
    headline:    "Dental Health Month — Keep Your Pet's Smile Bright",
    subheadline: vet
      ? `${vet.name} and the ${name} team are offering ${promo ?? "special rates on dental cleanings"} this month. Book before slots fill up.`
      : `The specialist team at ${name} is offering ${promo ?? "dental health specials"} this month.`,
    badgeText: "🦷 Dental Health Month",
  }),
  emergency: (_vet, _promo, name) => ({
    headline:    "24/7 Emergency & Specialty Care — When Every Minute Counts",
    subheadline: `${name}'s board-certified emergency team is on-site around the clock — no appointment needed for critical cases.`,
    badgeText:   "🚨 Open 24/7 · Emergency Line Active",
  }),
  seasonal: (_vet, promo, name) => ({
    headline:    "Seasonal Wellness — Your Pet's Health This Season",
    subheadline: promo
      ? `${name} is offering ${promo}. Limited time — book now to secure your slot.`
      : `Seasonal tips and wellness care from the expert team at ${name}.`,
    badgeText:   "🌸 Seasonal Offer",
  }),
  new_client: (_vet, promo, name) => ({
    headline:    `Welcome to ${name}`,
    subheadline: promo
      ? `New clients receive ${promo}. Our friendly team is here to make your first visit exceptional.`
      : "We're so glad you found us. Our team is ready to care for your pet like family.",
    badgeText:   "🐾 New Clients Welcome",
  }),
  general: (_vet, _promo, name) => ({
    headline:    `Expert Veterinary Care at ${name}`,
    subheadline: "Our specialist team is accepting new patients. Board-certified care with same-day emergency slots available.",
    badgeText:   "",
  }),
};

function buildCampaignPlan(
  intent: ParsedCampaignIntent,
  clinic: ClinicWebsite,
  currentSectionOrder: string[],
): CampaignPlan {
  const clinicName = clinic.general.name || "Your Clinic";
  const primaryVet = intent.matchedVets[0];
  const diffs: CampaignDiffEntry[] = [];

  // 1. Hero override
  const heroPayload = HERO_OVERRIDES[intent.campaignType](primaryVet, intent.promoText, clinicName);
  diffs.push({
    kind:        "update_hero",
    description: `Update hero headline + badge for ${intent.campaignType} campaign`,
    payload:     heroPayload,
  });

  // 2. Team spotlight — only if a vet was matched
  if (primaryVet) {
    const spotlightState = seedTeamSpotlight(primaryVet);
    diffs.push({
      kind:        "add_section",
      description: `Add Team Spotlight for ${primaryVet.name}`,
      payload: {
        sectionType:  "teamspotlight",
        afterId:      "services",
        initialState: spotlightState,
      },
    });
  }

  // 3. CTA Band
  const ctaState = seedCtaBand(intent, clinicName);
  diffs.push({
    kind:        "add_section",
    description: `Add CTA Band: "${(ctaState.state as CtaBandState).headline}"`,
    payload: {
      sectionType:  "ctaband",
      afterId:      primaryVet ? "teamspotlight-new" : "services",
      initialState: ctaState,
    },
  });

  // 4. Emergency: add contactsplit near the top for emergency visibility
  if (intent.campaignType === "emergency") {
    const defaultContact = createDefaultContactSplit();
    const emergencyContactState = {
      ...defaultContact,
      heading:       "Emergency Contact — We're Available 24/7",
      subtext:       "Walk-ins always welcome for urgent cases. Call our emergency line immediately — no appointment needed.",
      phone:         clinic.contact?.phone  || defaultContact.phone,
      email:         clinic.contact?.email  || defaultContact.email,
      emergencyNote: "🚨 Emergency line active 24/7 — call before driving in.",
      accentColor:   "navy" as const,
    };
    diffs.push({
      kind:        "add_section",
      description: "Add Contact + Form section at top for emergency visibility",
      payload: {
        sectionType:  "contactsplit",
        afterId:      "hero",
        initialState: { type: "contactsplit" as const, state: emergencyContactState },
      },
    });
  }

  // Build summary
  const vetLine   = primaryVet ? ` featuring ${primaryVet.name}` : "";
  const promoLine = intent.promoText ? ` (${intent.promoText})` : "";
  const summary   = `${intent.campaignType.replace("_", " ")} campaign${vetLine}${promoLine} — ${diffs.length} change${diffs.length !== 1 ? "s" : ""} ready to apply.`;

  return { intent, diffs, previewSummary: summary };
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runCampaignBuilder(
  prompt: string,
  clinic: ClinicWebsite,
  currentSectionOrder: string[],
): Promise<CampaignPlan> {
  // Simulate realistic AI latency (shorter for section mode)
  const mode = detectBuildMode(prompt);
  await sleep(mode === "section" ? 800 + Math.random() * 700 : 1200 + Math.random() * 1300);

  const intent = parseCampaignIntent(prompt, clinic);

  // Route to appropriate plan builder based on detected mode
  if (intent.buildMode === "section") {
    return buildSectionPlan(intent, clinic, currentSectionOrder);
  }
  return buildCampaignPlan(intent, clinic, currentSectionOrder);
}
