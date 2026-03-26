/**
 * Website Scraper - Main Orchestrator
 * Coordinates all extractors and builds ClinicWebsite data
 */

import { v4 as uuidv4 } from "uuid";
import { ClinicWebsiteDraft, createEmptyClinicWebsite } from "../../types/clinic";
import {
  parseHtml,
  extractText,
  extractImageUrl,
  normalizeUrl,
  extractMetaTag,
  calculateReadability,
} from "./htmlParser";
import {
  extractPrimaryAndSecondaryColors,
  isValidHex,
} from "./colorExtractor";
import {
  extractAllSeoData,
  extractOrganizationData,
  isVeterinaryClinicPage,
} from "./metadataExtractor";
import {
  extractClinicName,
  extractContactInfo,
  extractAddress,
  extractVeterinarians,
  extractServices,
  extractTestimonials,
  extractSocialLinks,
  extractHospitalType,
  extractPetTypes,
  extractBusinessHours,
} from "./contentExtractors";
import {
  ScrapeResult,
  ScrapeSession,
  ScrapedContent,
  ScraperConfig,
  BatchScrapRequest,
  BatchScrapResult,
} from "./types";

const DEFAULT_CONFIG: ScraperConfig = {
  timeout: 30000,
  maxRetries: 3,
  retryDelay: 1000,
  enableCache: true,
  maxPageSize: 5 * 1024 * 1024, // 5MB
  extractImages: true,
  extractPricingTable: true,
  extractCalendars: true,
  followRedirects: true,
};

/**
 * Main Scraper Class
 */
