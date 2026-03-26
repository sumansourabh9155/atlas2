/**
 * Metadata Extractor
 * Extracts Open Graph, Schema.org structured data, and SEO metadata
 */

import {
  querySelector,
  querySelectorAll,
  getAttribute,
  extractMetaTag,
  extractAllMetaTags,
  extractJsonLd,
} from "./htmlParser";

export interface SchemaOrgData {
  "@type": string;
  name?: string;
  description?: string;
  image?: string | string[];
  url?: string;
  telephone?: string;
  email?: string;
  address?: Record<string, unknown>;
  areaServed?: string | string[];
  priceRange?: string;
  image_url?: string;
  logo?: { "@type": string; url: string };
  [key: string]: unknown;
}

/**
 * Extract Open Graph metadata
 */
export function extractOpenGraphData(doc: Document): Record<string, string> {
  const og: Record<string, string> = {};

  querySelectorAll(doc, "meta[property^='og:']").forEach((meta) => {
    const property = getAttribute(meta, "property").replace("og:", "");
    const content = getAttribute(meta, "content");
    if (property && content) {
      og[property] = content;
    }
  });

  return og;
}

/**
 * Extract Twitter Card metadata
 */
export function extractTwitterCardData(doc: Document): Record<string, string> {
  const twitter: Record<string, string> = {};

  querySelectorAll(doc, "meta[name^='twitter:']").forEach((meta) => {
    const name = getAttribute(meta, "name").replace("twitter:", "");
    const content = getAttribute(meta, "content");
    if (name && content) {
      twitter[name] = content;
    }
  });

  return twitter;
}

/**
 * Extract all Schema.org structured data (JSON-LD)
 */
export function extractSchemaOrgData(doc: Document): SchemaOrgData[] {
  const schemas = extractJsonLd(doc);
  return schemas as SchemaOrgData[];
}

/**
 * Find specific Schema.org type
 */
export function findSchemaByType(schemas: SchemaOrgData[], type: string): SchemaOrgData | null {
  return schemas.find((s) => s["@type"] === type) || null;
}

/**
 * Extract organization schema (clinic info)
 */
export function extractOrganizationData(
  doc: Document
): (SchemaOrgData & { "@type": "Organization" }) | null {
  const schemas = extractSchemaOrgData(doc);
  const org = findSchemaByType(schemas, "Organization");
  const localBusiness = findSchemaByType(schemas, "LocalBusiness");
  const veterinaryClinic = findSchemaByType(schemas, "VeterinaryClinic");

  return (org || localBusiness || veterinaryClinic) as SchemaOrgData &
    { "@type": "Organization" } | null;
}

/**
 * Extract business contact from Schema.org
 */
export function extractContactFromSchema(
  schemas: SchemaOrgData[]
): { phone?: string; email?: string; address?: Record<string, unknown> } | null {
  const org = schemas.find((s) => ["Organization", "LocalBusiness", "VeterinaryClinic"].includes(s["@type"]));

  if (!org) return null;

  return {
    phone: org.telephone as string,
    email: org.email as string,
    address: org.address as Record<string, unknown>,
  };
}

/**
 * Extract person/professional schema
 */
export function extractPeopleData(schemas: SchemaOrgData[]): SchemaOrgData[] {
  return schemas.filter((s) =>
    ["Person", "Doctor", "Veterinarian", "Professional"].includes(s["@type"])
  );
}

/**
 * Extract product/service schema
 */
export function extractServicesData(schemas: SchemaOrgData[]): SchemaOrgData[] {
  return schemas.filter((s) =>
    ["Product", "Service", "MedicalBusiness", "HealthAndBeautyBusiness"].includes(s["@type"])
  );
}

/**
 * Extract reviews and ratings
 */
export function extractReviewsData(schemas: SchemaOrgData[]): SchemaOrgData[] {
  return schemas.filter((s) => s["@type"] === "Review" || s["@type"] === "AggregateRating");
}

/**
 * Extract breadcrumb navigation
 */
export function extractBreadcrumbs(schemas: SchemaOrgData[]): Array<{ name: string; url?: string }> {
  const breadcrumb = schemas.find((s) => s["@type"] === "BreadcrumbList");

  if (!breadcrumb || !Array.isArray(breadcrumb.itemListElement)) {
    return [];
  }

  return (breadcrumb.itemListElement as unknown[])
    .map((item: unknown) => {
      if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        return {
          name: (obj.name as string) || "",
          url: (obj.url as string) || undefined,
        };
      }
      return null;
    })
    .filter((x): x is { name: string; url?: string } => x !== null);
}

