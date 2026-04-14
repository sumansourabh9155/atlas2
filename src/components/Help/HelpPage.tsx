/**
 * Help & Support Page
 * Docs, video guides, common questions, and contact support.
 */

import React, { useState } from "react";
import {
  BookOpen, Video, MessageCircle, Mail,
  Search, ChevronDown, ChevronUp,
  ExternalLink, Lightbulb, Zap,
} from "lucide-react";
import { surface } from "../../lib/styles/tokens";

/* ── Quick links ─────────────────────────────────────────────────────────── */

const QUICK_LINKS = [
  { icon: BookOpen,        label: "Documentation",   desc: "Full platform guide",         href: "#" },
  { icon: Video,           label: "Video Tutorials", desc: "Step-by-step walkthroughs",   href: "#" },
  { icon: MessageCircle,   label: "Community",       desc: "Forum & user discussions",    href: "#" },
  { icon: Mail,            label: "Contact Support", desc: "Get help from our team",      href: "#" },
];

/* ── FAQ ─────────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: "How do I add a new clinic to the platform?",
    a: "Click the \"+ New Site\" button in the top bar. You'll be taken through a 3-step flow: Hospital Setup (basic info, taxonomy, contact, vets, services), Website Editor (drag-and-drop layout), and Domain Management. All changes auto-save every few seconds.",
  },
  {
    q: "What happens when a custom user submits changes for approval?",
    a: "The submission enters a pending state. Admins and managers see it in the Approval Flow page, where they can review a field-by-field diff, add feedback comments, and approve or request changes. The custom user is notified of the decision.",
  },
  {
    q: "Can I publish multiple clinics at once?",
    a: "Yes. In Site Management → All Sites, select multiple rows using the checkboxes, then choose \"Bulk Publish\" from the bulk action toolbar that appears. Only clinics with complete required fields can be published.",
  },
  {
    q: "How does the media library work?",
    a: "You can drag-and-drop up to 50 files at a time (100 MB each). Images and videos upload in parallel — up to 3 concurrent uploads. Completed files appear in your library instantly. Failed uploads can be retried individually.",
  },
  {
    q: "What roles are available and what can each do?",
    a: "Admin: full access including user management, approvals, and settings. Manager: same as Admin but cannot access Settings. Custom: can create and edit clinic content, submit for approval, and view their own submissions only.",
  },
  {
    q: "How do I import bulk data into the Data Collection tab?",
    a: "Open the Data Collection page and click \"Import CSV\" on any tab (Veterinarians, Services, or Testimonials). Download the template to get the correct column format, fill it in, then drag-drop or choose the file. Invalid rows are highlighted before you confirm the import.",
  },
];

/* ── Guides ──────────────────────────────────────────────────────────────── */

const GUIDES = [
  { icon: Zap,       label: "Getting started in 5 minutes",   time: "5 min" },
  { icon: Lightbulb, label: "Setting up your approval flow",  time: "8 min" },
  { icon: BookOpen,  label: "Multi-site & group management",  time: "10 min" },
  { icon: Video,     label: "Importing clinic data via CSV",  time: "4 min" },
];

/* ── FAQ item ────────────────────────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50 transition-colors text-left gap-4"
      >
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        {open
          ? <ChevronUp   size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
          : <ChevronDown size={15} className="text-gray-400 flex-shrink-0" aria-hidden="true" />
        }
      </button>
      {open && (
        <div className="px-5 pb-4 pt-0 bg-white border-t border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */

export function HelpPage() {
  const [search, setSearch] = useState("");

  const visibleFaq = FAQ_ITEMS.filter(
    (item) =>
      !search ||
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={surface.page}>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-10">

        {/* ── Hero ── */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto">
            <MessageCircle size={22} className="text-teal-600" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">How can we help?</h1>
          <p className="text-sm text-gray-500">Search the docs, browse guides, or contact support.</p>

          {/* Search */}
          <div className="relative max-w-sm mx-auto mt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search help articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search help articles"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* ── Quick links ── */}
        {!search && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Get Support</h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_LINKS.map(({ icon: Icon, label, desc, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                    <Icon size={16} className="text-teal-600" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <ExternalLink size={11} className="text-gray-300" aria-hidden="true" />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* ── Guides ── */}
        {!search && (
          <div>
            <h2 className="text-sm font-bold text-gray-700 mb-3">Popular Guides</h2>
            <div className="space-y-2">
              {GUIDES.map(({ icon: Icon, label, time }) => (
                <button
                  key={label}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-sm transition-all text-left group"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={15} className="text-teal-500" aria-hidden="true" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    {time} read
                    <ExternalLink size={11} className="text-gray-300 group-hover:text-teal-400 transition-colors" aria-hidden="true" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── FAQ ── */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">
            {search ? `Results for "${search}"` : "Frequently Asked Questions"}
          </h2>
          {visibleFaq.length > 0 ? (
            <div className="space-y-2">
              {visibleFaq.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl">
              <p className="text-sm text-gray-400">No results for &ldquo;{search}&rdquo;</p>
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-xs text-teal-600 hover:text-teal-700 transition-colors font-medium"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* ── Contact CTA ── */}
        {!search && (
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-teal-900">Still need help?</p>
              <p className="text-xs text-teal-700 mt-0.5">Our support team typically responds within 2 business hours.</p>
            </div>
            <button className="flex-shrink-0 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors">
              Contact Support
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
