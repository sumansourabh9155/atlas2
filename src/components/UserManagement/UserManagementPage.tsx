/**
 * UserManagementPage — List of platform users + Invite User modal.
 *
 * Opens InviteUserModal when:
 *  - "Invite User" button in the page header is clicked, OR
 *  - TopBar CTA fires invite-user action (navigate state: { openInvite })
 */

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Edit2, Trash2, Shield, Users, UserCog,
  Mail, CheckCircle2, Clock,
} from "lucide-react";
import { InviteUserModal } from "./InviteUserModal";
import { SearchInput } from "../ui/Input";
import { FilterPill } from "../ui/FilterPill";
import { Avatar } from "../ui/Avatar";
import { RoleBadge, UserStatusIndicator } from "../ui/StatusBadge";
import { IconButton } from "../ui/Button";
import { Table } from "../ui/Table";
import { surface, text } from "../../lib/styles/tokens";

/* ─── Types ──────────────────────────────────────────────────────── */

type UserRole   = "admin" | "manager" | "custom";
type UserStatus = "active" | "pending" | "inactive";

interface User {
  id:          string;
  name:        string;
  email:       string;
  role:        UserRole;
  status:      UserStatus;
  locations:   number;
  joinedAt:    string;
  initials:    string;
  avatarColor: string;
}

/* ─── Mock Data ──────────────────────────────────────────────────── */

const MOCK_USERS: User[] = [
  { id: "u1", name: "Admin User",     email: "admin@atlas.com",   role: "admin",   status: "active",   locations: 9, joinedAt: "Jan 15, 2026", initials: "AU", avatarColor: "from-violet-500 to-violet-700" },
  { id: "u2", name: "Sarah Mitchell", email: "sarah@atlas.com",   role: "manager", status: "active",   locations: 5, joinedAt: "Feb 01, 2026", initials: "SM", avatarColor: "from-blue-400 to-blue-600"    },
  { id: "u3", name: "James Kowalski", email: "james@atlas.com",   role: "manager", status: "active",   locations: 3, joinedAt: "Feb 14, 2026", initials: "JK", avatarColor: "from-blue-500 to-indigo-600"  },
  { id: "u4", name: "Maria Lopez",    email: "maria@atlas.com",   role: "custom",  status: "active",   locations: 1, joinedAt: "Mar 01, 2026", initials: "ML", avatarColor: "from-teal-400 to-teal-600"    },
  { id: "u5", name: "Dev Thakkar",    email: "dev@atlas.com",     role: "custom",  status: "active",   locations: 2, joinedAt: "Mar 10, 2026", initials: "DT", avatarColor: "from-teal-500 to-emerald-600" },
  { id: "u6", name: "Emily Chen",     email: "emily@atlas.com",   role: "custom",  status: "pending",  locations: 0, joinedAt: "Mar 28, 2026", initials: "EC", avatarColor: "from-pink-400 to-pink-600"    },
  { id: "u7", name: "Michael Torres", email: "michael@atlas.com", role: "manager", status: "inactive", locations: 4, joinedAt: "Jan 30, 2026", initials: "MT", avatarColor: "from-gray-400 to-gray-600"    },
];

import type { LucideIcon } from "lucide-react";

const ROLE_ICON: Record<UserRole, LucideIcon> = {
  admin: Shield, manager: Users, custom: UserCog,
};

const STATUS_ICON: Record<UserStatus, LucideIcon> = {
  active: CheckCircle2, pending: Clock, inactive: Clock,
};

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin", manager: "Manager", custom: "Custom",
};

/* ─── Component ──────────────────────────────────────────────────── */

