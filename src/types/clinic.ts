/**
 * Veterinary Clinic CMS — Core Data Model
 *
 * Single source of truth: Zod schemas power both runtime validation
 * and TypeScript types (inferred via z.infer<>).
 *
 * Architecture:
 *  - Primitives & Enums  → shared atoms
 *  - Relational Entities → Veterinarian, Service
 *  - Page Blocks         → discriminated union, one schema per block type
 *  - ClinicWebsite       → root aggregate that composes everything above
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SHARED PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

/** Hex color string: "#RRGGBB" */
const HexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{6})$/, "Must be a 6-digit hex color (e.g. #3B82F6)");

/** URL string (http / https / relative) */
const UrlSchema = z.string().url("Must be a valid URL");

/** Phone — loose E.164-compatible */
const PhoneSchema = z
  .string()
  .min(7)
  .max(20)
  .regex(/^[+\d\s\-().]+$/, "Invalid phone number");

/** URL-safe slug */
const SlugSchema = z
  .string()
  .min(2)
  .max(60)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a lowercase kebab-case slug");

// ─────────────────────────────────────────────────────────────────────────────
// 2. ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export const HospitalTypeEnum = z.enum([
  "general_practice",
  "specialty_referral",
  "emergency_critical_care",
  "mobile_clinic",
  "exotic_animal",
  "rehabilitation",
  "shelter_humane",
]);
export type HospitalType = z.infer<typeof HospitalTypeEnum>;

export const PetTypeEnum = z.enum([
  "dog",
  "cat",
  "bird",
  "rabbit",
  "reptile",
  "fish",
  "small_mammal",
  "large_animal",
  "exotic",
]);
export type PetType = z.infer<typeof PetTypeEnum>;

export const ClinicStatusEnum = z.enum(["draft", "published", "archived"]);
export type ClinicStatus = z.infer<typeof ClinicStatusEnum>;

export const BlockTypeEnum = z.enum([
  "navigation",
  "hero",
  "services",
  "teams",
  "testimonials",
  "contact",
  "footer",
]);
export type BlockType = z.infer<typeof BlockTypeEnum>;

// ─────────────────────────────────────────────────────────────────────────────
// 3. GENERAL DETAILS
// ─────────────────────────────────────────────────────────────────────────────

export const ClinicGeneralDetailsSchema = z.object({
  /** Display name shown across the site */
  name: z.string().min(2, "Name must be at least 2 characters").max(100),

  /** Unique URL path segment: paws-and-claws-vet */
  slug: SlugSchema,

  /** Primary brand color used in buttons, headings, accents */
  primaryColor: HexColorSchema,

  /** Optional secondary / accent color */
  secondaryColor: HexColorSchema.optional(),

  /** CDN or storage URL for the clinic logo */
  logoUrl: UrlSchema.optional(),

  /** Short tagline shown in hero and metadata */
  tagline: z.string().max(160).optional(),

  /** <meta name="description"> content */
  metaDescription: z.string().max(320).optional(),

  /** SEO settings — stored here so they travel with clinic identity */
  seo: z.object({
    metaTitle:       z.string().max(70).optional(),
    metaDescription: z.string().max(160).optional(),
    focusKeyword:    z.string().max(80).optional(),
    ogImageUrl:      UrlSchema.optional(),
    canonicalUrl:    UrlSchema.optional(),
    robots:          z.string().default("index,follow"),
  }).optional(),
});
export type ClinicGeneralDetails = z.infer<typeof ClinicGeneralDetailsSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 4. TAXONOMY
// ─────────────────────────────────────────────────────────────────────────────

export const ClinicTaxonomySchema = z.object({
  hospitalType: HospitalTypeEnum,

  /** One or more pet categories this clinic treats */
  petTypes: z
    .array(PetTypeEnum)
    .min(1, "Select at least one pet type")
    .max(PetTypeEnum.options.length),
});
export type ClinicTaxonomy = z.infer<typeof ClinicTaxonomySchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 5. LOCATION & CONTACT
// ─────────────────────────────────────────────────────────────────────────────

export const AddressSchema = z.object({
  street: z.string().min(3).max(120),
  street2: z.string().max(80).optional(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  zip: z.string().min(3).max(12),
  country: z.string().min(2).max(60).default("United States"),
  /** Google Maps embed URL or coordinates string */
  mapEmbedUrl: UrlSchema.optional(),
  coordinates: z
    .object({ lat: z.number(), lng: z.number() })
    .optional(),
});
export type Address = z.infer<typeof AddressSchema>;

export const ClinicContactSchema = z.object({
  address: AddressSchema,
  phone: PhoneSchema,
  /** Optional after-hours / emergency number */
  emergencyPhone: PhoneSchema.optional(),
  email: z.string().email("Must be a valid email"),
  website: UrlSchema.optional(),
  businessHours: z
    .array(
      z.object({
        day: z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ]),
        open: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
        close: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM format"),
        isClosed: z.boolean().default(false),
      })
    )
    .max(7)
    .optional(),
});
export type ClinicContact = z.infer<typeof ClinicContactSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 6. RELATIONAL ENTITIES
// ─────────────────────────────────────────────────────────────────────────────

