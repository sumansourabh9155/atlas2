// ─── Gallery Section ──────────────────────────────────────────────────────────
// Photo grid with optional caption. 2-4 columns.

const NAVY = "#1B2B4B";

import { input as inputTokens } from "../../../lib/styles/tokens";

const INPUT = inputTokens.compact;

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── State ────────────────────────────────────────────────────────────────────

export interface GalleryPhoto {
  url: string;
  caption: string;
}

export interface GalleryState {
  heading: string;
  subtext: string;
  photos: GalleryPhoto[];
  columns: 2 | 3 | 4;
}

const DEFAULT_PHOTOS: GalleryPhoto[] = [
  { url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80", caption: "Our surgical suite" },
  { url: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80", caption: "Happy patient" },
  { url: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80", caption: "State-of-the-art imaging" },
  { url: "https://images.unsplash.com/photo-1530041539828-114de669390e?w=600&auto=format&fit=crop&q=80", caption: "Compassionate care" },
  { url: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80", caption: "Recovery ward" },
  { url: "https://images.unsplash.com/photo-1522944925014-6879ef52e1dc?w=600&auto=format&fit=crop&q=80", caption: "Our facility" },
];

export function createDefaultGallery(): GalleryState {
  return {
    heading: "Inside Our Clinic",
    subtext: "A glimpse of our state-of-the-art facility and the compassionate care we provide.",
    photos: DEFAULT_PHOTOS,
    columns: 3,
  };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export function GallerySectionRenderer({
  state, isDark, compact,
}: { state: GalleryState; isDark: boolean; compact: boolean }) {
  const cols = compact ? Math.min(state.columns, 2) : state.columns;
  const shown = state.photos.slice(0, cols * 2); // 2 rows max in preview

  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0f172a" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="Gallery"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        {(state.heading || state.subtext) && (
          <div className="text-center mb-8">
            {state.heading && (
              <h2
                className={`font-extrabold mb-2 ${compact ? "text-xl" : "text-2xl"}`}
                style={{ color: isDark ? "#f1f5f9" : "#111827" }}
              >
                {state.heading}
              </h2>
            )}
            {state.subtext && (
              <p className="text-sm leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
                {state.subtext}
              </p>
            )}
          </div>
        )}

        {/* Photo grid */}
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {shown.map((photo, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden"
              style={{
                aspectRatio: "4/3",
                background: isDark ? "#1e293b" : "#e5e7eb",
              }}
            >
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.caption || `Gallery photo ${i + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-xs" style={{ color: isDark ? "#475569" : "#9ca3af" }}>
                    Add photo URL
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function GalleryEditor({
  state, onChange,
}: { state: GalleryState; onChange: (u: Partial<GalleryState>) => void }) {
  function updatePhoto(i: number, key: keyof GalleryPhoto, val: string) {
    const next = state.photos.map((p, idx) => idx === i ? { ...p, [key]: val } : p);
    onChange({ photos: next });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Heading</label>
        <input
          type="text"
          value={state.heading}
          onChange={(e) => onChange({ heading: e.target.value })}
          className={INPUT}
          placeholder="Inside Our Clinic"
        />
      </div>

      <div>
        <label className={LABEL}>Subtext</label>
        <textarea
          value={state.subtext}
          onChange={(e) => onChange({ subtext: e.target.value })}
          rows={2}
          className="w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 transition-colors resize-none"
          placeholder="Brief description…"
        />
      </div>

      <div>
        <label className={LABEL}>Columns</label>
        <select
          value={state.columns}
          onChange={(e) => onChange({ columns: Number(e.target.value) as 2 | 3 | 4 })}
          className={INPUT}
        >
          <option value={2}>2 columns</option>
          <option value={3}>3 columns</option>
          <option value={4}>4 columns</option>
        </select>
      </div>

      <div>
        <label className={LABEL}>Photos (URL per photo)</label>
        <div className="flex flex-col gap-2 mt-1">
          {state.photos.slice(0, 6).map((photo, i) => (
            <div key={i} className="flex flex-col gap-1">
              <input
                type="text"
                value={photo.url}
                onChange={(e) => updatePhoto(i, "url", e.target.value)}
                className="h-7 px-2.5 text-xs text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                placeholder={`Photo ${i + 1} URL`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────

export function GalleryThumbnail() {
  const photos = [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=80&h=60&fit=crop&q=70",
    "https://images.unsplash.com/photo-1552053831-71594a27632d?w=80&h=60&fit=crop&q=70",
    "https://images.unsplash.com/photo-1518791841217-8f162f1912da?w=80&h=60&fit=crop&q=70",
    "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=80&h=60&fit=crop&q=70",
    "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=80&h=60&fit=crop&q=70",
    "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=80&h=60&fit=crop&q=70",
  ];
  return (
    <div className="grid gap-[2px] p-[2px] h-full" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
      {photos.map((src, i) => (
        <img key={i} src={src} alt="" className="w-full h-full object-cover rounded-[2px]" />
      ))}
    </div>
  );
}
