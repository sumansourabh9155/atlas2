/**
 * DashboardPage — Overview of the Nexio platform.
 * Stats + recent activity. Fully industry-agnostic.
 */

import React from "react";
import { BarChart3, Clock, CheckCircle, TrendingUp, Globe, FileText, ArrowUpRight } from "lucide-react";

const STATS = [
  { label: "Total Sites",       value: 145, delta: "+12 this month", icon: BarChart3,   bg: "bg-blue-50",    icon_color: "text-blue-600"    },
  { label: "Pending Approvals", value: 7,   delta: "3 urgent",       icon: Clock,       bg: "bg-amber-50",   icon_color: "text-amber-600"   },
  { label: "Published",         value: 98,  delta: "↑ 8 this week",  icon: CheckCircle, bg: "bg-emerald-50", icon_color: "text-emerald-600" },
  { label: "Live Domains",      value: 43,  delta: "+5 this month",  icon: Globe,       bg: "bg-teal-50",    icon_color: "text-teal-600"    },
];

const ACTIVITY = [
  {
    title: "Luminary Salon & Spa website updated",
    desc:  "New service pages submitted for review",
    time:  "12 min ago",
    badge: { label: "Pending", color: "bg-amber-100 text-amber-700" },
  },
  {
    title: "Bellwood Bistro & Bar went live",
    desc:  "Domain connected and site published successfully",
    time:  "2 hours ago",
    badge: { label: "Published", color: "bg-teal-100 text-teal-700" },
  },
  {
    title: "Summit Realty Partners — draft saved",
    desc:  "Hero section and contact form updated",
    time:  "5 hours ago",
    badge: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  },
  {
    title: "Pacific Freight & Fulfillment approved",
    desc:  "All changes approved and pushed to production",
    time:  "1 day ago",
    badge: { label: "Published", color: "bg-teal-100 text-teal-700" },
  },
  {
    title: "Bright Minds Learning Academy created",
    desc:  "New site profile initialised, setup in progress",
    time:  "2 days ago",
    badge: { label: "Draft", color: "bg-gray-100 text-gray-600" },
  },
];

const QUICK_ACTIONS = [
  { label: "New Site",       desc: "Start building a new business site",    icon: TrendingUp, action: "/sites/new"           },
  { label: "Review Pending", desc: "7 sites waiting for your approval",     icon: Clock,      action: "/approvals"           },
  { label: "All Sites",      desc: "Browse and manage every site",          icon: BarChart3,  action: "/sites/all"           },
  { label: "Media Library",  desc: "Manage images, logos, and assets",      icon: FileText,   action: "/media-library"       },
];

export function DashboardPage() {
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-8 max-w-7xl mx-auto">

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1.5">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-1">{s.delta}</p>
                  </div>
                  <div className={`${s.bg} rounded-lg p-2.5`}>
                    <Icon size={18} className={s.icon_color} aria-hidden="true" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">

          {/* ── Recent Activity (2/3 width) ── */}
          <div className="col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
                View all <ArrowUpRight size={12} aria-hidden="true" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {ACTIVITY.map((a) => (
                <div key={a.title} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{a.desc}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.badge.color}`}>
                        {a.badge.label}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Quick Actions (1/3 width) ── */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-3 space-y-1">
              {QUICK_ACTIONS.map((q) => {
                const Icon = q.icon;
                return (
                  <button
                    key={q.label}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                      <Icon size={15} className="text-teal-600" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{q.label}</p>
                      <p className="text-xs text-gray-500 truncate">{q.desc}</p>
                    </div>
                    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
