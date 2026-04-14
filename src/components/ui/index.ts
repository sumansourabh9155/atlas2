/**
 * Atlas Design System — Shared UI primitives.
 *
 * Import from this barrel file:
 *   import { Button, Badge, Card, Input, Table } from "@/components/ui";
 *
 * Tokens (class-string constants) are separate:
 *   import { colors, text, surface, input } from "@/lib/styles/tokens";
 */

export { Button, IconButton } from "./Button";
export type { ButtonProps, IconButtonProps } from "./Button";

export { Badge } from "./Badge";
export type { BadgeProps, BadgeVariant } from "./Badge";

export { Card, CardHeader } from "./Card";
export type { CardProps, CardHeaderProps } from "./Card";

export { Input, Textarea, SearchInput, Select } from "./Input";
export type { InputProps, TextareaProps, SearchInputProps, SelectProps } from "./Input";

export { Table } from "./Table";

export { KpiCard } from "./KpiCard";
export type { KpiCardProps, KpiColor } from "./KpiCard";

export { Avatar, AVATAR_GRADIENTS, gradientFromString } from "./Avatar";
export type { AvatarProps } from "./Avatar";

export { FilterPill } from "./FilterPill";
export type { FilterPillProps } from "./FilterPill";

export { EmptyState } from "./EmptyState";
export type { EmptyStateProps } from "./EmptyState";

export {
  SiteStatusBadge,
  ApprovalStatusBadge,
  RoleBadge,
  UserStatusIndicator,
} from "./StatusBadge";

export { FieldReviewHint } from "./FieldReviewHint";