export const VeterinarianSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  /** e.g. "DVM", "VMD", "DACVIM" */
  credentials: z.string().max(50).optional(),
  title: z.string().max(80).optional(),
  bio: z.string().max(1000).optional(),
  photoUrl: UrlSchema.optional(),
  specializations: z.array(z.string().max(60)).max(10).default([]),
  /** IDs of services this vet provides */
  serviceIds: z.array(z.string().uuid()).default([]),
  /** Display order on the Team section */
  order: z.number().int().nonnegative().default(0),
  isVisible: z.boolean().default(true),
});
export type Veterinarian = z.infer<typeof VeterinarianSchema>;

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  /** Icon: Lucide icon name or CDN URL */
  icon: z.string().optional(),
  imageUrl: UrlSchema.optional(),
  /** Display price or price range string, e.g. "$50–$120" */
  priceDisplay: z.string().max(40).optional(),
  /** Duration hint, e.g. "30 min" */
  duration: z.string().max(30).optional(),
  /** Slug for the service detail page */
  slug: SlugSchema.optional(),
  isHighlighted: z.boolean().default(false),
  order: z.number().int().nonnegative().default(0),
  isVisible: z.boolean().default(true),
});
export type Service = z.infer<typeof ServiceSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 7. PAGE BLOCKS  (discriminated union — one schema per block type)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every block shares this base shape.
 * The `type` field drives the discriminated union.
 */
export const BaseBlockSchema = z.object({
  blockId: z.string().uuid(),
  isVisible: z.boolean().default(true),
  /** Render order on the page (0 = first) */
  order: z.number().int().nonnegative(),
});

// ── 7a. Navigation Block ────────────────────────────────────────────────────

export const NavLinkSchema = z.object({
  label: z.string().max(40),
  href: z.string(),
  openInNewTab: z.boolean().default(false),
});
export type NavLink = z.infer<typeof NavLinkSchema>;

export const NavigationBlockSchema = BaseBlockSchema.extend({
  type: z.literal("navigation"),
  /** Show logo from ClinicGeneralDetails.logoUrl, or override here */
  logoOverrideUrl: UrlSchema.optional(),
  /** Whether to show the clinic name as text next to the logo */
  showClinicName: z.boolean().default(true),
  links: z.array(NavLinkSchema).max(8).default([]),
  ctaButton: z
    .object({ label: z.string().max(30), href: z.string() })
    .optional(),
  isSticky: z.boolean().default(true),
  isTransparentOnScroll: z.boolean().default(false),
  /** "light" = white bg, "dark" = dark bg, "brand" = primaryColor bg */
  colorScheme: z.enum(["light", "dark", "brand"]).default("light"),
});
export type NavigationBlock = z.infer<typeof NavigationBlockSchema>;

// ── 7b. Hero Block ──────────────────────────────────────────────────────────

export const HeroBlockSchema = BaseBlockSchema.extend({
  type: z.literal("hero"),
  headline: z.string().max(120),
  subheadline: z.string().max(240).optional(),
  primaryCta: z
    .object({ label: z.string().max(40), href: z.string() })
    .optional(),
  secondaryCta: z
    .object({ label: z.string().max(40), href: z.string() })
    .optional(),
  backgroundType: z.enum(["image", "gradient", "solid", "video"]).default("image"),
  /** URL for image/video, or CSS gradient string */
  backgroundValue: z.string().optional(),
  /** Overlay opacity 0–1 for readability */
  overlayOpacity: z.number().min(0).max(1).default(0.4),
  layout: z.enum(["centered", "left_aligned", "split_image_right", "split_image_left"]).default("centered"),
  /** Badge text above headline, e.g. "Trusted by 5,000+ pet owners" */
  badgeText: z.string().max(80).optional(),
});
export type HeroBlock = z.infer<typeof HeroBlockSchema>;

// ── 7c. Services Block ──────────────────────────────────────────────────────

