// ─── Stats Section ────────────────────────────────────────────────────────────
// Full-bleed stats bar: 4 big numbers + labels in navy / teal / white BG.

const NAVY = "#1B2B4B";
const TEAL = "#0F766E";

import { input as inputTokens } from "../../../lib/styles/tokens";

const INPUT = inputTokens.compact;

const LABEL = "block text-xs font-medium text-gray-600 mb-1";

// ─── State ────────────────────────────────────────────────────────────────────

export interface StatItem {
  value: string;
  label: string;
}

export interface StatsState {
  stats: StatItem[];
  bgStyle: "navy" | "white" | "teal";
}

export function createDefaultStats(): StatsState {
  return {
    stats: [
      { value: "47,000+", label: "Patients Treated" },
      { value: "98%",     label: "Client Satisfaction" },
      { value: "24/7",    label: "Emergency Care" },
      { value: "15+",     label: "Specialists on Staff" },
    ],
    bgStyle: "navy",
  };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export function StatsSectionRenderer({
  state, isDark, compact,
}: { state: StatsState; isDark: boolean; compact: boolean }) {
  const bgMap: Record<StatsState["bgStyle"], string> = {
    navy: NAVY,
    white: isDark ? "#1e293b" : "#ffffff",
    teal: TEAL,
  };
  const bg = bgMap[state.bgStyle];
  const isColoured = state.bgStyle !== "white";
  const cols = Math.min(state.stats.length, compact ? 2 : 4);

  return (
    <section
      className="px-6 py-10"
      style={{
        background: bg,
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
      }}
      aria-label="Stats"
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="grid gap-8"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {state.stats.map((stat, i) => (
            <div key={i} className="text-center">
              {/* Number */}
              <p
                className={`font-black leading-none mb-2 ${compact ? "text-3xl" : "text-[2.5rem]"}`}
                style={{ color: isColoured ? "#ffffff" : (isDark ? "#f1f5f9" : NAVY) }}
              >
                {stat.value}
              </p>
              {/* Divider */}
              <div
                className="mx-auto mb-2 rounded-full"
                style={{
                  width: 32,
                  height: 2,
                  background: isColoured ? "rgba(255,255,255,0.35)" : "#e5e7eb",
                }}
              />
              {/* Label */}
              <p
                className="text-sm leading-snug"
                style={{ color: isColoured ? "rgba(255,255,255,0.7)" : (isDark ? "#64748b" : "#6b7280") }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Editor ───────────────────────────────────────────────────────────────────

export function StatsEditor({
  state, onChange,
}: { state: StatsState; onChange: (u: Partial<StatsState>) => void }) {
  function updateStat(i: number, key: keyof StatItem, val: string) {
    const next = state.stats.map((s, idx) => idx === i ? { ...s, [key]: val } : s);
    onChange({ stats: next });
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-4 pt-1">
      {/* BG Style */}
      <div>
        <label className={LABEL}>Background</label>
        <select
          value={state.bgStyle}
          onChange={(e) => onChange({ bgStyle: e.target.value as StatsState["bgStyle"] })}
          className={INPUT}
        >
          <option value="navy">Navy (dark)</option>
          <option value="teal">Teal</option>
          <option value="white">White / light</option>
        </select>
      </div>

      {/* Stat rows */}
      <div>
        <label className={LABEL}>Stats (up to 4)</label>
        <div className="flex flex-col gap-2 mt-1">
          {state.stats.map((stat, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <input
                type="text"
                value={stat.value}
                onChange={(e) => updateStat(i, "value", e.target.value)}
                className="w-[68px] h-8 px-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 font-bold"
                placeholder="47k+"
              />
              <input
                type="text"
                value={stat.label}
                onChange={(e) => updateStat(i, "label", e.target.value)}
                className="flex-1 h-8 px-2.5 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                placeholder="Patients Treated"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Thumbnail (for LeftPanel) ─────────────────────────────────────────────────

export function StatsThumbnail() {
  const stats = [["1.2k+","Patients"],["24/7","Emergency"],["15+","Specialists"],["98%","Satisfaction"]];
  return (
    <div className="flex items-center justify-around h-full px-2" style={{ background: NAVY }}>
      {stats.map(([n, l], i) => (
        <div key={i} className="flex flex-col items-center gap-[2px]">
          <span className="text-[9px] font-black text-white leading-none tracking-tight">{n}</span>
          <div className="h-[1px] rounded-full" style={{ width: 18, background: "rgba(245,158,11,0.7)" }} />
          <span className="text-[5px] font-medium leading-none" style={{ color: "rgba(255,255,255,0.5)" }}>{l}</span>
        </div>
      ))}
    </div>
  );
}
