/**
 * Utility types, type guards, and helpers derived from the core clinic schema.
 * Import these in form components and preview renderers — NOT the raw Zod schemas.
 */

import type {
  PageBlock,
  NavigationBlock,
  HeroBlock,
  ServicesBlock,
  TeamsBlock,
  TestimonialsBlock,
  ContactBlock,
  FooterBlock,
  ClinicWebsite,
  Service,
  Veterinarian,
} from "./clinic";

// ─────────────────────────────────────────────────────────────────────────────
// TYPE GUARDS  (narrow PageBlock to a concrete block type)
// ─────────────────────────────────────────────────────────────────────────────

export const isNavigationBlock = (b: PageBlock): b is NavigationBlock =>
  b.type === "navigation";

export const isHeroBlock = (b: PageBlock): b is HeroBlock =>
  b.type === "hero";

export const isServicesBlock = (b: PageBlock): b is ServicesBlock =>
  b.type === "services";

export const isTeamsBlock = (b: PageBlock): b is TeamsBlock =>
  b.type === "teams";

export const isTestimonialsBlock = (b: PageBlock): b is TestimonialsBlock =>
  b.type === "testimonials";

export const isContactBlock = (b: PageBlock): b is ContactBlock =>
  b.type === "contact";

export const isFooterBlock = (b: PageBlock): b is FooterBlock =>
  b.type === "footer";

// ─────────────────────────────────────────────────────────────────────────────
// DERIVED VIEW TYPES  (what the preview renderer actually needs — no IDs, etc.)
// ─────────────────────────────────────────────────────────────────────────────

/** Resolved service with the vet objects attached (for Services block render) */
export type ResolvedService = Service & {
  assignedVets: Pick<Veterinarian, "id" | "name" | "credentials">[];
};

/** Resolved vet with their service names attached (for Teams block render) */
export type ResolvedVeterinarian = Veterinarian & {
  services: Pick<Service, "id" | "name" | "icon">[];
};

/** Everything a page block renderer needs, fully resolved */
export interface ResolvedClinicPage {
  general: ClinicWebsite["general"];
  contact: ClinicWebsite["contact"];
  services: ResolvedService[];
  veterinarians: ResolvedVeterinarian[];
  /** Blocks sorted by `order`, filtered to `isVisible === true` */
  visibleBlocks: PageBlock[];
}

// ─────────────────────────────────────────────────────────────────────────────
// SELECTOR HELPERS  (use in React components / hooks)
// ─────────────────────────────────────────────────────────────────────────────

/** Returns page blocks sorted by order and filtered to visible only */
export function getVisibleBlocks(website: ClinicWebsite): PageBlock[] {
  return [...website.blocks]
    .filter((b) => b.isVisible)
    .sort((a, b) => a.order - b.order);
}

/** Find a block by its ID */
export function findBlockById(
  website: ClinicWebsite,
  blockId: string
): PageBlock | undefined {
  return website.blocks.find((b) => b.blockId === blockId);
}

/** Resolve services data for a ServicesBlock */
export function resolveServicesBlock(
  block: ServicesBlock,
  allServices: Service[],
  allVets: Veterinarian[]
): ResolvedService[] {
  const pool =
    block.featuredServiceIds.length > 0
      ? allServices.filter((s) => block.featuredServiceIds.includes(s.id))
      : allServices;

  return pool
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order)
    .slice(0, block.maxItemsToShow)
    .map((service) => ({
      ...service,
      assignedVets: allVets
        .filter((v) => v.serviceIds.includes(service.id))
        .map(({ id, name, credentials }) => ({ id, name, credentials })),
    }));
}

/** Resolve veterinarians data for a TeamsBlock */
export function resolveTeamsBlock(
  block: TeamsBlock,
  allVets: Veterinarian[],
  allServices: Service[]
): ResolvedVeterinarian[] {
  const pool =
    block.featuredVetIds.length > 0
      ? allVets.filter((v) => block.featuredVetIds.includes(v.id))
      : allVets;

  return pool
    .filter((v) => v.isVisible)
    .sort((a, b) => a.order - b.order)
    .map((vet) => ({
      ...vet,
      services: allServices
        .filter((s) => vet.serviceIds.includes(s.id))
        .map(({ id, name, icon }) => ({ id, name, icon })),
    }));
}

/** Build the full ResolvedClinicPage for the preview renderer */
export function resolveClinicPage(website: ClinicWebsite): ResolvedClinicPage {
  const { general, contact, services, veterinarians, blocks } = website;

  const resolvedVets: ResolvedVeterinarian[] = veterinarians.map((vet) => ({
    ...vet,
    services: services
      .filter((s) => vet.serviceIds.includes(s.id))
      .map(({ id, name, icon }) => ({ id, name, icon })),
  }));

  const resolvedServices: ResolvedService[] = services.map((service) => ({
    ...service,
    assignedVets: veterinarians
      .filter((v) => v.serviceIds.includes(service.id))
      .map(({ id, name, credentials }) => ({ id, name, credentials })),
  }));

  return {
    general,
    contact,
    services: resolvedServices,
    veterinarians: resolvedVets,
    visibleBlocks: getVisibleBlocks({ ...website, blocks }),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FORM STEP MAPPING  (drives the multi-step form wizard)
// ─────────────────────────────────────────────────────────────────────────────

export type FormStep =
  | "general"
  | "taxonomy"
  | "contact"
  | "veterinarians"
  | "services"
  | "blocks"
  | "review";

export const FORM_STEPS: { id: FormStep; label: string; description: string }[] =
  [
    {
      id: "general",
      label: "General Details",
      description: "Clinic name, slug, brand colors, and logo",
    },
    {
      id: "taxonomy",
      label: "Taxonomy",
      description: "Hospital type and pet categories",
    },
    {
      id: "contact",
      label: "Location & Contact",
      description: "Address, phone, email, and hours",
    },
    {
      id: "veterinarians",
      label: "Veterinarians",
      description: "Add and configure your team members",
    },
    {
      id: "services",
      label: "Services",
      description: "Define the services your clinic offers",
    },
    {
      id: "blocks",
      label: "Page Builder",
      description: "Arrange and configure website sections",
    },
    {
      id: "review",
      label: "Review & Publish",
      description: "Preview your site and go live",
    },
  ];

// ─────────────────────────────────────────────────────────────────────────────
// DISPLAY LABEL MAPS  (for rendering enum values as human-readable text)
// ─────────────────────────────────────────────────────────────────────────────

export const HOSPITAL_TYPE_LABELS: Record<string, string> = {
  general_practice: "General Practice",
  specialty_referral: "Specialty & Referral",
  emergency_critical_care: "Emergency & Critical Care",
  mobile_clinic: "Mobile Clinic",
  exotic_animal: "Exotic Animal",
  rehabilitation: "Rehabilitation",
  shelter_humane: "Shelter / Humane Society",
};

export const PET_TYPE_LABELS: Record<string, string> = {
  dog: "Dog",
  cat: "Cat",
  bird: "Bird",
  rabbit: "Rabbit",
  reptile: "Reptile",
  fish: "Fish",
  small_mammal: "Small Mammal",
  large_animal: "Large Animal",
  exotic: "Exotic",
};

export const BLOCK_TYPE_LABELS: Record<string, string> = {
  navigation: "Navigation Bar",
  hero: "Hero / Banner",
  services: "Services Section",
  teams: "Team Section",
  testimonials: "Testimonials",
  contact: "Contact Section",
  footer: "Footer",
};
