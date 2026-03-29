/**
 * DashboardPage — Atlas Command Centre
 *
 * Layout (priority order):
 *  Row 1 — 4 key KPI stat cards
 *  Row 2 — Needs Attention (urgent) | Recent Activity
 *  Row 3 — Publication Pipeline stage bar
 */

import React, { useState } from "react";
import {
  Globe, CheckCircle2, Clock,
  AlertCircle, ArrowUpRight, ArrowUp, ArrowDown,
  ChevronRight, RefreshCw,
  Building2, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type ActivityType = "published" | "submitted" | "approved" | "rejected" | "created" | "updated" | "domain";
type UrgencyLevel = "critical" | "warning" | "info";

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const PIPELINE_STAGES = [
  { id: "draft",       label: "Draft",       count: 47, bar: "bg-gray-400",   pct: 25 },
  { id: "scheduled",   label: "Scheduled",   count: 3,  bar: "bg-amber-400",  pct: 2  },
  { id: "published",   label: "Published",   count: 98, bar: "bg-teal-500",   pct: 52 },
  { id: "live_domain", label: "Live Domain", count: 43, bar: "bg-blue-500",   pct: 23 },
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
  { id: "f1", actor: "Sarah M.",  initials: "SM", color: "bg-violet-500", verb: "submitted",  verbColor: "bg-amber-100 text-amber-700",    site: "Luminary Salon & Spa",            industry: "Hair & Beauty Salon",    time: "2m ago",  action: "Review" },
  { id: "f2", actor: "James K.",  initials: "JK", color: "bg-blue-500",   verb: "published",  verbColor: "bg-teal-100 text-teal-700",      site: "Bellwood Bistro & Bar",           industry: "Restaurant & Café",      time: "1h ago",  action: "View" },
  { id: "f3", actor: "Admin",     initials: "AD", color: "bg-teal-600",   verb: "approved",   verbColor: "bg-emerald-100 text-emerald-700", site: "Summit Realty Partners",         industry: "Real Estate Agency",     time: "3h ago",  action: "View" },
  { id: "f4", actor: "Maria L.",  initials: "ML", color: "bg-pink-500",   verb: "created",    verbColor: "bg-gray-100 text-gray-600",      site: "Harbor City Auto Care",           industry: "Automotive Services",    time: "5h ago",  action: "Edit" },
  { id: "f5", actor: "Dev T.",    initials: "DT", color: "bg-indigo-500", verb: "updated",    verbColor: "bg-blue-100 text-blue-700",      site: "Midtown Family Health Center",    industry: "Healthcare Clinic",      time: "7h ago",  action: "View" },
  { id: "f6", actor: "Sarah M.",  initials: "SM", color: "bg-violet-500", verb: "rejected",   verbColor: "bg-red-100 text-red-700",        site: "Blue Ridge Outdoor & Apparel",    industry: "Retail Store",           time: "1d ago",  action: "Edit" },
  { id: "f7", actor: "James K.",  initials: "JK", color: "bg-blue-500",   verb: "published",  verbColor: "bg-teal-100 text-teal-700",      site: "Pawsome Pet Boarding & Grooming", industry: "Pet Services",           time: "1d ago",  action: "View" },
  { id: "f8", actor: "Admin",     initials: "AD", color: "bg-teal-600",   verb: "domain",     verbColor: "bg-purple-100 text-purple-700",  site: "Apex Consulting Group",           industry: "Professional Services",  time: "2d ago",  action: "View" },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function DashboardPage() {
  const navigate = useNavigate();
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">("all");

  const filteredActivity = activityFilter === "all"
    ? ACTIVITY_FEED
    : ACTIVITY_FEED.filter((f) => f.verb === activityFilter);

  const totalSites = PIPELINE_STAGES.reduce((s, p) => s + p.count, 0);
  const criticalCount = ATTENTION_ITEMS.filter((a) => a.urgency === "critical").length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 space-y-4">

        {/* ══════════════════════════════════════════════════════════════
            ROW 1 — KPI Stat Cards (most important at a glance)
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Sites",       value: 145, delta: "+12 this month", deltaUp: true,  icon: Building2,    iconBg: "bg-blue-50",    iconColor: "text-blue-600",    path: "/sites/all" },
            { label: "Published",         value: 98,  delta: "+8 this week",   deltaUp: true,  icon: CheckCircle2, iconBg: "bg-emerald-50", iconColor: "text-emerald-600", path: "/sites/all" },
            { label: "Pending Approvals", value: 7,   delta: "3 urgent today", deltaUp: false, icon: Clock,        iconBg: "bg-amber-50",   iconColor: "text-amber-600",   path: "/approvals" },
            { label: "Live Domains",      value: 43,  delta: "+5 this month",  deltaUp: true,  icon: Globe,        iconBg: "bg-teal-50",    iconColor: "text-teal-600",    path: "/sites/all" },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.label}
                onClick={() => navigate(m.path)}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{m.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2 tabular-nums">{m.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {m.deltaUp
                        ? <ArrowUp   size={11} className="text-emerald-500 flex-shrink-0" />
                        : <ArrowDown size={11} className="text-red-400 flex-shrink-0" />}
                      <span className="text-xs text-gray-400">{m.delta}</span>
                    </div>
                  </div>
                  <div className={`${m.iconBg} rounded-lg p-2.5 flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    <Icon size={18} className={m.iconColor} aria-hidden="true" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ROW 2 — Needs Attention | Recent Activity
        ══════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-4">

          {/* Needs Attention */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Needs Attention</h2>
              {criticalCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {criticalCount}
                </span>
              )}
            </div>
            <div className="flex-1 divide-y divide-gray-50">
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

          {/* Recent Activity */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900 flex-shrink-0">Recent Activity</h2>
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
                      <div className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-white text-[10px] font-bold select-none">{item.initials}</span>
                      </div>
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
        </div>

        {/* ══════════════════════════════════════════════════════════════
            ROW 3 — Publication Pipeline (stage distribution)
        ══════════════════════════════════════════════════════════════ */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
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

          <div className="px-6 py-5">
            {/* Segmented bar */}
            <div className="flex rounded-full overflow-hidden h-3 bg-gray-100 gap-px">
              {PIPELINE_STAGES.map((stage) => (
                <div
                  key={stage.id}
                  className={`${stage.bar} transition-all`}
                  style={{ width: `${stage.pct}%` }}
                  title={`${stage.label}: ${stage.count} sites (${stage.pct}%)`}
                />
              ))}
            </div>

            {/* Legend + counts */}
            <div className="grid grid-cols-4 mt-4 divide-x divide-gray-100">
              {PIPELINE_STAGES.map((stage) => (
                <div key={stage.id} className="flex items-center gap-3 px-4 first:pl-0 last:pr-0">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${stage.bar}`} />
                  <div>
                    <p className="text-xs text-gray-500">{stage.label}</p>
                    <p className="text-lg font-bold text-gray-900 tabular-nums leading-tight">{stage.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
