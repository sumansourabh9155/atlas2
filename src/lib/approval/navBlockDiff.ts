/**
 * navBlockDiff.ts
 *
 * Granular FieldChange generators for the two arrays that live outside the
 * core ClinicWebsite schema and therefore aren't covered by generateDeepDiff():
 *
 *   • navLinks  — individual nav link additions / removals / edits / reorders
 *   • blocks    — page section additions / removals / visibility toggles / reorders
 *
 * Both functions accept old + new arrays and return a typed FieldChange[] that
 * is merged into fieldChanges at submission time inside submitForApprovalWithDiff.
 */

import type { FieldChange } from "./diffGenerator";

// ─── Shared types (mirrors the context shapes without importing them) ─────────

interface NavLink {
  id:           string;
  label:        string;
  href:         string;
  openInNewTab?: boolean;
}

interface PageBlock {
  blockId?:   string;
  id?:        string;
  type:       string;
  order?:     number;
  isVisible?: boolean;
  [key: string]: unknown;
}

// ─── Block type → human label ──────────────────────────────────────────────────

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  navigation:   "Navigation Bar",
  hero:         "Hero Section",
  services:     "Services Section",
  teams:        "Team Section",
  testimonials: "Testimonials Section",
  contact:      "Contact Section",
  footer:       "Footer",
  stats:        "Stats Section",
  ctaband:      "CTA Band",
  gallery:      "Gallery Section",
  contactinfo:  "Contact Info Block",
  teamspotlight:"Team Spotlight",
  heading:      "Heading Block",
  paragraph:    "Paragraph Block",
  textblock:    "Text Block",
  blockquote:   "Blockquote",
  richtext:     "Rich Text Block",
  empty:        "Empty Block",
  twocol:       "Two Column Layout",
  threecol:     "Three Column Layout",
  cardgrid2:    "2-Column Card Grid",
  cardgrid3:    "3-Column Card Grid",
  teamcards:    "Team Cards",
  herocentered: "Centred Hero",
  herosplit:    "Split Hero",
  contactsplit: "Split Contact",
  faq:          "FAQ Section",
  newsletter:   "Newsletter Section",
  jointeam:     "Join Team Section",
};

function blockLabel(block: PageBlock): string {
  return BLOCK_TYPE_LABELS[block.type] ?? `${block.type.charAt(0).toUpperCase()}${block.type.slice(1)} Section`;
}

// ─── FieldChange factory ──────────────────────────────────────────────────────

let _idx = 0;

function mk(
  path:        string,
  section:     FieldChange["section"],
  label:       string,
  prev:        unknown = undefined,
  next:        unknown = undefined,
  changeType:  FieldChange["changeType"] = "updated",
): FieldChange {
  const summary =
    changeType === "created" ? `Added: ${label}` :
    changeType === "deleted" ? `Removed: ${label}` :
    changeType === "reordered" ? `Reordered: ${label}` :
    `Updated: ${label}`;

  return {
    id:            `nav-block-${path}-${_idx++}`,
    path,
    section,
    label,
    previousValue: prev,
    updatedValue:  next,
    humanSummary:  summary,
    changeType,
    dataType:      "object",
    status:        "pending",
  };
}

// ─── Nav link diff ────────────────────────────────────────────────────────────

/**
 * Compares two navLinks arrays and returns granular FieldChange entries for:
 *   • Added links   (changeType: "created")
 *   • Removed links (changeType: "deleted")
 *   • Label changes (changeType: "updated")
 *   • URL changes   (changeType: "updated")
 *   • openInNewTab  (changeType: "updated")
 *   • Order changes (changeType: "reordered")
 */
