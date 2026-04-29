/**
 * ReviewsPage — Google Reviews Curation & Display System.
 *
 * This component handles BOTH views:
 *   • Locations overview  — grid of location cards (/reviews)
 *   • Location detail     — review curation list  (/reviews/:locationId)
 *
 * URL is the source of truth for which view is active:
 *   /reviews              → list view
 *   /reviews/:locationId  → detail view (TopBar shows ← Google Reviews breadcrumb)
 *
 * The TopBar owns the title ("Google Reviews"), subtitle, and "Sync All" CTA.
 * The page content starts directly with functional controls (search / KPIs / cards).
 *
 * Sync All is triggered by a custom DOM event ("atlas:sync-reviews") fired by
 * App.tsx when the TopBar CTA is clicked — keeps wiring simple without a context.
 */

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  RefreshCw, MapPin, Star,
  TrendingUp, CheckCircle2, Clock, Eye, EyeOff,
  Search, ChevronRight, RotateCcw, Info,
} from "lucide-react";
import { surface } from "../../lib/styles/tokens";
import { Card, CardHeader } from "../ui/Card";
import {
  MOCK_LOCATIONS, MOCK_REVIEWS,
  type GoogleReview, type ReviewLocation, type ReviewStatus,
} from "./reviewsMockData";

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITY HELPERS
═══════════════════════════════════════════════════════════════════════════ */

const AVATAR_GRADIENTS = [
  "from-teal-400 to-teal-600",
  "from-blue-400 to-blue-600",
  "from-violet-400 to-violet-600",
  "from-pink-400 to-pink-600",
  "from-indigo-400 to-indigo-600",
  "from-amber-400 to-amber-600",
  "from-emerald-400 to-emerald-600",
  "from-rose-400 to-rose-600",
];

function authorGradient(name: string): string {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
}

function authorInitials(name: string): string {
  return name.split(" ").map((p) => p[0] ?? "").join("").toUpperCase().slice(0, 2);
}

