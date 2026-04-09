/**
 * StatusBadge — Pre-configured badge for site publication statuses.
 *
 * Maps the four standard site statuses (published, scheduled, draft,
 * live_domain) to consistent Badge variants with leading dots.
 *
 * Also exports role and approval status helpers.
 */

import React from "react";
import { Badge, type BadgeVariant } from "./Badge";
import type { LucideIcon } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   Site Status Badge
   ═══════════════════════════════════════════════════════════════════ */

type SiteStatus = "published" | "scheduled" | "draft" | "live_domain";

const SITE_STATUS_MAP: Record<SiteStatus, { label: string; variant: BadgeVariant }> = {
  published:   { label: "Published",   variant: "primary"  },
  scheduled:   { label: "Scheduled",   variant: "warning"  },
  draft:       { label: "Draft",       variant: "danger"   },
  live_domain: { label: "Live Domain", variant: "info"     },
};

export function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const s = SITE_STATUS_MAP[status];
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
}

/* ═══════════════════════════════════════════════════════════════════
   Approval Status Badge
   ═══════════════════════════════════════════════════════════════════ */

type ApprovalStatus = "pending" | "approved" | "rejected" | "needs_revision";

const APPROVAL_STATUS_MAP: Record<ApprovalStatus, { label: string; variant: BadgeVariant }> = {
  pending:        { label: "Pending Review",    variant: "warning" },
  approved:       { label: "Approved",          variant: "success" },
  rejected:       { label: "Rejected",          variant: "danger"  },
  needs_revision: { label: "Needs Revision",    variant: "danger"  },
};

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  const s = APPROVAL_STATUS_MAP[status];
  return <Badge variant={s.variant} dot>{s.label}</Badge>;
}

/* ═══════════════════════════════════════════════════════════════════
   Role Badge
   ═══════════════════════════════════════════════════════════════════ */

type UserRole = "admin" | "manager" | "custom";

const ROLE_MAP: Record<UserRole, { label: string; variant: BadgeVariant }> = {
  admin:   { label: "Admin",   variant: "violet"  },
  manager: { label: "Manager", variant: "info"     },
  custom:  { label: "Custom",  variant: "primary"  },
};

export function RoleBadge({
  role,
  icon,
}: {
  role: UserRole;
  icon?: LucideIcon;
}) {
  const r = ROLE_MAP[role];
  return (
    <Badge variant={r.variant} icon={icon} bordered>
      {r.label}
    </Badge>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   User Status
   ═══════════════════════════════════════════════════════════════════ */

type UserStatus = "active" | "pending" | "inactive";

const USER_STATUS_MAP: Record<UserStatus, { label: string; variant: BadgeVariant }> = {
  active:   { label: "Active",   variant: "success" },
  pending:  { label: "Pending",  variant: "warning" },
  inactive: { label: "Inactive", variant: "neutral" },
};

export function UserStatusIndicator({
  status,
  icon: Icon,
}: {
  status: UserStatus;
  icon?: LucideIcon;
}) {
  const s = USER_STATUS_MAP[status];
  const colorClass =
    status === "active"   ? "text-emerald-600" :
    status === "pending"  ? "text-amber-500"   :
                            "text-gray-400";
  return (
    <div className="flex items-center gap-1.5">
      {Icon && <Icon size={13} className={colorClass} aria-hidden="true" />}
      <span className={`text-xs font-medium ${colorClass}`}>{s.label}</span>
    </div>
  );
}