export function buildNavLinkDiff(
  baseLinks: NavLink[] | undefined | null,
  newLinks:  NavLink[] | undefined | null,
): FieldChange[] {
  const out: FieldChange[] = [];

  // Nothing to compare
  if (!baseLinks?.length && !newLinks?.length) return out;

  const base = new Map((baseLinks ?? []).map(l => [l.id, l]));
  const next = new Map((newLinks  ?? []).map(l => [l.id, l]));

  // ── Added links ──────────────────────────────────────────────────────────────
  for (const [id, link] of next) {
    if (!base.has(id)) {
      out.push(mk(
        `navLinks.${id}`,
        "other",
        `"${link.label}" added to navigation`,
        undefined,
        `${link.label}  ${link.href}`,
        "created",
      ));
    }
  }

  // ── Removed links ────────────────────────────────────────────────────────────
  for (const [id, link] of base) {
    if (!next.has(id)) {
      out.push(mk(
        `navLinks.${id}`,
        "other",
        `"${link.label}" removed from navigation`,
        `${link.label}  ${link.href}`,
        undefined,
        "deleted",
      ));
    }
  }

  // ── Per-field changes on existing links ──────────────────────────────────────
  for (const [id, newLink] of next) {
    const baseLink = base.get(id);
    if (!baseLink) continue;   // new link — already handled above

    if (baseLink.label !== newLink.label) {
      out.push(mk(
        `navLinks.${id}.label`,
        "other",
        `Nav label changed`,
        baseLink.label,
        newLink.label,
        "updated",
      ));
    }
    if (baseLink.href !== newLink.href) {
      out.push(mk(
        `navLinks.${id}.href`,
        "other",
        `Nav URL changed — "${newLink.label}"`,
        baseLink.href,
        newLink.href,
        "updated",
      ));
    }
    const wasNewTab = baseLink.openInNewTab ?? false;
    const isNewTab  = newLink.openInNewTab  ?? false;
    if (wasNewTab !== isNewTab) {
      out.push(mk(
        `navLinks.${id}.openInNewTab`,
        "other",
        `"${newLink.label}" opens in new tab`,
        wasNewTab,
        isNewTab,
        "updated",
      ));
    }
  }

  // ── Order changes ────────────────────────────────────────────────────────────
  // Only compare IDs that exist in both old and new (ignore added/removed)
  const commonBase = (baseLinks ?? []).filter(l => next.has(l.id)).map(l => l.id);
  const commonNew  = (newLinks  ?? []).filter(l => base.has(l.id)).map(l => l.id);
  if (JSON.stringify(commonBase) !== JSON.stringify(commonNew)) {
    out.push(mk(
      "navLinks.order",
      "other",
      "Navigation order changed",
      commonBase.map(id => base.get(id)!.label).join(" → "),
      commonNew.map(id =>  next.get(id)!.label).join(" → "),
      "reordered",
    ));
  }

  return out;
}

// ─── Block / page section diff ────────────────────────────────────────────────

/**
 * Compares two blocks arrays and returns granular FieldChange entries for:
 *   • Section added      (changeType: "created")
 *   • Section removed    (changeType: "deleted")
 *   • Visibility toggled (changeType: "updated")
 *   • Order changed      (changeType: "reordered")
 */
export function buildBlockDiff(
  baseBlocks: PageBlock[] | undefined | null,
  newBlocks:  PageBlock[] | undefined | null,
): FieldChange[] {
  const out: FieldChange[] = [];

  if (!baseBlocks?.length && !newBlocks?.length) return out;

  // Prefer blockId → id → type as the stable key
  const getId = (b: PageBlock) => b.blockId ?? b.id ?? b.type;

  const base = new Map((baseBlocks ?? []).map(b => [getId(b), b]));
  const next = new Map((newBlocks  ?? []).map(b => [getId(b), b]));

  // ── Added sections ───────────────────────────────────────────────────────────
  for (const [id, block] of next) {
    if (!base.has(id)) {
      out.push(mk(
        `blocks.${id}`,
        "blocks",
        `${blockLabel(block)} added`,
        undefined,
        blockLabel(block),
        "created",
      ));
    }
  }

  // ── Removed sections ─────────────────────────────────────────────────────────
  for (const [id, block] of base) {
    if (!next.has(id)) {
      out.push(mk(
        `blocks.${id}`,
        "blocks",
        `${blockLabel(block)} removed`,
        blockLabel(block),
        undefined,
        "deleted",
      ));
    }
  }

  // ── Visibility changes ───────────────────────────────────────────────────────
  for (const [id, newBlock] of next) {
    const baseBlock = base.get(id);
    if (!baseBlock) continue;
    const wasVisible = baseBlock.isVisible ?? true;
    const isVisible  = newBlock.isVisible  ?? true;
    if (wasVisible !== isVisible) {
      out.push(mk(
        `blocks.${id}.isVisible`,
        "blocks",
        `${blockLabel(newBlock)} ${isVisible ? "shown" : "hidden"}`,
        wasVisible,
        isVisible,
        "updated",
      ));
    }
  }

  // ── Reorder ──────────────────────────────────────────────────────────────────
  const commonBase = (baseBlocks ?? []).filter(b => next.has(getId(b))).map(b => getId(b));
  const commonNew  = (newBlocks  ?? []).filter(b => base.has(getId(b))).map(b => getId(b));
  if (JSON.stringify(commonBase) !== JSON.stringify(commonNew)) {
    const nameOf = (id: string) => blockLabel(next.get(id) ?? base.get(id) ?? { type: id });
    out.push(mk(
      "blocks.order",
      "blocks",
      "Page sections reordered",
      commonBase.map(nameOf).join(" → "),
      commonNew.map(nameOf).join(" → "),
      "reordered",
    ));
  }

  return out;
}
