/**
 * Approval Flow Page
 * Review, approve, publish changes
 */

import { useState, useEffect } from "react";
import { CheckCircle, ClipboardList, AlertCircle, XCircle } from "lucide-react";
import { useApproval, ClinicVersionV2, ApprovalWorkflowV2 } from "../../context/ApprovalContext";
import { useNavigate } from "react-router-dom";
import { ClinicWebsite } from "../../types/clinic";
import { ChangesSummaryCard } from "./ChangesSummaryCard";
import { DraftPanel } from "./DraftPanel";
import { buildContextFieldChanges } from "../../lib/approval/contextFieldChanges";

/** e.g. "2h ago", "3d ago", "May 15" */
function timeAgo(isoString: string): string {
  const diff  = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days  = Math.floor(hours / 24);
  if (days < 7)   return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function ApprovalFlowPage() {
  const navigate = useNavigate();
  const [activeTab,        setActiveTab]        = useState<"pending" | "history">("pending");
  const [openDraftId,      setOpenDraftId]      = useState<string | null>(null);
  const [sampleDataLoaded, setSampleDataLoaded] = useState(false);

  const { pendingApprovals, workflows, approveChanges, rejectChanges, requestRevision, addFeedback, submitForApprovalWithDiff } =
    useApproval();

  // Initialize with sample data for demonstration
  useEffect(() => {
    if (!sampleDataLoaded && pendingApprovals.length === 0) {

      // ─────────────────────────────────────────────────────────────────────────
      // SCENARIO 1 — Happy Paws Specialty Clinic
      // Branding refresh + emergency services expansion + new cardiologist
      // 8 field changes   Author: john.doe
      // ─────────────────────────────────────────────────────────────────────────
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
          primaryColor: "#0F766E", // CHANGED
          slug: "happy-paws-specialty", // CHANGED
        },
        contact: {
          ...baseClinicV1.contact,
          phone: "+1-555-5678", // CHANGED
          emergencyPhone: "+1-555-8888", // CHANGED
          website: "https://happypawsspecialty.com", // CHANGED
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
        // ── WebsiteEditor fields ──────────────────────────────────────────────
        seo: {
          metaTitle: "Happy Paws Specialty Clinic | Cardiology & Emergency Vet Austin TX",
          metaDescription: "Austin's trusted specialty vet. Expert cardiology, emergency services & compassionate care for dogs, cats, and exotics. Open 7 days.",
          ogImageUrl: "https://images.unsplash.com/photo-1611859266238-4b98091d9d9b?w=1200",
          canonicalUrl: "https://happy-paws-specialty.vet",
          robots: "index,follow",
          focusKeyword: "specialty veterinary clinic Austin emergency",
        },
        navLinks: [
          { id: "home",      label: "Home",            href: "/",                    openInNewTab: false },
          { id: "about",     label: "About Us",         href: "/about",               openInNewTab: false },
          { id: "services",  label: "Services",         href: "/services",            openInNewTab: false },
          { id: "cardio",    label: "Cardiology",       href: "/services/cardiology", openInNewTab: false },
          { id: "emergency", label: "Emergency",        href: "/emergency",           openInNewTab: false },
          { id: "book",      label: "Book Appointment", href: "/book",                openInNewTab: false },
        ],
        navConfig: {
          isSticky: true,
          isTransparentOnScroll: false,
          colorScheme: "dark",
          showClinicName: true,
          ctaLabel: "Emergency Line",
          ctaHref: "tel:+15558888",
        },
        servicesConfig: {
          pricingEnabled: true,
          pricingUrl: "https://happypawsspecialty.com/pricing",
          serviceGroups: [
            { id: "grp-1", enabled: true, name: "Core Services", selectedServiceIds: ["svc-1", "svc-8", "svc-7"] },
            { id: "grp-2", enabled: true, name: "Specialty", selectedServiceIds: ["svc-4", "svc-9"] },
          ],
        },
        vetsConfig: { selectedVetIds: ["vet-1", "vet-2", "vet-5"] },
        footerConfig: {
          subscriptionEnabled:    false,
          subscriptionHeading:    "",
          subscriptionLink:       "",
          additionalLinksEnabled: false,
          additionalLinks:        [],
          termsOfService:         "",
          privacyPolicy:          "",
        },
        integrations: {
          pixelTrackingEnabled:    false,
          ottoEnabled:             true,
          ottoWidgetScript:        "<script src='https://otto.vet/widget.js' data-clinic='happy-paws-specialty'></script>",
          vetstoriaEnabled:        true,
          googleTagManagerEnabled: false,
          facebookPixelEnabled:    false,
          microsoftClarityEnabled: false,
          cookieConsentEnabled:    false,
        },
        hours: {
          monday:    { isClosed: false, is24Hours: false, slots: [{ open: "07:30", close: "20:00" }] },
          tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "07:30", close: "20:00" }] },
          wednesday: { isClosed: false, is24Hours: false, slots: [{ open: "07:30", close: "20:00" }] },
          thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "07:30", close: "20:00" }] },
          friday:    { isClosed: false, is24Hours: false, slots: [{ open: "07:30", close: "19:00" }] },
          saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "17:00" }] },
          sunday:    { isClosed: false, is24Hours: false, slots: [{ open: "10:00", close: "15:00" }] },
        },
      };

      // Submit the first pending approval with diff (passing base clinic for proper comparison)
      const v1 = submitForApprovalWithDiff(pendingClinicV2.general.name, pendingClinicV2 as unknown as ClinicWebsite, "john.doe", baseClinicV1 as unknown as ClinicWebsite);

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
        general: {
          ...urbanPetBaseClinic.general,
          tagline: "Convenient, Affordable Pet Care in the Heart of Denver", // CHANGED
          logoUrl: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=200", // CHANGED
          primaryColor: "#0284C7",                                            // CHANGED — brighter blue
          metaDescription: "Denver's go-to neighbourhood vet. Wellness exams, dental care, surgery and same-day sick visits. Book online.",// CHANGED
        },
        contact: {
          ...urbanPetBaseClinic.contact,
          phone: "+1-555-2224",                                               // CHANGED
          email: "hello@urbanpetcare.com",                                    // CHANGED
          address: { ...urbanPetBaseClinic.contact.address, street: "456 Oak Ave, Ste 200" }, // CHANGED — suite added
          website: "https://urbanpetcaredenver.com",                          // CHANGED
        },
        services: [
          ...urbanPetBaseClinic.services,
          { id: "us3", name: "Surgical Services", description: "Spay/neuter and minor soft-tissue procedures under full general anaesthesia with pulse-ox monitoring", slug: "surgical", order: 2, isVisible: true, isHighlighted: false },
          { id: "us4", name: "Digital Radiology", description: "Same-day X-ray results for accurate diagnosis of bone, lung, and abdominal conditions", slug: "radiology", order: 3, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          ...urbanPetBaseClinic.veterinarians,
          { id: "uv2", name: "Dr. Carlos Mendez", credentials: "DVM", title: "Veterinary Surgeon", bio: "8 years experience in soft-tissue and orthopaedic procedures. Joined Urban Pet Care in 2024 from a busy referral practice in Boulder.", specializations: ["surgery"], serviceIds: ["us3"], order: 1, isVisible: true },
        ],
        // ── WebsiteEditor fields ──────────────────────────────────────────────
        seo: {
          metaTitle: "Urban Pet Care Denver | Affordable Vets for Dogs, Cats & Rabbits",
          metaDescription: "Convenient neighbourhood veterinary clinic in downtown Denver. Walk-in sick visits, wellness exams, dental cleaning, surgery and digital X-ray.",
          ogImageUrl: "https://images.unsplash.com/photo-1586671267731-da2cf3ceeb80?w=1200",
          canonicalUrl: "https://urban-pet-care.vet",
          robots: "index,follow",
          focusKeyword: "veterinary clinic Denver affordable",
        },
        navLinks: [
          { id: "home",     label: "Home",            href: "/",         openInNewTab: false },
          { id: "services", label: "Services",        href: "/services", openInNewTab: false },
          { id: "team",     label: "Our Team",        href: "/team",     openInNewTab: false },
          { id: "blog",     label: "Pet Health Blog", href: "/blog",     openInNewTab: false },
          { id: "book",     label: "Book Online",     href: "/book",     openInNewTab: false },
        ],
        navConfig: {
          isSticky: true,
          isTransparentOnScroll: false,
          colorScheme: "light",
          showClinicName: true,
          ctaLabel: "Book Online",
          ctaHref: "/book",
        },
        servicesConfig: {
          pricingEnabled: true,
          pricingUrl: "https://urbanpetcaredenver.com/pricing",
          serviceGroups: [
            { id: "grp-1", enabled: true, name: "Everyday Care", selectedServiceIds: ["svc-8", "svc-7", "svc-6"] },
            { id: "grp-2", enabled: true, name: "Procedures",    selectedServiceIds: ["svc-9", "svc-5"] },
          ],
        },
        vetsConfig: { selectedVetIds: ["vet-1", "vet-4"] },
        integrations: {
          pixelTrackingEnabled:    false,
          ottoEnabled:             false,
          ottoWidgetScript:        "",
          vetstoriaEnabled:        true,
          googleTagManagerEnabled: false,
          facebookPixelEnabled:    true,
          microsoftClarityEnabled: false,
          cookieConsentEnabled:    true,
        },
        footerConfig: {
          subscriptionEnabled:    true,
          subscriptionHeading:    "Monthly pet health tips from our Denver vets",
          subscriptionLink:       "https://urbanpetcaredenver.com/newsletter",
          additionalLinksEnabled: true,
          additionalLinks: [
            { name: "Book Online",   link: "/book" },
            { name: "Pet Resources", link: "/resources" },
          ],
          termsOfService: "https://urbanpetcaredenver.com/terms",
          privacyPolicy:  "https://urbanpetcaredenver.com/privacy",
        },
        hours: {
          monday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:30" }] },
          tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:30" }] },
          wednesday: { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "20:00" }] },
          thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:30" }] },
          friday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "17:00" }] },
          saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "14:00" }] },
          sunday:    { isClosed: true,  is24Hours: false, slots: [] },
        },
      };

      const v2 = submitForApprovalWithDiff("Urban Pet Care", urbanPetPendingChanges as unknown as ClinicWebsite, "sarah.wilson", urbanPetBaseClinic as unknown as ClinicWebsite);
      if (v2) {
        setTimeout(() => {
          addFeedback(v2.id, { id: "", versionId: v2.id, createdBy: "admin_review", createdAt: new Date(Date.now() - 50 * 60000).toISOString(), type: "request_change", fieldPath: "general.logoUrl", message: "The new logo needs to be at least 400×400 px and submitted as a PNG with transparent background per brand guidelines.", resolved: false });
        }, 150);
      }

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
          tagline: "Portland's 24/7 Emergency & Critical Care Centre",         // CHANGED
          logoUrl: "https://images.unsplash.com/photo-1516兑换-placeholder?w=200",
          primaryColor: "#B91C1C",                                              // CHANGED — darker red
          metaDescription: "24/7 emergency and critical care veterinary hospital in Portland. Immediate triage, ICU, ventilator support, and specialist on-call every night.", // CHANGED
        },
        contact: {
          ...riversideBaseClinic.contact,
          phone: "+1-555-4446",                                                 // CHANGED — updated main line
          address: { ...riversideBaseClinic.contact.address, mapEmbedUrl: "https://maps.google.com/embed?q=789+River+Road+Portland" }, // CHANGED — map added
        },
        services: [
          ...riversideBaseClinic.services,
          { id: "rs3", name: "Toxicology & Poison Control", description: "Immediate decontamination and antidote protocols for ingested toxins, envenomation, and drug exposure", slug: "toxicology", order: 2, isVisible: true, isHighlighted: true },
          { id: "rs4", name: "Advanced Imaging", description: "On-site CT and digital radiography available at all hours for trauma assessment and surgical planning", slug: "imaging", order: 3, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          ...riversideBaseClinic.veterinarians,
          { id: "rv2", name: "Dr. Nadia Kowalski", credentials: "DVM, DACVECC", title: "Critical Care Specialist", bio: "Board-certified in emergency and critical care. Leads the overnight ICU team and pioneered the hospital's ventilator management protocol.", specializations: ["emergency_critical_care"], serviceIds: ["rs1", "rs2"], order: 1, isVisible: true },
        ],
        // ── WebsiteEditor fields ──────────────────────────────────────────────
        seo: {
          metaTitle: "Riverside Veterinary Hospital Portland | 24/7 Emergency & Critical Care",
          metaDescription: "Portland's round-the-clock emergency vet. Immediate triage, board-certified critical care, ICU, CT imaging & toxicology. No appointment needed.",
          ogImageUrl: "https://images.unsplash.com/photo-1629909615957-be38d48fbbe4?w=1200",
          canonicalUrl: "https://riverside-vet.vet",
          robots: "index,follow",
          focusKeyword: "emergency veterinary hospital Portland 24 hour",
        },
        navLinks: [
          { id: "home",      label: "Home",           href: "/",           openInNewTab: false },
          { id: "emergency", label: "Emergency",      href: "/emergency",  openInNewTab: false },
          { id: "services",  label: "Services",       href: "/services",   openInNewTab: false },
          { id: "icu",       label: "ICU & Critical", href: "/critical",   openInNewTab: false },
          { id: "about",     label: "About",          href: "/about",      openInNewTab: false },
          { id: "refer",     label: "Referrals",      href: "/refer",      openInNewTab: true  },
        ],
        navConfig: {
          isSticky: true,
          isTransparentOnScroll: false,
          colorScheme: "dark",
          showClinicName: true,
          ctaLabel: "Call Emergency",
          ctaHref: "tel:+15554445",
        },
        servicesConfig: {
          pricingEnabled: false,
          pricingUrl: "",
          serviceGroups: [
            { id: "grp-1", enabled: true, name: "Emergency Services", selectedServiceIds: ["svc-2", "svc-5", "svc-6"] },
            { id: "grp-2", enabled: true, name: "Critical Care",      selectedServiceIds: ["svc-3", "svc-4"] },
          ],
        },
        vetsConfig: { selectedVetIds: ["vet-2", "vet-3", "vet-5"] },
        integrations: {
          pixelTrackingEnabled:    true,
          ottoEnabled:             false,
          ottoWidgetScript:        "",
          vetstoriaEnabled:        false,
          googleTagManagerEnabled: true,
          facebookPixelEnabled:    false,
          microsoftClarityEnabled: true,
          cookieConsentEnabled:    true,
        },
        footerConfig: {
          subscriptionEnabled:    false,
          subscriptionHeading:    "",
          subscriptionLink:       "",
          additionalLinksEnabled: true,
          additionalLinks: [
            { name: "Referral Forms",    link: "/refer" },
            { name: "Poison Control",    link: "/toxicology" },
            { name: "Patient Records",   link: "/portal" },
          ],
          termsOfService: "https://riversidevet.com/terms",
          privacyPolicy:  "https://riversidevet.com/privacy",
        },
        hours: {
          monday:    { isClosed: false, is24Hours: true, slots: [] },
          tuesday:   { isClosed: false, is24Hours: true, slots: [] },
          wednesday: { isClosed: false, is24Hours: true, slots: [] },
          thursday:  { isClosed: false, is24Hours: true, slots: [] },
          friday:    { isClosed: false, is24Hours: true, slots: [] },
          saturday:  { isClosed: false, is24Hours: true, slots: [] },
          sunday:    { isClosed: false, is24Hours: true, slots: [] },
        },
      };

      submitForApprovalWithDiff("Riverside Veterinary Hospital", riversidePendingChanges as unknown as ClinicWebsite, "admin.user", riversideBaseClinic as unknown as ClinicWebsite);

      // ─────────────────────────────────────────────────────────────────────────
      // SCENARIO 4 — Mountain View Animal Hospital
      // Full rebrand: new identity, relocated address, 3 new premium services,
      // 2 new specialists, hospital type upgraded, 4 more pet types added.
      // ~18 field changes   Author: dr.patricia.wells
      // ─────────────────────────────────────────────────────────────────────────
      const mvBase = {
        general: {
          name: "Mountain View Veterinary",
          slug: "mountain-view-vet",
          tagline: "Trusted pet care in the valley",
          logoUrl: "https://via.placeholder.com/150",
          primaryColor: "#1D4ED8",
          secondaryColor: "#EFF6FF",
          metaDescription: "General veterinary practice serving Mountain View and nearby communities.",
        },
        taxonomy: { hospitalType: "general_practice" as const, petTypes: ["dog", "cat"] },
        contact: {
          phone: "+1-650-555-0100",
          emergencyPhone: "",
          email: "info@mountainviewvet.com",
          website: "https://mountainviewvet.com",
          address: { street: "800 Castro St", city: "Mountain View", state: "CA", zip: "94041", country: "USA", mapEmbedUrl: "" },
          businessHours: [],
        },
        services: [
          { id: "mv-s1", name: "Wellness Exam", description: "Annual preventive health check", slug: "wellness-exam", order: 0, isVisible: true, isHighlighted: false },
          { id: "mv-s2", name: "Vaccination", description: "Core & lifestyle vaccines for dogs and cats", slug: "vaccination", order: 1, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          { id: "mv-v1", name: "Dr. Patricia Wells", credentials: "DVM", title: "Lead Veterinarian", bio: "15 years in general practice", specializations: ["general_practice"], serviceIds: ["mv-s1", "mv-s2"], order: 0, isVisible: true },
        ],
        blocks: [], status: "draft" as const, meta: { createdBy: "admin", version: 1 },
      };

      const mvPending = {
        ...mvBase,
        general: {
          ...mvBase.general,
          name: "Mountain View Animal Hospital",            // CHANGED — rebrand
          slug: "mountain-view-animal-hospital",            // CHANGED — new slug
          tagline: "Advanced Specialty & Urgent Care for Every Pet", // CHANGED
          logoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200", // CHANGED
          primaryColor: "#7C3AED",                          // CHANGED — teal→purple
          secondaryColor: "#F5F3FF",                        // CHANGED
          metaDescription: "Specialty veterinary hospital offering cardiology, oncology, and 24-hr urgent care across the Bay Area.", // CHANGED
        },
        taxonomy: {
          hospitalType: "specialty_referral" as const,      // CHANGED — upgraded
          petTypes: ["dog", "cat", "rabbit", "bird", "reptile", "small_mammal"], // CHANGED — expanded
        },
        contact: {
          ...mvBase.contact,
          phone: "+1-650-555-0199",                         // CHANGED
          emergencyPhone: "+1-650-555-9911",                // CHANGED — added emergency line
          email: "hello@mvanimalhospital.com",              // CHANGED
          website: "https://mvanimalhospital.com",          // CHANGED
          address: { street: "1450 Shoreline Blvd", city: "Mountain View", state: "CA", zip: "94043", country: "USA", mapEmbedUrl: "https://maps.google.com/embed?q=1450+Shoreline" }, // CHANGED — new address
        },
        services: [
          ...mvBase.services,
          { id: "mv-s3", name: "Cardiology", description: "Echocardiograms, Holter monitors, and interventional procedures for canine & feline heart disease", slug: "cardiology", order: 2, isVisible: true, isHighlighted: true },
          { id: "mv-s4", name: "Oncology", description: "Chemotherapy, immunotherapy, and palliative care with a board-certified oncologist on staff", slug: "oncology", order: 3, isVisible: true, isHighlighted: true },
          { id: "mv-s5", name: "Urgent Care", description: "Walk-in appointments available daily 8 AM–10 PM for non-life-threatening conditions", slug: "urgent-care", order: 4, isVisible: true, isHighlighted: true },
        ],
        veterinarians: [
          ...mvBase.veterinarians,
          { id: "mv-v2", name: "Dr. Kevin Tran", credentials: "DVM, DACVIM (Cardiology)", title: "Cardiologist", bio: "Board-certified cardiologist with 12 years performing minimally invasive cardiac procedures in companion animals.", specializations: ["cardiology"], serviceIds: ["mv-s3"], order: 1, isVisible: true },
          { id: "mv-v3", name: "Dr. Amelia Ortiz", credentials: "DVM, DACVIM (Oncology)", title: "Oncologist", bio: "Specialises in solid tumour management and novel immunotherapy protocols. Published researcher in feline lymphoma.", specializations: ["oncology"], serviceIds: ["mv-s4"], order: 2, isVisible: true },
        ],
        // ── WebsiteEditor + Domain fields ────────────────────────────────────
        seo: {
          metaTitle: "Mountain View Animal Hospital | Cardiology, Oncology & Urgent Care Bay Area",
          metaDescription: "Board-certified specialists in cardiology and oncology. Walk-in urgent care 8 AM–10 PM. Serving dogs, cats, rabbits, birds, reptiles & small mammals across the Bay Area.",
          ogImageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200",
          canonicalUrl: "https://mountain-view-animal-hospital.vet",
          robots: "index,follow",
          focusKeyword: "specialty veterinary hospital Mountain View Bay Area cardiology",
        },
        navLinks: [
          { id: "home",      label: "Home",           href: "/",                    openInNewTab: false },
          { id: "about",     label: "About",          href: "/about",               openInNewTab: false },
          { id: "services",  label: "Services",       href: "/services",            openInNewTab: false },
          { id: "cardio",    label: "Cardiology",     href: "/services/cardiology", openInNewTab: false },
          { id: "onco",      label: "Oncology",       href: "/services/oncology",   openInNewTab: false },
          { id: "urgent",    label: "Urgent Care",    href: "/urgent-care",         openInNewTab: false },
          { id: "book",      label: "Book Now",       href: "/book",                openInNewTab: false },
        ],
        navConfig: {
          isSticky: true,
          isTransparentOnScroll: true,
          colorScheme: "dark",
          showClinicName: true,
          ctaLabel: "Book Specialist",
          ctaHref: "/book",
        },
        integrations: {
          pixelTrackingEnabled:    true,
          ottoEnabled:             false,
          ottoWidgetScript:        "",
          vetstoriaEnabled:        true,
          googleTagManagerEnabled: true,
          facebookPixelEnabled:    true,
          microsoftClarityEnabled: true,
          cookieConsentEnabled:    true,
        },
        footerConfig: {
          subscriptionEnabled:    true,
          subscriptionHeading:    "Specialist pet health news from our cardiology & oncology team",
          subscriptionLink:       "https://mvanimalhospital.com/newsletter",
          additionalLinksEnabled: true,
          additionalLinks: [
            { name: "Referral Portal",      link: "/referrals" },
            { name: "Client Portal",        link: "/portal" },
            { name: "Emergency Protocols",  link: "/emergency" },
          ],
          termsOfService: "https://mvanimalhospital.com/terms",
          privacyPolicy:  "https://mvanimalhospital.com/privacy",
        },
        servicesConfig: {
          pricingEnabled: false,
          pricingUrl: "",
          serviceGroups: [
            { id: "grp-1", enabled: true, name: "Primary Care", selectedServiceIds: ["svc-8", "svc-5", "svc-6"] },
            { id: "grp-2", enabled: true, name: "Specialty",    selectedServiceIds: ["svc-1", "svc-9", "svc-10", "svc-13"] },
          ],
        },
        vetsConfig: { selectedVetIds: ["vet-2", "vet-3", "vet-5", "vet-7"] },
        hours: {
          monday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "22:00" }] },
          tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "22:00" }] },
          wednesday: { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "22:00" }] },
          thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "22:00" }] },
          friday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "22:00" }] },
          saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "22:00" }] },
          sunday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "22:00" }] },
        },
      };

      const mvV = submitForApprovalWithDiff("Mountain View Animal Hospital", mvPending as unknown as ClinicWebsite, "dr.patricia.wells", mvBase as unknown as ClinicWebsite);
      if (mvV) {
        setTimeout(() => {
          addFeedback(mvV.id, { id: "", versionId: mvV.id, createdBy: "admin_review", createdAt: new Date(Date.now() - 45 * 60000).toISOString(), type: "needs_review", fieldPath: "general.primaryColor", message: "Brand colour change from blue → purple needs sign-off from the marketing team before we can approve. Please attach the updated brand style guide.", resolved: false });
          addFeedback(mvV.id, { id: "", versionId: mvV.id, createdBy: "admin_review", createdAt: new Date(Date.now() - 30 * 60000).toISOString(), type: "request_change", fieldPath: "contact.address.street", message: "Can you confirm the lease is signed at 1450 Shoreline? Operations needs written confirmation before we update the public listing.", resolved: false });
          addFeedback(mvV.id, { id: "", versionId: mvV.id, createdBy: "admin_review", createdAt: new Date(Date.now() - 10 * 60000).toISOString(), type: "needs_review", fieldPath: "services.oncology", message: "Oncology description looks great. Just verify Dr. Ortiz's DACVIM credentials are on file in HR before publishing.", resolved: true });
        }, 200);
      }

      // ─────────────────────────────────────────────────────────────────────────
      // SCENARIO 5 — Pacific Coast Pet Wellness
      // Contact refresh + telemedicine launch + 1 vet bio update
      // ~7 field changes   Author: sarah.kim  |  3 feedback items
      // ─────────────────────────────────────────────────────────────────────────
      const pcBase = {
        general: {
          name: "Pacific Coast Pet Wellness",
          slug: "pacific-coast-pet",
          tagline: "Holistic care for coastal companions",
          logoUrl: "https://via.placeholder.com/150",
          primaryColor: "#0EA5E9",
          secondaryColor: "#F0F9FF",
          metaDescription: "Integrative veterinary practice offering acupuncture, nutrition counselling, and general care.",
        },
        taxonomy: { hospitalType: "general_practice" as const, petTypes: ["dog", "cat", "rabbit"] },
        contact: {
          phone: "+1-831-555-0200",
          emergencyPhone: "+1-831-555-0911",
          email: "care@pacificcoastpet.com",
          website: "https://pacificcoastpet.com",
          address: { street: "22 Ocean Ave", city: "Santa Cruz", state: "CA", zip: "95060", country: "USA", mapEmbedUrl: "" },
          businessHours: [],
        },
        services: [
          { id: "pc-s1", name: "Integrative Medicine", description: "Acupuncture, herbal therapy, and nutritional counselling", slug: "integrative-medicine", order: 0, isVisible: true, isHighlighted: true },
          { id: "pc-s2", name: "Preventive Care", description: "Vaccines, parasite control, and wellness bloodwork", slug: "preventive-care", order: 1, isVisible: true, isHighlighted: false },
          { id: "pc-s3", name: "Dental Health", description: "Professional dental cleaning under anaesthesia with full mouth X-rays", slug: "dental-health", order: 2, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          { id: "pc-v1", name: "Dr. Mei-Ling Chu", credentials: "DVM, CVA", title: "Holistic Veterinarian", bio: "Certified veterinary acupuncturist with a passion for integrative healing.", specializations: ["general_practice"], serviceIds: ["pc-s1", "pc-s2"], order: 0, isVisible: true },
          { id: "pc-v2", name: "Dr. Omar Khalid", credentials: "DVM", title: "General Practitioner", bio: "6 years experience with small animals.", specializations: ["general_practice"], serviceIds: ["pc-s2", "pc-s3"], order: 1, isVisible: true },
        ],
        blocks: [], status: "draft" as const, meta: { createdBy: "admin", version: 2 },
      };

      const pcPending = {
        ...pcBase,
        general: {
          ...pcBase.general,
          logoUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=200", // CHANGED
          primaryColor: "#0369A1",                          // CHANGED — deeper ocean blue
          metaDescription: "Holistic & integrative vet in Santa Cruz. Acupuncture, telemedicine, nutrition counselling and preventive care for dogs, cats, and rabbits.", // CHANGED
        },
        contact: {
          ...pcBase.contact,
          phone: "+1-831-555-0210",                         // CHANGED
          email: "hello@pacificcoastpet.com",               // CHANGED
          address: { ...pcBase.contact.address, street: "22 Ocean Ave, Suite 4B" }, // CHANGED
          website: "https://pacificcoastpetwellness.com",   // CHANGED
        },
        services: [
          ...pcBase.services,
          { id: "pc-s4", name: "Telemedicine Consults", description: "Video appointments for follow-ups, nutrition reviews, and minor concerns — available 7 days a week", slug: "telemedicine", order: 3, isVisible: true, isHighlighted: true },
          { id: "pc-s5", name: "Senior Wellness Programme", description: "Bi-annual comprehensive bloodwork panel, joint scoring, and cognitive assessment for pets aged 7+", slug: "senior-wellness", order: 4, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          { ...pcBase.veterinarians[0], bio: "Certified veterinary acupuncturist and IVAS-accredited practitioner with 9 years of integrative healing experience. Speaker at the 2025 AHVMA conference." }, // CHANGED
          { ...pcBase.veterinarians[1], bio: "6 years in small animal practice with a special interest in nutritional medicine and geriatric patient management. Completed WSAVA nutrition training 2024." }, // CHANGED
        ],
        // ── WebsiteEditor fields ──────────────────────────────────────────────
        seo: {
          metaTitle: "Pacific Coast Pet Wellness Santa Cruz | Holistic Vet + Telemedicine",
          metaDescription: "Integrative veterinary clinic in Santa Cruz offering acupuncture, telemedicine, nutrition counselling and senior wellness for dogs, cats & rabbits.",
          ogImageUrl: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200",
          canonicalUrl: "https://pacific-coast-pet.vet",
          robots: "index,follow",
          focusKeyword: "holistic veterinarian Santa Cruz telemedicine integrative",
        },
        navLinks: [
          { id: "home",        label: "Home",          href: "/",              openInNewTab: false },
          { id: "integrative", label: "Integrative",   href: "/integrative",   openInNewTab: false },
          { id: "telemedicine",label: "Telemedicine",  href: "/telemedicine",  openInNewTab: false },
          { id: "senior",      label: "Senior Care",   href: "/senior",        openInNewTab: false },
          { id: "team",        label: "Our Team",      href: "/team",          openInNewTab: false },
          { id: "book",        label: "Book / Video",  href: "/book",          openInNewTab: false },
        ],
        navConfig: {
          isSticky: true,
          isTransparentOnScroll: true,
          colorScheme: "light",
          showClinicName: true,
          ctaLabel: "Book or Video Call",
          ctaHref: "/book",
        },
        servicesConfig: {
          pricingEnabled: false,
          pricingUrl: "",
          serviceGroups: [
            { id: "grp-1", enabled: true, name: "Wellness",     selectedServiceIds: ["svc-8", "svc-7", "svc-6"] },
            { id: "grp-2", enabled: true, name: "Integrative",  selectedServiceIds: ["svc-3", "svc-10"] },
          ],
        },
        vetsConfig: { selectedVetIds: ["vet-3", "vet-6"] },
        integrations: {
          pixelTrackingEnabled:    false,
          ottoEnabled:             true,
          ottoWidgetScript:        "<script src='https://otto.vet/widget.js' data-clinic='pacific-coast'></script>",
          vetstoriaEnabled:        false,
          googleTagManagerEnabled: false,
          facebookPixelEnabled:    true,
          microsoftClarityEnabled: false,
          cookieConsentEnabled:    true,
        },
        footerConfig: {
          subscriptionEnabled:    true,
          subscriptionHeading:    "Holistic pet health tips from Dr. Chu & the Pacific Coast team",
          subscriptionLink:       "https://pacificcoastpetwellness.com/newsletter",
          additionalLinksEnabled: true,
          additionalLinks: [
            { name: "Telemedicine FAQs",  link: "/telemedicine/faqs" },
            { name: "Nutrition Guides",   link: "/resources/nutrition" },
          ],
          termsOfService: "https://pacificcoastpetwellness.com/terms",
          privacyPolicy:  "https://pacificcoastpetwellness.com/privacy",
        },
        hours: {
          monday:    { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "18:00" }] },
          tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "18:00" }] },
          wednesday: { isClosed: true,  is24Hours: false, slots: [] },
          thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "18:00" }] },
          friday:    { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "17:00" }] },
          saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "13:00" }] },
          sunday:    { isClosed: true,  is24Hours: false, slots: [] },
        },
      };

      const pcV = submitForApprovalWithDiff("Pacific Coast Pet Wellness", pcPending as unknown as ClinicWebsite, "sarah.kim", pcBase as unknown as ClinicWebsite);
      if (pcV) {
        setTimeout(() => {
          addFeedback(pcV.id, { id: "", versionId: pcV.id, createdBy: "admin_review", createdAt: new Date(Date.now() - 2 * 60 * 60000).toISOString(), type: "needs_review", fieldPath: "contact.phone", message: "Old number still forwards to this clinic. Check with the office manager that the new number is fully live before we publish.", resolved: false });
          addFeedback(pcV.id, { id: "", versionId: pcV.id, createdBy: "admin_review", createdAt: new Date(Date.now() - 90 * 60000).toISOString(), type: "request_change", fieldPath: "services.telemedicine", message: "Telemedicine page needs a consent/waiver disclaimer per state veterinary board requirements (CA BPC 4826.6). Please add a note or link.", resolved: false });
          addFeedback(pcV.id, { id: "", versionId: pcV.id, createdBy: "sarah.kim", createdAt: new Date(Date.now() - 20 * 60000).toISOString(), type: "needs_review", fieldPath: "veterinarians.pc-v1.bio", message: "Updated Dr. Chu's bio to reflect her 2025 AHVMA speaking engagement. Previous version was 3 years out of date.", resolved: true });
        }, 300);
      }

      // ─────────────────────────────────────────────────────────────────────────
      // SCENARIO 6 — Desert Bloom Animal Hospital
      // Taxonomy upgrade + colour rebrand + single new service
      // ~5 field changes   Author: alex.mendoza   (clean — no feedback yet)
      // ─────────────────────────────────────────────────────────────────────────
      const dbBase = {
        general: {
          name: "Desert Bloom Animal Hospital",
          slug: "desert-bloom",
          tagline: "Compassionate care under the sun",
          logoUrl: "https://via.placeholder.com/150",
          primaryColor: "#DC2626",
          secondaryColor: "#FFF7ED",
          metaDescription: "Full-service veterinary hospital for dogs and cats in Scottsdale, AZ.",
        },
        taxonomy: { hospitalType: "general_practice" as const, petTypes: ["dog", "cat"] },
        contact: {
          phone: "+1-480-555-0300",
          emergencyPhone: "+1-480-555-0911",
          email: "info@desertbloom.com",
          website: "https://desertbloom.com",
          address: { street: "5500 N Scottsdale Rd", city: "Scottsdale", state: "AZ", zip: "85253", country: "USA", mapEmbedUrl: "" },
          businessHours: [],
        },
        services: [
          { id: "db-s1", name: "General Practice", description: "Routine exams, vaccines, and primary care", slug: "general", order: 0, isVisible: true, isHighlighted: false },
          { id: "db-s2", name: "Surgery", description: "Elective and emergency soft-tissue surgery", slug: "surgery", order: 1, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          { id: "db-v1", name: "Dr. Rosa Delgado", credentials: "DVM", title: "Medical Director", bio: "18 years in small animal medicine and surgery.", specializations: ["general_practice"], serviceIds: ["db-s1", "db-s2"], order: 0, isVisible: true },
        ],
        blocks: [], status: "draft" as const, meta: { createdBy: "admin", version: 1 },
      };

      const dbPending = {
        ...dbBase,
        general: {
          ...dbBase.general,
          tagline: "Specialty & Emergency Care for Every Desert Companion",   // CHANGED
          logoUrl: "https://images.unsplash.com/photo-1629909615957-be38d48fbbe4?w=200", // CHANGED
          primaryColor: "#D97706",                                             // CHANGED — red → amber
          secondaryColor: "#FFFBEB",                                           // CHANGED
          metaDescription: "AAHA-accredited specialty hospital in Scottsdale offering exotic animal medicine, advanced imaging, and 24-hr urgent care.", // CHANGED
        },
        taxonomy: {
          hospitalType: "specialty_referral" as const,                        // CHANGED
          petTypes: ["dog", "cat", "rabbit", "reptile", "bird"],              // CHANGED
        },
        contact: {
          ...dbBase.contact,
          email: "specialty@desertbloom.com",                                  // CHANGED — new dedicated specialty inbox
          address: { ...dbBase.contact.address, mapEmbedUrl: "https://maps.google.com/embed?q=5500+N+Scottsdale+Rd" }, // CHANGED — map added
        },
        services: [
          ...dbBase.services,
          { id: "db-s3", name: "Exotic Animal Medicine", description: "Specialised care for reptiles, birds, small mammals, and uncommon companion species with an ABVP-certified exotic practitioner", slug: "exotic-medicine", order: 2, isVisible: true, isHighlighted: true },
          { id: "db-s4", name: "Advanced Imaging", description: "Digital radiography and ultrasound for accurate diagnosis of internal conditions across all species", slug: "imaging", order: 3, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          ...dbBase.veterinarians,
          { id: "db-v2", name: "Dr. Tomás Rivera", credentials: "DVM, ABVP (Exotic)", title: "Exotic Animal Specialist", bio: "ABVP board-certified in exotic companion mammal practice. Published author on chelonian medicine and reptile anaesthesia protocols.", specializations: ["exotic"], serviceIds: ["db-s3"], order: 1, isVisible: true },
        ],
        // ── WebsiteEditor fields ──────────────────────────────────────────────
        seo: {
          metaTitle: "Desert Bloom Animal Hospital Scottsdale | Exotic Animal & Specialty Vet",
          metaDescription: "AAHA-accredited specialty hospital in Scottsdale, AZ. Expert care for dogs, cats, rabbits, reptiles and birds. Advanced imaging and 24-hr urgent care.",
          ogImageUrl: "https://images.unsplash.com/photo-1629909615957-be38d48fbbe4?w=1200",
          canonicalUrl: "https://desert-bloom.vet",
          robots: "index,follow",
          focusKeyword: "exotic animal vet Scottsdale specialty hospital",
        },
        navLinks: [
          { id: "home",    label: "Home",           href: "/",               openInNewTab: false },
          { id: "exotic",  label: "Exotic Care",    href: "/exotic",         openInNewTab: false },
          { id: "services",label: "All Services",   href: "/services",       openInNewTab: false },
          { id: "team",    label: "Our Team",        href: "/team",           openInNewTab: false },
          { id: "book",    label: "Book Visit",      href: "/book",           openInNewTab: false },
        ],
        navConfig: {
          isSticky: true,
          isTransparentOnScroll: true,
          colorScheme: "light",
          showClinicName: true,
          ctaLabel: "Book a Visit",
          ctaHref: "/book",
        },
        servicesConfig: {
          pricingEnabled: false,
          pricingUrl: "",
          serviceGroups: [
            { id: "grp-1", enabled: true, name: "General Care", selectedServiceIds: ["svc-8", "svc-7", "svc-6"] },
            { id: "grp-2", enabled: true, name: "Specialty",    selectedServiceIds: ["svc-10", "svc-5", "svc-13"] },
          ],
        },
        vetsConfig: { selectedVetIds: ["vet-1", "vet-6"] },
        integrations: {
          pixelTrackingEnabled:    false,
          ottoEnabled:             false,
          ottoWidgetScript:        "",
          vetstoriaEnabled:        true,
          googleTagManagerEnabled: true,
          facebookPixelEnabled:    false,
          microsoftClarityEnabled: false,
          cookieConsentEnabled:    true,
        },
        footerConfig: {
          subscriptionEnabled:    true,
          subscriptionHeading:    "Exotic & specialty pet care advice from our Scottsdale vets",
          subscriptionLink:       "https://desertbloom.com/newsletter",
          additionalLinksEnabled: false,
          additionalLinks:        [],
          termsOfService: "https://desertbloom.com/terms",
          privacyPolicy:  "https://desertbloom.com/privacy",
        },
        hours: {
          monday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
          tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
          wednesday: { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
          thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
          friday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "17:00" }] },
          saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "15:00" }] },
          sunday:    { isClosed: true,  is24Hours: false, slots: [] },
        },
      };

      submitForApprovalWithDiff("Desert Bloom Animal Hospital", dbPending as unknown as ClinicWebsite, "alex.mendoza", dbBase as unknown as ClinicWebsite);

      // ─────────────────────────────────────────────────────────────────────────
      // SCENARIO 7 — Oakwood Companion Care
      // Services overhaul + 3 new vets + updated business email
      // ~14 field changes   Author: james.okafor   |  1 feedback item
      // ─────────────────────────────────────────────────────────────────────────
      const ocBase = {
        general: {
          name: "Oakwood Companion Care",
          slug: "oakwood-companion",
          tagline: "Where every pet is family",
          logoUrl: "https://via.placeholder.com/150",
          primaryColor: "#059669",
          secondaryColor: "#ECFDF5",
          metaDescription: "Friendly neighbourhood vet in Portland, OR.",
        },
        taxonomy: { hospitalType: "general_practice" as const, petTypes: ["dog", "cat"] },
        contact: {
          phone: "+1-503-555-0400",
          emergencyPhone: "",
          email: "hello@oakwoodcare.com",
          website: "https://oakwoodcare.com",
          address: { street: "3210 SE Hawthorne Blvd", city: "Portland", state: "OR", zip: "97214", country: "USA", mapEmbedUrl: "" },
          businessHours: [],
        },
        services: [
          { id: "oc-s1", name: "Wellness & Prevention", description: "Annual exams and core vaccinations", slug: "wellness", order: 0, isVisible: true, isHighlighted: false },
          { id: "oc-s2", name: "Sick Visits", description: "Same-day appointments for acute illness", slug: "sick-visits", order: 1, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          { id: "oc-v1", name: "Dr. James Okafor", credentials: "DVM", title: "Owner & Veterinarian", bio: "Founded Oakwood in 2018. Passionate about community-focused veterinary care.", specializations: ["general_practice"], serviceIds: ["oc-s1", "oc-s2"], order: 0, isVisible: true },
        ],
        blocks: [], status: "draft" as const, meta: { createdBy: "admin", version: 3 },
      };

      const ocPending = {
        ...ocBase,
        contact: {
          ...ocBase.contact,
          email: "appointments@oakwoodcare.com",                             // CHANGED — dedicated booking email
          emergencyPhone: "+1-503-555-4100",                                 // CHANGED — new after-hours line
        },
        services: [
          ...ocBase.services,
          { id: "oc-s3", name: "Dermatology", description: "Allergy testing, intradermal skin testing, and hyposensitisation protocols for chronic skin and ear conditions", slug: "dermatology", order: 2, isVisible: true, isHighlighted: true },
          { id: "oc-s4", name: "Behavioural Medicine", description: "Fear-Free certified consults for anxiety, aggression, compulsive disorders, and multi-pet household conflicts", slug: "behavioural-medicine", order: 3, isVisible: true, isHighlighted: true },
          { id: "oc-s5", name: "Rehabilitation & Sports Medicine", description: "Hydrotherapy, laser therapy, and customised physiotherapy plans for post-surgical and arthritic patients", slug: "rehabilitation", order: 4, isVisible: true, isHighlighted: false },
          { id: "oc-s6", name: "Nutrition Consultation", description: "Evidence-based dietary planning for weight management, renal disease, diabetes, and allergy elimination diets", slug: "nutrition", order: 5, isVisible: true, isHighlighted: false },
          { id: "oc-s7", name: "Geriatric Care", description: "Bi-annual wellness checks and proactive management plans for senior dogs and cats (7+ years)", slug: "geriatric-care", order: 6, isVisible: true, isHighlighted: false },
        ],
        veterinarians: [
          ocBase.veterinarians[0],
          { id: "oc-v2", name: "Dr. Priya Mehta", credentials: "DVM, DACVD", title: "Dermatologist", bio: "Board-certified veterinary dermatologist. 10 years of managing complex immune-mediated and allergic skin disease in dogs, cats, and exotics.", specializations: ["dermatology"], serviceIds: ["oc-s3"], order: 1, isVisible: true },
          { id: "oc-v3", name: "Dr. Tyler Brooks", credentials: "DVM, IAABC-CDBC", title: "Behavioural Medicine Specialist", bio: "Fear-Free Elite certified, IAABC-accredited behaviour consultant. Focuses on low-stress handling and positive reinforcement protocols.", specializations: ["behaviour"], serviceIds: ["oc-s4"], order: 2, isVisible: true },
          { id: "oc-v4", name: "Dr. Fatima Al-Rashid", credentials: "DVM, CCRP", title: "Rehabilitation Therapist", bio: "Certified Canine Rehabilitation Practitioner with advanced training in underwater treadmill therapy and sport medicine for performance dogs.", specializations: ["rehabilitation"], serviceIds: ["oc-s5"], order: 3, isVisible: true },
        ],
        // ── WebsiteEditor + Domain fields ────────────────────────────────────
        seo: {
          metaTitle: "Oakwood Companion Care | Dermatology, Behaviour & Rehab Specialists Portland",
          metaDescription: "Multi-specialty companion animal clinic in Portland, OR. Fear-Free certified, IAABC behaviour team, canine hydrotherapy rehab & geriatric care programmes. Book a consult today.",
          ogImageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200",
          canonicalUrl: "https://oakwood-companion-care.vet",
          robots: "index,follow",
          focusKeyword: "companion animal specialist Portland dermatology behaviour",
        },
        navLinks: [
          { id: "home",       label: "Home",         href: "/",                       openInNewTab: false },
          { id: "services",   label: "Services",     href: "/services",               openInNewTab: false },
          { id: "derma",      label: "Dermatology",  href: "/services/dermatology",   openInNewTab: false },
          { id: "behaviour",  label: "Behaviour",    href: "/services/behaviour",     openInNewTab: false },
          { id: "rehab",      label: "Rehab",        href: "/services/rehab",         openInNewTab: false },
          { id: "team",       label: "Our Team",     href: "/team",                   openInNewTab: false },
          { id: "book",       label: "Book Consult", href: "/book",                   openInNewTab: false },
        ],
        navConfig: {
          isSticky: true,
          isTransparentOnScroll: true,
          colorScheme: "light",
          showClinicName: true,
          ctaLabel: "Book a Consult",
          ctaHref: "/book",
        },
        servicesConfig: {
          pricingEnabled: false,
          pricingUrl: "",
          serviceGroups: [
            { id: "grp-1", enabled: true, name: "Core Care",           selectedServiceIds: ["svc-8", "svc-6", "svc-5"] },
            { id: "grp-2", enabled: true, name: "Specialist Services", selectedServiceIds: ["svc-11", "svc-12", "svc-13", "svc-7", "svc-3"] },
          ],
        },
        vetsConfig: { selectedVetIds: ["vet-1", "vet-4", "vet-6", "vet-7"] },
        footerConfig: {
          subscriptionEnabled:    true,
          subscriptionHeading:    "Monthly pet wellness tips from our Fear-Free team",
          subscriptionLink:       "https://oakwoodcare.com/newsletter",
          additionalLinksEnabled: true,
          additionalLinks: [
            { name: "Behaviour Resources", link: "/resources/behaviour" },
            { name: "Rehab Exercises",     link: "/resources/rehab" },
            { name: "Senior Pet Guide",    link: "/resources/senior-pets" },
          ],
          termsOfService: "https://oakwoodcare.com/terms",
          privacyPolicy:  "https://oakwoodcare.com/privacy",
        },
        integrations: {
          pixelTrackingEnabled:    false,
          ottoEnabled:             true,
          ottoWidgetScript:        "<script src='https://otto.vet/widget.js' data-clinic='oakwood'></script>",
          vetstoriaEnabled:        false,
          googleTagManagerEnabled: true,
          facebookPixelEnabled:    false,
          microsoftClarityEnabled: true,
          cookieConsentEnabled:    true,
        },
        hours: {
          monday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "19:00" }] },
          tuesday:   { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "19:00" }] },
          wednesday: { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "19:00" }] },
          thursday:  { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "19:00" }, { open: "18:00", close: "20:00" }] },
          friday:    { isClosed: false, is24Hours: false, slots: [{ open: "08:00", close: "18:00" }] },
          saturday:  { isClosed: false, is24Hours: false, slots: [{ open: "09:00", close: "16:00" }] },
          sunday:    { isClosed: true,  is24Hours: false, slots: [] },
        },
      };

      const ocV = submitForApprovalWithDiff("Oakwood Companion Care", ocPending as unknown as ClinicWebsite, "james.okafor", ocBase as unknown as ClinicWebsite);
      if (ocV) {
        setTimeout(() => {
          addFeedback(ocV.id, { id: "", versionId: ocV.id, createdBy: "admin_review", createdAt: new Date(Date.now() - 15 * 60000).toISOString(), type: "needs_review", fieldPath: "veterinarians.oc-v2", message: "Dr. Mehta's DACVD diploma needs to be scanned and uploaded to the credentials folder before we can list her as board-certified publicly.", resolved: false });
        }, 400);
      }

      setSampleDataLoaded(true);
    }
  }, [sampleDataLoaded, pendingApprovals.length, submitForApprovalWithDiff, addFeedback]);

  // Get all approved versions for history
  const allApproved = Array.from(workflows.values())
    .flatMap((w) => w.approvalHistory.slice(-5)) // Last 5 per clinic
    .sort((a, b) => new Date(b.approvedAt || "").getTime() - new Date(a.approvedAt || "").getTime());

  // Escape key closes the open Draft panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && openDraftId) setOpenDraftId(null);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [openDraftId]);

  return (
    <div className="flex-1 overflow-hidden bg-white flex flex-col">
      <div className="px-8 pt-8 pb-0 overflow-y-auto flex-1 flex flex-col">

        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0">
              <ClipboardList className="w-4.5 h-4.5 text-teal-600" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Approval Flow</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Review submitted clinic changes before they go live.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Approval sections" className="flex gap-4 border-b border-gray-200 mb-6">
          {[
            { id: "pending" as const, label: "Pending Approvals", count: pendingApprovals.length },
            { id: "history" as const, label: "History", count: allApproved.length },
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
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
          <div className="space-y-2 pb-8">
            {pendingApprovals.length > 0 ? (
              pendingApprovals.map((approval) => {
                const v2 = approval as ClinicVersionV2;
                const isDraftOpen = openDraftId === v2.id;

                // Read actual feedback count from the workflow thread
                const wf = Array.from(workflows.values()).find(
                  w => w.pendingApproval?.id === v2.id
                ) as ApprovalWorkflowV2 | undefined;
                const feedbackCount = wf?.feedbackThread?.length ?? 0;

                return (
                  <ChangesSummaryCard
                    key={v2.id}
                    clinicName={v2.clinicId}
                    submittedBy={v2.createdBy}
                    submittedAt={timeAgo(v2.createdAt)}
                    changesSummary={v2.changesSummary || []}
                    feedbackCount={feedbackCount}
                    diffStats={v2.diffStats || { totalChanged: 0, bySection: {}, createdItems: 0, deletedItems: 0 }}
                    isDraftOpen={isDraftOpen}
                    onViewDraft={() => setOpenDraftId(isDraftOpen ? null : v2.id)}
                    onReviewInEditor={() =>
                      navigate("/approvals/review", {
                        state: { mode: "admin-review", clinicName: v2.clinicId, submissionId: v2.id },
                      })
                    }
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                  <ClipboardList className="w-5 h-5 text-gray-300" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-gray-500">All caught up</p>
                <p className="text-xs text-gray-400 mt-1">No pending approvals right now.</p>
              </div>
            )}
          </div>
        )}

        {/* Draft popup modal — rendered once at page level for correct z-index */}
        {openDraftId && (() => {
          const active = pendingApprovals.find(a => a.id === openDraftId) as ClinicVersionV2 | undefined;
          if (!active) return null;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const changes = active.changes as any;
          const fullFieldChanges = [
            ...(active.fieldChanges || []),
            ...buildContextFieldChanges(changes),
          ];
          const submittedAt = new Date(active.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          });
          const city  = changes?.contact?.address?.city  as string | undefined;
          const state = changes?.contact?.address?.state as string | undefined;
          return (
            <DraftPanel
              fieldChanges={fullFieldChanges}
              clinicName={active.clinicId}
              submittedBy={active.createdBy}
              submittedAt={submittedAt}
              primaryColor={changes?.general?.primaryColor   as string | undefined}
              clinicType={changes?.taxonomy?.hospitalType    as string | undefined}
              petTypes={changes?.taxonomy?.petTypes          as string[] | undefined}
              clinicSlug={changes?.general?.slug             as string | undefined}
              clinicLocation={[city, state].filter(Boolean).join(", ") || undefined}
              onApprove={(_edits) => {
                approveChanges(active.id, "", "admin");
                setOpenDraftId(null);
              }}
              onRequestChanges={(feedback) => {
                requestRevision(active.id, feedback, "admin");
                setOpenDraftId(null);
              }}
              onReject={(reason) => {
                rejectChanges(active.id, reason, "admin");
                setOpenDraftId(null);
              }}
              onReviewInEditor={() =>
                navigate("/approvals/review", {
                  state: { mode: "admin-review", clinicName: active.clinicId, submissionId: active.id },
                })
              }
              onClose={() => setOpenDraftId(null)}
            />
          );
        })()}

        {/* History */}
        {activeTab === "history" && (
          <div className="space-y-2 pb-8">
            {allApproved.length > 0 ? (
              allApproved.map((approval) => {
                const v2 = approval as ClinicVersionV2;
                const status = approval.status;
                const isApproved       = status === "approved";
                const isNeedsRevision  = status === "needs_revision";
                const isRejected       = status === "rejected";
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const changes = v2.changes as any;
                const primaryColor = changes?.general?.primaryColor as string | undefined;
                const initials = approval.clinicId
                  .split(/\s+/).slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? "").join("");

                const statusBadge = isApproved
                  ? { label: "Approved",          cls: "bg-emerald-50 text-emerald-700 border-emerald-200" }
                  : isNeedsRevision
                  ? { label: "Revision Requested", cls: "bg-amber-50 text-amber-700 border-amber-200"   }
                  : { label: "Rejected",            cls: "bg-red-50 text-red-700 border-red-200"         };

                const statusIcon = isApproved
                  ? <CheckCircle size={18} className="shrink-0 text-emerald-400" aria-hidden="true" />
                  : isNeedsRevision
                  ? <AlertCircle size={18} className="shrink-0 text-amber-400" aria-hidden="true" />
                  : <XCircle     size={18} className="shrink-0 text-red-400"    aria-hidden="true" />;

                const avatarColor = primaryColor ?? (isApproved ? "#0F766E" : isNeedsRevision ? "#D97706" : "#DC2626");

                return (
                  <div
                    key={approval.id}
                    className="bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {/* Clinic avatar */}
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 opacity-70"
                        style={{ backgroundColor: avatarColor }}
                        aria-hidden="true"
                      >
                        {initials}
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-semibold text-gray-900">{approval.clinicId}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${statusBadge.cls}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                          <span>
                            {isApproved ? "Approved" : "Reviewed"} by{" "}
                            <span className="font-medium text-gray-600">{approval.approvedBy}</span>
                          </span>
                          <span>·</span>
                          <span>{timeAgo(approval.approvedAt || approval.createdAt)}</span>
                          {v2.diffStats?.totalChanged > 0 && (
                            <>
                              <span>·</span>
                              <span>{v2.diffStats.totalChanged} field{v2.diffStats.totalChanged !== 1 ? "s" : ""} changed</span>
                            </>
                          )}
                        </div>
                        {approval.approvalNotes && (
                          <p className="text-xs text-gray-500 mt-1.5 italic">"{approval.approvalNotes}"</p>
                        )}
                      </div>

                      {/* Status icon */}
                      {statusIcon}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5 text-gray-300" aria-hidden="true" />
                </div>
                <p className="text-sm font-medium text-gray-500">No history yet</p>
                <p className="text-xs text-gray-400 mt-1">Approved and rejected submissions will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
