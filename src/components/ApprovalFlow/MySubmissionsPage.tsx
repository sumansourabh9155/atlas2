/**
 * MySubmissionsPage — Custom user's view of their content approval workflow.
 *
 * Shows all submissions made by the Custom user across their assigned clinics,
 * with real-time status (Pending / Needs Revision / Approved) and inline diffs.
 *
 * Journey:
 *   Edit content → Submit for Review → Track here → Revise if rejected → Go live
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock, AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  FileEdit, ExternalLink, RotateCcw, Eye,
  MessageSquare, CalendarCheck,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────────────── */

type SubmissionStatus = "pending" | "rejected" | "approved";

interface FieldChange {
  field:  string;
  before: string;
  after:  string;
}

interface AdminFeedback {
  author:    string;
  message:   string;
  date:      string;
}

interface Submission {
  id:          string;
  clinicName:  string;
  clinicInitials: string;
  clinicColor: string;       // Tailwind bg class for avatar
  section:     string;       // human-readable section name
  sectionColor: string;      // Tailwind pill colour classes
  status:      SubmissionStatus;
  submittedAt: string;       // relative label e.g. "2 hours ago"
  changes:     FieldChange[];
  feedback?:   AdminFeedback;
  liveDate?:   string;       // only if approved
}

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const SUBMISSIONS: Submission[] = [
  // ── 1. Needs Revision (highest urgency — appears first) ──
  {
    id: "sub-2",
    clinicName: "Urban Pet Care",
    clinicInitials: "UP",
    clinicColor: "bg-blue-600",
    section: "Website Content",
    sectionColor: "bg-violet-50 text-violet-700 border-violet-200",
    status: "rejected",
    submittedAt: "3 days ago",
    changes: [
      { field: "Hero Image URL",  before: "https://cdn.example.com/hero-old.jpg",     after: "https://cdn.example.com/hero-new.jpg" },
      { field: "Hero Subheadline", before: "Expert care for every pet",              after: "Where every pet feels at home" },
    ],
    feedback: {
      author:  "Admin Sarah",
      message: "Please use the updated hero image from the Media Library — the new branding kit has the correct dimensions and colour profile. The subheadline wording is fine.",
      date:    "Apr 1, 2026",
    },
  },
  // ── 2. Pending Review ──
  {
    id: "sub-1",
    clinicName: "Happy Paws Specialty",
    clinicInitials: "HP",
    clinicColor: "bg-teal-600",
    section: "Website Important Content",
    sectionColor: "bg-amber-50 text-amber-700 border-amber-200",
    status: "pending",
    submittedAt: "2 hours ago",
    changes: [
      { field: "Hero Headline",        before: "Trusted Veterinary Care in Austin",        after: "Austin's Most Trusted Specialty Vet" },
      { field: "Primary CTA Text",     before: "Book an Appointment",                      after: "Schedule Your Visit" },
      { field: "Appointment Page URL", before: "/book",                                    after: "/schedule" },
    ],
  },
  // ── 3. Approved / Live ──
  {
    id: "sub-3",
    clinicName: "Riverside Veterinary",
    clinicInitials: "RV",
    clinicColor: "bg-emerald-600",
    section: "Navigation",
    sectionColor: "bg-blue-50 text-blue-700 border-blue-200",
    status: "approved",
    submittedAt: "1 week ago",
    liveDate: "Apr 1, 2026",
    changes: [
      { field: "Nav CTA Label", before: "Contact Us", after: "Book Now" },
    ],
  },
];

/* ─── Status config ──────────────────────────────────────────────────────── */

const STATUS_CONFIG = {
  pending: {
    label:      "Awaiting Review",
    icon:       Clock,
    pill:       "bg-amber-50 text-amber-700 border border-amber-200",
    dot:        "bg-amber-400",
    headerBorder: "border-l-amber-400",
  },
  rejected: {
    label:      "Revision Requested",
    icon:       AlertCircle,
    pill:       "bg-red-50 text-red-700 border border-red-200",
    dot:        "bg-red-500",
    headerBorder: "border-l-red-400",
  },
  approved: {
    label:      "Live",
    icon:       CheckCircle2,
    pill:       "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot:        "bg-emerald-500",
    headerBorder: "border-l-emerald-500",
  },
} satisfies Record<SubmissionStatus, {
  label: string; icon: React.ElementType;
  pill: string; dot: string; headerBorder: string;
}>;

