// ─── Team Spotlight Section ───────────────────────────────────────────────────
// Feature a single veterinarian with a large photo + full bio.

const NAVY = "#1B2B4B";
const AMBER = "#F59E0B";

const INPUT =
  "w-full h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md " +
  "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] " +
  "focus:border-[#003459] transition-colors";

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── State ────────────────────────────────────────────────────────────────────

export interface TeamSpotlightState {
  vetName: string;
  credentials: string;
  title: string;
  bio: string;
  photoUrl: string;
  specializations: string;
  ctaLabel: string;
  imagePosition: "left" | "right";
}

export function createDefaultTeamSpotlight(): TeamSpotlightState {
  return {
    vetName: "Dr. Sarah Nguyen",
    credentials: "DVM, DACVECC",
    title: "Chief of Emergency & Critical Care",
    bio: "Dr. Nguyen has over 14 years of experience in emergency and critical care medicine. She completed her residency at Cornell University College of Veterinary Medicine and is a diplomate of the American College of Veterinary Emergency and Critical Care.\n\nHer passion for high-acuity cases and her calm presence in the ICU have earned her the trust of pet owners and colleagues alike.",
    photoUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80",
    specializations: "Emergency Medicine, Critical Care, Internal Medicine",
    ctaLabel: "Book with Dr. Nguyen",
    imagePosition: "left",
  };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export function TeamSpotlightSectionRenderer({
  state, isDark, compact,
}: { state: TeamSpotlightState; isDark: boolean; compact: boolean }) {
  const specs = state.specializations.split(",").map(s => s.trim()).filter(Boolean);
  const initials = state.vetName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isImageLeft = state.imagePosition === "left";

  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
      aria-label="Team Spotlight"
    >
      <div className="max-w-4xl mx-auto">
        <div
          className={`flex ${compact ? "flex-col" : "flex-row"} gap-8 items-center`}
          style={compact ? {} : { flexDirection: isImageLeft ? "row" : "row-reverse" }}
        >
          {/* Photo */}
          <div
            className="shrink-0 rounded-2xl overflow-hidden"
            style={{
              width: compact ? "100%" : "320px",
              height: compact ? "260px" : "380px",
              background: isDark ? "#1e293b" : "#e5e7eb",
            }}
          >
            {state.photoUrl ? (
              <img
                src={state.photoUrl}
                alt={state.vetName}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-4xl font-black text-white"
                style={{ background: NAVY }}
              >
                {initials}
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="flex-1 min-w-0">
            {/* Overline */}
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: AMBER }}>
              Featured Veterinarian
            </p>

            {/* Name + credentials */}
            <h2
              className={`font-extrabold leading-tight mb-1 ${compact ? "text-xl" : "text-2xl"}`}
              style={{ color: isDark ? "#f1f5f9" : "#111827" }}
            >
              {state.vetName}
              {state.credentials && (
                <span className="text-base font-semibold ml-2" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
                  {state.credentials}
                </span>
              )}
            </h2>

            {/* Title */}
            {state.title && (
              <p className="text-sm mb-4" style={{ color: isDark ? "#94a3b8" : "#6b7280" }}>
                {state.title}
              </p>
            )}

            {/* Specializations */}
            {specs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {specs.map((s, i) => (
                  <span
                    key={i}
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{
                      background: isDark ? "rgba(245,158,11,0.12)" : "rgba(245,158,11,0.1)",
                      color: AMBER,
                      border: `1px solid ${isDark ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.25)"}`,
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Bio paragraphs */}
            <div className="flex flex-col gap-3 mb-6">
              {state.bio.split("\n").filter(Boolean).map((para, i) => (
                <p
                  key={i}
                  className="text-sm leading-relaxed"
                  style={{ color: isDark ? "#94a3b8" : "#374151" }}
                >
                  {para}
                </p>
              ))}
            </div>

            {/* CTA */}
            {state.ctaLabel && (
              <a
                href="#"
                className="inline-block px-5 py-2.5 rounded-lg text-sm font-bold text-white"
                style={{ background: NAVY }}
              >
                {state.ctaLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function TeamSpotlightEditor({
  state, onChange,
}: { state: TeamSpotlightState; onChange: (u: Partial<TeamSpotlightState>) => void }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      <div>
        <label className={LABEL}>Image position</label>
        <select
          value={state.imagePosition}
          onChange={(e) => onChange({ imagePosition: e.target.value as TeamSpotlightState["imagePosition"] })}
          className={INPUT}
        >
          <option value="left">Photo left</option>
          <option value="right">Photo right</option>
        </select>
      </div>

      <div>
        <label className={LABEL}>Vet name</label>
        <input
          type="text"
          value={state.vetName}
          onChange={(e) => onChange({ vetName: e.target.value })}
          className={INPUT}
          placeholder="Dr. Sarah Nguyen"
        />
      </div>

      <div>
        <label className={LABEL}>Credentials</label>
        <input
          type="text"
          value={state.credentials}
          onChange={(e) => onChange({ credentials: e.target.value })}
          className={INPUT}
          placeholder="DVM, DACVECC"
        />
      </div>

      <div>
        <label className={LABEL}>Title / Role</label>
        <input
          type="text"
          value={state.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className={INPUT}
          placeholder="Chief of Emergency & Critical Care"
        />
      </div>

      <div>
        <label className={LABEL}>Photo URL</label>
        <input
          type="text"
          value={state.photoUrl}
          onChange={(e) => onChange({ photoUrl: e.target.value })}
          className={INPUT}
          placeholder="https://…"
        />
      </div>

      <div>
        <label className={LABEL}>Specializations (comma-separated)</label>
        <input
          type="text"
          value={state.specializations}
          onChange={(e) => onChange({ specializations: e.target.value })}
          className={INPUT}
          placeholder="Emergency Medicine, Critical Care"
        />
      </div>

      <div>
        <label className={LABEL}>Bio (blank line = new paragraph)</label>
        <textarea
          value={state.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={5}
          className="w-full px-2.5 py-1.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#003459] focus:border-[#003459] transition-colors resize-none"
          placeholder="Write a compelling bio…"
        />
      </div>

      <div>
        <label className={LABEL}>CTA button label</label>
        <input
          type="text"
          value={state.ctaLabel}
          onChange={(e) => onChange({ ctaLabel: e.target.value })}
          className={INPUT}
          placeholder="Book with Dr. Nguyen"
        />
      </div>
    </div>
  );
}

// ─── Thumbnail ─────────────────────────────────────────────────────────────────

export function TeamSpotlightThumbnail() {
  return (
    <div className="flex gap-1.5 h-full p-1 items-center bg-white">
      <img
        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=60&h=80&fit=crop&q=70"
        alt="" className="rounded-md object-cover shrink-0" style={{ width: 28, height: 44 }}
      />
      <div className="flex-1 flex flex-col gap-[2.5px] justify-center">
        <span className="text-[5px] font-bold uppercase tracking-wider" style={{ color: AMBER }}>Chief of Surgery</span>
        <span className="text-[7.5px] font-extrabold leading-tight" style={{ color: NAVY }}>Dr. Sarah Chen</span>
        <span className="text-[5px] text-gray-500 leading-none">DVM, DACVS · 15 yrs exp</span>
        <span className="text-[4.5px] text-gray-400 leading-tight">Orthopedic &amp; soft tissue surgery specialist.</span>
        <div className="flex gap-[3px] mt-0.5">
          <span className="text-[4.5px] rounded-full px-1.5 py-[1.5px] font-medium" style={{ background: "#d1fae5", color: "#065f46" }}>Surgery</span>
          <span className="text-[4.5px] rounded-full px-1.5 py-[1.5px] font-medium" style={{ background: "#dbeafe", color: "#1e40af" }}>Ortho</span>
        </div>
      </div>
    </div>
  );
}
