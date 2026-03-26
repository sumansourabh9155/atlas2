/**
 * Content Extractors
 * Specialized extraction logic for different data types
 */

import {
  querySelector,
  querySelectorAll,
  getAttribute,
  extractText,
  extractImageUrl,
  extractImageUrls,
  findElementByText,
  extractPhoneNumbers,
  extractEmails,
  containsKeywords,
  normalizeUrl,
} from "./htmlParser";
import {
  ExtractionResult,
  Address,
  BusinessHours,
  ScrapedVeterinarian,
  ScrapedService,
  ScrapedTestimonial,
  SocialProfile,
} from "./types";

/**
 * Create an extraction result
 */
function createResult<T>(
  value: T | null,
  confidence: number,
  source: string,
  raw: string = ""
): ExtractionResult<T> {
  return { value, confidence, source, raw };
}

/**
 * Extract clinic name from various sources
 */
export function extractClinicName(doc: Document, baseUrl: string): ExtractionResult<string> {
  let confidence = 0;
  let source = "";
  let name = "";

  // Try OG title
  const ogTitle = querySelector(doc, "meta[property='og:title']");
  if (ogTitle) {
    const value = getAttribute(ogTitle, "content");
    if (value && value.length > 2 && value.length < 100) {
      return createResult(value, 0.8, "og:title", value);
    }
  }

  // Try <title> tag
  const title = querySelector(doc, "title");
  if (title && title.textContent) {
    const text = title.textContent;
    // Extract first part before separator
    const parts = text.split(/[|—–-]/);
    const candidate = parts[0].trim();
    if (candidate.length > 2 && candidate.length < 100) {
      return createResult(candidate, 0.7, "title-tag", text);
    }
  }

  // Try h1
  const h1 = querySelector(doc, "h1");
  if (h1) {
    const text = extractText(h1);
    if (text && text.length > 2 && text.length < 100 && !text.includes("\n")) {
      return createResult(text, 0.7, "h1", text);
    }
  }

  // Try logo alt text
  const logo = querySelector(doc, "img.logo, [class*='logo'] img");
  if (logo) {
    const alt = getAttribute(logo, "alt");
    if (alt && alt.length > 2) {
      return createResult(alt, 0.5, "logo-alt", alt);
    }
  }

  // Try domain name
  try {
    const domain = new URL(baseUrl).hostname.replace("www.", "");
    const parts = domain.split(".");
    if (parts[0].length > 2) {
      return createResult(parts[0], 0.3, "domain-name", domain);
    }
  } catch {
    // ignore
  }

  return createResult(null, 0, "not-found", "");
}

/**
 * Extract contact information
 */
export function extractContactInfo(
  doc: Document
): { phones: string[]; emails: string[]; websites: string[] } {
  const phones = new Set<string>();
  const emails = new Set<string>();
  const websites = new Set<string>();

  // Extract from text content
  const text = doc.documentElement.textContent || "";
  extractPhoneNumbers(text).forEach((p) => phones.add(p));
  extractEmails(text).forEach((e) => emails.add(e));

  // Extract from tel: and mailto: links
  querySelectorAll(doc, "a[href^='tel:']").forEach((a) => {
    const href = getAttribute(a, "href");
    const phone = href.replace("tel:", "").trim();
    if (phone) phones.add(phone);
  });

  querySelectorAll(doc, "a[href^='mailto:']").forEach((a) => {
    const href = getAttribute(a, "href");
    const email = href.replace("mailto:", "").split("?")[0].trim();
    if (email) emails.add(email);
  });

  // Extract from schema.org
  querySelectorAll(doc, "script[type='application/ld+json']").forEach((script) => {
    try {
      const data = JSON.parse(script.textContent || "{}");
      if (data.telephone) {
        if (Array.isArray(data.telephone)) {
          data.telephone.forEach((p: string) => phones.add(p));
        } else {
          phones.add(data.telephone);
        }
      }
      if (data.email) {
        if (Array.isArray(data.email)) {
          data.email.forEach((e: string) => emails.add(e));
        } else {
          emails.add(data.email);
        }
      }
      if (data.url) {
        if (Array.isArray(data.url)) {
          data.url.forEach((u: string) => websites.add(u));
        } else {
          websites.add(data.url);
        }
      }
    } catch {
      // ignore
    }
  });

  return {
    phones: Array.from(phones),
    emails: Array.from(emails),
    websites: Array.from(websites),
  };
}

/**
 * Extract address from various sources
 */