export class WebsiteScraper {
  private config: ScraperConfig;
  private cache: Map<string, ScrapeResult> = new Map();

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Scrape a single website
   */
  async scrape(url: string, onProgress?: (progress: number, status: string) => void): Promise<ScrapeResult> {
    const startTime = Date.now();
    const normalizedUrl = this.normalizeUrl(url);

    // Check cache
    if (this.config.enableCache && this.cache.has(normalizedUrl)) {
      return this.cache.get(normalizedUrl)!;
    }

    onProgress?.(10, "Fetching website...");

    try {
      // Fetch HTML
      const html = await this.fetchPage(normalizedUrl);

      if (!html) {
        return {
          success: false,
          url: normalizedUrl,
          clinicData: {},
          scrapedContent: this.createEmptyScrapedContent(),
          warnings: ["Failed to fetch page"],
          executionTime: Date.now() - startTime,
        };
      }

      onProgress?.(30, "Parsing HTML...");

      // Parse HTML
      const doc = parseHtml(html);
      if (!doc) {
        return {
          success: false,
          url: normalizedUrl,
          clinicData: {},
          scrapedContent: this.createEmptyScrapedContent(),
          warnings: ["Failed to parse HTML"],
          executionTime: Date.now() - startTime,
        };
      }

      onProgress?.(50, "Extracting content...");

      // Check if this is a veterinary clinic page
      const clinicScore = isVeterinaryClinicPage(doc);
      if (clinicScore < 1) {
        return {
          success: false,
          url: normalizedUrl,
          clinicData: {},
          scrapedContent: this.createEmptyScrapedContent(),
          warnings: [
            `Low confidence this is a veterinary clinic page (score: ${clinicScore.toFixed(1)}/10)`,
          ],
          executionTime: Date.now() - startTime,
        };
      }

      onProgress?.(70, "Building clinic data...");

      // Extract all data
      const scrapedContent = this.extractAllData(doc, normalizedUrl);
      const clinicData = this.buildClinicData(scrapedContent, normalizedUrl);

      onProgress?.(90, "Finalizing...");

      const result: ScrapeResult = {
        success: true,
        url: normalizedUrl,
        clinicData,
        scrapedContent,
        warnings: [],
        executionTime: Date.now() - startTime,
        pageTitle: doc.title,
        pageLanguage: doc.documentElement.lang,
        pageCharset: this.getCharset(doc),
        readability: this.calculateReadability(doc),
      };

      // Cache result
      if (this.config.enableCache) {
        this.cache.set(normalizedUrl, result);
      }

      onProgress?.(100, "Complete!");
      return result;
    } catch (error) {
      return {
        success: false,
        url: normalizedUrl,
        clinicData: {},
        scrapedContent: this.createEmptyScrapedContent(),
        warnings: [
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Scrape multiple websites in batch
   */
  async scrapeBatch(request: BatchScrapRequest): Promise<BatchScrapResult> {
    const startTime = Date.now();
    const results: ScrapeResult[] = [];

    for (let i = 0; i < request.urls.length; i++) {
      const url = request.urls[i];
      const progress = (i / request.urls.length) * 100;

      request.onProgress?.(progress, i + 1, request.urls.length);

      const result = await this.scrape(url, (subProgress, status) => {
        const combined = progress + (subProgress / request.urls.length);
        request.onProgress?.(combined, i + 1, request.urls.length);
      });

      results.push(result);

      // Delay between requests (rate limiting)
      if (i < request.urls.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return {
      total: request.urls.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
      executionTime: Date.now() - startTime,
    };
  }

  /**
   * Extract all data from document
   */
  private extractAllData(doc: Document, baseUrl: string): ScrapedContent {
    return {
      // Branding
      clinicName: extractClinicName(doc, baseUrl),
      tagline: this.extractTagline(doc),
      logo: this.extractLogo(doc, baseUrl),
      primaryColor: this.extractPrimaryColor(doc),
      secondaryColor: this.extractSecondaryColor(doc),

      // Contact
      phone: this.extractPhone(doc),
      emergencyPhone: this.extractEmergencyPhone(doc),
      email: this.extractEmail(doc),
      website: this.extractWebsite(doc),

      // Location
      address: extractAddress(doc),
      mapEmbedUrl: this.extractMapEmbed(doc),
      coordinates: this.extractCoordinates(doc),

      // Operations
      businessHours: extractBusinessHours(doc),

      // Type & Services
      hospitalType: extractHospitalType(doc),
      petTypes: extractPetTypes(doc),

      // People
      veterinarians: extractVeterinarians(doc),
      team: this.extractTeamMembers(doc),

      // Services
      services: extractServices(doc),

      // Social Proof
      testimonials: extractTestimonials(doc),
      googleReviewCount: this.extractGoogleReviewCount(doc),

      // SEO & Meta
      metaTitle: this.extractMetaTitle(doc),
      metaDescription: this.extractMetaDescription(doc),
      focusKeywords: this.extractKeywords(doc),
      ogImage: this.extractOgImage(doc),

      // Social
      socialLinks: extractSocialLinks(doc),

      // Hero Content
      heroHeadline: this.extractHeroHeadline(doc),
      heroSubheadline: this.extractHeroSubheadline(doc),
      heroImage: this.extractHeroImage(doc),
      heroCta: this.extractHeroCta(doc),

      // Rich Content
      aboutText: this.extractAboutText(doc),
      faqItems: this.extractFaq(doc),
    };
  }

  /**
   * Build ClinicWebsiteDraft from scraped content
   */
  private buildClinicData(scraped: ScrapedContent, baseUrl: string): Partial<ClinicWebsiteDraft> {
    const base = createEmptyClinicWebsite();

    // General Details
    if (scraped.clinicName.value) {
      base.general!.name = scraped.clinicName.value;
      // Auto-generate slug
      base.general!.slug = scraped.clinicName.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (scraped.tagline.value) {
      base.general!.tagline = scraped.tagline.value;
    }

    if (scraped.metaDescription.value) {
      base.general!.metaDescription = scraped.metaDescription.value;
    }

    if (scraped.logo.value) {
      base.general!.logoUrl = normalizeUrl(scraped.logo.value, baseUrl);
    }

    // Colors
    if (scraped.primaryColor.value && isValidHex(scraped.primaryColor.value)) {
      base.general!.primaryColor = scraped.primaryColor.value;
    }
    if (scraped.secondaryColor.value && isValidHex(scraped.secondaryColor.value)) {
      base.general!.secondaryColor = scraped.secondaryColor.value;
    }

    // Taxonomy
    if (scraped.hospitalType.value) {
      base.taxonomy!.hospitalType = scraped.hospitalType.value as any;
    }
    if (scraped.petTypes.value && scraped.petTypes.value.length > 0) {
      base.taxonomy!.petTypes = scraped.petTypes.value as any;
    }

    // Contact
    if (scraped.phone.value) {
      base.contact!.phone = scraped.phone.value;
    }
    if (scraped.emergencyPhone.value) {
      base.contact!.emergencyPhone = scraped.emergencyPhone.value;
    }
    if (scraped.email.value) {
      base.contact!.email = scraped.email.value;
    }
    if (scraped.address.value) {
      base.contact!.address = scraped.address.value;
    }
    if (scraped.businessHours.value) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      base.contact!.businessHours = scraped.businessHours.value as any;
    }

    // Team
    if (scraped.veterinarians.value) {
      base.veterinarians = scraped.veterinarians.value.map((v) => ({
        id: uuidv4(),
        name: v.name,
        credentials: v.credentials,
        title: v.title,
        bio: v.bio,
        photoUrl: v.photoUrl,
        specializations: v.specializations || [],
        serviceIds: [],
        order: 0,
        isVisible: true,
      }));
    }

    // Services
    if (scraped.services.value) {
      base.services = scraped.services.value.map((s, idx) => ({
        id: uuidv4(),
        name: s.name,
        description: s.description,
        priceDisplay: s.priceDisplay,
        duration: s.duration,
        order: idx,
        isVisible: true,
        isHighlighted: false,
      }));
    }

    return base;
  }

  /**
   * Helper extractors
   */
  private extractTagline(doc: Document) {
    const meta = document.querySelector("meta[name='description']");
    const content = meta?.getAttribute("content") || "";
    return {
      value: content ? content.slice(0, 160) : null,
      confidence: content ? 0.8 : 0,
      source: "meta-description",
      raw: content,
    };
  }

  private extractLogo(doc: Document, baseUrl: string) {
    const logo = doc.querySelector("img.logo, [class*='logo'] img, header img");
    const src = logo?.getAttribute("src");
    return {
      value: src ? normalizeUrl(src, baseUrl) : null,
      confidence: src ? 0.7 : 0,
      source: "img-logo",
      raw: src || "",
    };
  }

  private extractPrimaryColor(doc: Document) {
    const { primary } = extractPrimaryAndSecondaryColors(doc);
    if (primary) {
      return {
        value: primary.color,
        confidence: primary.confidence,
        source: primary.source,
        raw: primary.color,
      };
    }
    return { value: null, confidence: 0, source: "not-found", raw: "" };
  }

  private extractSecondaryColor(doc: Document) {
    const { secondary } = extractPrimaryAndSecondaryColors(doc);
    if (secondary) {
      return {
        value: secondary.color,
        confidence: secondary.confidence,
        source: secondary.source,
        raw: secondary.color,
      };
    }
    return { value: null, confidence: 0, source: "not-found", raw: "" };
  }

  private extractPhone(doc: Document) {
    const { phones } = extractContactInfo(doc);
    return {
      value: phones[0] || null,
      confidence: phones.length > 0 ? 0.8 : 0,
      source: "contact-extraction",
      raw: phones.join(", "),
    };
  }

  private extractEmergencyPhone(doc: Document) {
    const { phones } = extractContactInfo(doc);
    const emergencyKeywords = ["emergency", "after hours", "24/7", "urgent"];
    const text = doc.documentElement.textContent || "";

    const emergency = phones.find((p) => {
      const context = text.slice(Math.max(0, text.indexOf(p) - 100), text.indexOf(p) + 100);
      return emergencyKeywords.some((kw) => context.toLowerCase().includes(kw));
    });

    return {
      value: emergency || null,
      confidence: emergency ? 0.7 : 0,
      source: "emergency-phone-extraction",
      raw: emergency || "",
    };
  }

  private extractEmail(doc: Document) {
    const { emails } = extractContactInfo(doc);
    return {
      value: emails[0] || null,
      confidence: emails.length > 0 ? 0.8 : 0,
      source: "email-extraction",
      raw: emails.join(", "),
    };
  }

  private extractWebsite(doc: Document) {
    const { websites } = extractContactInfo(doc);
    return {
      value: websites[0] || null,
      confidence: websites.length > 0 ? 0.6 : 0,
      source: "website-extraction",
      raw: websites.join(", "),
    };
  }

  private extractMapEmbed(doc: Document) {
    const iframe = doc.querySelector("iframe[src*='google.com/maps'], iframe[src*='maps.']");
    const src = iframe?.getAttribute("src");
    return {
      value: src || null,
      confidence: src ? 0.8 : 0,
      source: "maps-embed",
      raw: src || "",
    };
  }

  private extractCoordinates(doc: Document) {
    // Would extract from Schema.org geo or map data
    return {
      value: null,
      confidence: 0,
      source: "not-found",
      raw: "",
    };
  }

  private extractTeamMembers(doc: Document) {
    // Fallback to veterinarians extraction
    return {
      value: null,
      confidence: 0,
      source: "not-found",
      raw: "",
    };
  }

  private extractGoogleReviewCount(doc: Document) {
    const reviewText = doc.documentElement.textContent || "";
    const match = reviewText.match(/(\d+(?:,\d+)?)\s*(?:google\s+)?review/i);
    const count = match ? parseInt(match[1].replace(/,/g, ""), 10) : null;

    return {
      value: count,
      confidence: count ? 0.6 : 0,
      source: "text-extraction",
      raw: match ? match[0] : "",
    };
  }

  private extractMetaTitle(doc: Document) {
    const title = doc.querySelector("meta[property='og:title']")?.getAttribute("content") || doc.title;
    return {
      value: title.slice(0, 70) || null,
      confidence: title ? 0.8 : 0,
      source: "meta-title",
      raw: title,
    };
  }

  private extractMetaDescription(doc: Document) {
    const desc = extractMetaTag(doc, "description");
    return {
      value: desc.slice(0, 160) || null,
      confidence: desc ? 0.9 : 0,
      source: "meta-description",
      raw: desc,
    };
  }

  private extractKeywords(doc: Document) {
    const keywords = extractMetaTag(doc, "keywords");
    const list = keywords ? keywords.split(",").map((k) => k.trim()) : [];
    return {
      value: list.length > 0 ? list : null,
      confidence: list.length > 0 ? 0.5 : 0,
      source: "meta-keywords",
      raw: keywords,
    };
  }

  private extractOgImage(doc: Document) {
    const img = doc.querySelector("meta[property='og:image']")?.getAttribute("content");
    return {
      value: img || null,
      confidence: img ? 0.8 : 0,
      source: "og-image",
      raw: img || "",
    };
  }

  private extractHeroHeadline(doc: Document) {
    const h1 = doc.querySelector("h1");
    const text = extractText(h1);
    return {
      value: text || null,
      confidence: text ? 0.8 : 0,
      source: "h1-tag",
      raw: text,
    };
  }

  private extractHeroSubheadline(doc: Document) {
    const h2 = doc.querySelector("h2");
    const text = extractText(h2);
    return {
      value: text || null,
      confidence: text ? 0.7 : 0,
      source: "h2-tag",
      raw: text,
    };
  }

  private extractHeroImage(doc: Document) {
    const hero = doc.querySelector("[class*='hero'], header");
    const img = extractImageUrl(hero);
    return {
      value: img || null,
      confidence: img ? 0.7 : 0,
      source: "hero-image",
      raw: img,
    };
  }

  private extractHeroCta(doc: Document) {
    const cta = doc.querySelector("a[class*='cta'], a[class*='primary'], button[class*='primary']");
    if (!cta) {
      return { value: null, confidence: 0, source: "not-found", raw: "" };
    }

    const label = extractText(cta);
    const href = cta.getAttribute("href") || "";

    return {
      value: label && href ? { label, href } : null,
      confidence: label && href ? 0.7 : 0,
      source: "cta-button",
      raw: `${label} → ${href}`,
    };
  }

  private extractAboutText(doc: Document) {
    const about = doc.querySelector("[class*='about'], main p");
    const text = extractText(about);
    return {
      value: text?.slice(0, 500) || null,
      confidence: text ? 0.6 : 0,
      source: "about-section",
      raw: text || "",
    };
  }

  private extractFaq(doc: Document) {
    const faqs = document.querySelectorAll("[class*='faq'] [class*='item'], details");
    const items = Array.from(faqs).map((el) => {
      const summary = el.querySelector("summary") || el.querySelector("h3");
      const question = extractText(summary);
      const answer = extractText(el);

      return { question, answer };
    });

    return {
      value: items.length > 0 ? items : null,
      confidence: items.length > 0 ? 0.6 : 0,
      source: "faq-extraction",
      raw: items.map((i) => `Q: ${i.question}`).join("\n"),
    };
  }

  private createEmptyScrapedContent() {
    return {
      clinicName: { value: null, confidence: 0, source: "", raw: "" },
      tagline: { value: null, confidence: 0, source: "", raw: "" },
      logo: { value: null, confidence: 0, source: "", raw: "" },
      primaryColor: { value: null, confidence: 0, source: "", raw: "" },
      secondaryColor: { value: null, confidence: 0, source: "", raw: "" },
      phone: { value: null, confidence: 0, source: "", raw: "" },
      emergencyPhone: { value: null, confidence: 0, source: "", raw: "" },
      email: { value: null, confidence: 0, source: "", raw: "" },
      website: { value: null, confidence: 0, source: "", raw: "" },
      address: { value: null, confidence: 0, source: "", raw: "" },
      mapEmbedUrl: { value: null, confidence: 0, source: "", raw: "" },
      coordinates: { value: null, confidence: 0, source: "", raw: "" },
      businessHours: { value: null, confidence: 0, source: "", raw: "" },
      hospitalType: { value: null, confidence: 0, source: "", raw: "" },
      petTypes: { value: null, confidence: 0, source: "", raw: "" },
      veterinarians: { value: null, confidence: 0, source: "", raw: "" },
      team: { value: null, confidence: 0, source: "", raw: "" },
      services: { value: null, confidence: 0, source: "", raw: "" },
      testimonials: { value: null, confidence: 0, source: "", raw: "" },
      googleReviewCount: { value: null, confidence: 0, source: "", raw: "" },
      metaTitle: { value: null, confidence: 0, source: "", raw: "" },
      metaDescription: { value: null, confidence: 0, source: "", raw: "" },
      focusKeywords: { value: null, confidence: 0, source: "", raw: "" },
      ogImage: { value: null, confidence: 0, source: "", raw: "" },
      socialLinks: { value: null, confidence: 0, source: "", raw: "" },
      heroHeadline: { value: null, confidence: 0, source: "", raw: "" },
      heroSubheadline: { value: null, confidence: 0, source: "", raw: "" },
      heroImage: { value: null, confidence: 0, source: "", raw: "" },
      heroCta: { value: null, confidence: 0, source: "", raw: "" },
      aboutText: { value: null, confidence: 0, source: "", raw: "" },
      faqItems: { value: null, confidence: 0, source: "", raw: "" },
    } as ScrapedContent;
  }

  /**
   * Fetch page HTML
   */
  private async fetchPage(url: string, attempt: number = 1): Promise<string | null> {
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; VetClinicsBot/1.0; +http://vetclinics.io/bot)",
        },
        signal: AbortSignal.timeout(this.config.timeout!),
      });

      if (!response.ok) {
        if (attempt < this.config.maxRetries! && response.status >= 500) {
          await new Promise((r) => setTimeout(r, this.config.retryDelay!));
          return this.fetchPage(url, attempt + 1);
        }
        return null;
      }

      const html = await response.text();

      // Check size
      if (html.length > this.config.maxPageSize!) {
        return html.slice(0, this.config.maxPageSize!);
      }

      return html;
    } catch (error) {
      if (attempt < this.config.maxRetries!) {
        await new Promise((r) => setTimeout(r, this.config.retryDelay!));
        return this.fetchPage(url, attempt + 1);
      }
      return null;
    }
  }

  /**
   * Normalize URL
   */
  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url.startsWith("http") ? url : `https://${url}`);
      return u.href;
    } catch {
      return url;
    }
  }

  /**
   * Get page charset
   */
  private getCharset(doc: Document): string {
    const meta = doc.querySelector("meta[charset], meta[http-equiv='Content-Type']");
    if (meta?.getAttribute("charset")) {
      return meta.getAttribute("charset")!;
    }
    const content = meta?.getAttribute("content") || "";
    const match = content.match(/charset=([^;]+)/i);
    return match ? match[1] : "UTF-8";
  }

  /**
   * Calculate readability
   */
  private calculateReadability(doc: Document) {
    const text = doc.documentElement.textContent || "";
    const { wordCount, estimatedReadingTime } = calculateReadability(text);

    return {
      estimatedReadingTime,
      textLength: text.length,
    };
  }
}

/**
 * Convenience export
 */
export async function scrapeWebsite(
  url: string,
  config?: Partial<ScraperConfig>,
  onProgress?: (progress: number, status: string) => void
): Promise<ScrapeResult> {
  const scraper = new WebsiteScraper(config);
  return scraper.scrape(url, onProgress);
}

export async function scrapeMultiple(
  request: BatchScrapRequest
): Promise<BatchScrapResult> {
  const scraper = new WebsiteScraper(request.config);
  return scraper.scrapeBatch(request);
}
