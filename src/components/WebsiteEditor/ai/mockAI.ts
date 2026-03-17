// ─── Types ─────────────────────────────────────────────────────────────────────

export type AIActionType =
  | "enhance"
  | "rephrase"
  | "shorten"
  | "expand"
  | "fix_spelling";

export interface MockAIRequest {
  action:          AIActionType;
  value:           string;
  /** Dot-separated field key, e.g. "headline", "services.title", "cta.primary.label" */
  fieldKey:        string;
  sectionId:       string;
  clinicName:      string;
  clinicType?:     string;
  clinicLocation?: string;
}

// ─── Timing ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// ─── Field-specific transforms ────────────────────────────────────────────────
// Each entry maps fieldKey → action → (value, clinicName) => transformed string.
// When an action is handled here the generic fallback is skipped.

type FieldActionFn = (value: string, name: string) => string;

const FIELD_TRANSFORMS: Record<string, Partial<Record<AIActionType, FieldActionFn>>> = {

  // ── Hero badge ──────────────────────────────────────────────────────────────
  badgeText: {
    enhance:     (_, n) => `⚡ Open 24/7  ·  Board-Certified Specialists  ·  ${n}`,
    rephrase:    (_, n) => `🏆 ${n} — Rated Top Specialty Vet in the Region`,
    shorten:     ()     => "⭐ Open 24/7 · Specialists",
    expand:      (_, n) => `🏥 ${n}  ·  AAHA Accredited  ·  Board-Certified Specialists  ·  24/7 Emergency Care`,
    fix_spelling: (v)   => capitaliseFirst(v),
  },

  // ── Hero headline ───────────────────────────────────────────────────────────
  headline: {
    enhance: (_, n) =>
      `Board-Certified Specialists at ${n} — 24/7 Emergency & Specialty Care`,
    rephrase: (v) => {
      if (v.toLowerCase().includes("care"))
        return v.replace(/\bcare\b/i, "expertise");
      if (v.toLowerCase().includes("advanced"))
        return v.replace(/\badvanced\b/i, "comprehensive");
      return "Expert Veterinary Medicine. Exceptional Compassion.";
    },
    shorten: (v) => {
      const words = v.split(" ");
      return words.length <= 5 ? v : words.slice(0, 5).join(" ") + ".";
    },
    expand: (v, n) =>
      `${v} — ${n}: Advanced Diagnostics, Minimally Invasive Surgery & Round-the-Clock Emergency Coverage`,
    fix_spelling: (v) => fixCommonVetTypos(capitaliseFirst(v)),
  },

  // ── Hero subheadline ────────────────────────────────────────────────────────
  subheadline: {
    enhance: (_, n) =>
      `Your pet deserves the same level of care you'd expect for yourself. The board-certified team at ${n} delivers advanced diagnostics, compassionate treatment, and 24/7 emergency coverage — so you never have to choose between quality and urgency.`,
    rephrase: (v) =>
      v.length > 60
        ? `Our specialists deliver advanced veterinary medicine — internal medicine, surgery, and emergency care — all under one roof at ${v.split(" ").slice(-2).join(" ").replace(/[^a-zA-Z\s]/g, "")}.`
        : "Our dedicated team provides compassionate, expert care every step of the way.",
    shorten: (v) => {
      const first = v.split(". ")[0];
      return first.endsWith(".") ? first : first + ".";
    },
    expand: (v, n) =>
      `${v}\n\nAt ${n}, our commitment goes beyond treating conditions — we build lasting partnerships with pet owners, providing education, preventive care, and the most advanced treatments available to keep your companion thriving at every stage of life.`,
    fix_spelling: (v) => fixCommonVetTypos(capitaliseFirst(v)),
  },

  // ── Services section title ───────────────────────────────────────────────────
  "services.title": {
    enhance:     () => "Advanced Specialty & Emergency Care",
    rephrase:    () => "Comprehensive Veterinary Services",
    shorten:     () => "Our Services",
    expand:      () => "Comprehensive Specialty, Emergency & Wellness Services",
    fix_spelling: (v) => capitaliseFirst(fixCommonVetTypos(v)),
  },

  // ── Services subtitle ────────────────────────────────────────────────────────
  "services.subtitle": {
    enhance: (_, n) =>
      `At ${n}, our board-certified specialists bring hospital-level diagnostics and minimally invasive techniques to every case — because your pet deserves nothing less than the very best.`,
    rephrase: () =>
      `From complex diagnostics to precision surgery, our specialist team provides the focused expertise your pet needs to thrive.`,
    shorten: () =>
      `Board-certified specialists in surgery, internal medicine, and critical care — all under one roof.`,
    expand: (v, n) =>
      `${v} From advanced imaging and minimally invasive surgery to 24/7 critical care, ${n}'s team is here at every stage — routine consultations, complex procedures, and life-saving emergencies.`,
    fix_spelling: (v) => fixCommonVetTypos(capitaliseFirst(v)),
  },

  // ── Teams section title ─────────────────────────────────────────────────────
  "teams.title": {
    enhance:     () => "Meet Our Board-Certified Specialists",
    rephrase:    () => "The Experts Caring for Your Pet",
    shorten:     () => "Our Team",
    expand:      () => "Meet Our Experienced & Compassionate Veterinary Specialists",
    fix_spelling: (v) => capitaliseFirst(v),
  },

  // ── Teams subtitle ─────────────────────────────────────────────────────────
  "teams.subtitle": {
    enhance: (_, n) =>
      `Every patient at ${n} is cared for by a board-certified specialist with deep expertise in their field — people who truly understand your pet's condition and are passionate about improving outcomes.`,
    rephrase: () =>
      `Our team of veterinary specialists combines clinical expertise with genuine compassion to deliver the highest standard of care for your pet.`,
    shorten: () =>
      `Board-certified specialists who are passionate about your pet's health and well-being.`,
    fix_spelling: (v) => fixCommonVetTypos(capitaliseFirst(v)),
  },

  // ── Testimonials title ─────────────────────────────────────────────────────
  "testimonials.title": {
    enhance:  () => "What Pet Owners Say About Us",
    rephrase: () => "Stories from Our Clients",
    shorten:  () => "Client Reviews",
    expand:   () => "Hear What Our Community Says — Real Stories from Pet Owners Who Trust Us",
    fix_spelling: (v) => capitaliseFirst(v),
  },

  // ── Testimonials subtitle ─────────────────────────────────────────────────
  "testimonials.subtitle": {
    enhance: (_, n) =>
      `Don't just take our word for it — see why hundreds of pet owners in the region trust ${n} with the animals they love most.`,
    rephrase: () =>
      `Real experiences from real clients. See why our community keeps coming back for exceptional veterinary care.`,
    shorten: () =>
      `Real stories from clients who trust us with their pets.`,
    fix_spelling: (v) => fixCommonVetTypos(capitaliseFirst(v)),
  },

  // ── Join Team heading ──────────────────────────────────────────────────────
  "jointeam.heading": {
    enhance:  () => "Grow Your Career at a Practice That Cares",
    rephrase: () => "We're Looking for Passionate Veterinary Professionals",
    shorten:  () => "Join Our Team",
    expand:   () => "Join a Team That's Redefining Veterinary Excellence — Start Your Career with Us",
    fix_spelling: (v) => capitaliseFirst(v),
  },

  // ── Join Team description ──────────────────────────────────────────────────
  "jointeam.description": {
    enhance: (_, n) =>
      `At ${n}, our people are our greatest asset. We invest in your growth with mentorship programs, continuing education, and a culture that balances clinical excellence with genuine work-life balance. If you're passionate about animals and want to work alongside the best in veterinary medicine, we'd love to meet you.`,
    rephrase: () =>
      `We believe great veterinary care starts with a great team. If you share our passion for animals and commitment to excellence, explore our open positions today.`,
    shorten: () =>
      `Passionate about pets and veterinary medicine? We're hiring. Browse our open positions and join a team that makes a difference.`,
    fix_spelling: (v) => fixCommonVetTypos(capitaliseFirst(v)),
  },

  // ── FAQ section title ──────────────────────────────────────────────────────
  "faq.title": {
    enhance:  () => "Everything You Need to Know — Before Your First Visit",
    rephrase: () => "Common Questions from Pet Owners",
    shorten:  () => "FAQs",
    expand:   () => "Frequently Asked Questions — Appointments, Services, Billing & More",
    fix_spelling: (v) => capitaliseFirst(v),
  },

  // ── FAQ subtitle ──────────────────────────────────────────────────────────
  "faq.subtitle": {
    enhance: () =>
      `We've answered the questions we hear most — from first-time visitors to long-time clients. Can't find what you're looking for? Our team is always a call or click away.`,
    rephrase: () =>
      `Browse our most common questions about appointments, services, and care. Still unsure? Reach out to our friendly team.`,
    shorten: () =>
      `Quick answers to the questions we get asked most.`,
    fix_spelling: (v) => fixCommonVetTypos(capitaliseFirst(v)),
  },

  // ── Newsletter prompt text ─────────────────────────────────────────────────
  "newsletter.promptText": {
    enhance:  (_, n) => `Stay Informed. Get Exclusive Pet Health Tips from ${n}`,
    rephrase: (_, n) => `Get the Latest News & Advice Direct from ${n}`,
    shorten:  ()     => "Get Pet Health Updates",
    fix_spelling: (v) => capitaliseFirst(v),
  },

  // ── CTA labels ─────────────────────────────────────────────────────────────
  "cta.primary.label": {
    enhance:  () => "Book an Appointment Today →",
    rephrase: () => "Schedule Your Visit",
    shorten:  () => "Book Now",
    expand:   () => "Book a Specialist Appointment — Same-Day Available",
    fix_spelling: (v) => capitaliseFirst(v),
  },
  "cta.secondary.label": {
    enhance:  () => "Explore All Specialty Services →",
    rephrase: () => "See What We Offer",
    shorten:  () => "Our Services",
    expand:   () => "Discover All Specialty & Emergency Services",
    fix_spelling: (v) => capitaliseFirst(v),
  },
};

