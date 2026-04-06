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
  Search, Edit2, Trash2, Shield, Users, UserCog,
  UserPlus, Mail, CheckCircle2, Clock,
} from "lucide-react";
import { InviteUserModal } from "./InviteUserModal";

/* ─── Types ──────────────────────────────────────────────────────────────── */

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

/* ─── Mock Data ──────────────────────────────────────────────────────────── */

const MOCK_USERS: User[] = [
  { id: "u1", name: "Admin User",     email: "admin@atlas.com",   role: "admin",   status: "active",   locations: 9, joinedAt: "Jan 15, 2026", initials: "AU", avatarColor: "from-violet-500 to-violet-700" },
  { id: "u2", name: "Sarah Mitchell", email: "sarah@atlas.com",   role: "manager", status: "active",   locations: 5, joinedAt: "Feb 01, 2026", initials: "SM", avatarColor: "from-blue-400 to-blue-600"    },
  { id: "u3", name: "James Kowalski", email: "james@atlas.com",   role: "manager", status: "active",   locations: 3, joinedAt: "Feb 14, 2026", initials: "JK", avatarColor: "from-blue-500 to-indigo-600"  },
  { id: "u4", name: "Maria Lopez",    email: "maria@atlas.com",   role: "custom",  status: "active",   locations: 1, joinedAt: "Mar 01, 2026", initials: "ML", avatarColor: "from-teal-400 to-teal-600"    },
  { id: "u5", name: "Dev Thakkar",    email: "dev@atlas.com",     role: "custom",  status: "active",   locations: 2, joinedAt: "Mar 10, 2026", initials: "DT", avatarColor: "from-teal-500 to-emerald-600" },
  { id: "u6", name: "Emily Chen",     email: "emily@atlas.com",   role: "custom",  status: "pending",  locations: 0, joinedAt: "Mar 28, 2026", initials: "EC", avatarColor: "from-pink-400 to-pink-600"    },
  { id: "u7", name: "Michael Torres", email: "michael@atlas.com", role: "manager", status: "inactive", locations: 4, joinedAt: "Jan 30, 2026", initials: "MT", avatarColor: "from-gray-400 to-gray-600"    },
];

/* ─── Style Maps ─────────────────────────────────────────────────────────── */

const ROLE_META: Record<UserRole, { icon: React.ElementType; badge: string; label: string }> = {
  admin:   { icon: Shield,  badge: "bg-violet-50 text-violet-700 border border-violet-200", label: "Admin"   },
  manager: { icon: Users,   badge: "bg-blue-50 text-blue-700 border border-blue-200",       label: "Manager" },
  custom:  { icon: UserCog, badge: "bg-teal-50 text-teal-700 border border-teal-200",       label: "Custom"  },
};

const STATUS_META: Record<UserStatus, { icon: React.ElementType; badge: string; label: string }> = {
  active:   { icon: CheckCircle2, badge: "text-emerald-600", label: "Active"   },
  pending:  { icon: Clock,        badge: "text-amber-500",   label: "Pending"  },
  inactive: { icon: Clock,        badge: "text-gray-400",    label: "Inactive" },
};

/* ─── Component ──────────────────────────────────────────────────────────── */

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

  /* ─── Render ── */
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">

      {/* Success banner */}
      {successBanner && (
        <div className="bg-teal-600 text-white text-sm font-medium px-6 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden="true" />
          {successBanner}
        </div>
      )}

      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-gray-900">User Management</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {users.length} users · {users.filter((u) => u.status === "active").length} active
          </p>
        </div>
        <button
          onClick={() => navigate("/users/invite")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors"
        >
          <UserPlus size={15} aria-hidden="true" />
          Invite User
        </button>
      </div>

      <div className="p-6 space-y-4">

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {(["all", "admin", "manager", "custom"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  roleFilter === r
                    ? "bg-teal-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {r === "all" ? "All" : ROLE_META[r].label} ({counts[r]})
              </button>
            ))}
          </div>
        </div>

        {/* User table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_1fr_120px_110px_80px_56px] items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
            {["User", "Email", "Role", "Status", "Locations", ""].map((h) => (
              <span key={h} className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
              <p className="text-sm text-gray-500 font-medium">No users found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((user) => {
                const rm = ROLE_META[user.role];
                const sm = STATUS_META[user.status];
                const RI = rm.icon;
                const SI = sm.icon;
                return (
                  <div
                    key={user.id}
                    className="grid grid-cols-[1fr_1fr_120px_110px_80px_56px] items-center px-5 py-3.5 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Avatar + Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.avatarColor} flex-shrink-0 flex items-center justify-center shadow-sm`}>
                        <span className="text-white text-[11px] font-bold select-none">{user.initials}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400">Joined {user.joinedAt}</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5 min-w-0 pr-4">
                      <Mail size={12} className="text-gray-300 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-gray-500 truncate">{user.email}</span>
                    </div>

                    {/* Role */}
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${rm.badge}`}>
                      <RI size={11} aria-hidden="true" /> {rm.label}
                    </span>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <SI size={13} className={sm.badge} aria-hidden="true" />
                      <span className={`text-xs font-medium ${sm.badge}`}>{sm.label}</span>
                    </div>

                    {/* Locations */}
                    <span className="text-xs text-gray-500">
                      {user.role === "admin" ? "All" : user.locations}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Edit" aria-label="Edit user">
                        <Edit2 size={14} className="text-gray-500" aria-hidden="true" />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 rounded-md transition-colors" title="Remove" aria-label="Remove user">
                        <Trash2 size={14} className="text-red-400" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Role legend */}
        <div className="flex items-center gap-6 px-1">
          {(["admin", "manager", "custom"] as const).map((role) => {
            const { icon: Icon, label } = ROLE_META[role];
            return (
              <div key={role} className="flex items-center gap-1.5">
                <Icon size={12} className="text-gray-400" aria-hidden="true" />
                <span className="text-xs text-gray-400">{label} — {counts[role]}</span>
              </div>
            );
          })}
        </div>

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
