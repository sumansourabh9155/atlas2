import type { ClinicWebsite } from "../../../types/clinic";

// ─── Day name map ─────────────────────────────────────────────────────────────

const DAY_NAMES: Record<string, string> = {
  monday:    "Monday",
  tuesday:   "Tuesday",
  wednesday: "Wednesday",
  thursday:  "Thursday",
  friday:    "Friday",
  saturday:  "Saturday",
  sunday:    "Sunday",
};

// ─── Hospital type → Schema.org medicalSpecialty ─────────────────────────────

const TYPE_SPECIALTY: Record<string, string> = {
  specialty_referral:      "Specialty Veterinary Care",
  emergency_critical_care: "Emergency Veterinary Care",
  general_practice:        "General Veterinary Practice",
  exotic_animal:           "Exotic Animal Medicine",
  rehabilitation:          "Veterinary Rehabilitation",
  mobile_clinic:           "Mobile Veterinary Care",
  shelter_humane:          "Shelter and Humane Care",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Group business hours by identical open/close times to reduce JSON-LD bloat. */
function buildOpeningHoursSpec(
  businessHours: ClinicWebsite["contact"]["businessHours"],
): object[] {
  if (!businessHours || businessHours.length === 0) return [];

  // Map: "HH:MM-HH:MM" → day names[]
  const groups: Record<string, string[]> = {};

  for (const h of businessHours) {
    if (h.isClosed) continue;
    const key = `${h.open}-${h.close}`;
    if (!groups[key]) groups[key] = [];
    const dayName = DAY_NAMES[h.day] ?? h.day;
    groups[key].push(dayName);
  }

  return Object.entries(groups).map(([timeKey, days]) => {
    const [opens, closes] = timeKey.split("-");
    return {
      "@type":  "OpeningHoursSpecification",
      dayOfWeek: days,
      opens,
      closes,
    };
  });
}

// ─── Main generator ──────────────────────────────────────────────────────────

export function generateVetClinicSchema(clinic: ClinicWebsite): object {
  const { general, taxonomy, contact, veterinarians, services } = clinic;

  // Canonical base URL
  const baseUrl =
    contact.website ||
    (general.slug ? `https://${general.slug}.vet` : "");

  // Address
  const streetAddress = [contact.address.street, contact.address.street2]
    .filter(Boolean)
    .join(", ");

  // Specialty
  const medicalSpecialty = TYPE_SPECIALTY[taxonomy.hospitalType] ?? "Veterinary Care";

  // Opening hours (grouped)
  const openingHoursSpecification = buildOpeningHoursSpec(contact.businessHours);

  // Visible services → OfferCatalog
  const visibleServices = services.filter((s) => s.isVisible);
  const itemListElement = visibleServices.map((svc, idx) => ({
    "@type": "Offer",
    position: idx + 1,
    itemOffered: {
      "@type":       "Service",
      name:          svc.name,
      description:   svc.description,
      ...(svc.slug && baseUrl
        ? { url: `${baseUrl}/services/${svc.slug}` }
        : {}),
    },
  }));

  // Visible vets → employee[]
  const visibleVets = veterinarians.filter((v) => v.isVisible);
  const employees = visibleVets.map((vet) => ({
    "@type":       "Person",
    name:          vet.name,
    jobTitle:      vet.title,
    description:   `${vet.credentials} — ${vet.title}`,
    ...(vet.photoUrl ? { image: vet.photoUrl } : {}),
  }));

  // Assemble the LocalBusiness / VeterinaryClinic node
  const clinicNode: Record<string, unknown> = {
    "@type":      ["LocalBusiness", "VeterinaryClinic"],
    "@id":        baseUrl ? `${baseUrl}/#clinic` : undefined,
    name:         general.name,
    description:  general.metaDescription || undefined,
    url:          baseUrl || undefined,
    telephone:    contact.phone,
    email:        contact.email,
    ...(general.logoUrl
      ? { logo: { "@type": "ImageObject", url: general.logoUrl } }
      : {}),
    address: {
      "@type":           "PostalAddress",
      streetAddress,
      addressLocality:   contact.address.city,
      addressRegion:     contact.address.state,
      postalCode:        contact.address.zip,
      addressCountry:    contact.address.country === "United States" ? "US" : (contact.address.country || "US"),
    },
    medicalSpecialty,
    ...(openingHoursSpecification.length > 0
      ? { openingHoursSpecification }
      : {}),
    ...(itemListElement.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name:    "Veterinary Services",
            itemListElement,
          },
        }
      : {}),
    ...(employees.length > 0 ? { employee: employees } : {}),
  };

  // Strip undefined values (keeps JSON clean)
  const cleanNode = JSON.parse(JSON.stringify(clinicNode)) as object;

  return {
    "@context": "https://schema.org",
    "@graph":   [cleanNode],
  };
}

/** Wraps the schema object in a <script type="application/ld+json"> tag. */
export function formatSchemaScript(schema: object): string {
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}
