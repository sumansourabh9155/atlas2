/**
 * Data Collection Page — Manage vets, services, testimonials.
 *
 * Bulk import:
 *  - "Import CSV" button on each tab opens 3-step CSVImportModal
 *  - Tab-specific schemas define columns, validation, and example rows
 *  - Parsed + validated rows are previewed before importing
 *  - Valid rows are added to the list; invalid rows are skipped with summary
 */

import React, { useState } from "react";
import { Edit2, Trash2, Plus, Users, Briefcase, MessageSquare, Upload } from "lucide-react";
import { Badge } from "../ui/Badge";
import { IconButton } from "../ui/Button";
import { SearchInput } from "../ui/Input";
import { EmptyState } from "../ui/EmptyState";
import { ConfirmDialog, type ConfirmState } from "../ui/ConfirmDialog";
import { ToastContainer, useToast } from "../ui/Toast";
import { CSVImportModal, type CSVSchema, type ParsedRow } from "../ui/CSVImportModal";
import { surface } from "../../lib/styles/tokens";

/* ── Types ──────────────────────────────────────────────────────── */

interface Veterinarian { id: string; name: string; credentials: string; specializations: string[]; email: string; phone: string; }
interface Service       { id: string; name: string; description: string; price: string; duration: string; }
interface Testimonial   { id: string; clinicName: string; clientName: string; rating: number; text: string; }

/* ── Mock Data ──────────────────────────────────────────────────── */

const INIT_VETS: Veterinarian[] = [
  { id: "v1", name: "Dr. Sarah Mitchell",  credentials: "DVM",         specializations: ["Surgery", "Internal Medicine"], email: "sarah@clinic.com", phone: "+1-555-0101" },
  { id: "v2", name: "Dr. James Chen",      credentials: "DVM, DACVS",  specializations: ["Orthopedic Surgery"],           email: "james@clinic.com", phone: "+1-555-0102" },
  { id: "v3", name: "Dr. Emily Rodriguez", credentials: "DVM",         specializations: ["Dermatology", "Allergy"],       email: "emily@clinic.com", phone: "+1-555-0103" },
];

const INIT_SERVICES: Service[] = [
  { id: "s1", name: "General Checkup",          description: "Routine wellness exam and consultation",  price: "$75",     duration: "30 min"  },
  { id: "s2", name: "Dental Cleaning",           description: "Professional teeth cleaning and scaling", price: "$300",    duration: "1-2 hours" },
  { id: "s3", name: "Orthopedic Surgery",        description: "Advanced surgical procedures",           price: "$2,500+", duration: "2-4 hours" },
  { id: "s4", name: "Dermatology Consultation",  description: "Skin condition evaluation and treatment", price: "$150",    duration: "45 min"  },
];

const INIT_TESTIMONIALS: Testimonial[] = [
  { id: "t1", clinicName: "Austin Paws",   clientName: "Michael Johnson", rating: 5, text: "Excellent care and very professional staff. Highly recommended!" },
  { id: "t2", clinicName: "Riverside Vet", clientName: "Sarah Williams",  rating: 5, text: "Best veterinary experience we've had. Very caring and attentive." },
  { id: "t3", clinicName: "Urban Pet Care",clientName: "David Martinez",  rating: 4, text: "Great service and knowledgeable doctors. A bit busy on weekends." },
];

/* ── CSV Schemas ─────────────────────────────────────────────────── */

