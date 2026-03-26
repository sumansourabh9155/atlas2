/**
 * Clinic Management Page
 * Overview and navigation to clinic management sub-pages
 */

import React from "react";
import { Building2, List, Users, Globe } from "lucide-react";

export function ClinicManagementPage() {
  const managementOptions = [
    {
      title: "Clinic List",
      description: "Manage individual clinic profiles and settings",
      icon: List,
      action: "View Clinics",
      count: 3,
    },
    {
      title: "Group Clinic",
      description: "Organize clinics under parent organizations",
      icon: Users,
      action: "View Groups",
      count: 3,
    },
    {
      title: "Multi-site Clinic",
      description: "Manage clinics with multiple locations",
      icon: Globe,
      action: "View Multi-sites",
      count: 4,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-10">
        {/* Management Options Grid */}
        <div className="grid grid-cols-3 gap-6">
          {managementOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.title}
                className="border border-gray-200 rounded-lg p-8 hover:border-gray-300 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={24} className="text-teal-600" />
                  </div>
                  <span className="px-2 py-0.5 text-xs font-medium rounded bg-teal-50 text-teal-700">
                    {option.count} {option.count === 1 ? "item" : "items"}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{option.title}</h3>
                <p className="text-xs text-gray-600 mb-6">{option.description}</p>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-600 text-white text-xs font-medium rounded-md hover:bg-teal-700 transition">
                  {option.action}
                </button>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-10 grid grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-xs text-gray-600 mb-2">Total Clinics</p>
            <p className="text-3xl font-semibold text-gray-900">10</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-xs text-gray-600 mb-2">Active Groups</p>
            <p className="text-3xl font-semibold text-gray-900">3</p>
          </div>
          <div className="border border-gray-200 rounded-lg p-6">
            <p className="text-xs text-gray-600 mb-2">Multi-site Clinics</p>
            <p className="text-3xl font-semibold text-gray-900">4</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-10 border border-gray-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">About Clinic Management</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Organize and manage your veterinary clinics through three different structures. Individual clinics for
            standalone practices, clinic groups for affiliated organizations, and multi-site clinics for locations
            operating under unified management.
          </p>
        </div>
      </div>
    </div>
  );
}
