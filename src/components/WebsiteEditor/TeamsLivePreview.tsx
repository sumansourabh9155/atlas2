import type { TeamsEditorState } from "./WebsiteEditorPage";
import type { ClinicWebsite, Veterinarian } from "../../types/clinic";
import type { PreviewTheme } from "./LivePreviewPane";

// ─── Vet card ─────────────────────────────────────────────────────────────────

function VetCard({
  vet,
  state,
  primaryColor,
  theme = "1",
}: {
  vet: Veterinarian;
  state: TeamsEditorState;
  primaryColor: string;
  theme?: PreviewTheme;
}) {
  const initials = vet.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isDark = theme === "2";

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: isDark ? "#1e2a3a" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #f3f4f6",
        boxShadow: isDark ? "0 4px 20px rgba(0,0,0,0.3)" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Photo */}
      <div className="relative overflow-hidden" style={{ height: "200px", background: isDark ? "#111827" : "#f3f4f6" }}>
        {vet.photoUrl ? (
          <img
            src={vet.photoUrl}
            alt={vet.name}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-white"
            style={{ backgroundColor: primaryColor }}
            aria-hidden="true"
          >
            {initials}
          </div>
        )}

        {/* Credentials badge */}
        {vet.credentials && (
          <span
            className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow"
            style={{ backgroundColor: primaryColor }}
          >
            {vet.credentials}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div>
          <h3
            className="text-sm font-bold leading-snug"
            style={{ color: isDark ? "#f1f5f9" : "#111827" }}
          >
            {vet.name}
          </h3>
          {vet.title && (
            <p
              className="text-xs mt-0.5"
              style={{ color: isDark ? "#94a3b8" : "#6b7280" }}
            >
              {vet.title}
            </p>
          )}
        </div>

        {/* Specialization pills */}
        {state.showSpecializations && vet.specializations.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vet.specializations.map((s) => (
              <span
                key={s}
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={
                  isDark
                    ? { border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#94a3b8" }
                    : { border: "1px solid #e5e7eb", background: "#f9fafb", color: "#4b5563" }
                }
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Bio */}
        {state.showBio && vet.bio && (
          <p
            className="text-[11px] leading-relaxed"
            style={{
              color: isDark ? "#64748b" : "#9ca3af",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {vet.bio}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── TeamsLivePreview ─────────────────────────────────────────────────────────

interface Props {
  state: TeamsEditorState;
  clinic: ClinicWebsite;
  compact?: boolean;
  theme?: PreviewTheme;
}

export function TeamsLivePreview({ state, clinic, compact = false, theme = "1" }: Props) {
  const vets = clinic.veterinarians
    .filter((v) => v.isVisible)
    .sort((a, b) => a.order - b.order);

  const { primaryColor } = clinic.general;
  const isDark = theme === "2";

  return (
    <section
      style={{
        padding: compact ? "32px 20px" : "56px 24px",
        background: isDark ? "#0f172a" : "#f9fafb",
        borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #f3f4f6",
      }}
      aria-label="Team section preview"
    >
      {/* Section header */}
      <div className="text-center mx-auto mb-8" style={{ maxWidth: "640px" }}>
        <h2
          className={`font-extrabold leading-tight ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}
          style={{ color: isDark ? "#f1f5f9" : "#111827" }}
        >
          {state.sectionTitle || "Meet Our Team"}
        </h2>
        {state.sectionSubtitle && (
          <p
            className="mt-3 leading-relaxed"
            style={{ fontSize: compact ? "12px" : "14px", color: isDark ? "#64748b" : "#6b7280" }}
          >
            {state.sectionSubtitle}
          </p>
        )}
      </div>

      {/* Card grid */}
      <div
        className="mx-auto"
        style={{
          maxWidth: "1000px",
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)",
          gap: compact ? "16px" : "20px",
        }}
      >
        {vets.map((vet) => (
          <VetCard
            key={vet.id}
            vet={vet}
            state={state}
            primaryColor={primaryColor}
            theme={theme}
          />
        ))}
      </div>

      {/* Empty state */}
      {vets.length === 0 && (
        <div
          className="text-center py-12 text-sm"
          style={{ color: isDark ? "#475569" : "#9ca3af" }}
        >
          No team members configured yet.
        </div>
      )}
    </section>
  );
}
