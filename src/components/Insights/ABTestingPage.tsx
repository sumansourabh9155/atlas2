/**
 * ABTestingPage — Experiment manager.
 * Active tests with confidence bars + completed results table + insights panel.
 */

import React, { useState, useEffect } from "react";
import {
  GitBranch, CheckCircle2, Clock, TrendingUp, TrendingDown,
  Plus, X, ChevronRight, ArrowUpRight, Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MOCK_AB_TESTS, type ABTest } from "../../data/insightsMockData";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function ConfidenceBar({ confidence }: { confidence: number }) {
  const isSignificant = confidence >= 95;
  const color = confidence >= 95 ? "bg-emerald-500" : confidence >= 70 ? "bg-amber-400" : "bg-gray-300";
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-400">Statistical significance</span>
        <span className={`text-[11px] font-semibold ${isSignificant ? "text-emerald-600" : "text-gray-600"}`}>
          {confidence}%{isSignificant ? " ✓" : ""}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${confidence}%` }} />
      </div>
      {isSignificant && (
        <p className="text-[10px] text-emerald-600 mt-1 font-medium">Ready to declare a winner</p>
      )}
    </div>
  );
}

function WinnerBadge({ winner }: { winner: "control" | "variant" | undefined }) {
  if (!winner) return <span className="text-xs text-gray-400 italic">No clear winner</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
      winner === "variant" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
    }`}>
      <CheckCircle2 size={11} />
      {winner === "variant" ? "Variant won" : "Control won"}
    </span>
  );
}

/* ─── Create Test Modal ───────────────────────────────────────────────────── */

function CreateTestModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const TOTAL = 4;
  const STEPS = ["Select Site & Page", "Choose Element", "Define Variants", "Configure Test"];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Create A/B Test</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of {TOTAL} — {STEPS[step - 1]}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {Array.from({ length: TOTAL }, (_, i) => (
            <React.Fragment key={i}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                i + 1 === step ? "bg-teal-600 text-white"
                : i + 1 < step  ? "bg-teal-100 text-teal-700"
                : "bg-gray-100 text-gray-400"
              }`}>{i + 1}</div>
              {i < TOTAL - 1 && (
                <div className={`flex-1 h-0.5 ${i + 1 < step ? "bg-teal-300" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="px-6 py-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Site</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {MOCK_AB_TESTS.slice(0, 4).map((t) => (
                    <option key={t.id}>{t.site}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Page</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {["Homepage", "Services Page", "Contact Page", "Team Page", "Booking Page"].map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Hypothesis</label>
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  rows={2}
                  placeholder="e.g. Changing the CTA from 'Book Now' to 'Schedule Free Visit' will increase form starts by 15%"
                />
              </div>
            </>
          )}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              {["Hero CTA Button", "Hero Headline", "Hero Image / Video", "Service Card Layout",
                "Form Field Count", "Nav Call-to-Action", "Testimonial Format", "Footer CTA"].map((el) => (
                <button
                  key={el}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-left hover:border-teal-400 hover:bg-teal-50 transition-colors"
                >
                  {el}
                </button>
              ))}
            </div>
          )}
          {step === 3 && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Control (A) — current</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Book Now"
                  defaultValue="Book Now"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Variant (B) — new version</label>
                <input
                  type="text"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Schedule Free Consultation"
                />
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Traffic split</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>50% / 50%</option>
                    <option>70% / 30%</option>
                    <option>80% / 20%</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1.5">Goal metric</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Form Submissions</option>
                    <option>Click-through Rate</option>
                    <option>Session Duration</option>
                    <option>Scroll Depth</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Min. run duration</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option>14 days</option>
                  <option>21 days</option>
                  <option>30 days</option>
                </select>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-start gap-2">
                <Info size={13} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">We'll automatically pause the test when 95% statistical significance is reached or the minimum run duration ends.</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>
          <button
            onClick={() => step < TOTAL ? setStep(step + 1) : onClose()}
            className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {step < TOTAL ? "Continue →" : "Launch Test"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */

interface ABTestingPageProps { userRole?: "admin" | "manager" | "custom"; }

export function ABTestingPage({ userRole }: ABTestingPageProps) {
  const navigate = useNavigate();
  const [tab, setTab]             = useState<"active" | "completed">("active");
  const [modalOpen, setModalOpen] = useState(false);

  // Role guard — custom users cannot access analytics
  useEffect(() => {
    if (userRole === "custom") navigate("/dashboard", { replace: true });
  }, [userRole, navigate]);

  const activeTests    = MOCK_AB_TESTS.filter((t) => t.status === "active");
  const completedTests = MOCK_AB_TESTS.filter((t) => t.status === "completed");

  const completedWins  = completedTests.filter((t) => t.winner === "variant").length;
  const avgLift        = Math.round(
    completedTests
      .filter((t) => t.winner === "variant" && t.lift !== undefined)
      .reduce((s, t) => s + (t.lift ?? 0), 0)
    / completedTests.filter((t) => t.winner === "variant").length
  );

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <GitBranch size={16} className="text-violet-600" aria-hidden="true" />
            A/B Testing
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">{activeTests.length} active · {completedTests.length} completed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {(["active", "completed"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === t ? "bg-white shadow-sm text-gray-800" : "text-gray-500"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            New Test
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {tab === "active" && (
          <>
            {/* KPI row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Active Experiments", value: activeTests.length, sub: "Running now", color: "text-violet-600", bg: "bg-violet-50" },
                { label: "Near Significance",  value: activeTests.filter((t) => t.confidence >= 90).length, sub: "≥90% confidence", color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Total Sample Size",  value: activeTests.reduce((s, t) => s + t.sampleSize, 0).toLocaleString(), sub: "visitors in experiments", color: "text-teal-600", bg: "bg-teal-50" },
              ].map((k) => (
                <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className={`w-8 h-8 ${k.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <GitBranch size={15} className={k.color} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 tabular-nums">{k.value}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">{k.label}</p>
                  <p className="text-xs text-gray-400">{k.sub}</p>
                </div>
              ))}
            </div>

            {/* Active test cards */}
            <div className="space-y-4">
              {activeTests.map((test) => (
                <div key={test.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Test header */}
                  <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900">{test.name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{test.hypothesis}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-400">{test.daysRunning}d running</span>
                      <span className="bg-violet-50 text-violet-700 text-xs font-medium px-2 py-0.5 rounded-full">Active</span>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-3 gap-6">
                    {/* Control vs Variant */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      {[
                        { label: "A — Control", desc: test.controlLabel, conv: test.controlConvPct, isWinner: false, bg: "bg-blue-50 border-blue-200" },
                        { label: "B — Variant", desc: test.variantLabel, conv: test.variantConvPct, isWinner: test.variantConvPct > test.controlConvPct, bg: "bg-violet-50 border-violet-200" },
                      ].map((v) => (
                        <div key={v.label} className={`border rounded-xl p-4 ${v.bg} relative`}>
                          {v.isWinner && (
                            <div className="absolute -top-2 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              LEADING
                            </div>
                          )}
                          <p className="text-xs font-semibold text-gray-500">{v.label}</p>
                          <p className="text-sm text-gray-700 mt-1 leading-snug font-medium">{v.desc}</p>
                          <div className="mt-3 pt-3 border-t border-gray-200/60">
                            <p className="text-2xl font-bold text-gray-900 tabular-nums">{v.conv}%</p>
                            <p className="text-xs text-gray-400">conversion rate</p>
                          </div>
                        </div>
                      ))}
                      {/* Lift indicator */}
                      <div className="col-span-2 flex items-center gap-2">
                        {test.variantConvPct > test.controlConvPct ? (
                          <>
                            <TrendingUp size={14} className="text-emerald-500" />
                            <span className="text-xs text-emerald-700 font-medium">
                              Variant is leading by{" "}
                              {(((test.variantConvPct - test.controlConvPct) / test.controlConvPct) * 100).toFixed(1)}% relative lift
                            </span>
                          </>
                        ) : (
                          <>
                            <TrendingDown size={14} className="text-amber-500" />
                            <span className="text-xs text-amber-700 font-medium">Control is performing better so far</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Confidence + meta */}
                    <div className="space-y-4">
                      <ConfidenceBar confidence={test.confidence} />
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Traffic split</span>
                          <span className="font-medium text-gray-700">{test.split}/{100 - test.split}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sample size</span>
                          <span className="font-medium text-gray-700">{test.sampleSize.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Element</span>
                          <span className="font-medium text-gray-700 truncate ml-2 max-w-[100px] text-right">{test.element}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Page</span>
                          <span className="font-medium text-gray-700">{test.page}</span>
                        </div>
                      </div>
                      {test.confidence >= 95 && (
                        <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors">
                          Declare Winner
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "completed" && (
          <>
            {/* Insights panel */}
            <div className="bg-gradient-to-br from-violet-50 to-teal-50 border border-violet-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-1">
                📊 Insights from {completedTests.length} completed tests
              </h2>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div>
                  <p className="text-2xl font-bold text-violet-700">{completedWins}</p>
                  <p className="text-xs text-gray-500">Winning variants implemented</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700">+{avgLift}%</p>
                  <p className="text-xs text-gray-500">Avg lift from winning variants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-teal-700">
                    {completedTests.reduce((s, t) => s + (t.sitesApplied ?? 0), 0)}
                  </p>
                  <p className="text-xs text-gray-500">Sites updated with winning designs</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-violet-200">
                <p className="text-xs font-semibold text-gray-700 mb-2">Key learnings:</p>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li>• Phone numbers in the nav outperform generic "Call Us" CTAs by avg <strong>61%</strong></li>
                  <li>• Star ratings in testimonials increase trust and improve conversion by avg <strong>22%</strong></li>
                  <li>• Team photos outperform exterior photos by avg <strong>47%</strong> — people connect with people</li>
                  <li>• Shorter contact forms (3 fields) consistently win over 5-field versions</li>
                </ul>
              </div>
            </div>

            {/* Completed tests table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Completed Tests</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {completedTests.map((test) => (
                  <div key={test.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{test.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{test.site} · {test.page}</p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <WinnerBadge winner={test.winner} />
                      {test.lift !== undefined && (
                        <span className={`text-sm font-semibold tabular-nums ${
                          (test.lift ?? 0) > 0 ? "text-emerald-600" : "text-red-500"
                        }`}>
                          {test.lift > 0 ? "+" : ""}{test.lift}%
                        </span>
                      )}
                      <span className="text-xs text-gray-400">{test.confidence}% conf.</span>
                      {(test.sitesApplied ?? 0) > 0 && (
                        <span className="text-xs text-teal-600 font-medium">
                          Applied to {test.sitesApplied} sites
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && <CreateTestModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
