/**
 * Approval Flow Page
 * Review, approve, publish changes
 */

import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useApproval, ClinicVersionV2 } from "../../context/ApprovalContext";
import { ClinicWebsite } from "../../types/clinic";
import { ChangesSummaryCard } from "./ChangesSummaryCard";
import { DiffViewPanel } from "./DiffViewPanel";
import { FeedbackThread } from "./FeedbackThread";

export function ApprovalFlowPage() {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(null);
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);

  const { pendingApprovals, workflows, getFeedback, addFeedback, approveChanges, submitForApprovalWithDiff } =
    useApproval();

  // Initialize with sample data for demonstration
  useEffect(() => {
    if (!sampleDataLoaded && pendingApprovals.length === 0) {
      // Sample clinic data - base version
      const baseClinicV1 = {
        general: {
          name: "Happy Paws Veterinary",
          slug: "happy-paws",
          tagline: "Your Pet's Health is Our Priority",
          logoUrl: "https://via.placeholder.com/150",
          primaryColor: "#006B5D",
          secondaryColor: "#F0F0F0",
          metaDescription: "Professional veterinary services for your beloved pets",
        },
        taxonomy: {
          hospitalType: "general_practice" as const,
          petTypes: ["dog", "cat"],
        },
        contact: {
          phone: "+1-555-1234",
          emergencyPhone: "+1-555-9999",
          email: "info@happypaws.com",
          website: "https://happypaws.com",
          address: {
            street: "123 Main St",
            city: "Austin",
            state: "TX",
            zip: "78701",
            country: "USA",
            mapEmbedUrl: "https://maps.example.com",
          },
          businessHours: [],
        },
        services: [
          {
            id: "s1",
            name: "General Checkup",
            description: "Routine health examination",
            slug: "general-checkup",
            order: 0,
            isVisible: true,
            isHighlighted: false,
          },
          {
            id: "s2",
            name: "Vaccination",
            description: "Preventive care immunizations",
            slug: "vaccination",
            order: 1,
            isVisible: true,
            isHighlighted: false,
          },
        ],
        veterinarians: [
          {
            id: "v1",
            name: "Dr. Sarah Johnson",
            credentials: "DVM",
            title: "Senior Veterinarian",
            bio: "20 years of experience in general practice",
            specializations: ["general_practice"],
            serviceIds: ["s1", "s2"],
            order: 0,
            isVisible: true,
          },
        ],
        blocks: [],
        status: "draft" as const,
        meta: {
          createdBy: "admin",
          version: 1,
        },
      };

      // Sample pending changes - version 2
      const pendingClinicV2 = {
        ...baseClinicV1,
        general: {
          ...baseClinicV1.general,
          name: "Happy Paws Specialty Clinic", // CHANGED
          tagline: "Specialty Veterinary Care & Emergency Services", // CHANGED
          primaryColor: "teal-600", // CHANGED
        },
        contact: {
          ...baseClinicV1.contact,
          phone: "+1-555-5678", // CHANGED
          emergencyPhone: "+1-555-8888", // CHANGED
        },
        services: [
          ...baseClinicV1.services,
          {
            id: "s3",
            name: "Cardiology Consultation",
            description: "Specialist care for heart disease diagnosis and treatment",
            slug: "cardiology",
            order: 2,
            isVisible: true,
            isHighlighted: true,
          },
        ],
        veterinarians: [
          {
            id: "v2",
            name: "Dr. Michael Chen",
            credentials: "DVM",
            title: "Cardiologist",
            bio: "10 years of specialty experience in cardiac health",
            specializations: ["cardiology"],
            serviceIds: ["s3"],
            order: 0,
            isVisible: true,
          },
          ...baseClinicV1.veterinarians,
        ],
      };

      // Submit the first pending approval with diff (passing base clinic for proper comparison)
      const v1 = submitForApprovalWithDiff("Austin Paws Specialty Clinic", pendingClinicV2 as unknown as ClinicWebsite, "john.doe", baseClinicV1 as unknown as ClinicWebsite);

      // Add feedback to first approval
      if (v1) {
        setTimeout(() => {
          addFeedback(v1.id, {
            id: "fb1",
            versionId: v1.id,
            createdBy: "admin_user",
            createdAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
            type: "request_change",
            fieldPath: "general.primaryColor",
            message: "Please verify this color matches our new brand guidelines. Looks good but let's confirm with the design team first.",
            resolved: false,
          });
        }, 100);
      }

      // Second sample approval - Urban Pet Care with simpler changes
      const urbanPetBaseClinic = {
        general: {
          name: "Urban Pet Care",
          slug: "urban-pet-care",
          tagline: "Quality Pet Care in the City",
          logoUrl: "https://via.placeholder.com/150",
          primaryColor: "#0066CC",
          secondaryColor: "#F5F5F5",
          metaDescription: "Comprehensive veterinary services for urban pet owners",
        },
        taxonomy: {
          hospitalType: "general_practice" as const,
          petTypes: ["dog", "cat", "rabbit"],
        },
        contact: {
          phone: "+1-555-2222",
          emergencyPhone: "+1-555-3333",
          email: "contact@urbanpet.com",
          website: "https://urbanpetcare.com",
          address: {
            street: "456 Oak Ave",
            city: "Denver",
            state: "CO",
            zip: "80202",
            country: "USA",
            mapEmbedUrl: "https://maps.example.com",
          },
          businessHours: [],
        },
        services: [
          {
            id: "us1",
            name: "Wellness Exam",
            description: "Complete health assessment",
            slug: "wellness-exam",
            order: 0,
            isVisible: true,
            isHighlighted: false,
          },
          {
            id: "us2",
            name: "Dental Cleaning",
            description: "Professional teeth cleaning",
            slug: "dental-cleaning",
            order: 1,
            isVisible: true,
            isHighlighted: false,
          },
        ],
        veterinarians: [
          {
            id: "uv1",
            name: "Dr. Lisa Anderson",
            credentials: "DVM",
            title: "Veterinarian",
            bio: "5 years experience with small animals",
            specializations: ["general_practice"],
            serviceIds: ["us1", "us2"],
            order: 0,
            isVisible: true,
          },
        ],
        blocks: [],
        status: "draft" as const,
        meta: {
          createdBy: "admin",
          version: 1,
        },
      };

      const urbanPetPendingChanges = {
        ...urbanPetBaseClinic,
        contact: {
          ...urbanPetBaseClinic.contact,
          phone: "+1-555-2224", // Phone updated
        },
        services: [
          ...urbanPetBaseClinic.services,
          {
            id: "us3",
            name: "Surgical Services",
            description: "Minor surgical procedures and spay/neuter",
            slug: "surgical",
            order: 2,
            isVisible: true,
            isHighlighted: false,
          },
        ],
      };

      const v2 = submitForApprovalWithDiff("Urban Pet Care", urbanPetPendingChanges as unknown as ClinicWebsite, "sarah.wilson", urbanPetBaseClinic as unknown as ClinicWebsite);

      // Third sample approval - Riverside Vet (no feedback - clean approval ready)
      const riversideBaseClinic = {
        general: {
          name: "Riverside Veterinary Hospital",
          slug: "riverside-vet",
          tagline: "Emergency & Critical Care Specialists",
          logoUrl: "https://via.placeholder.com/150",
          primaryColor: "#D32F2F",
          secondaryColor: "#FAFAFA",
          metaDescription: "24/7 emergency veterinary services",
        },
        taxonomy: {
          hospitalType: "emergency_critical_care" as const,
          petTypes: ["dog", "cat", "bird", "exotic"],
        },
        contact: {
          phone: "+1-555-4444",
          emergencyPhone: "+1-555-4445",
          email: "emergency@riverside.com",
          website: "https://riversidevet.com",
          address: {
            street: "789 River Road",
            city: "Portland",
            state: "OR",
            zip: "97210",
            country: "USA",
            mapEmbedUrl: "https://maps.example.com",
          },
          businessHours: [],
        },
        services: [
          {
            id: "rs1",
            name: "Emergency Care",
            description: "24/7 emergency treatment",
            slug: "emergency-care",
            order: 0,
            isVisible: true,
            isHighlighted: true,
          },
          {
            id: "rs2",
            name: "Critical Care ICU",
            description: "Intensive care monitoring",
            slug: "critical-icu",
            order: 1,
            isVisible: true,
            isHighlighted: true,
          },
        ],
        veterinarians: [
          {
            id: "rv1",
            name: "Dr. James Mitchell",
            credentials: "DVM",
            title: "Emergency Medicine Specialist",
            bio: "15 years in emergency care",
            specializations: ["emergency_critical_care"],
            serviceIds: ["rs1", "rs2"],
            order: 0,
            isVisible: true,
          },
        ],
        blocks: [],
        status: "draft" as const,
        meta: {
          createdBy: "admin",
          version: 1,
        },
      };

      const riversidePendingChanges = {
        ...riversideBaseClinic,
        general: {
          ...riversideBaseClinic.general,
          metaDescription: "24/7 emergency and critical care veterinary services - Always available", // Updated
        },
      };

      const v3 = submitForApprovalWithDiff("Riverside Veterinary Hospital", riversidePendingChanges as unknown as ClinicWebsite, "admin.user", riversideBaseClinic as unknown as ClinicWebsite);

      setSampleDataLoaded(true);
    }
  }, [sampleDataLoaded, pendingApprovals.length, submitForApprovalWithDiff, addFeedback]);

  // Get all approved versions for history
  const allApproved = Array.from(workflows.values())
    .flatMap((w) => w.approvalHistory.slice(-5)) // Last 5 per clinic
    .sort((a, b) => new Date(b.approvedAt || "").getTime() - new Date(a.approvedAt || "").getTime());

  const selectedPending = pendingApprovals.find((p) => p.id === selectedPendingId);
  const selectedPendingV2 = selectedPending as ClinicVersionV2 | undefined;

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDetailModal) {
        setShowDetailModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showDetailModal]);

  return (
    <div className="flex-1 overflow-hidden bg-white flex flex-col">
      <div className="p-10 overflow-y-auto flex-1">
        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          {[
            { id: "pending" as const, label: "Pending Approvals", count: pendingApprovals.length },
            { id: "history" as const, label: "History", count: allApproved.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition border-b-2 ${
                activeTab === tab.id
                  ? "text-teal-600 border-teal-600"
                  : "text-gray-600 border-transparent hover:text-gray-900"
              }`}
            >
              {tab.label}
              {tab.id === "pending" && tab.count > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Pending Approvals */}
        {activeTab === "pending" && (
          <div className="space-y-3">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((approval) => {
                const v2 = approval as ClinicVersionV2;
                const feedback = getFeedback(v2.id);
                return (
                  <ChangesSummaryCard
                    key={v2.id}
                    clinicName={v2.clinicId}
                    submittedBy={v2.createdBy}
                    submittedAt={new Date(v2.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                    changesSummary={v2.changesSummary || []}
                    feedbackCount={feedback.length}
                    diffStats={v2.diffStats || { totalChanged: 0, bySection: {}, createdItems: 0, deletedItems: 0 }}
                    onViewDetails={() => {
                      setSelectedPendingId(v2.id);
                      setSelectedSectionKey(v2.changesSummary?.[0]?.sectionKey || "");
                      setShowDetailModal(true);
                    }}
                  />
                );
              })
            ) : (
              <div className="border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-sm text-gray-600">No pending approvals</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {allApproved.length > 0 ? (
              allApproved.map((approval) => (
                <div
                  key={approval.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-5 flex-1">
                      <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle
                          size={20}
                          className={
                            approval.status === "approved"
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h3 className="text-sm font-medium text-gray-900">
                            {approval.clinicId}
                          </h3>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              approval.status === "approved"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {approval.status === "approved"
                              ? "Approved & Published"
                              : "Rejected"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-5 text-xs text-gray-600 mb-2">
                          <div>
                            {approval.status === "approved" ? "Approved" : "Rejected"} by{" "}
                            {approval.approvedBy}
                          </div>
                          <div>
                            {new Date(approval.approvedAt || "").toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </div>
                        </div>
                        {approval.approvalNotes && (
                          <p className="text-xs text-gray-600 mt-2">{approval.approvalNotes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="border border-gray-200 rounded-lg p-12 text-center">
                <p className="text-sm text-gray-600">No approval history</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedPendingV2 && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Review Changes: {selectedPendingV2.clinicId}
                </h2>
                <p className="text-xs text-gray-600 mt-1">
                  Submitted by {selectedPendingV2.createdBy} on{" "}
                  {new Date(selectedPendingV2.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                title="Close modal (Esc)"
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Modal Body: 3-column layout */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left: Change groups */}
              <div className="w-48 border-r border-gray-200 overflow-y-auto bg-gray-50">
                <div className="p-3 space-y-2">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-2">
                    Changes by Section
                  </h3>
                  {selectedPendingV2.changesSummary?.map((group) => (
                    <button
                      key={group.sectionKey}
                      onClick={() => setSelectedSectionKey(group.sectionKey)}
                      className={`w-full text-left px-3 py-2 rounded text-xs font-medium transition ${
                        selectedSectionKey === group.sectionKey
                          ? "bg-teal-600 text-white"
                          : "text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <div>{group.section}</div>
                      <div className="text-[11px] opacity-80 font-normal">
                        {group.changeCount} change{group.changeCount !== 1 ? "s" : ""}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle: Diff View */}
              <div className="flex-1 border-r border-gray-200 overflow-y-auto">
                <DiffViewPanel
                  fieldChanges={selectedPendingV2.fieldChanges || []}
                  selectedSectionKey={selectedSectionKey}
                  onRequestChange={(fieldPath, message) => {
                    addFeedback(selectedPendingV2.id, {
                      id: "",
                      versionId: selectedPendingV2.id,
                      createdBy: "admin",
                      createdAt: new Date().toISOString(),
                      type: "request_change",
                      fieldPath,
                      message,
                      resolved: false,
                    });
                  }}
                />
              </div>

              {/* Right: Feedback Thread */}
              <div className="w-64 border-l border-gray-200 overflow-y-auto bg-gray-50">
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
                    Feedback
                  </h3>
                </div>
                <FeedbackThread
                  feedback={getFeedback(selectedPendingV2.id)}
                  onResolveFeedback={(feedbackId) => {
                    // This would be implemented with context method in Phase 4
                  }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  approveChanges(selectedPendingV2.id, "", "admin");
                  setShowDetailModal(false);
                }}
                className="px-4 py-2 text-sm font-medium bg-teal-600 text-white rounded-md hover:bg-teal-700 transition"
              >
                Approve All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