export function extractAddress(doc: Document): ExtractionResult<Address> {
  // Try Schema.org first
  const schemas = querySelectorAll(doc, "script[type='application/ld+json']");
  for (const script of schemas) {
    try {
      const data = JSON.parse(script.textContent || "{}");
      if (data.address && typeof data.address === "object") {
        const addr = data.address as Record<string, unknown>;
        const result: Address = {
          street: (addr.streetAddress as string) || "",
          city: (addr.addressLocality as string) || "",
          state: (addr.addressRegion as string) || "",
          zip: (addr.postalCode as string) || "",
          country: (addr.addressCountry as string) || "United States",
        };
        if (result.street && result.city) {
          return createResult(result, 0.9, "schema.org", JSON.stringify(result));
        }
      }
    } catch {
      // ignore
    }
  }

  // Try contact footer section
  const footer = querySelector(doc, "footer, [class*='contact'], [class*='address']");
  if (footer) {
    const text = extractText(footer);
    // Simple heuristic: look for city, state pattern
    const match = text.match(/([A-Z][a-z]+),\s+([A-Z]{2})\s+(\d{5})/);
    if (match) {
      return createResult(
        {
          street: "",
          city: match[1],
          state: match[2],
          zip: match[3],
          country: "United States",
        },
        0.6,
        "footer-text",
        text
      );
    }
  }

  return createResult(null, 0, "not-found", "");
}

/**
 * Extract veterinarians/team members
 */
export function extractVeterinarians(doc: Document): ExtractionResult<ScrapedVeterinarian[]> {
  const vets: ScrapedVeterinarian[] = [];

  // Look for team section
  const teamSection = querySelector(
    doc,
    "[class*='team'], [class*='veterinarian'], [class*='staff'], [class*='doctor']"
  );
  if (!teamSection) {
    return createResult(null, 0, "not-found", "");
  }

  // Find individual team member cards
  const cards = querySelectorAll(
    teamSection,
    "[class*='card'], [class*='member'], [class*='person'], article"
  );

  cards.forEach((card) => {
    // Extract name
    const nameEl = querySelector(card, "h2, h3, [class*='name']");
    const name = extractText(nameEl);
    if (!name || name.length < 2) return;

    // Extract title/credentials
    const titleEl = querySelector(card, "[class*='title'], [class*='credential']");
    let title = extractText(titleEl);

    // Extract DVM/credentials from text
    const text = extractText(card);
    const credMatch = text.match(/(DVM|VMD|DACVIM|ACVS|ACVECC)[\s,)]*/);
    const credentials = credMatch ? credMatch[0].trim() : undefined;

    // Extract bio
    const bioEl = querySelector(card, "[class*='bio'], p");
    const bio = extractText(bioEl);

    // Extract image
    const photoUrl = extractImageUrl(card);

    // Extract specializations
    const specEl = querySelector(card, "[class*='special']");
    const specText = extractText(specEl);
    const specializations = specText
      ? specText.split(/[,;]/).map((s) => s.trim())
      : [];

    vets.push({
      name,
      credentials,
      title: title || undefined,
      bio: bio || undefined,
      photoUrl: photoUrl || undefined,
      specializations: specializations.length > 0 ? specializations : undefined,
    });
  });

  const confidence = vets.length > 0 ? Math.min(1, 0.5 + vets.length * 0.1) : 0;
  return createResult(vets.length > 0 ? vets : null, confidence, "team-section", "");
}

/**
 * Extract services
 */
export function extractServices(doc: Document): ExtractionResult<ScrapedService[]> {
  const services: ScrapedService[] = [];

  // Look for services section
  const servicesSection = querySelector(
    doc,
    "[class*='service'], [class*='treatment'], [class*='offering']"
  );
  if (!servicesSection) {
    return createResult(null, 0, "not-found", "");
  }

  // Find service items
  const items = querySelectorAll(
    servicesSection,
    "[class*='item'], [class*='card'], li, [class*='service']"
  );

  items.forEach((item) => {
    const nameEl = querySelector(item, "h2, h3, h4, strong, [class*='title']");
    const name = extractText(nameEl);
    if (!name || name.length < 2) return;

    const descEl = querySelector(item, "p, [class*='desc']");
    const description = extractText(descEl);

    const priceEl = querySelector(item, "[class*='price'], [class*='cost']");
    const priceDisplay = extractText(priceEl);

    services.push({
      name,
      description: description || undefined,
      priceDisplay: priceDisplay || undefined,
    });
  });

  const confidence = services.length > 0 ? Math.min(1, 0.6 + services.length * 0.05) : 0;
  return createResult(services.length > 0 ? services : null, confidence, "services-section", "");
}

/**
 * Extract testimonials
 */
export function extractTestimonials(doc: Document): ExtractionResult<ScrapedTestimonial[]> {
  const testimonials: ScrapedTestimonial[] = [];

  // Look for testimonials section
  const testSection = querySelector(
    doc,
    "[class*='testimonial'], [class*='review'], [class*='quote']"
  );
  if (!testSection) {
    return createResult(null, 0, "not-found", "");
  }

  // Find testimonial items
  const items = querySelectorAll(testSection, "[class*='item'], blockquote, [class*='testimonial']");

  items.forEach((item) => {
    const quoteEl = querySelector(item, "p, blockquote, [class*='quote']");
    const quote = extractText(quoteEl);
    if (!quote || quote.length < 10) return;

    const authorEl = querySelector(item, "[class*='author'], strong, [class*='name']");
    const authorName = extractText(authorEl);

    // Extract rating from stars or text
    let rating: number | undefined;
    const starEl = querySelector(item, "[class*='star'], [class*='rating']");
    if (starEl) {
      const starText = extractText(starEl);
      const match = starText.match(/(\d+(?:\.\d+)?)\s*(?:\/\s*5|star)/i);
      if (match) rating = parseFloat(match[1]);
    }

    const avatarUrl = extractImageUrl(item);

    testimonials.push({
      authorName: authorName || "Anonymous",
      quote,
      rating,
      avatarUrl: avatarUrl || undefined,
      source: "website",
    });
  });

  const confidence = testimonials.length > 0 ? Math.min(1, 0.5 + testimonials.length * 0.08) : 0;
  return createResult(
    testimonials.length > 0 ? testimonials : null,
    confidence,
    "testimonials-section",
    ""
  );
}

