/**
 * industries.ts — Centralized business type / industry definitions.
 *
 * All pages that display a "Business Type" or "Industry" column/filter
 * reference this single list. To add a new industry, add it here only.
 */

export const BUSINESS_TYPES = [
  "Restaurant & Café",
  "Hair & Beauty Salon",
  "Real Estate Agency",
  "Healthcare Clinic",
  "Education & Training",
  "Retail Store",
  "Automotive Services",
  "Pet Services",
  "Warehouse & Logistics",
  "Professional Services",
  "Hotel & Hospitality",
  "Fitness & Wellness",
  "Legal Services",
  "Financial Services",
  "Technology & Software",
  "Entertainment & Events",
  "Construction & Trades",
  "Non-Profit & Community",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

/** Status values shared across all site/location tables */
export const SITE_STATUSES = ["published", "scheduled", "draft", "live_domain"] as const;
export type SiteStatus = (typeof SITE_STATUSES)[number];

/** Centralised status badge styles — import in any table page */
export const STATUS_STYLES: Record<SiteStatus, { badge: string; dot: string; label: string }> = {
  published:   { badge: "bg-teal-50 text-teal-700",   dot: "bg-emerald-400", label: "Published"   },
  scheduled:   { badge: "bg-amber-50 text-amber-700", dot: "bg-orange-400",  label: "Scheduled"   },
  draft:       { badge: "bg-red-50 text-red-600",     dot: "bg-red-400",     label: "Draft"       },
  live_domain: { badge: "bg-blue-50 text-blue-700",   dot: "bg-blue-400",    label: "Live Domain" },
};