const VET_SCHEMA: CSVSchema = {
  entityName: "Veterinarian",
  columns: [
    { key: "name",            label: "Name",            required: true  },
    { key: "credentials",     label: "Credentials",     required: true, hint: "e.g. DVM, DVM DACVS" },
    { key: "specializations", label: "Specializations",  required: false, hint: "Semicolon-separated e.g. Surgery;Dermatology" },
    { key: "email",           label: "Email",           required: true,
      validate: (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email" : null },
    { key: "phone",           label: "Phone",           required: false },
  ],
  exampleRow: {
    name:            "Dr. Jane Smith",
    credentials:     "DVM",
    specializations: "Surgery;Internal Medicine",
    email:           "jane@clinic.com",
    phone:           "+1-555-0100",
  },
};

const SERVICE_SCHEMA: CSVSchema = {
  entityName: "Service",
  columns: [
    { key: "name",        label: "Name",        required: true  },
    { key: "description", label: "Description", required: true  },
    { key: "price",       label: "Price",       required: false, hint: "e.g. $75 or $100-$200" },
    { key: "duration",    label: "Duration",    required: false, hint: "e.g. 30 min or 1-2 hours" },
  ],
  exampleRow: {
    name:        "Annual Wellness Exam",
    description: "Full physical exam and vaccine review",
    price:       "$85",
    duration:    "30 min",
  },
};

const TESTIMONIAL_SCHEMA: CSVSchema = {
  entityName: "Testimonial",
  columns: [
    { key: "clinicName",  label: "Clinic Name",  required: true  },
    { key: "clientName",  label: "Client Name",  required: true  },
    { key: "rating",      label: "Rating",       required: true,
      validate: (v) => {
        const n = Number(v);
        if (!v) return "Rating is required";
        if (isNaN(n) || n < 1 || n > 5) return "Rating must be 1–5";
        return null;
      }},
    { key: "text",        label: "Review Text",  required: true  },
  ],
  exampleRow: {
    clinicName: "Happy Paws",
    clientName: "Alex Johnson",
    rating:     "5",
    text:       "Incredible care — our dog felt right at home!",
  },
};

/* ── Shared card row ─────────────────────────────────────────────── */

function ItemCard({
  icon, iconBg, iconColor, onEdit, onDelete, children,
}: {
  icon:      React.ElementType;
  iconBg:    string;
  iconColor: string;
  onEdit:    () => void;
  onDelete:  () => void;
  children:  React.ReactNode;
}) {
  const Icon = icon;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 hover:shadow-sm transition-all group">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
          <Icon size={18} className={iconColor} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">{children}</div>
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
          <IconButton icon={Edit2}  label="Edit"   size="sm" onClick={onEdit}   />
          <IconButton icon={Trash2} label="Delete" size="sm" variant="danger" onClick={onDelete} />
        </div>
      </div>
    </div>
  );
}

/* ── Tab button ──────────────────────────────────────────────────── */

function Tab({ active, icon: Icon, label, count, onClick }: {
  active: boolean; icon: React.ElementType; label: string; count: number; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
        active ? "text-teal-600 border-teal-600" : "text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300"
      }`}
      aria-selected={active}
      role="tab"
    >
      <Icon size={15} aria-hidden="true" />
      {label}
      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
        active ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"
      }`}>
        {count}
      </span>
    </button>
  );
}

/* ── Component ───────────────────────────────────────────────────── */

