/**
 * Table — Composable table primitives for the Atlas design system.
 *
 * Usage:
 *   <Table.Root>
 *     <Table.Header>
 *       <Table.HeaderCell>Name</Table.HeaderCell>
 *       <Table.HeaderCell>Status</Table.HeaderCell>
 *     </Table.Header>
 *     <Table.Body>
 *       <Table.Row index={0}>
 *         <Table.Cell>Acme Corp</Table.Cell>
 *         <Table.Cell><Badge>Active</Badge></Table.Cell>
 *       </Table.Row>
 *     </Table.Body>
 *   </Table.Root>
 *
 * Wrapping with <Table.Wrapper> gives the bordered card container.
 */

import React from "react";

/* ── Wrapper — bordered card around the table ───────────────────── */

function Wrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

/* ── Root — <table> element ─────────────────────────────────────── */

function Root({
  children,
  className = "",
  ...rest
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <table
      className={`w-full text-sm border-collapse ${className}`}
      {...rest}
    >
      {children}
    </table>
  );
}

/* ── Header — <thead> with <tr> built-in ────────────────────────── */

function Header({
  children,
  sticky = false,
  className = "",
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <thead className={sticky ? "sticky top-0 z-10" : ""}>
      <tr className={`bg-gray-50 border-b border-gray-200 ${className}`}>
        {children}
      </tr>
    </thead>
  );
}

/* ── HeaderCell — <th> ──────────────────────────────────────────── */

function HeaderCell({
  children,
  align = "left",
  width,
  className = "",
  ...rest
}: React.ThHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right";
  width?: string | number;
}) {
  return (
    <th
      style={width ? { width } : undefined}
      className={`px-5 py-3 text-${align} text-xs font-semibold text-gray-600 whitespace-nowrap ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

/* ── Body — <tbody> ─────────────────────────────────────────────── */

function Body({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <tbody className={className}>{children}</tbody>;
}

/* ── Row — <tr> with zebra striping + hover ─────────────────────── */

function Row({
  children,
  index,
  className = "",
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement> & {
  /** Row index for automatic zebra striping. Omit to disable. */
  index?: number;
}) {
  const stripe =
    index !== undefined
      ? index % 2 === 0
        ? "bg-white"
        : "bg-gray-50/30"
      : "";

  return (
    <tr
      className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors group ${stripe} ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}

/* ── Cell — <td> ────────────────────────────────────────────────── */

function Cell({
  children,
  align = "left",
  className = "",
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: "left" | "center" | "right";
}) {
  return (
    <td
      className={`px-5 py-3.5 text-${align} ${className}`}
      {...rest}
    >
      {children}
    </td>
  );
}

/* ── EmptyState — full-width empty row ──────────────────────────── */

function EmptyState({
  colSpan,
  icon: Icon,
  title = "No results found",
  subtitle,
}: {
  colSpan: number;
  icon?: React.ElementType;
  title?: string;
  subtitle?: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-16 text-center">
        {Icon && (
          <Icon size={32} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
        )}
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
        )}
      </td>
    </tr>
  );
}

/* ── Pagination — standard table footer ─────────────────────────── */

interface PaginationProps {
  currentPage:  number;
  totalPages:   number;
  totalItems:   number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (count: number) => void;
  itemsPerPageOptions?: number[];
}

const PAGE_BTN =
  "w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors";
const PAGE_BTN_INACTIVE =
  "border border-gray-200 text-gray-600 hover:bg-gray-50";
const PAGE_BTN_ACTIVE =
  "bg-teal-600 text-white border border-teal-600";
const PAGE_BTN_NAV =
  "border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [8, 10, 20],
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Show up to 5 page numbers centered on the current page
  const getVisiblePages = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - maxVisible + 1));
    return Array.from({ length: maxVisible }, (_, i) => start + i);
  };

  return (
    <div className="px-5 py-3 border-t border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
      <p className="text-xs text-gray-500">
        Page{" "}
        <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
        of{" "}
        <span className="font-semibold text-gray-700">{totalPages}</span>
        <span className="ml-3 text-gray-400">·</span>
        <span className="ml-3">
          {startItem}–{endItem} of {totalItems} results
        </span>
      </p>

      <div className="flex items-center gap-1.5">
        {onItemsPerPageChange && (
          <span className="text-xs text-gray-500 mr-2">
            Rows per page:
            <select
              className="ml-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            >
              {itemsPerPageOptions.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </span>
        )}

        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className={`${PAGE_BTN} ${PAGE_BTN_NAV}`}
          aria-label="First page"
        >
          «
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${PAGE_BTN} ${PAGE_BTN_NAV}`}
          aria-label="Previous page"
        >
          ‹
        </button>

        {getVisiblePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${PAGE_BTN} ${page === currentPage ? PAGE_BTN_ACTIVE : PAGE_BTN_INACTIVE}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`${PAGE_BTN} ${PAGE_BTN_NAV}`}
          aria-label="Next page"
        >
          ›
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className={`${PAGE_BTN} ${PAGE_BTN_NAV}`}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
}

/* ── Export as namespace ─────────────────────────────────────────── */

export const Table = {
  Wrapper,
  Root,
  Header,
  HeaderCell,
  Body,
  Row,
  Cell,
  EmptyState,
  Pagination,
};
