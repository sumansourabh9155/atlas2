/**
 * Mock Data — Austin Paws Specialty & Emergency Veterinary Center
 * Fully satisfies the ClinicWebsite Zod schema.
 */

import type { ClinicWebsite } from "../types/clinic";

export const mockClinicData: ClinicWebsite = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",

  // ── 1. General Details ──────────────────────────────────────────────────
  general: {
    name: "Austin Paws Specialty & Emergency",
    slug: "austin-paws-specialty-emergency",
    primaryColor: "#0F766E",       // teal-700 — trustworthy, medical
    secondaryColor: "#F59E0B",     // amber-500 — warm, approachable
    logoUrl: "https://placehold.co/160x48/0F766E/white?text=AustinPaws",
    tagline: "Advanced Care. Compassionate Hearts.",
    metaDescription:
      "Austin's premier specialty and 24/7 emergency veterinary center. Board-certified specialists in internal medicine, surgery, and critical care.",
  },

  // ── 2. Taxonomy ─────────────────────────────────────────────────────────
  taxonomy: {
    hospitalType: "specialty_referral",
    petTypes: ["dog", "cat", "rabbit", "small_mammal", "exotic"],
  },

  // ── 3. Location & Contact ───────────────────────────────────────────────
  contact: {
    address: {
      street: "4820 Burnet Road",
      street2: "Suite 100",
      city: "Austin",
      state: "TX",
      zip: "78756",
      country: "United States",
      mapEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3442.0!2d-97.7431!3d30.3243",
      coordinates: { lat: 30.3243, lng: -97.7431 },
    },
    phone: "+1 (512) 555-0182",
    emergencyPhone: "+1 (512) 555-0199",
    email: "care@austinpaws.vet",
    website: "https://austinpaws.vet",
    businessHours: [
      { day: "monday",    open: "08:00", close: "20:00", isClosed: false },
      { day: "tuesday",   open: "08:00", close: "20:00", isClosed: false },
      { day: "wednesday", open: "08:00", close: "20:00", isClosed: false },
      { day: "thursday",  open: "08:00", close: "20:00", isClosed: false },
      { day: "friday",    open: "08:00", close: "18:00", isClosed: false },
      { day: "saturday",  open: "09:00", close: "16:00", isClosed: false },
      { day: "sunday",    open: "00:00", close: "00:00", isClosed: true  },
    ],
  },

  // ── 4. Veterinarians ────────────────────────────────────────────────────
  veterinarians: [
    {
      id: "vet-001-uuid-0000-000000000001",
      name: "Dr. Maya Reyes",
      credentials: "DVM, DACVIM",
      title: "Chief of Internal Medicine",
      bio: "Dr. Reyes completed her residency at Texas A&M College of Veterinary Medicine and is board-certified in Small Animal Internal Medicine. She has a special interest in endocrinology and immune-mediated diseases, with over 12 years of clinical experience.",
      photoUrl: "https://i.pravatar.cc/400?img=47",
      specializations: ["Internal Medicine", "Endocrinology", "Nephrology"],
      serviceIds: [
        "svc-001-uuid-0000-000000000001",
        "svc-002-uuid-0000-000000000002",
      ],
      order: 0,
      isVisible: true,
    },
    {
      id: "vet-002-uuid-0000-000000000002",
      name: "Dr. James Okafor",
      credentials: "DVM, DACVS",
      title: "Head of Surgical Services",
      bio: "Dr. Okafor is a board-certified veterinary surgeon specializing in soft tissue and orthopedic procedures. He trained at Cornell University and has performed over 3,000 surgeries, including complex oncologic resections and minimally invasive laparoscopic procedures.",
      photoUrl: "https://i.pravatar.cc/400?img=12",
      specializations: ["Soft Tissue Surgery", "Orthopedics", "Laparoscopy"],
      serviceIds: [
        "svc-003-uuid-0000-000000000003",
        "svc-004-uuid-0000-000000000004",
      ],
      order: 1,
      isVisible: true,
    },
    {
      id: "vet-003-uuid-0000-000000000003",
      name: "Dr. Priya Nair",
      credentials: "DVM, DACVECC",
      title: "Director of Emergency & Critical Care",
      bio: "Dr. Nair leads our 24/7 emergency department and is board-certified in Veterinary Emergency and Critical Care. A UC Davis alumna, she specializes in trauma stabilization, mechanical ventilation, and sepsis management.",
      photoUrl: "https://i.pravatar.cc/400?img=45",
      specializations: ["Emergency Medicine", "Critical Care", "Toxicology"],
      serviceIds: [
        "svc-005-uuid-0000-000000000005",
        "svc-001-uuid-0000-000000000001",
      ],
      order: 2,
      isVisible: true,
    },
  ],

  // ── 5. Services ─────────────────────────────────────────────────────────
  services: [
    {
      id: "svc-001-uuid-0000-000000000001",
      name: "Diagnostic Imaging",
      description:
        "Advanced MRI, CT, and digital radiography interpreted by board-certified radiologists. Same-day results for urgent cases.",
      icon: "Scan",
      imageUrl: "https://placehold.co/600x400/e0f2f1/0F766E?text=Imaging",
      priceDisplay: "From $250",
      duration: "30–90 min",
      slug: "diagnostic-imaging",
      isHighlighted: true,
      order: 0,
      isVisible: true,
    },
    {
      id: "svc-002-uuid-0000-000000000002",
      name: "Internal Medicine",
      description:
        "Comprehensive evaluation and management of complex internal disorders including liver, kidney, endocrine, and immune system diseases.",
      icon: "HeartPulse",
      imageUrl: "https://placehold.co/600x400/e0f2f1/0F766E?text=Internal+Med",
      priceDisplay: "From $180",
      duration: "45–60 min",
      slug: "internal-medicine",
      isHighlighted: true,
      order: 1,
      isVisible: true,
    },
    {
      id: "svc-003-uuid-0000-000000000003",
      name: "Surgical Services",
      description:
        "Soft tissue, orthopedic, and minimally invasive laparoscopic surgery in our state-of-the-art operating suites with full anesthesia monitoring.",
      icon: "Scissors",
      imageUrl: "https://placehold.co/600x400/e0f2f1/0F766E?text=Surgery",
      priceDisplay: "From $800",
      duration: "1–4 hours",
      slug: "surgical-services",
      isHighlighted: true,
      order: 2,
      isVisible: true,
    },
    {
      id: "svc-004-uuid-0000-000000000004",
      name: "Rehabilitation & Physical Therapy",
      description:
        "Post-surgical and chronic pain rehabilitation with underwater treadmill therapy, laser treatment, and certified rehabilitation practitioners.",
      icon: "Activity",
      imageUrl: "https://placehold.co/600x400/e0f2f1/0F766E?text=Rehab",
      priceDisplay: "From $95",
      duration: "45 min",
      slug: "rehabilitation",
      isHighlighted: false,
      order: 3,
      isVisible: true,
    },
    {
      id: "svc-005-uuid-0000-000000000005",
      name: "24/7 Emergency Care",
      description:
        "Round-the-clock emergency services for acute illness, trauma, toxin ingestion, and respiratory distress. No appointment needed.",
      icon: "Ambulance",
      imageUrl: "https://placehold.co/600x400/e0f2f1/0F766E?text=Emergency",
      priceDisplay: "Emergency fee: $150",
      duration: "As needed",
      slug: "emergency-care",
      isHighlighted: true,
      order: 4,
      isVisible: true,
    },
    {
      id: "svc-006-uuid-0000-000000000006",
      name: "Oncology & Cancer Care",
      description:
        "Compassionate oncology consultations, chemotherapy protocols, and palliative care plans developed in partnership with your primary vet.",
      icon: "Ribbon",
      imageUrl: "https://placehold.co/600x400/e0f2f1/0F766E?text=Oncology",
      priceDisplay: "Consultation from $220",
      duration: "60 min",
      slug: "oncology",
      isHighlighted: false,
      order: 5,
      isVisible: true,
    },
  ],

  // ── 6. Page Blocks ──────────────────────────────────────────────────────
  blocks: [
    // Navigation
    {
      blockId: "blk-nav-0000-0000-000000000001",
      type: "navigation",
      isVisible: true,
      order: 0,
      showClinicName: true,
      links: [
        { label: "Services",  href: "#services",     openInNewTab: false },
        { label: "Our Team",  href: "#team",          openInNewTab: false },
        { label: "Emergency", href: "#contact",       openInNewTab: false },
        { label: "About",     href: "#about",         openInNewTab: false },
      ],
      ctaButton: { label: "Book Appointment", href: "#contact" },
      isSticky: true,
      isTransparentOnScroll: true,
      colorScheme: "light",
    },

    // Hero
    {
      blockId: "blk-hero-0000-0000-000000000002",
      type: "hero",
      isVisible: true,
      order: 1,
      headline: "Advanced Specialty Care for the Pets You Love",
      subheadline:
        "Austin's only 24/7 specialty & emergency center staffed by board-certified specialists in internal medicine, surgery, and critical care.",
      backgroundType: "image",
      backgroundValue:
        "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&auto=format&fit=crop&q=80",
      overlayOpacity: 0.55,
      layout: "centered",
      badgeText: "⭐ Rated #1 Specialty Clinic in Austin — 2024",
      primaryCta:  { label: "Book an Appointment", href: "#contact" },
      secondaryCta: { label: "Explore Our Services", href: "#services" },
    },

    // Services
    {
      blockId: "blk-svc-0000-0000-000000000003",
      type: "services",
      isVisible: true,
      order: 2,
      sectionTitle: "Specialty Services",
      sectionSubtitle:
        "From routine diagnostics to complex surgery, our board-certified team has the expertise your pet deserves.",
      featuredServiceIds: [],
      maxItemsToShow: 6,
      displayStyle: "grid_cards",
      gridColumns: 3,
      showPricing: true,
      showCta: true,
      ctaLabel: "Learn More",
    },

    // Teams
    {
      blockId: "blk-team-0000-0000-000000000004",
      type: "teams",
      isVisible: true,
      order: 3,
      sectionTitle: "Meet Our Specialists",
      sectionSubtitle:
        "Every patient is cared for by a board-certified specialist with deep expertise in their field.",
      featuredVetIds: [],
      layout: "grid_cards",
      gridColumns: 3,
      showBio: true,
      showSpecializations: true,
      showCredentials: true,
    },

    // Footer
    {
      blockId: "blk-ftr-0000-0000-000000000005",
      type: "footer",
      isVisible: true,
      order: 99,
      copyrightText: "© 2024 Austin Paws Specialty & Emergency. All rights reserved.",
      showSocialLinks: true,
      socialLinks: [
        { platform: "facebook",  url: "https://facebook.com/austinpaws" },
        { platform: "instagram", url: "https://instagram.com/austinpaws" },
      ],
      footerLinks: [
        { label: "Privacy Policy", href: "#", openInNewTab: false },
        { label: "Accessibility",  href: "#", openInNewTab: false },
      ],
      showLogo: true,
      colorScheme: "dark",
    },
  ],

  status: "published",
  createdAt: "2024-01-15T09:00:00.000Z",
  updatedAt: "2024-09-10T14:30:00.000Z",
  publishedAt: "2024-02-01T12:00:00.000Z",
  meta: {
    createdBy: "admin@cms.local",
    lastEditedBy: "editor@cms.local",
    version: 7,
    notes: "Updated team bios and added oncology service.",
  },
};