/**
 * Extract image from OG or Schema.org
 */
export function extractFeaturedImage(doc: Document): string | null {
  const og = extractOpenGraphData(doc);
  if (og.image) return og.image;

  const twitter = extractTwitterCardData(doc);
  if (twitter.image) return twitter.image;

  const schemas = extractSchemaOrgData(doc);
  for (const schema of schemas) {
    if (schema.image) {
      if (typeof schema.image === "string") return schema.image;
      if (Array.isArray(schema.image) && schema.image.length > 0) {
        return schema.image[0] as string;
      }
    }
  }

  return null;
}

/**
 * Extract canonical URL
 */
export function extractCanonicalUrl(doc: Document): string | null {
  const link = querySelector(doc, "link[rel='canonical']");
  if (link) return getAttribute(link, "href") || null;

  return extractMetaTag(doc, "canonical");
}

/**
 * Extract language
 */
export function extractLanguage(doc: Document): string | null {
  const html = doc.documentElement;
  return getAttribute(html, "lang") || null;
}

/**
 * Extract charset
 */
export function extractCharset(doc: Document): string {
  const meta = querySelector(doc, "meta[charset], meta[http-equiv='Content-Type']");
  if (!meta) return "UTF-8";

  const charset = getAttribute(meta, "charset");
  if (charset) return charset;

  const content = getAttribute(meta, "content");
  const match = content.match(/charset=([^;]+)/i);
  return match ? match[1] : "UTF-8";
}

/**
 * Extract all SEO metadata
 */
export function extractAllSeoData(doc: Document): {
  title: string;
  description: string;
  keywords: string;
  ogData: Record<string, string>;
  twitterData: Record<string, string>;
  schemas: SchemaOrgData[];
  canonicalUrl: string | null;
  language: string | null;
  viewport: string | null;
  robots: string | null;
} {
  return {
    title: querySelector(doc, "title")?.textContent || "",
    description: extractMetaTag(doc, "description"),
    keywords: extractMetaTag(doc, "keywords"),
    ogData: extractOpenGraphData(doc),
    twitterData: extractTwitterCardData(doc),
    schemas: extractSchemaOrgData(doc),
    canonicalUrl: extractCanonicalUrl(doc),
    language: extractLanguage(doc),
    viewport: extractMetaTag(doc, "viewport"),
    robots: extractMetaTag(doc, "robots"),
  };
}

/**
 * Extract business hours from Schema.org
 */
export function extractBusinessHoursFromSchema(
  schemas: SchemaOrgData[]
): Array<{ dayOfWeek: string; opens: string; closes: string }> {
  const org = schemas.find((s) =>
    ["Organization", "LocalBusiness", "VeterinaryClinic"].includes(s["@type"])
  );

  if (!org || !Array.isArray(org.openingHoursSpecification)) {
    return [];
  }

  return (org.openingHoursSpecification as unknown[])
    .map((spec: unknown) => {
      if (typeof spec === "object" && spec !== null) {
        const obj = spec as Record<string, unknown>;
        return {
          dayOfWeek: (obj.dayOfWeek as string) || "",
          opens: (obj.opens as string) || "",
          closes: (obj.closes as string) || "",
        };
      }
      return null;
    })
    .filter((x): x is { dayOfWeek: string; opens: string; closes: string } => x !== null);
}

/**
 * Check if page is about a veterinary clinic
 */
export function isVeterinaryClinicPage(doc: Document): number {
  let score = 0;

  // Check title
  const title = querySelector(doc, "title")?.textContent?.toLowerCase() || "";
  if (title.includes("vet") || title.includes("clinic") || title.includes("veterinary")) {
    score += 2;
  }

  // Check description
  const desc = extractMetaTag(doc, "description").toLowerCase();
  if (desc.includes("vet") || desc.includes("clinic")) {
    score += 2;
  }

  // Check Schema.org
  const schemas = extractSchemaOrgData(doc);
  if (findSchemaByType(schemas, "VeterinaryClinic")) {
    score += 3;
  }

  // Check headings
  const h1s = querySelectorAll(doc, "h1")
    .map((h) => h.textContent?.toLowerCase() || "")
    .join(" ");
  if (h1s.includes("vet") || h1s.includes("clinic")) {
    score += 1;
  }

  // Check for veterinary keywords
  const text = doc.documentElement.textContent?.toLowerCase() || "";
  const vetKeywords = ["veterinary", "veterinarian", "pet care", "animal hospital", "animal clinic"];
  vetKeywords.forEach((kw) => {
    if (text.includes(kw)) score += 0.5;
  });

  return Math.min(10, score); // cap at 10
}