/**
 * Extract social media links
 */
export function extractSocialLinks(doc: Document): ExtractionResult<SocialProfile[]> {
  const socials: SocialProfile[] = [];
  const platformMap: Record<string, SocialProfile["platform"]> = {
    facebook: "facebook",
    facebook_url: "facebook",
    instagram: "instagram",
    insta: "instagram",
    twitter: "twitter",
    x_twitter: "twitter",
    youtube: "youtube",
    tiktok: "tiktok",
    linkedin: "linkedin",
  };

  // Find social links
  const socialLinks = querySelectorAll(
    doc,
    "a[href*='facebook'], a[href*='instagram'], a[href*='twitter'], a[href*='youtube'], a[href*='tiktok'], a[href*='linkedin']"
  );

  socialLinks.forEach((link) => {
    const href = getAttribute(link, "href");
    if (!href) return;

    let platform: SocialProfile["platform"] | null = null;
    for (const [key, plat] of Object.entries(platformMap)) {
      if (href.includes(key.replace(/_/g, ""))) {
        platform = plat;
        break;
      }
    }

    if (platform) {
      socials.push({ platform, url: href });
    }
  });

  return createResult(socials.length > 0 ? socials : null, 0.7, "social-links", "");
}

/**
 * Extract hospital type from keywords
 */
export function extractHospitalType(doc: Document): ExtractionResult<string> {
  const text = (doc.documentElement.textContent || "").toLowerCase();

  const typeKeywords: Record<string, string[]> = {
    general_practice: ["general practice", "general vet", "family vet"],
    emergency_critical_care: ["emergency", "24 hour", "critical care"],
    specialty_referral: ["specialty", "specialist", "referral"],
    exotic_animal: ["exotic", "birds", "reptiles"],
    rehabilitation: ["rehabilitation", "rehab", "physical therapy"],
    mobile_clinic: ["mobile", "house calls"],
  };

  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return createResult(type, 0.6, "keyword-matching", text.slice(0, 100));
    }
  }

  return createResult(null, 0, "not-found", "");
}

/**
 * Extract pet types from content
 */
export function extractPetTypes(doc: Document): ExtractionResult<string[]> {
  const text = (doc.documentElement.textContent || "").toLowerCase();

  const petTypes: Record<string, string[]> = {
    dog: ["dogs", "canine", "puppies"],
    cat: ["cats", "feline", "kittens"],
    bird: ["birds", "avian", "parrot"],
    rabbit: ["rabbit", "rabbits", "bunny"],
    reptile: ["reptile", "reptiles", "snake", "lizard"],
    fish: ["fish", "aquatic"],
    small_mammal: ["hamster", "guinea pig", "ferret"],
    large_animal: ["horse", "horses", "equine"],
    exotic: ["exotic", "unusual"],
  };

  const found: string[] = [];
  for (const [type, keywords] of Object.entries(petTypes)) {
    if (keywords.some((kw) => text.includes(kw))) {
      found.push(type);
    }
  }

  const confidence = found.length > 0 ? Math.min(1, 0.5 + found.length * 0.1) : 0;
  return createResult(found.length > 0 ? found : null, confidence, "keyword-matching", "");
}

/**
 * Extract business hours from various formats
 */
export function extractBusinessHours(doc: Document): ExtractionResult<BusinessHours[]> {
  const hours: BusinessHours[] = [];

  // Try to find hours section
  const hoursSection = querySelector(
    doc,
    "[class*='hours'], [class*='schedule'], [class*='opening']"
  );
  if (!hoursSection) {
    return createResult(null, 0, "not-found", "");
  }

  const text = extractText(hoursSection);
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // Simple regex for "Monday: 9:00 AM - 5:00 PM" format
  days.forEach((day) => {
    const pattern = new RegExp(`${day}[:\\s]+([\\d:]+\\s*(?:am|pm)?)\\s*[-–]\\s*([\\d:]+\\s*(?:am|pm)?)`,"i");
    const match = text.match(pattern);

    if (match) {
      hours.push({
        day,
        open: match[1].toLowerCase(),
        close: match[2].toLowerCase(),
        isClosed: false,
      });
    }
  });

  const confidence = hours.length > 0 ? 0.7 : 0;
  return createResult(hours.length > 0 ? hours : null, confidence, "hours-section", text);
}
