/**
 * Synthesises FieldChange entries for fields that live only in ClinicContext
 * (seo, navLinks, navConfig, hours, integrations, footerConfig, servicesConfig,
 * vetsConfig) and are therefore NOT produced by generateDeepDiff().
 *
 * Imported by both ApprovalReviewPage (for field highlights in the editor) and
 * ApprovalFlowPage / DraftPanel (for the inline diff view).
 */

import type { FieldChange } from "./diffGenerator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildContextFieldChanges(data: any): FieldChange[] {
  const out: FieldChange[] = [];
  let _idx = 0;

  const mk = (
    path: string,
    section: FieldChange["section"],
    label: string,
    prev = "",
    next = "",
  ): FieldChange => ({
    id:            `ctx-${path}-${_idx++}`,
    path,
    section,
    label,
    previousValue: prev,
    updatedValue:  next,
    humanSummary:  `Updated ${label}`,
    changeType:    "updated",
    dataType:      "string",
    status:        "pending",
  });

  // ── SEO ────────────────────────────────────────────────────────────────────
  if (data?.seo?.metaTitle)       out.push(mk("seo.metaTitle",       "other", "SEO Title",       "", data.seo.metaTitle));
  if (data?.seo?.metaDescription) out.push(mk("seo.metaDescription", "other", "SEO Description", "", data.seo.metaDescription));
  if (data?.seo?.focusKeyword)    out.push(mk("seo.focusKeyword",    "other", "Focus Keyword",   "", data.seo.focusKeyword));
  if (data?.seo?.ogImageUrl)      out.push(mk("seo.ogImageUrl",      "other", "OG Image URL",    "", data.seo.ogImageUrl));
  if (data?.seo?.canonicalUrl)    out.push(mk("seo.canonicalUrl",    "other", "Canonical URL",   "", data.seo.canonicalUrl));

  // ── Navigation ─────────────────────────────────────────────────────────────
  // navLinks per-link diff is now computed at submission time via buildNavLinkDiff()
  // and lives in fieldChanges — we only surface navConfig settings here.
  if (data?.navConfig?.colorScheme)    out.push(mk("navConfig.colorScheme", "other", "Nav Style",     "", data.navConfig.colorScheme));
  if (data?.navConfig?.ctaLabel)       out.push(mk("navConfig.ctaLabel",    "other", "Nav CTA Label", "", data.navConfig.ctaLabel));
  if (data?.navConfig?.isSticky !== undefined)
    out.push(mk("navConfig.isSticky", "other", "Sticky Nav", "", String(data.navConfig.isSticky)));

  // ── Hours ──────────────────────────────────────────────────────────────────
  if (data?.hours) {
    out.push(mk("hours", "other", "Operating Hours", "", "Updated schedule"));
  }

  // ── Services config ────────────────────────────────────────────────────────
  if (data?.servicesConfig?.serviceGroups?.length > 0) {
    const total = (data.servicesConfig.serviceGroups as { selectedServiceIds?: string[] }[])
      .reduce((n, g) => n + (g.selectedServiceIds?.length ?? 0), 0);
    out.push(mk("servicesConfig", "other", `Service Selection (${total})`, "", "Updated"));
  }
  if (data?.servicesConfig?.pricingEnabled) {
    out.push(mk("servicesConfig.pricingEnabled", "other", "Pricing Enabled", "", "true"));
  }

  // ── Vets config ────────────────────────────────────────────────────────────
  if ((data?.vetsConfig?.selectedVetIds?.length ?? 0) > 0) {
    out.push(mk("vetsConfig", "other", `Team Selection (${data.vetsConfig.selectedVetIds.length})`, "", "Updated"));
  }

  // ── Integrations ───────────────────────────────────────────────────────────
  const ig = data?.integrations;
  if (ig) {
    if (ig.googleTagManagerEnabled) out.push(mk("integrations.gtm",      "other", "Google Tag Manager", "", "enabled"));
    if (ig.vetstoriaEnabled)        out.push(mk("integrations.vetstoria", "other", "Vetstoria Booking",  "", "enabled"));
    if (ig.facebookPixelEnabled)    out.push(mk("integrations.fb",       "other", "Facebook Pixel",     "", "enabled"));
    if (ig.microsoftClarityEnabled) out.push(mk("integrations.clarity",  "other", "MS Clarity",         "", "enabled"));
    if (ig.ottoEnabled)             out.push(mk("integrations.otto",     "other", "Otto Widget",        "", "enabled"));
    if (ig.cookieConsentEnabled)    out.push(mk("integrations.cookie",   "other", "Cookie Consent",     "", "enabled"));
  }

  // ── Footer config ──────────────────────────────────────────────────────────
  const fc = data?.footerConfig;
  if (fc) {
    if (fc.subscriptionEnabled)    out.push(mk("footerConfig.subscription", "other", "Newsletter Signup",  "", "enabled"));
    if (fc.additionalLinksEnabled) out.push(mk("footerConfig.extraLinks",   "other", "Footer Extra Links", "", `${fc.additionalLinks?.length ?? 0} links`));
    if (fc.termsOfService)         out.push(mk("footerConfig.terms",        "other", "Terms of Service",   "", fc.termsOfService));
    if (fc.privacyPolicy)          out.push(mk("footerConfig.privacy",      "other", "Privacy Policy",     "", fc.privacyPolicy));
  }

  return out;
}
