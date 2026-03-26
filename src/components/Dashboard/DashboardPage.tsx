/**
 * DashboardPage — Atlas Command Centre
 *
 * Layout (2 rows):
 *  1. Publication pipeline (with KPI stats inside)  |  Needs attention
 *  2. Activity feed  |  Sites by industry (CSS bar chart)
 *
 * Fully generic — works for any industry vertical.
 * Every widget is actionable, not just informational.
 */

import React, { useState } from "react";
import {
  Globe, CheckCircle2, Clock, FileText,
  AlertCircle, ArrowUpRight, ArrowUp, ArrowDown,
  ChevronRight, MoreVertical, RefreshCw, Zap,
  Building2, Users, BarChart2, TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type ActivityType = "published" | "submitted" | "approved" | "rejected" | "created" | "updated" | "domain";
type UrgencyLevel = "critical" | "warning" | "info";

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const PIPELINE_STAGES = [
  { id: "draft",       label: "Draft",       count: 47, color: "bg-gray-200",    text: "text-gray-600",   bar: "bg-gray-400",   pct: 25 },
  { id: "scheduled",   label: "Scheduled",   count: 3,  color: "bg-amber-100",   text: "text-amber-700",  bar: "bg-amber-400",  pct: 2  },
  { id: "published",   label: "Published",   count: 98, color: "bg-teal-50",     text: "text-teal-700",   bar: "bg-teal-500",   pct: 52 },
  { id: "live_domain", label: "Live Domain", count: 43, color: "bg-blue-50",     text: "text-blue-700",   bar: "bg-blue-500",   pct: 23 },
];

const ATTENTION_ITEMS = [
  {
    id: "a1", urgency: "critical" as UrgencyLevel,
    icon: AlertCircle, iconColor: "text-red-500", bg: "bg-red-50",
    title: "3 Approvals Due Today",
    detail: "Luminary Salon, Summit Realty, Harbor Auto Care",
    cta: "Review Now", path: "/approvals",
  },
  {
    id: "a2", urgency: "warning" as UrgencyLevel,
    icon: Clock, iconColor: "text-amber-500", bg: "bg-amber-50",
    title: "2 Sites Scheduled for Today",
    detail: "Bellwood Bistro & Bar, Bright Minds Academy",
    cta: "View Schedule", path: "/sites/all",
  },
  {
    id: "a3", urgency: "warning" as UrgencyLevel,
    icon: RefreshCw, iconColor: "text-orange-500", bg: "bg-orange-50",
    title: "5 Stale Drafts (30+ days)",
    detail: "Last edited over a month ago — consider publishing or archiving",
    cta: "View Drafts", path: "/sites/all",
  },
  {
    id: "a4", urgency: "critical" as UrgencyLevel,
    icon: Globe, iconColor: "text-red-500", bg: "bg-red-50",
    title: "1 Domain Not Resolving",
    detail: "Pacific Freight & Fulfillment — DNS propagation failed",
    cta: "Fix Issue", path: "/sites/all",
  },
  {
    id: "a5", urgency: "info" as UrgencyLevel,
    icon: Users, iconColor: "text-blue-500", bg: "bg-blue-50",
    title: "4 Pending User Invites",
    detail: "Invitations sent but not yet accepted",
    cta: "Manage Users", path: "/users",
  },
];

const ACTIVITY_FEED = [
  { id: "f1", actor: "Sarah M.",  initials: "SM", color: "bg-violet-500", verb: "submitted",  verbColor: "bg-amber-100 text-amber-700",   site: "Luminary Salon & Spa",             industry: "Hair & Beauty Salon",     time: "2m ago",   action: "Review" },
  { id: "f2", actor: "James K.",  initials: "JK", color: "bg-blue-500",   verb: "published",  verbColor: "bg-teal-100 text-teal-700",     site: "Bellwood Bistro & Bar",            industry: "Restaurant & Café",       time: "1h ago",   action: "View" },
  { id: "f3", actor: "Admin",     initials: "AD", color: "bg-teal-600",   verb: "approved",   verbColor: "bg-emerald-100 text-emerald-700",site: "Summit Realty Partners",          industry: "Real Estate Agency",      time: "3h ago",   action: "View" },
  { id: "f4", actor: "Maria L.",  initials: "ML", color: "bg-pink-500",   verb: "created",    verbColor: "bg-gray-100 text-gray-600",     site: "Harbor City Auto Care",            industry: "Automotive Services",     time: "5h ago",   action: "Edit" },
  { id: "f5", actor: "Dev T.",    initials: "DT", color: "bg-indigo-500", verb: "updated",    verbColor: "bg-blue-100 text-blue-700",     site: "Midtown Family Health Center",     industry: "Healthcare Clinic",       time: "7h ago",   action: "View" },
  { id: "f6", actor: "Sarah M.",  initials: "SM", color: "bg-violet-500", verb: "rejected",   verbColor: "bg-red-100 text-red-700",       site: "Blue Ridge Outdoor & Apparel",     industry: "Retail Store",            time: "1d ago",   action: "Edit" },
  { id: "f7", actor: "James K.",  initials: "JK", color: "bg-blue-500",   verb: "published",  verbColor: "bg-teal-100 text-teal-700",     site: "Pawsome Pet Boarding & Grooming",  industry: "Pet Services",            time: "1d ago",   action: "View" },
  { id: "f8", actor: "Admin",     initials: "AD", color: "bg-teal-600",   verb: "domain",     verbColor: "bg-purple-100 text-purple-700", site: "Apex Consulting Group",            industry: "Professional Services",   time: "2d ago",   action: "View" },
];

const INDUSTRY_BREAKDOWN = [
  { name: "Restaurant & Café",    count: 22, color: "bg-orange-400" },
  { name: "Healthcare Clinic",    count: 18, color: "bg-emerald-500" },
  { name: "Real Estate Agency",   count: 16, color: "bg-blue-500" },
  { name: "Hair & Beauty Salon",  count: 14, color: "bg-pink-400" },
  { name: "Fitness & Wellness",   count: 13, color: "bg-violet-500" },
  { name: "Retail Store",         count: 12, color: "bg-amber-500" },
  { name: "Automotive Services",  count: 10, color: "bg-slate-500" },
  { name: "Pet Services",         count: 9,  color: "bg-teal-500" },
  { name: "Education & Training", count: 8,  color: "bg-indigo-500" },
  { name: "Other",                count: 23, color: "bg-gray-400" },
];
const INDUSTRY_MAX = Math.max(...INDUSTRY_BREAKDOWN.map((i) => i.count));

const QUICK_ACTIONS = [
  { label: "New Site",         desc: "Build a site for any business",      icon: Zap,        path: "/sites/new",     color: "bg-teal-600 hover:bg-teal-700 text-white" },
  { label: "Review Approvals", desc: "7 waiting · 3 urgent",               icon: CheckCircle2, path: "/approvals",   color: "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200" },
  { label: "Upload Media",     desc: "Add images, logos, or files",        icon: BarChart2,  path: "/media-library", color: "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" },
  { label: "Invite Team",      desc: "Add users to your workspace",        icon: Users,      path: "/users",         color: "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200" },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function StatCard({
  label, value, delta, deltaUp, icon: Icon, iconBg, iconColor, onClick,
}: {
  label: string; value: number | string; delta: string; deltaUp?: boolean;
  icon: React.ElementType; iconBg: string; iconColor: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group w-full"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">{value}</p>
          <div className="flex items-center gap-1 mt-2">
            {deltaUp !== undefined && (
              deltaUp
                ? <ArrowUp size={11} className="text-emerald-500 flex-shrink-0" />
                : <ArrowDown size={11} className="text-red-400 flex-shrink-0" />
            )}
            <span className="text-xs text-gray-400">{delta}</span>
          </div>
        </div>
        <div className={`${iconBg} rounded-lg p-2.5 flex-shrink-0 group-hover:scale-105 transition-transform`}>
          <Icon size={18} className={iconColor} aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function DashboardPage() {
  const navigate = useNavigate();
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">("all");

  const filteredActivity = activityFilter === "all"
    ? ACTIVITY_FEED
    : ACTIVITY_FEED.filter((f) => f.verb === activityFilter);

  const totalSites = PIPELINE_STAGES.reduce((s, p) => s + p.count, 0);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 space-y-5">

        {/* ══════════════════════════════════════════════════════════════
            ROW 1 — Pipeline + Needs Attention
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-4">

          {/* Publication Pipeline */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Publication Pipeline</h2>
                <p className="text-xs text-gray-400 mt-0.5">{totalSites} total sites across all stages</p>
              </div>
              <button
                onClick={() => navigate("/sites/all")}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                Manage all <ArrowUpRight size={12} />
              </button>
            </div>

            {/* ── Section 1: KPI metric strip ── */}
            <div className="grid grid-cols-4 divide-x divide-gray-100">
              {[
                { label: "Total Sites",       value: 145, delta: "+12 this month", deltaUp: true,  icon: Building2,    iconBg: "bg-blue-50",    iconColor: "text-blue-600",    path: "/sites/all" },
                { label: "Published",         value: 98,  delta: "+8 this week",   deltaUp: true,  icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", path: "/sites/all" },
                { label: "Pending Approvals", value: 7,   delta: "3 urgent",       deltaUp: false, icon: Clock,        iconBg: "bg-amber-50",   iconColor: "text-amber-600",   path: "/approvals" },
                { label: "Live Domains",      value: 43,  delta: "+5 this month",  deltaUp: true,  icon: Globe,        iconBg: "bg-teal-50",    iconColor: "text-teal-600",    path: "/sites/all" },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.label}
                    onClick={() => navigate(m.path)}
                    className="px-6 py-5 text-left hover:bg-gray-50 transition-colors group first:rounded-none last:rounded-none"
                  >
                    <div className={`${m.iconBg} w-8 h-8 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                      <Icon size={16} className={m.iconColor} aria-hidden="true" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 tabular-nums">{m.value}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">{m.label}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      {m.deltaUp
                        ? <ArrowUp size={10} className="text-emerald-500 flex-shrink-0" />
                        : <ArrowDown size={10} className="text-red-400 flex-shrink-0" />}
                      <span className="text-[11px] text-gray-400">{m.delta}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── Section 2: Stage progress bar ── */}
            <div className="px-6 py-5 border-t border-gray-100">
              <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-100 gap-px">
                {PIPELINE_STAGES.map((stage) => (
                  <div
                    key={stage.id}
                    className={`${stage.bar} transition-all`}
                    style={{ width: `${stage.pct}%` }}
                    title={`${stage.label}: ${stage.count} sites (${stage.pct}%)`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-5 mt-3">
                {PIPELINE_STAGES.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${stage.bar}`} />
                    <span className="text-xs text-gray-400">{stage.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 3: Quick actions ── */}
            <div className="px-6 py-5 border-t border-gray-100 grid grid-cols-4 gap-3">
              {QUICK_ACTIONS.map((qa) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={qa.label}
                    onClick={() => navigate(qa.path)}
                    className={`${qa.color} flex flex-col items-start gap-1.5 px-4 py-3 rounded-xl text-left transition-colors`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span className="text-xs font-semibold leading-tight">{qa.label}</span>
                    <span className="text-[10px] opacity-70 leading-tight">{qa.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Needs Attention */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Needs Attention</h2>
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {ATTENTION_ITEMS.filter((a) => a.urgency === "critical").length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {ATTENTION_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="px-5 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`${item.bg} rounded-lg p-1.5 flex-shrink-0 mt-0.5`}>
                        <Icon size={13} className={item.iconColor} aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 leading-snug">{item.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{item.detail}</p>
                        <button
                          onClick={() => navigate(item.path)}
                          className="mt-1.5 text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-0.5"
                        >
                          {item.cta} <ChevronRight size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ROW 3 — Activity Feed + Industry Breakdown
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-4">

          {/* Activity Feed */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900 flex-shrink-0">Recent Activity</h2>
              {/* Filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {(["all", "submitted", "published", "approved", "rejected", "created"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setActivityFilter(f)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors ${
                      activityFilter === f
                        ? "bg-teal-600 text-white"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => navigate("/approvals")}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 flex-shrink-0"
              >
                View all <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="divide-y divide-gray-50">
              {filteredActivity.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No activity for this filter</div>
              ) : (
                filteredActivity.map((item) => (
                  <div key={item.id} className="px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[10px] font-bold select-none">{item.initials}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-800">{item.actor}</span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${item.verbColor}`}>
                            {item.verb}
                          </span>
                          <span className="text-xs text-gray-700 truncate max-w-[180px]">{item.site}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">{item.industry}</p>
                      </div>

                      {/* Time + CTA */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">{item.time}</span>
                        <button className="text-[11px] font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 rounded transition-colors">
                          {item.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sites by Industry */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Sites by Industry</h2>
                <p className="text-xs text-gray-400 mt-0.5">{INDUSTRY_BREAKDOWN.reduce((s, i) => s + i.count, 0)} total</p>
              </div>
              <TrendingUp size={15} className="text-gray-300" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2.5">
              {INDUSTRY_BREAKDOWN.map((ind) => {
                const pct = Math.round((ind.count / INDUSTRY_MAX) * 100);
                return (
                  <div key={ind.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 truncate pr-2">{ind.name}</span>
                      <span className="text-xs font-semibold text-gray-800 tabular-nums flex-shrink-0">{ind.count}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${ind.color} rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-5 py-3 border-t border-gray-100">
              <button
                onClick={() => navigate("/sites/all")}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
              >
                View all sites <ArrowUpRight size={12} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