type FilterTab = "all" | SubmissionStatus;

/* ─── Component ──────────────────────────────────────────────────────────── */

export function MySubmissionsPage() {
  const navigate = useNavigate();
  const [filter,   setFilter]   = useState<FilterTab>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  /* KPI counts */
  const counts = {
    pending:  SUBMISSIONS.filter((s) => s.status === "pending").length,
    rejected: SUBMISSIONS.filter((s) => s.status === "rejected").length,
    approved: SUBMISSIONS.filter((s) => s.status === "approved").length,
  };

  /* Sorted: rejected first, then pending, then approved */
  const ORDER: Record<SubmissionStatus, number> = { rejected: 0, pending: 1, approved: 2 };
  const filtered = SUBMISSIONS
    .filter((s) => filter === "all" || s.status === filter)
    .sort((a, b) => ORDER[a.status] - ORDER[b.status]);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const TABS: { key: FilterTab; label: string; count?: number }[] = [
    { key: "all",      label: "All",              count: SUBMISSIONS.length },
    { key: "rejected", label: "Needs Revision",   count: counts.rejected    },
    { key: "pending",  label: "Pending Review",   count: counts.pending     },
    { key: "approved", label: "Approved",          count: counts.approved    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="p-6 max-w-5xl mx-auto space-y-4">

        {/* ── Status summary strip — KPI pills + description ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-xs text-gray-400">Content changes you've submitted for admin review</p>
          <div className="flex items-center gap-2">
            {counts.rejected > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border bg-red-50 text-red-700 border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
                {counts.rejected} Needs Revision
              </span>
            )}
            {counts.pending > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden="true" />
                {counts.pending} Pending
              </span>
            )}
            {counts.approved > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                {counts.approved} Live
              </span>
            )}
          </div>
        </div>

        {/* ── How it works banner (shown only when there's a revision needed) ── */}
        {counts.rejected > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 flex items-start gap-3">
            <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-red-800">Action required on {counts.rejected} submission{counts.rejected > 1 ? "s" : ""}</p>
              <p className="text-xs text-red-600 mt-0.5">
                An admin has requested changes. Review the feedback below, update your content in the editor, then resubmit for approval.
              </p>
            </div>
          </div>
        )}

        {/* ── Filter tabs ── */}
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-2 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                filter === tab.key
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  filter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Submission cards ── */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl px-6 py-12 text-center">
            <CheckCircle2 size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-400">No submissions in this category</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((sub) => {
              const cfg      = STATUS_CONFIG[sub.status];
              const StatusIcon = cfg.icon;
              const isOpen   = expanded.has(sub.id);

              return (
                <div
                  key={sub.id}
                  className={`bg-white border border-gray-200 rounded-xl overflow-hidden border-l-4 ${cfg.headerBorder}`}
                >
                  {/* ── Card header ── */}
                  <div className="px-5 py-4 flex items-start gap-4">
                    {/* Clinic avatar */}
                    <div className={`w-9 h-9 rounded-lg ${sub.clinicColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {sub.clinicInitials}
                    </div>

                    {/* Clinic + section info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{sub.clinicName}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded-full border ${sub.sectionColor}`}>
                          {sub.section}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <CalendarCheck size={11} aria-hidden="true" />
                          Submitted {sub.submittedAt}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">{sub.changes.length} field{sub.changes.length !== 1 ? "s" : ""} changed</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full border flex-shrink-0 ${cfg.pill}`}>
                      <StatusIcon size={11} aria-hidden="true" />
                      {sub.status === "approved" && sub.liveDate
                        ? `Live since ${sub.liveDate}`
                        : cfg.label}
                    </div>
                  </div>

                  {/* ── Admin feedback (rejected only) ── */}
                  {sub.status === "rejected" && sub.feedback && (
                    <div className="mx-5 mb-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare size={12} className="text-amber-600" aria-hidden="true" />
                        <span className="text-[11px] font-semibold text-amber-800">Admin Feedback</span>
                        <span className="text-[11px] text-amber-600 ml-auto">{sub.feedback.author} · {sub.feedback.date}</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">{sub.feedback.message}</p>
                    </div>
                  )}

                  {/* ── Expandable diff table ── */}
                  {isOpen && (
                    <div className="mx-5 mb-3 border border-gray-100 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 border-b border-gray-100 px-4 py-2 flex items-center gap-2">
                        <FileEdit size={12} className="text-gray-400" aria-hidden="true" />
                        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Changes Detail</span>
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-1/4">Field</th>
                            <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-[37.5%]">Before</th>
                            <th className="text-left px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider w-[37.5%]">After</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.changes.map((change, i) => (
                            <tr key={i} className={`border-b border-gray-50 last:border-0 ${i % 2 === 1 ? "bg-gray-50/40" : ""}`}>
                              <td className="px-4 py-2.5 font-semibold text-gray-600">{change.field}</td>
                              <td className="px-4 py-2.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-red-50 text-red-700 line-through text-[11px] max-w-[200px] truncate" title={change.before}>
                                  {change.before}
                                </span>
                              </td>
                              <td className="px-4 py-2.5">
                                <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] max-w-[200px] truncate" title={change.after}>
                                  {change.after}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Card footer: actions ── */}
                  <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/40">
                    {/* Toggle changes */}
                    <button
                      onClick={() => toggleExpand(sub.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                    >
                      {isOpen ? (
                        <><ChevronUp size={13} aria-hidden="true" /> Hide Changes</>
                      ) : (
                        <><ChevronDown size={13} aria-hidden="true" /> View Changes</>
                      )}
                    </button>

                    {/* Status-specific actions */}
                    <div className="flex items-center gap-2">
                      {sub.status === "rejected" && (
                        <button
                          onClick={() => navigate("/my-submissions/revise", {
                            state: {
                              mode: "custom-revise",
                              clinicName: sub.clinicName,
                              submissionId: sub.id,
                            },
                          })}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                        >
                          <RotateCcw size={11} aria-hidden="true" />
                          Revise &amp; Resubmit
                          <ExternalLink size={10} aria-hidden="true" className="opacity-70" />
                        </button>
                      )}
                      {sub.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                          Awaiting admin review
                        </span>
                      )}
                      {sub.status === "approved" && (
                        <button
                          onClick={() => navigate("/sites/all")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors"
                        >
                          <Eye size={11} aria-hidden="true" />
                          View Live Site
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── How the approval flow works — info footer ── */}
        <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 mt-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">How the approval flow works</p>
          <div className="flex items-start gap-0">
            {[
              { step: "1", label: "Edit content",   desc: "Make changes in the Website Editor",             color: "bg-teal-600" },
              { step: "2", label: "Submit",          desc: "Click \"Submit for Review\" — not Publish",       color: "bg-amber-500" },
              { step: "3", label: "Admin reviews",   desc: "An admin checks your changes within 24–48 hrs",  color: "bg-blue-500" },
              { step: "4", label: "Goes live",       desc: "Approved changes are published automatically",   color: "bg-emerald-600" },
            ].map((item, i, arr) => (
              <div key={item.step} className="flex items-center flex-1 min-w-0">
                <div className="flex flex-col items-center min-w-0 flex-1">
                  <div className={`w-7 h-7 rounded-full ${item.color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                    {item.step}
                  </div>
                  <p className="text-xs font-semibold text-gray-700 mt-2 text-center">{item.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 text-center leading-tight px-1">{item.desc}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="w-8 h-px bg-gray-200 flex-shrink-0 mb-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}

