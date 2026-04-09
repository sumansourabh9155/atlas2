// ─── Card Sections ─────────────────────────────────────────────────────────────
// CardGridSection (2-col and 3-col), TeamCardsSection

const NAVY = "#1B2B4B";
const AMBER = "#F59E0B";
const TEAL = "#0F766E";

import { input as inputTokens } from "../../../lib/styles/tokens";

const INPUT = inputTokens.compact;

const TEXTAREA =
  "w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 " +
  "focus:border-teal-600 transition-colors resize-none";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

const BG_OPTIONS = [
  { value: "white", label: "White"      },
  { value: "light", label: "Light gray" },
  { value: "dark",  label: "Dark"       },
  { value: "navy",  label: "Navy"       },
];

function getBg(bgStyle: string, isDark: boolean): string {
  if (isDark) return bgStyle === "navy" ? "#0b1628" : bgStyle === "dark" ? "#0f172a" : "#1e293b";
  switch (bgStyle) {
    case "white": return "#ffffff";
    case "light": return "#f8f9fb";
    case "dark":  return "#1e293b";
    case "navy":  return NAVY;
    default:      return "#ffffff";
  }
}

function isDarkBg(bgStyle: string, isDark: boolean): boolean {
  return isDark || bgStyle === "dark" || bgStyle === "navy";
}

// ─── CardGridSection ──────────────────────────────────────────────────────────
// Shared by cardgrid2 and cardgrid3 (different defaults)

export interface CardItem {
  imageUrl: string;
  badge: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface CardGridState {
  heading: string;
  subtext: string;
  cards: CardItem[];
  columns: 2 | 3;
  showImage: boolean;
  showBadge: boolean;
  showCta: boolean;
  cardRadius: "sm" | "md" | "lg";
  bgStyle: "white" | "light" | "dark" | "navy";
}

const DEFAULT_CARD: CardItem = {
  imageUrl: "",
  badge: "",
  title: "Card Title",
  body: "A short description for this card. Keep it concise and informative.",
  ctaLabel: "Learn more",
  ctaHref: "#",
};

const DEFAULT_CARDS_2: CardItem[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80",
    badge: "Popular",
    title: "Emergency & Critical Care",
    body: "Round-the-clock emergency services for acute illness, trauma, and respiratory distress. No appointment needed.",
    ctaLabel: "Learn more",
    ctaHref: "#",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80",
    badge: "Specialist",
    title: "Internal Medicine",
    body: "Comprehensive evaluation of complex internal disorders with board-certified internists.",
    ctaLabel: "Learn more",
    ctaHref: "#",
  },
];

const DEFAULT_CARDS_3: CardItem[] = [
  ...DEFAULT_CARDS_2,
  {
    imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80",
    badge: "Advanced",
    title: "Diagnostic Imaging",
    body: "MRI, CT, and digital radiography interpreted by board-certified radiologists. Same-day results.",
    ctaLabel: "Learn more",
    ctaHref: "#",
  },
];

export function createDefaultCardGrid2(): CardGridState {
  return {
    heading: "Featured Services",
    subtext: "Explore what our specialists can do for your pet.",
    cards: DEFAULT_CARDS_2,
    columns: 2,
    showImage: true,
    showBadge: true,
    showCta: true,
    cardRadius: "lg",
    bgStyle: "light",
  };
}

export function createDefaultCardGrid3(): CardGridState {
  return {
    heading: "Our Core Services",
    subtext: "From routine diagnostics to complex surgery — all under one roof.",
    cards: DEFAULT_CARDS_3,
    columns: 3,
    showImage: true,
    showBadge: true,
    showCta: true,
    cardRadius: "lg",
    bgStyle: "white",
  };
}

const RADIUS: Record<CardGridState["cardRadius"], string> = {
  sm: "rounded-md",
  md: "rounded-xl",
  lg: "rounded-2xl",
};