export function DataCollectionPage() {
  const [activeTab,    setActiveTab]    = useState<"vets" | "services" | "testimonials">("vets");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [vets,         setVets]         = useState<Veterinarian[]>(INIT_VETS);
  const [services,     setServices]     = useState<Service[]>(INIT_SERVICES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INIT_TESTIMONIALS);
  const [confirm,      setConfirm]      = useState<ConfirmState | null>(null);
  const [showImport,   setShowImport]   = useState(false);
  const { toasts, toast, dismiss }      = useToast();

  /* ── Deletion handlers ── */

  const deleteVet = (id: string) => {
    const name = vets.find((v) => v.id === id)?.name ?? "Veterinarian";
    setConfirm({
      title:   `Remove ${name}?`,
      message: "This will remove the vet from all clinic pages.",
      onConfirm: () => { setVets((p) => p.filter((v) => v.id !== id)); toast.success(`${name} removed`); },
    });
  };

  const deleteService = (id: string) => {
    const name = services.find((s) => s.id === id)?.name ?? "Service";
    setConfirm({
      title:   `Delete "${name}"?`,
      message: "This service will be removed from all listings.",
      onConfirm: () => { setServices((p) => p.filter((s) => s.id !== id)); toast.success(`"${name}" deleted`); },
    });
  };

  const deleteTestimonial = (id: string) => {
    setConfirm({
      title:   "Delete testimonial?",
      message: "This cannot be undone.",
      onConfirm: () => { setTestimonials((p) => p.filter((t) => t.id !== id)); toast.success("Testimonial deleted"); },
    });
  };

  /* ── CSV import handlers ── */

  const currentSchema =
    activeTab === "vets"         ? VET_SCHEMA :
    activeTab === "services"     ? SERVICE_SCHEMA :
    TESTIMONIAL_SCHEMA;

  const handleImport = (rows: ParsedRow[]) => {
    if (activeTab === "vets") {
      const newVets: Veterinarian[] = rows.map((r, i) => ({
        id:              `v-csv-${Date.now()}-${i}`,
        name:            r.name,
        credentials:     r.credentials,
        specializations: r.specializations ? r.specializations.split(";").map((s) => s.trim()).filter(Boolean) : [],
        email:           r.email,
        phone:           r.phone ?? "",
      }));
      setVets((prev) => [...prev, ...newVets]);
      toast.success(`${newVets.length} veterinarian${newVets.length !== 1 ? "s" : ""} imported`);
    } else if (activeTab === "services") {
      const newServices: Service[] = rows.map((r, i) => ({
        id:          `s-csv-${Date.now()}-${i}`,
        name:        r.name,
        description: r.description,
        price:       r.price ?? "",
        duration:    r.duration ?? "",
      }));
      setServices((prev) => [...prev, ...newServices]);
      toast.success(`${newServices.length} service${newServices.length !== 1 ? "s" : ""} imported`);
    } else {
      const newTestimonials: Testimonial[] = rows.map((r, i) => ({
        id:         `t-csv-${Date.now()}-${i}`,
        clinicName: r.clinicName,
        clientName: r.clientName,
        rating:     Math.min(5, Math.max(1, Number(r.rating) || 5)),
        text:       r.text,
      }));
      setTestimonials((prev) => [...prev, ...newTestimonials]);
      toast.success(`${newTestimonials.length} testimonial${newTestimonials.length !== 1 ? "s" : ""} imported`);
    }
  };

  /* ── Filtered lists ── */

  const filteredVets = vets.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           v.specializations.join(" ").toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredServices = services.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const switchTab = (tab: typeof activeTab) => { setActiveTab(tab); setSearchQuery(""); };

  return (
    <div className={surface.page}>
      <div className="p-6 space-y-5">

        {/* ── Tab bar ── */}
        <div className="flex gap-1 border-b border-gray-200" role="tablist" aria-label="Data categories">
          <Tab active={activeTab === "vets"}         icon={Users}         label="Veterinarians" count={vets.length}         onClick={() => switchTab("vets")}         />
          <Tab active={activeTab === "services"}     icon={Briefcase}     label="Services"      count={services.length}     onClick={() => switchTab("services")}     />
          <Tab active={activeTab === "testimonials"} icon={MessageSquare} label="Testimonials"  count={testimonials.length} onClick={() => switchTab("testimonials")} />
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3">
          {activeTab !== "testimonials" && (
            <SearchInput
              placeholder={activeTab === "vets" ? "Search veterinarians…" : "Search services…"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              wrapperClassName="max-w-xs"
            />
          )}
          <div className="ml-auto flex items-center gap-2">
            {/* CSV Import */}
            <button
              onClick={() => setShowImport(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              aria-label={`Import ${activeTab === "vets" ? "veterinarians" : activeTab} from CSV`}
            >
              <Upload size={14} aria-hidden="true" />
              Import CSV
            </button>
            {/* Add single */}
            <button
              onClick={() => toast.info("Single-add form coming soon")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus size={14} aria-hidden="true" />
              Add {activeTab === "vets" ? "Veterinarian" : activeTab === "services" ? "Service" : "Testimonial"}
            </button>
          </div>
        </div>

        {/* ── Veterinarians ── */}
        {activeTab === "vets" && (
          <div className="space-y-3" role="list" aria-label="Veterinarians">
            {filteredVets.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No veterinarians found"
                subtitle={searchQuery ? "Try adjusting your search." : "Import a CSV or add a vet above."}
              />
            ) : filteredVets.map((vet) => (
              <div key={vet.id} role="listitem">
                <ItemCard icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600"
                  onEdit={() => toast.info("Edit coming soon")} onDelete={() => deleteVet(vet.id)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-semibold text-gray-900">{vet.name}</h3>
                    <Badge variant="primary" size="sm">{vet.credentials}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-gray-500">
                    {vet.specializations.length > 0 && <span>{vet.specializations.join(", ")}</span>}
                    <span>{vet.email}</span>
                    {vet.phone && <span>{vet.phone}</span>}
                  </div>
                </ItemCard>
              </div>
            ))}
          </div>
        )}

        {/* ── Services ── */}
        {activeTab === "services" && (
          <div className="space-y-3" role="list" aria-label="Services">
            {filteredServices.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No services found"
                subtitle={searchQuery ? "Try adjusting your search." : "Import a CSV or add a service above."}
              />
            ) : filteredServices.map((service) => (
              <div key={service.id} role="listitem">
                <ItemCard icon={Briefcase} iconBg="bg-emerald-50" iconColor="text-emerald-600"
                  onEdit={() => toast.info("Edit coming soon")} onDelete={() => deleteService(service.id)}>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{service.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {service.price    && <span className="font-semibold text-gray-800">{service.price}</span>}
                    {service.duration && <span className="text-gray-500">{service.duration}</span>}
                  </div>
                </ItemCard>
              </div>
            ))}
          </div>
        )}

        {/* ── Testimonials ── */}
        {activeTab === "testimonials" && (
          <div className="space-y-3" role="list" aria-label="Testimonials">
            {testimonials.length === 0 ? (
              <EmptyState
                icon={MessageSquare}
                title="No testimonials yet"
                subtitle="Import a CSV or add your first testimonial above."
              />
            ) : testimonials.map((t) => (
              <div key={t.id} role="listitem">
                <ItemCard icon={MessageSquare} iconBg="bg-amber-50" iconColor="text-amber-600"
                  onEdit={() => toast.info("Edit coming soon")} onDelete={() => deleteTestimonial(t.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900">{t.clientName}</h3>
                    <span className="text-xs text-amber-500 font-medium" aria-label={`${t.rating} out of 5 stars`}>
                      {"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1.5">{t.clinicName}</p>
                  <p className="text-xs text-gray-600 leading-relaxed">{t.text}</p>
                </ItemCard>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── CSV Import Modal ── */}
      <CSVImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        schema={currentSchema}
        onImport={handleImport}
      />

      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
