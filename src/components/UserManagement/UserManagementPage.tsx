/**
 * User Management Page
 * Create/manage users and permissions
 */

import React, { useState } from "react";
import { Plus, Edit2, Trash2, Shield, Search } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "local";
  status: "active" | "inactive";
  createdAt: string;
}

const DUMMY_USERS: User[] = [
  {
    id: "u1",
    name: "Admin User",
    email: "admin@vetcms.com",
    role: "admin",
    status: "active",
    createdAt: "Jan 15, 2026",
  },
  {
    id: "u2",
    name: "Sarah Manager",
    email: "sarah@vetcms.com",
    role: "manager",
    status: "active",
    createdAt: "Feb 01, 2026",
  },
  {
    id: "u3",
    name: "John Editor",
    email: "john@vetcms.com",
    role: "local",
    status: "active",
    createdAt: "Feb 15, 2026",
  },
  {
    id: "u4",
    name: "Emily Content",
    email: "emily@vetcms.com",
    role: "local",
    status: "active",
    createdAt: "Mar 01, 2026",
  },
  {
    id: "u5",
    name: "Michael Reviewer",
    email: "michael@vetcms.com",
    role: "manager",
    status: "inactive",
    createdAt: "Mar 10, 2026",
  },
];

const roleColors = {
  admin: { bg: "bg-purple-50", text: "text-purple-700" },
  manager: { bg: "bg-blue-50", text: "text-blue-700" },
  local: { bg: "bg-teal-50", text: "text-teal-700" },
};

const statusColors = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700" },
  inactive: { bg: "bg-gray-100", text: "text-gray-600" },
};

export function UserManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = DUMMY_USERS.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-10">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md pl-11 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-sm font-medium text-gray-900">{user.name}</h3>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          roleColors[user.role].bg
                        } ${roleColors[user.role].text} inline-flex items-center gap-1`}
                      >
                        <Shield size={12} />
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          statusColors[user.status].bg
                        } ${statusColors[user.status].text}`}
                      >
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-5 text-xs text-gray-600">
                      <div>{user.email}</div>
                      <div>Added {user.createdAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-6 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                    <button className="p-2 hover:bg-gray-100 rounded-md transition" title="Edit">
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md transition" title="Delete">
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-sm text-gray-600">No users found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