export function CardGridSectionRenderer({
  state, isDark, compact,
}: { state: CardGridState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const cols = compact ? 1 : state.columns;
  const radius = RADIUS[state.cardRadius];

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Card Grid"
    >
      <div className="max-w-5xl mx-auto">
        {(state.heading || state.subtext) && (
          <div className="text-center mb-10">
            {state.heading && (
              <h2 className={`font-extrabold ${compact ? "text-xl" : "text-2xl"}`}
                style={{ color: dark ? "#f1f5f9" : "#111827" }}>
                {state.heading}
              </h2>
            )}
            {state.subtext && (
              <p className="text-sm mt-2 leading-relaxed max-w-2xl mx-auto"
                style={{ color: dark ? "#64748b" : "#6b7280" }}>
                {state.subtext}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {state.cards.map((card, i) => (
            <div
              key={i}
              className={`flex flex-col overflow-hidden ${radius}`}
              style={{
                background: dark ? "#1e293b" : "#ffffff",
                border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
                boxShadow: dark ? "none" : "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {state.showImage && card.imageUrl && (
                <div className="w-full overflow-hidden shrink-0" style={{ aspectRatio: "16/9", background: dark ? "#0f172a" : "#e5e7eb" }}>
                  <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="flex flex-col flex-1 p-5 gap-3">
                {state.showBadge && card.badge && (
                  <span
                    className="self-start text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: `${AMBER}20`, color: AMBER }}
                  >
                    {card.badge}
                  </span>
                )}
                <h3 className="font-bold text-base leading-snug" style={{ color: dark ? "#f1f5f9" : "#111827" }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed flex-1" style={{ color: dark ? "#94a3b8" : "#374151" }}>
                  {card.body}
                </p>
                {state.showCta && card.ctaLabel && (
                  <a href={card.ctaHref} className="inline-flex items-center gap-1 text-sm font-semibold mt-auto pt-2"
                    style={{ color: dark ? "#94a3b8" : NAVY }}>
                    {card.ctaLabel} <span>→</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CardGridEditor({
  state, onChange,
}: { state: CardGridState; onChange: (u: Partial<CardGridState>) => void }) {
  function updateCard(idx: number, key: keyof CardItem, val: string) {
    const next = state.cards.map((c, i) => i === idx ? { ...c, [key]: val } : c);
    onChange({ cards: next });
  }

  function addCard() {
    onChange({ cards: [...state.cards, { ...DEFAULT_CARD }] });
  }

  function removeCard(idx: number) {
    if (state.cards.length <= 1) return;
    onChange({ cards: state.cards.filter((_, i) => i !== idx) });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Section heading</label>
        <input type="text" value={state.heading} onChange={(e) => onChange({ heading: e.target.value })} className={INPUT} placeholder="Section heading" />
      </div>
      <div>
        <label className={LABEL}>Subtext</label>
        <textarea value={state.subtext} onChange={(e) => onChange({ subtext: e.target.value })} rows={2} className={TEXTAREA} placeholder="Supporting text…" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Columns</label>
          <select value={state.columns} onChange={(e) => onChange({ columns: Number(e.target.value) as 2 | 3 })} className={INPUT}>
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Card corners</label>
          <select value={state.cardRadius} onChange={(e) => onChange({ cardRadius: e.target.value as CardGridState["cardRadius"] })} className={INPUT}>
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {[
          { key: "showImage", label: "Show images" },
          { key: "showBadge", label: "Show badges" },
          { key: "showCta",   label: "Show CTA links" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={(state as unknown as Record<string, boolean>)[key]}
              onChange={(e) => onChange({ [key]: e.target.checked } as Partial<CardGridState>)} className="rounded" />
            {label}
          </label>
        ))}
      </div>

      {state.cards.map((card, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Card {idx + 1}</p>
            {state.cards.length > 1 && (
              <button type="button" onClick={() => removeCard(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL}>Badge text</label>
              <input type="text" value={card.badge} onChange={(e) => updateCard(idx, "badge", e.target.value)} className={INPUT} placeholder="Optional" />
            </div>
            <div>
              <label className={LABEL}>CTA label</label>
              <input type="text" value={card.ctaLabel} onChange={(e) => updateCard(idx, "ctaLabel", e.target.value)} className={INPUT} placeholder="Learn more" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Title</label>
            <input type="text" value={card.title} onChange={(e) => updateCard(idx, "title", e.target.value)} className={INPUT} placeholder="Card title" />
          </div>
          <div>
            <label className={LABEL}>Body text</label>
            <textarea value={card.body} onChange={(e) => updateCard(idx, "body", e.target.value)} rows={2} className={TEXTAREA} placeholder="Card description…" />
          </div>
          <div>
            <label className={LABEL}>Image URL</label>
            <input type="text" value={card.imageUrl} onChange={(e) => updateCard(idx, "imageUrl", e.target.value)} className={INPUT} placeholder="https://…" />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addCard}
        className="w-full h-8 border border-dashed border-gray-300 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 rounded-lg transition-colors"
      >
        + Add card
      </button>

      <div>
        <label className={LABEL}>Background</label>
        <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as CardGridState["bgStyle"] })} className={INPUT}>
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function CardGrid2Thumbnail() {
  const imgs = [
    "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=100&h=60&fit=crop&q=70",
    "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=100&h=60&fit=crop&q=70",
  ];
  return (
    <div className="flex flex-col h-full p-1 bg-gray-50 gap-1">
      <div className="h-[2px] rounded bg-gray-700 w-1/2 mx-auto" />
      <div className="flex gap-1 flex-1">
        {imgs.map((src, i) => (
          <div key={i} className="flex-1 bg-white rounded-sm shadow-sm overflow-hidden flex flex-col">
            <img src={src} alt="" className="w-full object-cover" style={{ height: 24 }} />
            <div className="p-[3px] flex flex-col gap-[2px]">
              <div className="h-[2px] bg-gray-700 rounded" />
              <div className="h-[1.5px] bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGrid3Thumbnail() {
  const imgs = [
    "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=80&h=50&fit=crop&q=70",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=80&h=50&fit=crop&q=70",
    "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=80&h=50&fit=crop&q=70",
  ];
  return (
    <div className="flex flex-col h-full p-[3px] bg-gray-50 gap-[3px]">
      <div className="h-[2px] rounded bg-gray-700 w-1/2 mx-auto" />
      <div className="flex gap-[3px] flex-1">
        {imgs.map((src, i) => (
          <div key={i} className="flex-1 bg-white rounded-sm shadow-sm overflow-hidden flex flex-col">
            <img src={src} alt="" className="w-full object-cover" style={{ height: 20 }} />
            <div className="p-[2px] flex flex-col gap-[1.5px]">
              <div className="h-[2px] bg-gray-700 rounded" />
              <div className="h-[1.5px] bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TeamCardsSection ─────────────────────────────────────────────────────────

export interface TeamMemberCard {
  name: string;
  title: string;
  credentials: string;
  photoUrl: string;
  bio: string;
  linkedinUrl: string;
  specializations: string;
}

export interface TeamCardsState {
  heading: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  members: TeamMemberCard[];
  columns: 2 | 3 | 4;
  showBio: boolean;
  showCredentials: boolean;
  showLinkedin: boolean;
  bgStyle: "white" | "light" | "dark" | "navy";
}

const DEFAULT_MEMBER: TeamMemberCard = {
  name: "Dr. Team Member",
  title: "Board-Certified Specialist",
  credentials: "DVM",
  photoUrl: "",
  bio: "Experienced specialist with over 10 years of clinical expertise.",
  linkedinUrl: "",
  specializations: "",
};

export function createDefaultTeamCards(): TeamCardsState {
  return {
    heading: "Meet Our Team",
    subtext: "Board-certified specialists dedicated to providing the highest standard of care for your pets.",
    ctaLabel: "View Full Team",
    ctaHref: "#",
    members: [
      {
        name: "Dr. Maya Reyes",
        title: "Chief of Internal Medicine",
        credentials: "DVM, DACVIM",
        photoUrl: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&auto=format&fit=crop&q=80",
        bio: "Board-certified in Small Animal Internal Medicine with 12+ years experience.",
        linkedinUrl: "",
        specializations: "Endocrinology, Immune-mediated Disease",
      },
      {
        name: "Dr. James Okafor",
        title: "Head of Surgical Services",
        credentials: "DVM, DACVS",
        photoUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&auto=format&fit=crop&q=80",
        bio: "Specializing in soft tissue and orthopedic procedures, with 3,000+ surgeries.",
        linkedinUrl: "",
        specializations: "Soft Tissue, Orthopedic Surgery",
      },
      {
        name: "Dr. Priya Nair",
        title: "Director of Emergency Care",
        credentials: "DVM, DACVECC",
        photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
        bio: "Leads our 24/7 emergency department specializing in trauma and critical care.",
        linkedinUrl: "",
        specializations: "Trauma, Critical Care, Sepsis",
      },
    ],
    columns: 3,
    showBio: true,
    showCredentials: true,
    showLinkedin: false,
    bgStyle: "white",
  };
}

export function TeamCardsSectionRenderer({
  state, isDark, compact,
}: { state: TeamCardsState; isDark: boolean; compact: boolean }) {
  const bg = getBg(state.bgStyle, isDark);
  const dark = isDarkBg(state.bgStyle, isDark);
  const cols = compact ? 1 : Math.min(state.columns, 3);

  return (
    <section
      className="px-6 py-14"
      style={{ background: bg, borderTop: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}` }}
      aria-label="Team Cards"
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          {state.heading && (
            <h2 className={`font-extrabold ${compact ? "text-xl" : "text-2xl"}`}
              style={{ color: dark ? "#f1f5f9" : "#111827" }}>
              {state.heading}
            </h2>
          )}
          {state.subtext && (
            <p className="text-sm mt-2 leading-relaxed max-w-2xl mx-auto"
              style={{ color: dark ? "#64748b" : "#6b7280" }}>
              {state.subtext}
            </p>
          )}
        </div>

        <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {state.members.map((member, i) => {
            const initials = member.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            const specs = member.specializations.split(",").map(s => s.trim()).filter(Boolean);

            return (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl"
                style={{
                  background: dark ? "#1e293b" : "#f8f9fb",
                  border: `1px solid ${dark ? "rgba(255,255,255,0.07)" : "#e5e7eb"}`,
                }}
              >
                <div
                  className="w-20 h-20 rounded-full overflow-hidden shrink-0"
                  style={{ background: dark ? "#334155" : "#e5e7eb" }}
                >
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover object-top"
                      loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-lg font-black text-white"
                      style={{ background: NAVY }}>
                      {initials}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-base" style={{ color: dark ? "#f1f5f9" : "#111827" }}>
                    {member.name}
                    {state.showCredentials && member.credentials && (
                      <span className="text-xs font-medium ml-1.5" style={{ color: dark ? "#64748b" : "#9ca3af" }}>
                        {member.credentials}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: dark ? "#94a3b8" : "#6b7280" }}>{member.title}</p>
                </div>

                {specs.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center">
                    {specs.slice(0, 2).map((s, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${AMBER}15`, color: AMBER }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {state.showBio && member.bio && (
                  <p className="text-xs leading-relaxed" style={{ color: dark ? "#64748b" : "#6b7280" }}>
                    {member.bio}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {state.ctaLabel && (
          <div className="text-center mt-10">
            <a href={state.ctaHref}
              className="inline-block px-6 py-2.5 rounded-lg text-sm font-bold border-2"
              style={{ borderColor: dark ? "#ffffff" : NAVY, color: dark ? "#ffffff" : NAVY }}>
              {state.ctaLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export function TeamCardsEditor({
  state, onChange,
}: { state: TeamCardsState; onChange: (u: Partial<TeamCardsState>) => void }) {
  function updateMember(idx: number, key: keyof TeamMemberCard, val: string) {
    const next = state.members.map((m, i) => i === idx ? { ...m, [key]: val } : m);
    onChange({ members: next });
  }

  function addMember() {
    onChange({ members: [...state.members, { ...DEFAULT_MEMBER }] });
  }

  function removeMember(idx: number) {
    if (state.members.length <= 1) return;
    onChange({ members: state.members.filter((_, i) => i !== idx) });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Section heading</label>
        <input type="text" value={state.heading} onChange={(e) => onChange({ heading: e.target.value })} className={INPUT} placeholder="Meet Our Team" />
      </div>
      <div>
        <label className={LABEL}>Subtext</label>
        <textarea value={state.subtext} onChange={(e) => onChange({ subtext: e.target.value })} rows={2} className={TEXTAREA} placeholder="Team description…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>CTA button label</label>
          <input type="text" value={state.ctaLabel} onChange={(e) => onChange({ ctaLabel: e.target.value })} className={INPUT} placeholder="View Full Team" />
        </div>
        <div>
          <label className={LABEL}>Columns</label>
          <select value={state.columns} onChange={(e) => onChange({ columns: Number(e.target.value) as 2 | 3 | 4 })} className={INPUT}>
            <option value={2}>2 columns</option>
            <option value={3}>3 columns</option>
            <option value={4}>4 columns</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {[
          { key: "showBio",         label: "Show bio"         },
          { key: "showCredentials", label: "Show credentials" },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
            <input type="checkbox" checked={(state as unknown as Record<string, boolean>)[key]}
              onChange={(e) => onChange({ [key]: e.target.checked } as Partial<TeamCardsState>)} className="rounded" />
            {label}
          </label>
        ))}
      </div>

      {state.members.map((member, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{member.name || `Member ${idx + 1}`}</p>
            {state.members.length > 1 && (
              <button type="button" onClick={() => removeMember(idx)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className={LABEL}>Name</label>
              <input type="text" value={member.name} onChange={(e) => updateMember(idx, "name", e.target.value)} className={INPUT} placeholder="Dr. Name" />
            </div>
            <div>
              <label className={LABEL}>Credentials</label>
              <input type="text" value={member.credentials} onChange={(e) => updateMember(idx, "credentials", e.target.value)} className={INPUT} placeholder="DVM, DACVIM" />
            </div>
          </div>
          <div>
            <label className={LABEL}>Title / Role</label>
            <input type="text" value={member.title} onChange={(e) => updateMember(idx, "title", e.target.value)} className={INPUT} placeholder="Chief of Medicine" />
          </div>
          <div>
            <label className={LABEL}>Specializations (comma-separated)</label>
            <input type="text" value={member.specializations} onChange={(e) => updateMember(idx, "specializations", e.target.value)} className={INPUT} placeholder="Internal Medicine, Oncology" />
          </div>
          <div>
            <label className={LABEL}>Photo URL</label>
            <input type="text" value={member.photoUrl} onChange={(e) => updateMember(idx, "photoUrl", e.target.value)} className={INPUT} placeholder="https://…" />
          </div>
          <div>
            <label className={LABEL}>Bio</label>
            <textarea value={member.bio} onChange={(e) => updateMember(idx, "bio", e.target.value)} rows={2} className={TEXTAREA} placeholder="Brief bio…" />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addMember}
        className="w-full h-8 border border-dashed border-gray-300 text-xs text-gray-400 hover:text-gray-600 hover:border-gray-400 rounded-lg transition-colors"
      >
        + Add team member
      </button>

      <div>
        <label className={LABEL}>Background</label>
        <select value={state.bgStyle} onChange={(e) => onChange({ bgStyle: e.target.value as TeamCardsState["bgStyle"] })} className={INPUT}>
          {BG_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  );
}

export function TeamCardsThumbnail() {
  const members = [
    { src: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=60&h=60&fit=crop&q=70", name: "Dr. Chen" },
    { src: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=60&fit=crop&q=70", name: "Dr. Park" },
    { src: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=60&h=60&fit=crop&q=70", name: "Dr. Nair" },
  ];
  return (
    <div className="flex flex-col h-full p-1 bg-gray-50 gap-1">
      <div className="h-[2px] rounded bg-gray-700 w-2/5 mx-auto" />
      <div className="flex gap-1 flex-1">
        {members.map((m, i) => (
          <div key={i} className="flex-1 bg-white rounded-sm shadow-sm overflow-hidden flex flex-col items-center p-[3px] gap-[2px]">
            <img src={m.src} alt="" className="rounded-full object-cover border border-gray-100" style={{ width: 18, height: 18 }} />
            <span className="text-[4.5px] font-bold text-gray-800 leading-none">{m.name}</span>
            <div className="h-[1.5px] bg-gray-200 rounded w-3/4" />
            <div className="h-[1.5px] rounded w-1/2" style={{ background: "#0d9488" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
