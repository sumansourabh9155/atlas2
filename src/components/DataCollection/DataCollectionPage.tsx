/**
 * Data Collection Page
 * Manage vets, services, testimonials
 */

import React, { useState } from "react";
import { Edit2, Trash2, Plus, Search, Users, Briefcase, MessageSquare } from "lucide-react";

interface Veterinarian {
  id: string;
  name: string;
  credentials: string;
  specializations: string[];
  email: string;
  phone: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration: string;
}

interface Testimonial {
  id: string;
  clinicName: string;
  clientName: string;
  rating: number;
  text: string;
}

const DUMMY_VETS: Veterinarian[] = [
  {
    id: "v1",
    name: "Dr. Sarah Mitchell",
    credentials: "DVM",
    specializations: ["Surgery", "Internal Medicine"],
    email: "sarah@clinic.com",
    phone: "+1-555-0101",
  },
  {
    id: "v2",
    name: "Dr. James Chen",
    credentials: "DVM, DACVS",
    specializations: ["Orthopedic Surgery"],
    email: "james@clinic.com",
    phone: "+1-555-0102",
  },
  {
    id: "v3",
    name: "Dr. Emily Rodriguez",
    credentials: "DVM",
    specializations: ["Dermatology", "Allergy"],
    email: "emily@clinic.com",
    phone: "+1-555-0103",
  },
];

const DUMMY_SERVICES: Service[] = [
  { id: "s1", name: "General Checkup", description: "Routine wellness exam and consultation", price: "$75", duration: "30 min" },
  { id: "s2", name: "Dental Cleaning", description: "Professional teeth cleaning and scaling", price: "$300", duration: "1-2 hours" },
  { id: "s3", name: "Orthopedic Surgery", description: "Advanced surgical procedures", price: "$2,500+", duration: "2-4 hours" },
  { id: "s4", name: "Dermatology Consultation", description: "Skin condition evaluation and treatment plan", price: "$150", duration: "45 min" },
];

const DUMMY_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    clinicName: "Austin Paws",
    clientName: "Michael Johnson",
    rating: 5,
    text: "Excellent care and very professional staff. Highly recommended!",
  },
  {
    id: "t2",
    clinicName: "Riverside Vet",
    clientName: "Sarah Williams",
    rating: 5,
    text: "Best veterinary experience we've had. Very caring and attentive.",
  },
  {
    id: "t3",
    clinicName: "Urban Pet Care",
    clientName: "David Martinez",
    rating: 4,
    text: "Great service and knowledgeable doctors. A bit busy on weekends.",
  },
];

export function DataCollectionPage() {
  const [activeTab, setActiveTab] = useState<"vets" | "services" | "testimonials">("vets");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="p-10">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          {[
            { id: "vets" as const, label: "Veterinarians", icon: Users },
            { id: "services" as const, label: "Services", icon: Briefcase },
            { id: "testimonials" as const, label: "Testimonials", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-b-2 ${
                  activeTab === tab.id
                    ? "text-teal-600 border-teal-600"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        {activeTab !== "testimonials" && (
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={activeTab === "vets" ? "Search veterinarians..." : "Search services..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md pl-11 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent bg-white"
              />
            </div>
          </div>
        )}

        {/* Veterinarians Tab */}
        {activeTab === "vets" && (
          <div className="space-y-3">
            {DUMMY_VETS.map((vet) => (
              <div key={vet.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-5 flex-1">
                    <div className="w-10 h-10 rounded-md bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <Users size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-sm font-medium text-gray-900">{vet.name}</h3>
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-teal-50 text-teal-700">{vet.credentials}</span>
                      </div>
                      <div className="flex flex-wrap gap-5 text-xs text-gray-600 mb-2">
                        <div>{vet.specializations.join(", ")}</div>
                        <div>{vet.email}</div>
                        <div>{vet.phone}</div>
                      </div>
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
            ))}
          </div>
        )}

        {/* Services Tab */}
        {activeTab === "services" && (
          <div className="space-y-3">
            {DUMMY_SERVICES.map((service) => (
              <div key={service.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-5 flex-1">
                    <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-1">
                      <Briefcase size={20} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 mb-1">{service.name}</h3>
                      <p className="text-xs text-gray-600 mb-2">{service.description}</p>
                      <div className="flex flex-wrap gap-5 text-xs text-gray-600">
                        <div className="font-medium text-gray-900">{service.price}</div>
                        <div>{service.duration}</div>
                      </div>
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
            ))}
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === "testimonials" && (
          <div className="space-y-3">
            {DUMMY_TESTIMONIALS.map((testimonial) => (
              <div key={testimonial.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-medium text-gray-900">{testimonial.clientName}</h3>
                      <span className="text-xs text-amber-600">★ {testimonial.rating}/5</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{testimonial.clinicName}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{testimonial.text}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