// ─── Generic fallbacks ────────────────────────────────────────────────────────

function genericEnhance(v: string, name: string): string {
  if (!v.trim()) return `Experience compassionate, expert care at ${name}.`;
  if (v.length < 40)
    return `${v} — delivered with expertise and compassion at ${name}`;
  return v
    .replace(/\bgood\b/gi, "exceptional")
    .replace(/\bbest\b/gi, "industry-leading")
    .replace(/\bteam\b/gi, "specialist team");
}

function genericRephrase(v: string): string {
  if (!v.trim()) return v;
  const result = v
    .replace(/\bprovide\b/gi, "deliver")
    .replace(/\bprovides\b/gi, "delivers")
    .replace(/\bcare\b/gi, "expertise")
    .replace(/\bteam\b/gi, "specialists");
  return result !== v ? result : `We're dedicated to: ${v}`;
}

function genericShorten(v: string): string {
  if (v.length <= 60) return v;
  const dot = v.indexOf(". ");
  if (dot > 10 && dot < v.length - 2) return v.slice(0, dot + 1);
  const words = v.split(" ");
  return words.slice(0, Math.ceil(words.length * 0.55)).join(" ") + "…";
}

function genericExpand(v: string, name: string): string {
  if (!v.trim())
    return `At ${name}, we are committed to providing exceptional care for every patient who walks through our doors.`;
  return `${v}\n\nOur team at ${name} is dedicated to your pet's long-term health and well-being, using the latest evidence-based treatments and compassionate care at every visit.`;
}

