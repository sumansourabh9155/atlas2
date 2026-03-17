import { useState, useEffect } from "react";
import {
  X, AlertTriangle, Info, AlertCircle,
  Check, Loader2, ShieldCheck,
} from "lucide-react";
import { runConsistencyCheck, type ConsistencyIssue } from "./mockAI";
import { useAIEditorContext } from "./AIEditorContext";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  /** Called when the user clicks "Fix" on an issue — parent routes to the right setter */
  onApplyFix: (fieldKey: string, value: string) => void;
  onClose:    () => void;
}

// ─── ConsistencyPanel ─────────────────────────────────────────────────────────

export function ConsistencyPanel({ onApplyFix, onClose }: Props) {
  const { clinicContext } = useAIEditorContext();

  const [issues,     setIssues]     = useState<ConsistencyIssue[]>([]);
  const [isChecking, setIsChecking] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    runConsistencyCheck(clinicContext.name).then(results => {
      if (alive) { setIssues(results); setIsChecking(false); }
    });
    return () => { alive = false; };
  }, [clinicContext.name]);

  function applyFix(issue: ConsistencyIssue) {
    onApplyFix(issue.fieldKey, issue.fixValue);
    setAppliedIds(s => new Set([...s, issue.id]));
  }

  function fixAll() {
    issues.forEach(i => { if (!appliedIds.has(i.id)) applyFix(i); });
  }

  const pendingCount = issues.filter(i => !appliedIds.has(i.id)).length;
  const allFixed     = !isChecking && issues.length > 0 && pendingCount === 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.08)" }}
      >
        {/* Accent line — amber/red for review */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, #f59e0b 0%, #ef4444 55%, #f97316 100%)" }}
        />

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </span>
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Consistency Check</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {isChecking
                  ? "Analyzing your content…"
                  : allFixed
                    ? "All issues resolved ✓"
                    : `${pendingCount} issue${pendingCount !== 1 ? "s" : ""} found`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close consistency panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Issue list */}
        <div className="px-5 pb-3 flex flex-col gap-2.5 max-h-[400px] overflow-y-auto">

          {/* Loading */}
          {isChecking && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
              <p className="text-xs text-gray-400">Reading all section content…</p>
            </div>
          )}

          {/* Empty — no issues */}
          {!isChecking && issues.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-10">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm font-semibold text-gray-800">All clear!</p>
              <p className="text-xs text-gray-400">Content is consistent across all sections.</p>
            </div>
          )}

          {/* Issues */}
          {!isChecking && issues.map(issue => {
            const applied  = appliedIds.has(issue.id);
            const Icon     = issue.severity === "error"   ? AlertCircle
                           : issue.severity === "warning" ? AlertTriangle
                           : Info;
            const color    = issue.severity === "error"   ? "#ef4444"
                           : issue.severity === "warning" ? "#f59e0b"
                           : "#6366f1";
            const bgColor  = issue.severity === "error"   ? "rgba(239,68,68,0.04)"
                           : issue.severity === "warning" ? "rgba(245,158,11,0.04)"
                           : "rgba(99,102,241,0.03)";

            return (
              <div
                key={issue.id}
                className="p-3.5 rounded-xl border transition-all"
                style={{
                  borderColor: applied ? "#d1fae5" : `${color}28`,
                  background:  applied ? "#f0fdf4" : bgColor,
                  opacity:     applied ? 0.75 : 1,
                }}
              >
                <div className="flex items-start gap-2.5">
                  <Icon
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    style={{ color: applied ? "#22c55e" : color }}
                  />
                  <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded"
                        style={{ background: `${color}18`, color }}
                      >
                        {issue.section}
                      </span>
                      {applied && (
                        <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-green-100 text-green-600">
                          Fixed
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-medium text-gray-800 leading-snug mb-1">
                      {issue.issue}
                    </p>
                    {!applied && (
                      <p className="text-[10px] text-gray-400 leading-relaxed">
                        {issue.suggestion}
                      </p>
                    )}
                  </div>
                </div>

                {!applied && (
                  <button
                    type="button"
                    onClick={() => applyFix(issue)}
                    className="mt-2.5 ml-6 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all hover:shadow-sm"
                    style={{
                      borderColor: `${color}30`,
                      color,
                      background:  `${color}0a`,
                    }}
                  >
                    <Check className="w-2.5 h-2.5" />
                    Fix with AI
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {!isChecking && issues.length > 0 && (
          <div className="px-5 pb-5 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {appliedIds.size} of {issues.length} resolved
            </span>
            {allFixed ? (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                Done ✓
              </button>
            ) : (
              <button
                onClick={fixAll}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                Fix All Issues
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
