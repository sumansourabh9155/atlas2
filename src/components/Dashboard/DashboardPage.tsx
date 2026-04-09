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
  AlertCircle, ArrowUpRight,
  ChevronRight, RefreshCw,
  Building2, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KpiCard } from "../ui/KpiCard";
import { Card, CardHeader } from "../ui/Card";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { FilterPill } from "../ui/FilterPill";
import { surface, text } from "../../lib/styles/tokens";

/* ─── Types ──────────────────────────────────────────────────────── */

type ActivityType = "published" | "submitted" | "approved" | "rejected" | "created" | "updated" | "domain";
type UrgencyLevel = "critical" | "warning" | "info";

/* ─── Mock Data ──────────────────────────────────────────────────── */

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

const VERB_VARIANT: Record<string, "primary" | "warning" | "success" | "danger" | "neutral" | "info" | "violet"> = {
  submitted: "warning",
  published: "primary",
  approved:  "success",
  rejected:  "danger",
  created:   "neutral",
  updated:   "info",
  domain:    "violet",
};

const ACTIVITY_FEED = [
  { id: "f1", actor: "Sarah M.",  initials: "SM", gradient: "from-violet-500 to-violet-700", verb: "submitted",  site: "Luminary Salon & Spa",            industry: "Hair & Beauty Salon",    time: "2m ago",  action: "Review" },
  { id: "f2", actor: "James K.",  initials: "JK", gradient: "from-blue-400 to-blue-600",     verb: "published",  site: "Bellwood Bistro & Bar",           industry: "Restaurant & Café",      time: "1h ago",  action: "View" },
  { id: "f3", actor: "Admin",     initials: "AD", gradient: "from-teal-500 to-teal-700",     verb: "approved",   site: "Summit Realty Partners",          industry: "Real Estate Agency",     time: "3h ago",  action: "View" },
  { id: "f4", actor: "Maria L.",  initials: "ML", gradient: "from-pink-400 to-pink-600",     verb: "created",    site: "Harbor City Auto Care",           industry: "Automotive Services",    time: "5h ago",  action: "Edit" },
  { id: "f5", actor: "Dev T.",    initials: "DT", gradient: "from-indigo-500 to-indigo-700", verb: "updated",    site: "Midtown Family Health Center",    industry: "Healthcare Clinic",      time: "7h ago",  action: "View" },
  { id: "f6", actor: "Sarah M.",  initials: "SM", gradient: "from-violet-500 to-violet-700", verb: "rejected",   site: "Blue Ridge Outdoor & Apparel",   industry: "Retail Store",           time: "1d ago",  action: "Edit" },
  { id: "f7", actor: "James K.",  initials: "JK", gradient: "from-blue-400 to-blue-600",     verb: "published",  site: "Pawsome Pet Boarding & Grooming", industry: "Pet Services",           time: "1d ago",  action: "View" },
  { id: "f8", actor: "Admin",     initials: "AD", gradient: "from-teal-500 to-teal-700",     verb: "domain",     site: "Apex Consulting Group",          industry: "Professional Services",  time: "2d ago",  action: "View" },
];

/* ─── Main Component ─────────────────────────────────────────────── */

export function DashboardPage() {
  const navigate = useNavigate();
  const [activityFilter, setActivityFilter] = useState<ActivityType | "all">("all");

  const filteredActivity = activityFilter === "all"
    ? ACTIVITY_FEED
    : ACTIVITY_FEED.filter((f) => f.verb === activityFilter);

  const totalSites = PIPELINE_STAGES.reduce((s, p) => s + p.count, 0);
  const criticalCount = ATTENTION_ITEMS.filter((a) => a.urgency === "critical").length;

  return (
    <div className={surface.page}>
      <div className="p-6 space-y-4">

        {/* ═══ ROW 1 — KPI Stat Cards ═══ */}
        <div className="grid grid-cols-4 gap-4">
          <KpiCard label="Total Sites"       value={145} icon={Building2}    color="blue"    delta="+12 this month" deltaUp onClick={() => navigate("/sites/all")} />
          <KpiCard label="Published"         value={98}  icon={CheckCircle2} color="emerald" delta="+8 this week"   deltaUp onClick={() => navigate("/sites/all")} />
          <KpiCard label="Pending Approvals" value={7}   icon={Clock}        color="amber"   delta="3 urgent today" deltaUp={false} onClick={() => navigate("/approvals")} />
          <KpiCard label="Live Domains"      value={43}  icon={Globe}        color="teal"    delta="+5 this month"  deltaUp onClick={() => navigate("/sites/all")} />
        </div>

        {/* ═══ ROW 2 — Needs Attention | Recent Activity ═══ */}
        <div className="grid grid-cols-3 gap-4">

          {/* Needs Attention */}
          <Card variant="flush">
            <CardHeader
              title="Needs Attention"
              action={
                criticalCount > 0 ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {criticalCount}
                  </span>
                ) : undefined
              }
            />
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
                        <p className={`${text.caption} mt-0.5 leading-snug line-clamp-2`}>{item.detail}</p>
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
          </Card>

          {/* Recent Activity */}
          <Card variant="flush" className="col-span-2">
            <CardHeader
              title="Recent Activity"
              action={
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {(["all", "submitted", "published", "approved", "rejected", "created"] as const).map((f) => (
                      <FilterPill
                        key={f}
                        active={activityFilter === f}
                        onClick={() => setActivityFilter(f)}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </FilterPill>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate("/approvals")}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 flex-shrink-0"
                  >
                    View all <ArrowUpRight size={12} />
                  </button>
                </div>
              }
            />
            <div className="divide-y divide-gray-50">
              {filteredActivity.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">No activity for this filter</div>
              ) : (
                filteredActivity.map((item) => (
                  <div key={item.id} className="px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar initials={item.initials} gradient={item.gradient} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-gray-800">{item.actor}</span>
                          <Badge variant={VERB_VARIANT[item.verb] ?? "neutral"} size="sm">{item.verb}</Badge>
                          <span className="text-xs text-gray-700 truncate max-w-[180px]">{item.site}</span>
                        </div>
                        <p className={text.caption + " mt-0.5"}>{item.industry}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={text.caption + " whitespace-nowrap"}>{item.time}</span>
                        <button className="text-[11px] font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-2 py-1 rounded transition-colors">
                          {item.action}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* ═══ ROW 3 — Publication Pipeline ═══ */}
        <Card variant="flush">
          <CardHeader
            title="Publication Pipeline"
            subtitle={`${totalSites} total sites across all stages`}
            action={
              <button
                onClick={() => navigate("/sites/all")}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
              >
                Manage all <ArrowUpRight size={12} />
              </button>
            }
          />
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
                    <p className={text.bodySmall}>{stage.label}</p>
                    <p className="text-lg font-bold text-gray-900 tabular-nums leading-tight">{stage.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