export const ServicesBlockSchema = BaseBlockSchema.extend({
  type: z.literal("services"),
  sectionTitle: z.string().max(80).default("Our Services"),
  sectionSubtitle: z.string().max(200).optional(),
  /** IDs from ClinicWebsite.services to feature; empty = show all */
  featuredServiceIds: z.array(z.string().uuid()).default([]),
  maxItemsToShow: z.number().int().min(1).max(24).default(6),
  displayStyle: z.enum(["grid_cards", "icon_list", "carousel", "accordion"]).default("grid_cards"),
  /** Number of columns in grid view */
  gridColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  showPricing: z.boolean().default(false),
  showCta: z.boolean().default(true),
  ctaLabel: z.string().max(40).default("Learn More"),
});
export type ServicesBlock = z.infer<typeof ServicesBlockSchema>;

// ── 7d. Teams Block ─────────────────────────────────────────────────────────

export const TeamsBlockSchema = BaseBlockSchema.extend({
  type: z.literal("teams"),
  sectionTitle: z.string().max(80).default("Meet Our Team"),
  sectionSubtitle: z.string().max(200).optional(),
  /** IDs from ClinicWebsite.veterinarians to feature; empty = show all */
  featuredVetIds: z.array(z.string().uuid()).default([]),
  layout: z.enum(["grid_cards", "carousel", "list_with_bio"]).default("grid_cards"),
  gridColumns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  showBio: z.boolean().default(true),
  showSpecializations: z.boolean().default(true),
  showCredentials: z.boolean().default(true),
});
export type TeamsBlock = z.infer<typeof TeamsBlockSchema>;

// ── 7e. Testimonials Block ──────────────────────────────────────────────────

export const TestimonialItemSchema = z.object({
  id: z.string().uuid(),
  authorName: z.string().max(80),
  petName: z.string().max(40).optional(),
  rating: z.number().int().min(1).max(5).default(5),
  quote: z.string().max(500),
  avatarUrl: UrlSchema.optional(),
  source: z.enum(["google", "yelp", "facebook", "manual"]).default("manual"),
});
export type TestimonialItem = z.infer<typeof TestimonialItemSchema>;

export const TestimonialsBlockSchema = BaseBlockSchema.extend({
  type: z.literal("testimonials"),
  sectionTitle: z.string().max(80).default("What Pet Parents Say"),
  sectionSubtitle: z.string().max(200).optional(),
  items: z.array(TestimonialItemSchema).max(20).default([]),
  displayStyle: z.enum(["grid", "carousel", "single_spotlight"]).default("carousel"),
  showRatingStars: z.boolean().default(true),
});
export type TestimonialsBlock = z.infer<typeof TestimonialsBlockSchema>;

// ── 7f. Contact Block ───────────────────────────────────────────────────────

export const ContactBlockSchema = BaseBlockSchema.extend({
  type: z.literal("contact"),
  sectionTitle: z.string().max(80).default("Contact Us"),
  sectionSubtitle: z.string().max(200).optional(),
  showMap: z.boolean().default(true),
  showBusinessHours: z.boolean().default(true),
  showContactForm: z.boolean().default(true),
  /** Submission endpoint for the contact form */
  formEndpoint: UrlSchema.optional(),
  layout: z.enum(["split", "stacked"]).default("split"),
});
export type ContactBlock = z.infer<typeof ContactBlockSchema>;

// ── 7g. Footer Block ────────────────────────────────────────────────────────

export const FooterBlockSchema = BaseBlockSchema.extend({
  type: z.literal("footer"),
  copyrightText: z.string().max(120).optional(),
  showSocialLinks: z.boolean().default(true),
  socialLinks: z
    .array(
      z.object({
        platform: z.enum(["facebook", "instagram", "twitter", "youtube", "tiktok", "linkedin"]),
        url: UrlSchema,
      })
    )
    .max(6)
    .default([]),
  footerLinks: z.array(NavLinkSchema).max(12).default([]),
  showLogo: z.boolean().default(true),
  colorScheme: z.enum(["light", "dark", "brand"]).default("dark"),
});
export type FooterBlock = z.infer<typeof FooterBlockSchema>;

// ── Discriminated Union ─────────────────────────────────────────────────────

export const PageBlockSchema = z.discriminatedUnion("type", [
  NavigationBlockSchema,
  HeroBlockSchema,
  ServicesBlockSchema,
  TeamsBlockSchema,
  TestimonialsBlockSchema,
  ContactBlockSchema,
  FooterBlockSchema,
]);
export type PageBlock = z.infer<typeof PageBlockSchema>;

// ── Per-block type helpers (useful in form switch/case) ─────────────────────
export type PageBlockType = PageBlock["type"];

// ─────────────────────────────────────────────────────────────────────────────
// 8. ROOT AGGREGATE — ClinicWebsite
// ─────────────────────────────────────────────────────────────────────────────