export function UserManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery,   setSearchQuery]   = useState("");
  const [roleFilter,    setRoleFilter]    = useState<UserRole | "all">("all");
  const [users,         setUsers]         = useState<User[]>(MOCK_USERS);
  const [inviteOpen,    setInviteOpen]    = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  /* Show success banner when returning from InviteUserPage */
  const navState = location.state as { invited?: string } | null;
  useEffect(() => {
    if (navState?.invited) {
      setSuccessBanner(`Invitation sent to ${navState.invited}`);
      setTimeout(() => setSuccessBanner(null), 4000);
    }
  }, [navState?.invited]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase())
      || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleInvited = (name: string, email: string, role: UserRole) => {
    const initials = name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
    const avatarColors = ["from-blue-400 to-blue-600", "from-teal-400 to-teal-600", "from-pink-400 to-pink-600"];
    const newUser: User = {
      id:          `u${Date.now()}`,
      name, email, role,
      status:      "pending",
      locations:   0,
      joinedAt:    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      initials,
      avatarColor: avatarColors[Math.floor(Math.random() * avatarColors.length)],
    };
    setUsers((prev) => [newUser, ...prev]);
    setSuccessBanner(`Invitation sent to ${email}`);
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const counts = { all: users.length, admin: 0, manager: 0, custom: 0 };
  users.forEach((u) => { counts[u.role]++; });

  return (
    <div className={surface.page}>

      {/* Success banner */}
      {successBanner && (
        <div className="bg-teal-600 text-white text-sm font-medium px-6 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden="true" />
          {successBanner}
        </div>
      )}

      <div className="p-8 space-y-6">

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            wrapperClassName="min-w-[240px]"
          />
          <div className="flex items-center gap-1.5">
            {(["all", "admin", "manager", "custom"] as const).map((r) => (
              <FilterPill
                key={r}
                active={roleFilter === r}
                variant="bordered"
                onClick={() => setRoleFilter(r)}
              >
                {r === "all" ? "All" : ROLE_LABEL[r]} ({counts[r]})
              </FilterPill>
            ))}
          </div>
        </div>

        {/* User table */}
        <Table.Wrapper>
          <Table.Root>
            <Table.Header>
              <Table.HeaderCell width="260px">User</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell width="120px">Role</Table.HeaderCell>
              <Table.HeaderCell width="110px">Status</Table.HeaderCell>
              <Table.HeaderCell width="90px">Locations</Table.HeaderCell>
              <Table.HeaderCell width="64px" />
            </Table.Header>

            <Table.Body>
              {filtered.length === 0 ? (
                <Table.EmptyState
                  colSpan={6}
                  icon={Users}
                  title="No users found"
                  subtitle="Try adjusting your search or filter"
                />
              ) : (
                filtered.map((user, idx) => (
                  <Table.Row key={user.id} index={idx}>
                    {/* Avatar + Name */}
                    <Table.Cell>
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar initials={user.initials} gradient={user.avatarColor} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className={text.caption}>Joined {user.joinedAt}</p>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Email */}
                    <Table.Cell>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail size={12} className="text-gray-300 flex-shrink-0" aria-hidden="true" />
                        <span className={text.bodySmall + " truncate"}>{user.email}</span>
                      </div>
                    </Table.Cell>

                    {/* Role */}
                    <Table.Cell>
                      <RoleBadge role={user.role} icon={ROLE_ICON[user.role]} />
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell>
                      <UserStatusIndicator status={user.status} icon={STATUS_ICON[user.status]} />
                    </Table.Cell>

                    {/* Locations */}
                    <Table.Cell>
                      <span className={text.bodySmall}>
                        {user.role === "admin" ? "All" : user.locations}
                      </span>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton icon={Edit2} label="Edit user" size="sm" />
                        <IconButton icon={Trash2} label="Remove user" size="sm" variant="danger" />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Root>
        </Table.Wrapper>

        {/* Summary row */}
        <p className={text.caption + " px-1"}>
          {filtered.length} of {users.length} users
          {roleFilter !== "all" && ` · filtered by ${ROLE_LABEL[roleFilter]}`}
        </p>

      </div>

      {/* Invite modal */}
      <InviteUserModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={handleInvited}
      />
    </div>
  );
}