function genericFixSpelling(v: string): string {
  return fixCommonVetTypos(capitaliseFirst(v));
}

// ─── Utility helpers ──────────────────────────────────────────────────────────

function capitaliseFirst(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fixCommonVetTypos(s: string): string {
  return s
    .replace(/\bspecalty\b/gi,        "specialty")
    .replace(/\bveternary\b/gi,       "veterinary")
    .replace(/\bveternarian\b/gi,     "veterinarian")
    .replace(/\bveternariy\b/gi,      "veterinary")
    .replace(/\bcompassonate\b/gi,    "compassionate")
    .replace(/\bexcelence\b/gi,       "excellence")
    .replace(/\bprofessinal\b/gi,     "professional")
    .replace(/\baccreditated\b/gi,    "accredited")
    .replace(/\bdiagnostics\b/gi,     "diagnostics")
    .replace(/\brecieve\b/gi,         "receive")
    .replace(/\boccured\b/gi,         "occurred")
    .replace(/\bcommited\b/gi,        "committed")
    .replace(/\bspecialty's\b/gi,     "specialty");
}

// ─── Phase 3: Fill from Scratch · Tone Presets · Consistency Check ───────────

export type TonePreset = "premium" | "friendly" | "emergency";

export interface WizardAnswers {
  clinicType: "general" | "specialty" | "exotic" | "network";
  standout:   string;
  audience:   string[];
  tone:       TonePreset;
  promotion?: string;
}

export interface AllSectionContent {
  hero:         { headline: string; subheadline: string; badgeText: string; primaryCtaLabel: string; secondaryCtaLabel: string };
  services:     { sectionTitle: string; sectionSubtitle: string };
  teams:        { sectionTitle: string; sectionSubtitle: string };
  testimonials: { sectionTitle: string; subtitle: string };
  joinTeam:     { heading: string; description: string; ctaLabel: string };
  faq:          { sectionTitle: string; subtitle: string };
  newsletter:   { promptText: string; ctaLabel: string };
}

export interface ConsistencyIssue {
  id:         string;
  severity:   "error" | "warning" | "info";
  section:    string;
  /** matches the data-ai-field / fieldKey so we can route the fix */
  fieldKey:   string;
  issue:      string;
  suggestion: string;
  fixValue:   string;
}

// ── Content packs — one full AllSectionContent per tone ──────────────────────

const TONE_PACKS: Record<TonePreset, (n: string) => AllSectionContent> = {

  premium: (n) => ({
    hero: {
      headline:          "Exceptional Veterinary Medicine. Delivered With Precision.",
      subheadline:       `${n}'s fellowship-trained specialists combine evidence-based medicine, state-of-the-art diagnostics, and a genuine commitment to your pet's quality of life — setting the regional standard for specialty veterinary care.`,
      badgeText:         "🏛 AAHA Accredited · Board-Certified Specialists",
      primaryCtaLabel:   "Schedule a Consultation",
      secondaryCtaLabel: "Explore Our Specialties",
    },
    services: {
      sectionTitle:    "Advanced Specialty Care",
      sectionSubtitle: `At ${n}, every case benefits from the expertise of a board-certified specialist. From complex internal medicine to precision oncologic surgery, we bring academic-level care to the patients who need it most.`,
    },
    teams: {
      sectionTitle:    "Our Board-Certified Specialists",
      sectionSubtitle: `Each member of the ${n} team holds fellowship-level credentials in their discipline — and a deep commitment to the highest standards of veterinary medicine.`,
    },
    testimonials: {
      sectionTitle: "Trusted by Discerning Pet Owners",
      subtitle:     `When quality and expertise matter most, our clients choose ${n}. See what they have to say about their experience with our specialist team.`,
    },
    joinTeam: {
      heading:     "Advance Your Career at the Highest Level",
      description: `We are selective in our hiring because we are serious about excellence. ${n} offers fellowship mentorship, access to cutting-edge equipment, and a collegial culture that values both intellectual rigour and patient outcomes.`,
      ctaLabel:    "View Open Positions",
    },
    faq: {
      sectionTitle: "Frequently Asked Questions",
      subtitle:     `Answers to the questions most often asked by clients preparing for their first specialist consultation at ${n}.`,
    },
    newsletter: {
      promptText: `Stay ahead with specialist-level pet health insights from ${n}`,
      ctaLabel:   "Subscribe",
    },
  }),

  friendly: (n) => ({
    hero: {
      headline:          "We Love Your Pets Like Our Own",
      subheadline:       `From first puppy vaccines to senior wellness checks, the warm, welcoming team at ${n} is here for every chapter of your pet's life. We're not just your vet — we're your partner in pet care.`,
      badgeText:         "🐾 Voted Best Vet in the Neighborhood",
      primaryCtaLabel:   "Book an Appointment",
      secondaryCtaLabel: "Meet Our Team",
    },
    services: {
      sectionTitle:    "Everything Your Pet Needs, Under One Roof",
      sectionSubtitle: `Whether it's a routine check-up or something that needs a little more attention, ${n} has you covered. Our friendly team makes every visit as stress-free as possible — for pets and their people.`,
    },
    teams: {
      sectionTitle:    "Meet the People Who Love Your Pets",
      sectionSubtitle: `Our vets and nurses aren't just skilled — they genuinely care about every animal they see. Come in and meet the friendly faces of ${n}.`,
    },
    testimonials: {
      sectionTitle: "Hear from Our Happy Clients",
      subtitle:     `We're so grateful for the trust our community places in us. Here's what some of our wonderful clients have to say about their experience at ${n}.`,
    },
    joinTeam: {
      heading:     "Love Animals? Come Work With Us!",
      description: `At ${n} we're always on the lookout for warm, caring people to join our team. If you're passionate about pets and love making a difference in your community, we'd love to chat.`,
      ctaLabel:    "See Open Roles",
    },
    faq: {
      sectionTitle: "Your Questions, Answered",
      subtitle:     `Got questions? We've got answers! Here are the things our clients ask us most. Still unsure? Just give us a call — we're always happy to help.`,
    },
    newsletter: {
      promptText: `Get friendly pet health tips from the team at ${n}`,
      ctaLabel:   "Sign Me Up!",
    },
  }),

  emergency: (n) => ({
    hero: {
      headline:          "24/7 Emergency & Specialty Care — When Every Minute Counts",
      subheadline:       `When your pet needs urgent care, ${n} is ready. Our board-certified emergency team is on-site around the clock — no appointment needed, no wait lists for critical cases. We're here when it matters most.`,
      badgeText:         "🚨 Open 24/7 · No Appointment · Emergency Line Active",
      primaryCtaLabel:   "Get Emergency Care Now",
      secondaryCtaLabel: "Call Our Emergency Line",
    },
    services: {
      sectionTitle:    "Emergency & Specialty Services — Always Available",
      sectionSubtitle: `From sudden trauma to complex surgeries, ${n}'s round-the-clock team is equipped to handle any emergency. Advanced imaging, intensive care, and specialist intervention — all immediately available.`,
    },
    teams: {
      sectionTitle:    "Emergency-Ready Specialists On Call 24/7",
      sectionSubtitle: `Every specialist at ${n} is trained for high-pressure, high-stakes situations. Day or night, our credentialed team delivers fast, decisive care when your pet needs it most.`,
    },
    testimonials: {
      sectionTitle: "They Were There When We Needed Them",
      subtitle:     `In an emergency, you need a team you can trust. Here's what clients say about their experience with ${n} during some of their most difficult moments.`,
    },
    joinTeam: {
      heading:     "Join Our Emergency Response Team",
      description: `${n} is seeking veterinary professionals who thrive under pressure and are driven to make a difference in critical moments. We offer competitive pay, advanced equipment, and 24/7 team support.`,
      ctaLabel:    "Apply Now",
    },
    faq: {
      sectionTitle: "Emergency Care — What You Need to Know",
      subtitle:     `Have a pet emergency? Here's everything you need to know about arriving at ${n}, what to expect, and how our team will take care of your animal immediately.`,
    },
    newsletter: {
      promptText: `Get urgent care tips and emergency preparedness guides from ${n}`,
      ctaLabel:   "Stay Informed",
    },
  }),
};

// ─── Fill from Scratch ────────────────────────────────────────────────────────

export async function runFillFromScratch(
  answers:    WizardAnswers,
  clinicName: string,
): Promise<AllSectionContent> {
  await sleep(2400 + Math.random() * 600);

  const base      = TONE_PACKS[answers.tone](clinicName);
  const promoLine = answers.promotion?.trim()
    ? `\n\n🎉 Now on: ${answers.promotion.trim()}`
    : "";

  return {
    ...base,
    hero: {
      ...base.hero,
      subheadline: base.hero.subheadline + promoLine,
      badgeText: answers.promotion?.trim()
        ? `🎉 ${answers.promotion.trim()}`
        : base.hero.badgeText,
    },
  };
}

// ─── Tone Rewrite ─────────────────────────────────────────────────────────────

export async function runToneRewrite(
  tone:       TonePreset,
  clinicName: string,
): Promise<AllSectionContent> {
  await sleep(1800 + Math.random() * 500);
  return TONE_PACKS[tone](clinicName);
}

// ─── Consistency Check ────────────────────────────────────────────────────────

const MOCK_ISSUES: ConsistencyIssue[] = [
  {
    id: "tone-hero",
    severity: "warning",
    section: "Hero",
    fieldKey: "subheadline",
    issue: "Hero uses clinical 'board-certified specialists' language while some sections use a casual, friendly tone.",
    suggestion: "Pick one voice — clinical-professional or warm-approachable — and apply it across all sections.",
    fixValue: "Our specialist team is here for your pet — every day, every hour, whenever you need us.",
  },
  {
    id: "cta-conflict",
    severity: "error",
    section: "Hero",
    fieldKey: "headline",
    issue: "Headline implies immediate walk-in access while CTAs require online booking.",
    suggestion: "Remove 'drop-in' language or align CTAs to reflect appointment booking.",
    fixValue: "Expert Veterinary Care — Book Your Specialist Appointment Today",
  },
  {
    id: "newsletter-brand",
    severity: "info",
    section: "Newsletter",
    fieldKey: "newsletter.promptText",
    issue: "Newsletter prompt doesn't mention your clinic name, reducing brand recall in subscriber inboxes.",
    suggestion: "Include your clinic name in the prompt for stronger brand recognition.",
    fixValue: "Get Expert Pet Health Tips Delivered by Our Team",
  },
  {
    id: "careers-tone",
    severity: "warning",
    section: "Join Team",
    fieldKey: "jointeam.description",
    issue: "Career section uses generic language that doesn't reflect your clinic's established brand voice.",
    suggestion: "Rewrite the description to match your brand tone and highlight your unique culture.",
    fixValue: "We're building something special — a team that genuinely cares. If you're passionate about animals and want to work somewhere that values both expertise and heart, explore our openings today.",
  },
];

export async function runConsistencyCheck(clinicName: string): Promise<ConsistencyIssue[]> {
  await sleep(1600 + Math.random() * 700);
  return MOCK_ISSUES.map((i) => ({
    ...i,
    issue: i.issue.replace(/your clinic/g, clinicName),
  }));
}

// ─── Public entry point ───────────────────────────────────────────────────────

export async function runMockAI(req: MockAIRequest): Promise<string> {
  // Simulate realistic latency (700–1100ms)
  await sleep(700 + Math.random() * 400);

  const { action, value, fieldKey, clinicName } = req;

  // Field-specific transform wins when available
  const fieldMap = FIELD_TRANSFORMS[fieldKey];
  if (fieldMap?.[action]) {
    return fieldMap[action]!(value, clinicName);
  }

  // Generic fallback
  switch (action) {
    case "enhance":      return genericEnhance(value, clinicName);
    case "rephrase":     return genericRephrase(value);
    case "shorten":      return genericShorten(value);
    case "expand":       return genericExpand(value, clinicName);
    case "fix_spelling": return genericFixSpelling(value);
    default:             return value;
  }
}
