// ─── Smart Modes Panel ────────────────────────────────────────────────────────
// Configure time-of-day layout rules. Amber-to-red gradient accent.
// Includes a time-simulator slider to preview the site at any hour.

import { useState, useMemo } from "react";
import { X, Zap, ChevronDown, ChevronUp, Clock, AlertTriangle } from "lucide-react";
import {
  computeActiveMode,
  type SmartModesState,
  type SmartMode,
  type SmartModeId,
  type ActiveModeResult,
} from "../../../types/smartModes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function minutesToTimeString(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function timeStringToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToLabel(m: number): string {
  const h = Math.floor(m / 60) % 24;
  const min = m % 60;
  const period = h < 12 ? "AM" : "PM";
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${String(min).padStart(2, "0")} ${period}`;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ result, label }: { result: ActiveModeResult | null; label: string }) {
  const color = result?.mode.color ?? "green";
  const modeLabel = result?.mode.label ?? "Business Hours";

  const classes: Record<string, string> = {
    green: "bg-green-100 border-green-200 text-green-700",
    amber: "bg-amber-100 border-amber-200 text-amber-700",
    red:   "bg-red-100   border-red-200   text-red-700",
  };
  const dotClasses: Record<string, string> = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red:   "bg-red-500 animate-ping",
  };

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{label}</p>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${classes[color]}`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClasses[color]}`} aria-hidden="true" />
        {modeLabel}
      </span>
    </div>
  );
}

// ─── Mode card ────────────────────────────────────────────────────────────────

interface ModeCardProps {
  mode: SmartMode;
  isRealActive: boolean;
  isSimActive: boolean;
  onUpdate: (updated: SmartMode) => void;
  onForceActive: () => void;
  isManualOverride: boolean;
}

function ModeCard({ mode, isRealActive, isSimActive, onUpdate, onForceActive, isManualOverride }: ModeCardProps) {
  const [expanded, setExpanded] = useState(false);

  const trigger = mode.triggers.find(t => t.type === "time_range");
  const startMin = trigger?.startMinute ?? 8 * 60;
  const endMin   = trigger?.endMinute   ?? 18 * 60;
  const days     = trigger?.days ?? [1, 2, 3, 4, 5];

  const borderColors: Record<string, string> = {
    green: "border-green-200",
    amber: "border-amber-200",
    red:   "border-red-200",
  };
  const activeColors: Record<string, string> = {
    green: "bg-green-50",
    amber: "bg-amber-50",
    red:   "bg-red-50",
  };
  const dotColors: Record<string, string> = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red:   "bg-red-500",
  };

  const triggerSummary = trigger
    ? `${DAY_LABELS.filter((_, i) => days.includes(i)).join(" · ")} · ${minutesToLabel(startMin)} – ${minutesToLabel(endMin)}`
    : "Manual override only";

  function updateTimeRange(field: "startMinute" | "endMinute", value: number) {
    const newTriggers = mode.triggers.map(t =>
      t.type === "time_range" ? { ...t, [field]: value } : t
    );
    onUpdate({ ...mode, triggers: newTriggers });
  }

  function toggleDay(day: number) {
    const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day];
    const newTriggers = mode.triggers.map(t =>
      t.type === "time_range" ? { ...t, days: newDays } : t
    );
    onUpdate({ ...mode, triggers: newTriggers });
  }

  return (
    <div
      className={[
        "rounded-xl border transition-all",
        borderColors[mode.color],
        isSimActive ? activeColors[mode.color] : "bg-white",
      ].join(" ")}
    >
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left focus:outline-none"
        aria-expanded={expanded}
      >
        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[mode.color]} ${isRealActive && mode.color === "red" ? "animate-ping" : ""}`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800">{mode.label}</p>
          <p className="text-[10px] text-gray-400 truncate">{triggerSummary}</p>
        </div>
        {isRealActive && (
          <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-white border shrink-0" style={{ color: mode.color === "red" ? "#dc2626" : mode.color === "amber" ? "#d97706" : "#16a34a", borderColor: mode.color === "red" ? "#fca5a5" : mode.color === "amber" ? "#fcd34d" : "#86efac" }}>
            Active
          </span>
        )}
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">

          {/* Day pills */}
          {trigger && (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 mb-1.5">Active days</p>
              <div className="flex gap-1">
                {DAY_LABELS.map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    aria-pressed={days.includes(i)}
                    className={[
                      "w-7 h-7 rounded-lg text-[10px] font-semibold transition-all focus:outline-none",
                      days.includes(i)
                        ? "bg-gray-700 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200",
                    ].join(" ")}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time range */}
          {trigger && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-gray-500 mb-1">Start</p>
                <input
                  type="time"
                  value={minutesToTimeString(startMin)}
                  onChange={e => updateTimeRange("startMinute", timeStringToMinutes(e.target.value))}
                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <span className="text-gray-300 text-sm mt-4">→</span>
              <div className="flex-1">
                <p className="text-[10px] font-semibold text-gray-500 mb-1">End</p>
                <input
                  type="time"
                  value={minutesToTimeString(endMin)}
                  onChange={e => updateTimeRange("endMinute", timeStringToMinutes(e.target.value))}
                  className="w-full h-8 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
            </div>
          )}

          {/* Hero headline override */}
          <div>
            <p className="text-[10px] font-semibold text-gray-500 mb-1">Hero headline override (optional)</p>
            <input
              type="text"
              value={mode.heroHeadlineOverride ?? ""}
              onChange={e => onUpdate({ ...mode, heroHeadlineOverride: e.target.value || undefined })}
              placeholder="Leave blank to keep default"
              className="w-full h-8 px-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 placeholder:text-gray-300"
            />
          </div>

          {/* Emergency: force activate */}
          {mode.id === "emergency" && (
            <button
              type="button"
              onClick={onForceActive}
              className={[
                "w-full flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-bold transition-all",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
                isManualOverride
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-red-50 border-2 border-red-300 text-red-600 hover:bg-red-100",
              ].join(" ")}
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              {isManualOverride ? "Emergency Active — Click to Deactivate" : "Activate Emergency Mode Now"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  smartModesState: SmartModesState;
  onUpdate:        (patch: Partial<SmartModesState>) => void;
  onClose:         () => void;
}

// ─── SmartModesPanel ──────────────────────────────────────────────────────────

export function SmartModesPanel({ smartModesState, onUpdate, onClose }: Props) {
  // Time simulator — minutes since midnight + day-of-week
  const [simMinutes,    setSimMinutes]    = useState<number | null>(null);
  const [simDayOfWeek,  setSimDayOfWeek]  = useState<number>(new Date().getDay());

  // Live active mode (uses real clock)
  const liveActiveMode = useMemo(
    () => smartModesState.enabled ? computeActiveMode(smartModesState, new Date()) : null,
    [smartModesState]
  );

  // Simulator mode
  const simActiveMode = useMemo<ActiveModeResult | null>(() => {
    if (simMinutes === null || !smartModesState.enabled) return null;
    const fakeDate = new Date();
    fakeDate.setHours(Math.floor(simMinutes / 60), simMinutes % 60, 0, 0);
    // Patch day of week by using a trick — shift the date to the desired weekday
    const currentDay = fakeDate.getDay();
    const diff = simDayOfWeek - currentDay;
    fakeDate.setDate(fakeDate.getDate() + diff);
    return computeActiveMode(smartModesState, fakeDate);
  }, [simMinutes, simDayOfWeek, smartModesState]);

  function updateMode(updated: SmartMode) {
    const modes = smartModesState.modes.map(m => m.id === updated.id ? updated : m);
    onUpdate({ modes });
  }

  function handleForceEmergency() {
    const current = smartModesState.manualOverride;
    onUpdate({ manualOverride: current === "emergency" ? null : "emergency" });
  }

  const isManualEmergency = smartModesState.manualOverride === "emergency";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          maxHeight: "calc(100vh - 32px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Smart Modes"
      >
        {/* Accent line — amber → red */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)" }}
          aria-hidden="true"
        />

        {/* ── Header ── */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 shrink-0">
          <span
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)" }}
          >
            <Zap className="w-3.5 h-3.5 text-white" aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-none">Smart Modes</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              Automatic layout changes based on time
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
            aria-label="Close Smart Modes"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 pb-5 flex flex-col gap-4">

          {/* Enable toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-semibold text-gray-800">Enable Smart Modes</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Auto-switch layouts based on time rules</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={smartModesState.enabled}
              aria-label="Enable Smart Modes"
              onClick={() => onUpdate({ enabled: !smartModesState.enabled, manualOverride: null })}
              className={`relative inline-flex h-5 w-9 rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${smartModesState.enabled ? "bg-amber-500" : "bg-gray-200"}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform ${smartModesState.enabled ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>

          {smartModesState.enabled && (
            <>
              {/* Status bar */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <StatusPill result={liveActiveMode} label="Right Now" />
                {simMinutes !== null && (
                  <>
                    <div className="w-px h-10 bg-gray-200 self-center" aria-hidden="true" />
                    <StatusPill result={simActiveMode} label="Simulator" />
                  </>
                )}
              </div>

              {/* Time simulator */}
              <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                  <p className="text-xs font-semibold text-gray-700">Time Simulator</p>
                  {simMinutes !== null && (
                    <span className="text-[10px] text-amber-600 font-medium ml-auto">
                      {minutesToLabel(simMinutes)}
                    </span>
                  )}
                </div>

                <input
                  type="range"
                  min={0}
                  max={1439}
                  step={15}
                  value={simMinutes ?? 0}
                  onChange={e => setSimMinutes(Number(e.target.value))}
                  className="w-full accent-amber-500"
                  aria-label="Simulate time of day"
                />

                {/* Day pills */}
                <div className="flex gap-1">
                  {DAY_LABELS.map((day, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSimDayOfWeek(i); if (simMinutes === null) setSimMinutes(0); }}
                      aria-pressed={simDayOfWeek === i && simMinutes !== null}
                      className={[
                        "flex-1 h-6 rounded-md text-[9px] font-bold transition-all focus:outline-none",
                        simDayOfWeek === i && simMinutes !== null
                          ? "bg-amber-500 text-white"
                          : "bg-white border border-gray-200 text-gray-500 hover:border-amber-300",
                      ].join(" ")}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <p className="text-[9px] text-gray-400">
                  Drag the slider to preview how the site would appear at any time without changing real settings.
                </p>
              </div>

              {/* Manual override */}
              {smartModesState.manualOverride && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" aria-hidden="true" />
                  <p className="text-xs text-red-700 font-medium flex-1">
                    Manual override: <strong>{smartModesState.modes.find(m => m.id === smartModesState.manualOverride)?.label}</strong>
                  </p>
                  <button
                    type="button"
                    onClick={() => onUpdate({ manualOverride: null })}
                    className="text-[10px] font-semibold text-red-600 hover:text-red-800 transition-colors underline-offset-2 hover:underline focus:outline-none"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Force-override dropdown */}
              {!smartModesState.manualOverride && (
                <div className="flex items-center gap-2">
                  <p className="text-[10px] text-gray-500 shrink-0">Force active:</p>
                  <div className="flex gap-1 flex-1">
                    {(smartModesState.modes.filter(m => m.id !== "business_hours") as SmartMode[]).map(m => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onUpdate({ manualOverride: m.id as SmartModeId })}
                        className={[
                          "flex-1 h-7 rounded-lg border text-[9px] font-bold transition-all focus:outline-none",
                          m.color === "red"
                            ? "border-red-200 text-red-600 bg-red-50 hover:bg-red-100"
                            : "border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100",
                        ].join(" ")}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode cards */}
              <div className="flex flex-col gap-2">
                {smartModesState.modes.map(mode => (
                  <ModeCard
                    key={mode.id}
                    mode={mode}
                    isRealActive={liveActiveMode?.mode.id === mode.id}
                    isSimActive={simMinutes !== null && simActiveMode?.mode.id === mode.id}
                    onUpdate={updateMode}
                    onForceActive={handleForceEmergency}
                    isManualOverride={isManualEmergency && mode.id === "emergency"}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