function timeAgo(iso: string): string {
  const now  = new Date("2026-04-29T23:59:00Z");
  const date = new Date(iso);
  const d    = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d  < 7) return `${d} days ago`;
  if (d < 14) return "1 week ago";
  if (d < 30) return `${Math.floor(d / 7)} weeks ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function lastFetchedLabel(iso: string): string {
  const now  = new Date("2026-04-29T23:59:00Z");
  const hrs  = Math.round((now.getTime() - new Date(iso).getTime()) / 3_600_000);
  if (hrs < 1)  return "Just now";
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function passesAutoFilter(r: GoogleReview): boolean {
  return r.rating >= 4 && r.sentiment_score > 0.5 && r.text.length > 40;
}

function filterFailReasons(r: GoogleReview): string[] {
  const reasons: string[] = [];
  if (r.rating < 4)             reasons.push("Rating below 4★");
  if (r.sentiment_score <= 0.5) reasons.push("Sentiment score ≤ 0.5");
  if (r.text.length <= 40)      reasons.push("Review text too short");
  return reasons;
}

interface ReviewStats { total: number; featured: number; shortlisted: number; hidden: number; unfiltered: number; }

function computeStats(reviews: GoogleReview[]): ReviewStats {
  return reviews.reduce<ReviewStats>(
    (acc, r) => {
      acc.total++;
      if (r.status === "featured")    acc.featured++;
      if (r.status === "shortlisted") acc.shortlisted++;
      if (r.status === "hidden")      acc.hidden++;
      if (r.status === "unfiltered")  acc.unfiltered++;
      return acc;
    },
    { total: 0, featured: 0, shortlisted: 0, hidden: 0, unfiltered: 0 },
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════════════ */

function StarRating({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-px" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill="currentColor"
          className={i <= rating ? "text-amber-400" : "text-gray-200"} aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
  );
}

function SentimentBadge({ score }: { score: number }) {
  if (score > 0.5) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      <TrendingUp size={9} aria-hidden="true" /> Positive · {score.toFixed(2)}
    </span>
  );
  if (score < -0.5) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600 border border-red-100">
      <TrendingUp size={9} className="rotate-180" aria-hidden="true" /> Negative · {score.toFixed(2)}
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" aria-hidden="true" />
      Neutral · {score.toFixed(2)}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REVIEW CARD
═══════════════════════════════════════════════════════════════════════════ */

interface ReviewCardProps {
  review:         GoogleReview;
  onStatusChange: (id: string, status: ReviewStatus) => void;
}

function ReviewCard({ review, onStatusChange }: ReviewCardProps) {
  const gradient    = authorGradient(review.author_name);
  const initials    = authorInitials(review.author_name);
  const autoPass    = passesAutoFilter(review);
  const failReasons = !autoPass ? filterFailReasons(review) : [];

  const actionBar = (() => {
    if (review.status === "featured") return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} aria-hidden="true" /> Featured on website
        </span>
        <button
          onClick={() => onStatusChange(review.id, autoPass ? "shortlisted" : "unfiltered")}
          className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
        >
          Remove
        </button>
      </div>
    );

    if (review.status === "hidden") return (
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
          <EyeOff size={12} aria-hidden="true" /> Hidden
        </span>
        <button
          onClick={() => onStatusChange(review.id, autoPass ? "shortlisted" : "unfiltered")}
          className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <RotateCcw size={11} aria-hidden="true" /> Restore
        </button>
      </div>
    );

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onStatusChange(review.id, "featured")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 text-white hover:bg-teal-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        >
          <CheckCircle2 size={12} aria-hidden="true" /> Feature this review
        </button>
        <button
          onClick={() => onStatusChange(review.id, "hidden")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
        >
          <EyeOff size={12} aria-hidden="true" /> Hide
        </button>
        {review.status === "shortlisted" && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <Clock size={9} aria-hidden="true" /> Auto-shortlisted
          </span>
        )}
      </div>
    );
  })();

  return (
    <div className={`bg-white border rounded-xl p-6 transition-all hover:shadow-sm ${
      review.status === "featured" ? "border-emerald-200 bg-emerald-50/20"
      : review.status === "hidden" ? "border-gray-200 opacity-60 hover:opacity-100"
      : "border-gray-200"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`} aria-hidden="true">
          <span className="text-white text-xs font-bold select-none">{initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-semibold text-gray-900">{review.author_name}</span>
            <StarRating rating={review.rating} />
            <SentimentBadge score={review.sentiment_score} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-gray-400">via Google</span>
            <span className="text-gray-200 select-none">·</span>
            <span className="text-[11px] text-gray-400">{timeAgo(review.review_time)}</span>
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-700 leading-relaxed">{review.text}</p>

      {review.status === "unfiltered" && failReasons.length > 0 && (
        <div className="mt-3 flex items-start gap-1.5 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
          <Info size={12} className="text-gray-400 flex-shrink-0 mt-px" aria-hidden="true" />
          <p className="text-[11px] text-gray-500">
            Did not meet auto-filter: {failReasons.join(" · ")}
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
        {actionBar}
        <span className="text-[10px] text-gray-300 flex-shrink-0 ml-auto">
          {review.text.length} chars
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   LOCATION CARD (Locations grid)
═══════════════════════════════════════════════════════════════════════════ */

interface LocationCardProps {
  location:  ReviewLocation;
  reviews:   GoogleReview[];
  onSelect:  (id: string) => void;
  isSyncing: boolean;
  onSync:    (id: string) => void;
}

function LocationCard({ location, reviews, onSelect, isSyncing, onSync }: LocationCardProps) {
  const stats = computeStats(reviews);

  return (
    <div className="bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all flex flex-col">
      <div className="p-6 flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${location.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`} aria-hidden="true">
          <span className="text-white text-sm font-bold select-none">
            {location.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 leading-snug">{location.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <MapPin size={10} aria-hidden="true" />
            {location.address} · {location.city}, {location.state}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5">
            <StarRating rating={Math.round(location.avgRating)} size={11} />
            <span className="text-xs font-semibold text-gray-700">{location.avgRating}</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-6 pb-5 grid grid-cols-3 gap-4 border-t border-gray-50 pt-4">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Featured</p>
          <p className="text-xl font-bold text-emerald-600 tabular-nums leading-tight mt-0.5">{stats.featured}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">To Review</p>
          <p className={`text-xl font-bold tabular-nums leading-tight mt-0.5 ${stats.shortlisted > 0 ? "text-amber-600" : "text-gray-300"}`}>
            {stats.shortlisted}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Fetched</p>
          <p className="text-xl font-bold text-gray-700 tabular-nums leading-tight mt-0.5">{stats.total}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 min-w-0">
          <RefreshCw size={10} className={isSyncing ? "animate-spin" : ""} aria-hidden="true" />
          <span className="truncate">
            Updated {lastFetchedLabel(location.lastFetched)}
            <span className="text-gray-200 mx-1.5">·</span>
            {location.totalGoogleReviews.toLocaleString()} on Google
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onSync(location.id)}
            disabled={isSyncing}
            title="Sync this location"
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} aria-hidden="true" />
          </button>
          <button
            onClick={() => onSelect(location.id)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            Manage <ChevronRight size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Amber alert when reviews are waiting */}
      {stats.shortlisted > 0 && (
        <div className="rounded-b-xl bg-amber-50 border-t border-amber-100 px-6 py-2.5 flex items-center gap-2">
          <Clock size={11} className="text-amber-500 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs text-amber-700 font-medium">
            {stats.shortlisted} review{stats.shortlisted !== 1 ? "s" : ""} ready for your decision
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIEW 1 — LOCATIONS LIST
═══════════════════════════════════════════════════════════════════════════ */

interface ReviewsLocationsViewProps {
  locations:    ReviewLocation[];
  reviewsMap:   Record<string, GoogleReview[]>;
  onSelect:     (id: string) => void;
  syncingSet:   Set<string>;
  onSync:       (id: string) => void;
  isSyncingAll: boolean;
}

function ReviewsLocationsView({
  locations, reviewsMap, onSelect, syncingSet, onSync, isSyncingAll,
}: ReviewsLocationsViewProps) {
  const [search, setSearch] = useState("");

  const allReviews  = Object.values(reviewsMap).flat();
  const globalStats = computeStats(allReviews);
  const avgRating   = locations.reduce((s, l) => s + l.avgRating, 0) / locations.length;

  const visibleLocations = search.trim()
    ? locations.filter((l) =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.city.toLowerCase().includes(search.toLowerCase())
      )
    : locations;

  return (
    <div className={surface.page}>
      <div className="p-8 space-y-6">

        {/* ── Global KPI strip ── */}
        <div className="grid grid-cols-4 gap-6">
          {[
            {
              label: "Avg Rating",   value: avgRating.toFixed(1),
              sub: `${locations.length} locations`, icon: Star,
              iconCls: "text-amber-500 bg-amber-50", valueCls: "text-amber-600",
            },
            {
              label: "Featured",     value: globalStats.featured,
              sub: "Live on websites", icon: CheckCircle2,
              iconCls: "text-emerald-600 bg-emerald-50", valueCls: "text-emerald-600",
            },
            {
              label: "To Review",    value: globalStats.shortlisted,
              sub: "Auto-shortlisted", icon: Clock,
              iconCls: "text-amber-600 bg-amber-50", valueCls: "text-amber-600",
            },
            {
              label: "Total Fetched", value: globalStats.total,
              sub: `of ${locations.reduce((s, l) => s + l.totalGoogleReviews, 0).toLocaleString()} on Google`,
              icon: Eye,
              iconCls: "text-blue-500 bg-blue-50", valueCls: "text-gray-900",
            },
          ].map(({ label, value, sub, icon: Icon, iconCls, valueCls }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconCls}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                <p className={`text-2xl font-bold tabular-nums leading-tight ${valueCls}`}>{value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 truncate">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Locations card — mirrors Dashboard "Needs Attention" / "Recent Activity" pattern ── */}
        <Card variant="flush">
          <CardHeader
            title="Locations"
            subtitle={
              isSyncingAll
                ? "Syncing all locations…"
                : "Select a location to curate which reviews appear on its website."
            }
            action={
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search locations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-52 pl-9 pr-3 h-9 text-sm bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                />
              </div>
            }
          />

          <div className="p-6">
            {visibleLocations.length === 0 ? (
              <div className="py-16 text-center">
                <MapPin size={32} className="text-gray-200 mx-auto mb-4" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-500">No locations match "{search}"</p>
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {visibleLocations.map((loc) => (
                  <LocationCard
                    key={loc.id}
                    location={loc}
                    reviews={reviewsMap[loc.id] ?? []}
                    onSelect={onSelect}
                    isSyncing={syncingSet.has(loc.id)}
                    onSync={onSync}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   VIEW 2 — LOCATION DETAIL (review curation)
═══════════════════════════════════════════════════════════════════════════ */

type FilterKey = "all" | "shortlisted" | "featured" | "hidden" | "unfiltered";

const FILTER_LABELS: Record<FilterKey, string> = {
  all:         "All",
  shortlisted: "To Review",
  featured:    "Featured",
  hidden:      "Hidden",
  unfiltered:  "Low Quality",
};

const STATUS_ORDER: Record<ReviewStatus, number> = { featured: 0, shortlisted: 1, unfiltered: 2, hidden: 3 };

interface ReviewsDetailViewProps {
  location:       ReviewLocation;
  reviews:        GoogleReview[];
  onStatusChange: (reviewId: string, status: ReviewStatus) => void;
}

function ReviewsDetailView({ location, reviews, onStatusChange }: ReviewsDetailViewProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const stats = computeStats(reviews);

  const sorted = useMemo(() => {
    let list = reviews;
    if (filter !== "all") list = list.filter((r) => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.author_name.toLowerCase().includes(q) || r.text.toLowerCase().includes(q),
      );
    }
    return [...list].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  }, [reviews, filter, search]);

  const filterCounts: Record<FilterKey, number> = {
    all:         reviews.length,
    shortlisted: stats.shortlisted,
    featured:    stats.featured,
    hidden:      stats.hidden,
    unfiltered:  stats.unfiltered,
  };

  return (
    <div className={surface.page}>
      <div className="p-8 space-y-6">

        {/* ── Location info card ── */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-5">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${location.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`} aria-hidden="true">
            <span className="text-white text-base font-bold select-none">
              {location.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900">{location.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin size={11} aria-hidden="true" />
              {location.address} · {location.city}, {location.state}
            </p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1.5">
                <StarRating rating={Math.round(location.avgRating)} size={12} />
                <span className="text-xs font-semibold text-gray-700">{location.avgRating}</span>
              </div>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-500">{location.totalGoogleReviews.toLocaleString()} Google reviews total</span>
              <span className="text-gray-200">·</span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <RefreshCw size={10} aria-hidden="true" />
                Updated {lastFetchedLabel(location.lastFetched)}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 flex-shrink-0 border-l border-gray-100 pl-6">
            {[
              { label: "Featured",  value: stats.featured,    cls: "text-emerald-600" },
              { label: "To Review", value: stats.shortlisted, cls: stats.shortlisted > 0 ? "text-amber-600" : "text-gray-400" },
              { label: "Hidden",    value: stats.hidden,      cls: "text-gray-400" },
            ].map(({ label, value, cls }) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-bold tabular-nums ${cls}`}>{value}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filter bar + search ── */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter pills */}
          <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-label="Filter by status">
            {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => {
              const count  = filterCounts[key];
              const active = filter === key;
              const warn   = key === "shortlisted" && count > 0 && !active;
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    active ? "bg-gray-900 text-white border-gray-900"
                    : warn  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {FILTER_LABELS[key]}
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search */}
          <div className="relative flex-shrink-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search reviews…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 pl-9 pr-3 h-9 text-sm bg-white border border-gray-200 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
            />
          </div>
        </div>

        {/* ── Review list ── */}
        {sorted.length === 0 ? (
          <div className="py-20 text-center">
            <Eye size={32} className="text-gray-200 mx-auto mb-4" aria-hidden="true" />
            <p className="text-sm font-medium text-gray-500">
              {search ? "No reviews match your search" : "No reviews in this category"}
            </p>
            {(search || filter !== "all") && (
              <button onClick={() => { setSearch(""); setFilter("all"); }}
                className="mt-3 text-xs text-teal-600 hover:text-teal-700 font-medium">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending callout */}
            {filter === "all" && stats.shortlisted > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                <Clock size={15} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
                <p className="text-sm text-amber-800 font-medium">
                  {stats.shortlisted} review{stats.shortlisted !== 1 ? "s" : ""} auto-shortlisted and waiting for your decision
                </p>
                <button onClick={() => setFilter("shortlisted")}
                  className="ml-auto flex-shrink-0 text-xs font-semibold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
                  Review now →
                </button>
              </div>
            )}

            {sorted.map((review) => (
              <ReviewCard key={review.id} review={review} onStatusChange={onStatusChange} />
            ))}
          </div>
        )}

        {/* ── Compliance note ── */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
          <Info size={13} className="text-gray-400 flex-shrink-0 mt-px" aria-hidden="true" />
          <p className="text-xs text-gray-500 leading-relaxed">
            <strong className="font-semibold text-gray-600">Google Attribution required:</strong>{" "}
            All featured reviews display "via Google" attribution on your website. Original review text is never edited.
            Reviews auto-expire after 48 hours and are re-fetched to stay compliant.
          </p>
        </div>

      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT — ReviewsPage
   Renders list OR detail depending on URL param (:locationId)
═══════════════════════════════════════════════════════════════════════════ */

type ReviewsMap = Record<string, GoogleReview[]>;

export function ReviewsPage() {
  const navigate                = useNavigate();
  const { locationId }          = useParams<{ locationId?: string }>();

  /* Mutable reviews state — persists across view switches within this component mount */
  const [reviewsMap, setReviewsMap] = useState<ReviewsMap>(() =>
    Object.fromEntries(MOCK_LOCATIONS.map((l) => [l.id, MOCK_REVIEWS[l.id] ?? []])),
  );

  /* Per-location sync */
  const [syncingSet, setSyncingSet] = useState<Set<string>>(new Set());
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const handleSync = useCallback((id: string) => {
    setSyncingSet((prev) => new Set([...prev, id]));
    setTimeout(() => setSyncingSet((prev) => { const n = new Set(prev); n.delete(id); return n; }), 2200);
  }, []);

  const handleSyncAll = useCallback(() => {
    setIsSyncingAll(true);
    setTimeout(() => setIsSyncingAll(false), 2500);
  }, []);

  /* Listen for the TopBar "Sync All" CTA → fired by App.tsx as a custom event */
  useEffect(() => {
    const handler = () => handleSyncAll();
    window.addEventListener("atlas:sync-reviews", handler);
    return () => window.removeEventListener("atlas:sync-reviews", handler);
  }, [handleSyncAll]);

  const handleStatusChange = useCallback(
    (locId: string, reviewId: string, status: ReviewStatus) => {
      setReviewsMap((prev) => ({
        ...prev,
        [locId]: (prev[locId] ?? []).map((r) => r.id === reviewId ? { ...r, status } : r),
      }));
    },
    [],
  );

  const handleSelectLocation = useCallback(
    (id: string) => navigate(`/reviews/${id}`),
    [navigate],
  );

  /* ── Render ── */
  const selectedLocation = MOCK_LOCATIONS.find((l) => l.id === locationId);

  if (locationId && selectedLocation) {
    return (
      <ReviewsDetailView
        location={selectedLocation}
        reviews={reviewsMap[locationId] ?? []}
        onStatusChange={(rid, s) => handleStatusChange(locationId, rid, s)}
      />
    );
  }

  return (
    <ReviewsLocationsView
      locations={MOCK_LOCATIONS}
      reviewsMap={reviewsMap}
      onSelect={handleSelectLocation}
      syncingSet={syncingSet}
      onSync={handleSync}
      isSyncingAll={isSyncingAll}
    />
  );
}