export const ClinicWebsiteSchema = z.object({
  /** Internal DB / CMS record ID */
  id: z.string().uuid(),

  general: ClinicGeneralDetailsSchema,
  taxonomy: ClinicTaxonomySchema,
  contact: ClinicContactSchema,

  /** Full veterinarian records owned by this clinic */
  veterinarians: z.array(VeterinarianSchema).default([]),

  /** Full service records offered by this clinic */
  services: z.array(ServiceSchema).default([]),

  /**
   * Ordered list of page sections.
   * The `order` field on each block determines render sequence;
   * sort before rendering: blocks.sort((a, b) => a.order - b.order)
   */
  blocks: z.array(PageBlockSchema).default([]),

  /** Publication lifecycle */
  status: ClinicStatusEnum.default("draft"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),

  /** CMS internal metadata */
  meta: z
    .object({
      createdBy: z.string().optional(),
      lastEditedBy: z.string().optional(),
      version: z.number().int().nonnegative().default(1),
      notes: z.string().max(500).optional(),
    })
    .optional(),
});
export type ClinicWebsite = z.infer<typeof ClinicWebsiteSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 9. PARTIAL SCHEMAS  (for form draft / auto-save)
// ─────────────────────────────────────────────────────────────────────────────

/** Safe for incomplete form state — all fields optional */
export const ClinicWebsiteDraftSchema = ClinicWebsiteSchema.deepPartial();
export type ClinicWebsiteDraft = z.infer<typeof ClinicWebsiteDraftSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// 10. DEFAULT FACTORY VALUES  (seed a new ClinicWebsite)
// ─────────────────────────────────────────────────────────────────────────────

import { v4 as uuidv4 } from "uuid";

const now = () => new Date().toISOString();

export function createDefaultNavigationBlock(order = 0): NavigationBlock {
  return {
    blockId: uuidv4(),
    type: "navigation",
    isVisible: true,
    order,
    showClinicName: true,
    links: [],
    isSticky: true,
    isTransparentOnScroll: false,
    colorScheme: "light",
  };
}

export function createDefaultHeroBlock(order = 1): HeroBlock {
  return {
    blockId: uuidv4(),
    type: "hero",
    isVisible: true,
    order,
    headline: "Compassionate Care for Your Beloved Pets",
    subheadline: "Trusted veterinary expertise — right in your neighborhood.",
    backgroundType: "image",
    overlayOpacity: 0.4,
    layout: "centered",
    primaryCta: { label: "Book an Appointment", href: "#contact" },
    secondaryCta: { label: "Our Services", href: "#services" },
  };
}

export function createDefaultServicesBlock(order = 2): ServicesBlock {
  return {
    blockId: uuidv4(),
    type: "services",
    isVisible: true,
    order,
    sectionTitle: "Our Services",
    featuredServiceIds: [],
    maxItemsToShow: 6,
    displayStyle: "grid_cards",
    gridColumns: 3,
    showPricing: false,
    showCta: true,
    ctaLabel: "Learn More",
  };
}

export function createDefaultTeamsBlock(order = 3): TeamsBlock {
  return {
    blockId: uuidv4(),
    type: "teams",
    isVisible: true,
    order,
    sectionTitle: "Meet Our Team",
    featuredVetIds: [],
    layout: "grid_cards",
    gridColumns: 3,
    showBio: true,
    showSpecializations: true,
    showCredentials: true,
  };
}

export function createDefaultFooterBlock(order = 99): FooterBlock {
  return {
    blockId: uuidv4(),
    type: "footer",
    isVisible: true,
    order,
    showSocialLinks: true,
    socialLinks: [],
    footerLinks: [],
    showLogo: true,
    colorScheme: "dark",
  };
}

export function createEmptyClinicWebsite(): ClinicWebsiteDraft {
  const ts = now();
  return {
    id: uuidv4(),
    general: {
      name: "",
      slug: "my-clinic",
      primaryColor: "#3B82F6",
    },
    taxonomy: {
      hospitalType: "general_practice",
      petTypes: ["dog", "cat"],
    },
    contact: {
      address: {
        street: "",
        city: "",
        state: "",
        zip: "",
        country: "United States",
      },
      phone: "",
      email: "",
    },
    veterinarians: [],
    services: [],
    blocks: [
      createDefaultNavigationBlock(0),
      createDefaultHeroBlock(1),
      createDefaultServicesBlock(2),
      createDefaultTeamsBlock(3),
      createDefaultFooterBlock(99),
    ],
    status: "draft",
    createdAt: ts,
    updatedAt: ts,
  };
}
