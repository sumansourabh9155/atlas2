/**
 * ConversionFunnelsPage — Multi-step drop-off analysis.
 * CSS-based funnel visualiser + device split + benchmark comparison.
 */

import React, { useState, useEffect } from "react";
import { TrendingDown, TrendingUp, Users, ChevronDown, ArrowDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MOCK_FUNNELS, type Funnel, type FunnelStep } from "../../data/insightsMockData";

/* ─── Funnel step block ───────────────────────────────────────────────────── */

function FunnelBlock({
  step,
  prev,
  index,
  totalSteps,
  maxCount,
}: {
  step: FunnelStep;
  prev: FunnelStep | null;
  index: number;
  totalSteps: number;
  maxCount: number;
}) {
  const widthPct = Math.max(20, (step.count / maxCount) * 100);
  const isFirst  = index === 0;
  const dropped  = prev ? prev.count - step.count : 0;
  const isLast   = index === totalSteps - 1;

  const stepColor =
    step.dropPct === 0 ? "bg-teal-600"
    : step.dropPct >= 50 ? "bg-red-500"
    : step.dropPct >= 35 ? "bg-amber-500"
    : "bg-teal-500";

  return (
    <div className="flex flex-col items-center">
      {/* Drop indicator */}
      {!isFirst && prev && (
        <div className="flex items-center gap-3 w-full max-w-md mb-1.5">
          <div className="flex-1 border-l-2 border-dashed border-gray-200 h-5 ml-auto mr-auto" style={{ width: 0 }} />
          <div className="flex items-center gap-2 text-xs">
            <ArrowDown size={12} className="text-red-400" />
            <span className="text-red-500 font-semibold">{step.dropPct}% dropped</span>
            <span className="text-gray-400">({dropped.toLocaleString()} users, avg {prev.avgTimeSec}s)</span>
          </div>
        </div>
      )}

      {/* Step bar */}
      <div
        className={`${stepColor} rounded-lg flex items-center justify-between px-4 py-3 text-white transition-all`}
        style={{ width: `${widthPct}%`, minWidth: 200 }}
      >
        <div>
          <p className="text-xs font-semibold opacity-80">Step {index + 1}</p>
          <p className="text-sm font-bold">{step.label}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold tabular-nums">{step.count.toLocaleString()}</p>
          <p className="text-xs opacity-70">
            {Math.round((step.count / MOCK_FUNNELS[0].steps[0].count) * 100)}% of entry
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Mini funnel for device comparison ──────────────────────────────────── */

function MiniFunnel({
  label,
  pcts,
  steps,
  color,
}: {
  label: string;
  pcts: number[];
  steps: string[];
  color: string;
}) {
  return (
    <div className="flex-1">
      <p className="text-xs font-semibold text-gray-500 mb-3 text-center">{label}</p>
      <div className="space-y-1.5 flex flex-col items-center">
        {pcts.map((pct, i) => (
          <div key={i} className="w-full flex flex-col items-center">
            {i > 0 && (
              <div className="text-[9px] text-red-400 font-semibold mb-0.5">
                ↓ {pcts[i - 1] - pct}%
              </div>
            )}
            <div
              className={`${color} rounded text-white text-[9px] font-medium py-1 flex items-center justify-center`}
              style={{ width: `${Math.max(15, pct)}%`, minWidth: 40 }}
            >
              {pct}%
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {steps.map((s, i) => (
          <p key={i} className="text-[9px] text-gray-400 text-center truncate">{s}</p>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────────────── */

interface ConversionFunnelsPageProps { userRole?: "admin" | "manager" | "custom"; }

export function ConversionFunnelsPage({ userRole }: ConversionFunnelsPageProps) {
  const navigate = useNavigate();

  // Role guard — custom users cannot access analytics
  useEffect(() => {
    if (userRole === "custom") navigate("/dashboard", { replace: true });
  }, [userRole, navigate]);

  const [funnelId, setFunnelId] = useState(MOCK_FUNNELS[0].id);
  const funnel = MOCK_FUNNELS.find((f) => f.id === funnelId) ?? MOCK_FUNNELS[0];
  const maxCount = funnel.steps[0].count;
  const endConv  = funnel.endConversionPct;
  const bench    = funnel.industryBenchmarkPct;
  const diff     = +(endConv - bench).toFixed(1);
  const stepLabels = funnel.steps.map((s) => s.label);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <TrendingDown size={16} className="text-teal-600" aria-hidden="true" />
            Conversion Funnels
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">Multi-step drop-off analysis · last 30 days</p>
        </div>
        {/* Funnel selector */}
        <div className="relative">
          <select
            value={funnelId}
            onChange={(e) => setFunnelId(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          >
            {MOCK_FUNNELS.map((f) => (
              <option key={f.id} value={f.id}>{f.name} — {f.site}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ── KPI Row ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Total Entries",
              value: funnel.steps[0].count.toLocaleString(),
              sub: "visitors started funnel",
              icon: Users,
              color: "text-blue-600", bg: "bg-blue-50",
            },
            {
              label: "End Conversion",
              value: `${endConv}%`,
              sub: "completed all steps",
              icon: TrendingDown,
              color: "text-teal-600", bg: "bg-teal-50",
            },
            {
              label: "vs. Industry Avg",
              value: `${diff > 0 ? "+" : ""}${diff}%`,
              sub: `Benchmark: ${bench}%`,
              icon: diff >= 0 ? TrendingUp : TrendingDown,
              color: diff >= 0 ? "text-emerald-600" : "text-red-500",
              bg: diff >= 0 ? "bg-emerald-50" : "bg-red-50",
            },
            {
              label: "Biggest Drop-off",
              value: `Step ${funnel.steps.reduce((max, s, i) => s.dropPct > funnel.steps[max].dropPct ? i : max, 0) + 1}`,
              sub: `${Math.max(...funnel.steps.map((s) => s.dropPct))}% abandon rate`,
              icon: TrendingDown,
              color: "text-red-500", bg: "bg-red-50",
            },
          ].map((k) => {
            const Icon = k.icon;
            return (
              <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-5">
                <div className={`w-8 h-8 ${k.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon size={16} className={k.color} />
                </div>
                <p className={`text-2xl font-bold tabular-nums ${k.color}`}>{k.value}</p>
                <p className="text-xs font-medium text-gray-600 mt-0.5">{k.label}</p>
                <p className="text-xs text-gray-400">{k.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4">

          {/* ── Funnel Visualiser ── */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">{funnel.name}</h2>
              <p className="text-xs text-gray-400 mt-0.5">{funnel.site} · {funnel.steps.length}-step funnel</p>
            </div>
            <div className="p-6 flex flex-col items-center gap-1">
              {funnel.steps.map((step, i) => (
                <FunnelBlock
                  key={i}
                  step={step}
                  prev={i > 0 ? funnel.steps[i - 1] : null}
                  index={i}
                  totalSteps={funnel.steps.length}
                  maxCount={maxCount}
                />
              ))}
              {/* End conversion rate */}
              <div className="mt-4 pt-4 border-t border-gray-100 w-full text-center">
                <p className="text-xs text-gray-400">
                  Overall conversion:{" "}
                  <strong className={`${endConv >= bench ? "text-teal-600" : "text-red-500"}`}>
                    {endConv}%
                  </strong>
                  {" "}vs industry avg{" "}
                  <strong className="text-gray-600">{bench}%</strong>
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex flex-col gap-4">

            {/* Top drop-off analysis */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Biggest Leaks</h2>
                <p className="text-xs text-gray-400 mt-0.5">Steps with most drop-off</p>
              </div>
              <div className="divide-y divide-gray-50">
                {[...funnel.steps]
                  .filter((s) => s.dropPct > 0)
                  .sort((a, b) => b.dropPct - a.dropPct)
                  .slice(0, 4)
                  .map((s, i) => (
                    <div key={i} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-700 truncate">{s.label}</span>
                        <span className={`text-xs font-bold ml-2 flex-shrink-0 ${
                          s.dropPct >= 40 ? "text-red-500" : "text-amber-600"
                        }`}>{s.dropPct}% drop</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.dropPct >= 40 ? "bg-red-400" : "bg-amber-400"}`}
                          style={{ width: `${s.dropPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Avg time before leaving: {s.avgTimeSec}s</p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Device comparison */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Mobile vs Desktop</h2>
              </div>
              <div className="px-5 py-4 flex gap-4">
                <MiniFunnel
                  label="📱 Mobile"
                  pcts={funnel.mobilePcts}
                  steps={stepLabels}
                  color="bg-blue-500"
                />
                <div className="w-px bg-gray-100" />
                <MiniFunnel
                  label="🖥️ Desktop"
                  pcts={funnel.desktopPcts}
                  steps={stepLabels}
                  color="bg-teal-500"
                />
              </div>
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                <p className="text-[11px] text-gray-500">
                  Desktop converts{" "}
                  <strong className="text-teal-700">
                    {Math.round(
                      ((funnel.desktopPcts[funnel.desktopPcts.length - 1] -
                        funnel.mobilePcts[funnel.mobilePcts.length - 1]) /
                        funnel.mobilePcts[funnel.mobilePcts.length - 1]) * 100
                    )}% better
                  </strong>{" "}
                  than mobile at end.
                </p>
              </div>
            </div>

            {/* Traffic source */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Traffic Sources</h2>
              {(Object.entries(funnel.trafficSplit) as [string, number][]).map(([src, pct]) => (
                <div key={src} className="flex items-center gap-3 mb-2">
                  <span className="text-xs text-gray-500 capitalize w-14 flex-shrink-0">{src}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-8 text-right tabular-nums">{pct}%</span>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
