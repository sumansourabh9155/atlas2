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
  Mail, CheckCircle2, Clock,
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
  const navigate = useNavigate(); // used for invite redirect on TopBar CTA

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

      <div className="p-6 space-y-4">

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative min-w-[240px]">
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
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                  roleFilter === r
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                {r === "all" ? "All" : ROLE_META[r].label} ({counts[r]})
              </button>
            ))}
          </div>
        </div>

        {/* User table — matches platform table pattern */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 w-[260px]">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 w-[120px]">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 w-[110px]">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 w-[90px]">Locations</th>
                <th className="px-5 py-3 w-[64px]" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <Users size={32} className="text-gray-200 mx-auto mb-3" aria-hidden="true" />
                    <p className="text-sm text-gray-500 font-medium">No users found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((user, idx) => {
                  const rm = ROLE_META[user.role];
                  const sm = STATUS_META[user.status];
                  const RI = rm.icon;
                  const SI = sm.icon;
                  return (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-100 last:border-0 hover:bg-gray-50/70 transition-colors group ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* Avatar + Name */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${user.avatarColor} flex-shrink-0 flex items-center justify-center shadow-sm`}>
                            <span className="text-white text-[11px] font-bold select-none">{user.initials}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                            <p className="text-[11px] text-gray-400">Joined {user.joinedAt}</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Mail size={12} className="text-gray-300 flex-shrink-0" aria-hidden="true" />
                          <span className="text-xs text-gray-500 truncate">{user.email}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${rm.badge}`}>
                          <RI size={11} aria-hidden="true" /> {rm.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <SI size={13} className={sm.badge} aria-hidden="true" />
                          <span className={`text-xs font-medium ${sm.badge}`}>{sm.label}</span>
                        </div>
                      </td>

                      {/* Locations */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs text-gray-500">
                          {user.role === "admin" ? "All" : user.locations}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" title="Edit" aria-label="Edit user">
                            <Edit2 size={13} className="text-gray-400" aria-hidden="true" />
                          </button>
                          <button className="p-1.5 hover:bg-red-50 rounded-md transition-colors" title="Remove" aria-label="Remove user">
                            <Trash2 size={13} className="text-red-400" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Summary row */}
        <p className="text-xs text-gray-400 px-1">
          {filtered.length} of {users.length} users
          {roleFilter !== "all" && ` · filtered by ${ROLE_META[roleFilter].label}`}
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
