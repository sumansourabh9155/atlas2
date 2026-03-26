/**
 * Website Scraper Type Definitions
 * Interfaces for scraping, parsing, and data extraction
 */

import { ClinicWebsiteDraft } from "@/types/clinic";

/**
 * Extraction result with confidence score and source
 */
export interface ExtractionResult<T> {
  value: T | null;
  confidence: number; // 0–1: how confident we are in this value
  source: string; // where we found it (meta tag, h1, etc.)
  raw: string; // original text before processing
}

/**
 * Overall scrape session with progress tracking
 */
export interface ScrapeSession {
  url: string;
  status: "idle" | "loading" | "scanning" | "extracting" | "complete" | "error";
  progress: number; // 0–100
  error?: string;
  startedAt: number;
  completedAt?: number;
  rawHtml?: string;
  extractedData?: Partial<ClinicWebsiteDraft>;
  warnings: string[];
}

/**
 * Extracted content from a live website
 */
export interface ScrapedContent {
  // Branding & Identity
  clinicName: ExtractionResult<string>;
  tagline: ExtractionResult<string>;
  logo: ExtractionResult<string>; // URL
  primaryColor: ExtractionResult<string>; // hex
  secondaryColor: ExtractionResult<string>; // hex

  // Contact Details
  phone: ExtractionResult<string>;
  emergencyPhone: ExtractionResult<string>;
  email: ExtractionResult<string>;
  website: ExtractionResult<string>;

  // Location
  address: ExtractionResult<Address>;
  mapEmbedUrl: ExtractionResult<string>;
  coordinates: ExtractionResult<{ lat: number; lng: number }>;

  // Operations
  businessHours: ExtractionResult<BusinessHours[]>;

  // Type & Services
  hospitalType: ExtractionResult<string>;
  petTypes: ExtractionResult<string[]>;

  // People & Expertise
  veterinarians: ExtractionResult<ScrapedVeterinarian[]>;
  team: ExtractionResult<ScrapedTeamMember[]>;

  // Services Offered
  services: ExtractionResult<ScrapedService[]>;

  // Testimonials & Social Proof
  testimonials: ExtractionResult<ScrapedTestimonial[]>;
  googleReviewCount: ExtractionResult<number>;

  // SEO & Meta
  metaTitle: ExtractionResult<string>;
  metaDescription: ExtractionResult<string>;
  focusKeywords: ExtractionResult<string[]>;
  ogImage: ExtractionResult<string>;

  // Social Media
  socialLinks: ExtractionResult<SocialProfile[]>;

  // Content Blocks
  heroHeadline: ExtractionResult<string>;
  heroSubheadline: ExtractionResult<string>;
  heroImage: ExtractionResult<string>;
  heroCta: ExtractionResult<CtaButton>;

  // Rich Content
  aboutText: ExtractionResult<string>;
  faqItems: ExtractionResult<FaqItem[]>;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface BusinessHours {
  day: string; // "monday", "tuesday", etc.
  open: string; // "09:00"
  close: string; // "17:00"
  isClosed: boolean;
}

export interface ScrapedVeterinarian {
  name: string;
  credentials?: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  specializations?: string[];
}

export interface ScrapedTeamMember {
  name: string;
  title?: string;
  bio?: string;
  photoUrl?: string;
  email?: string;
}

export interface ScrapedService {
  name: string;
  description?: string;
  priceDisplay?: string;
  duration?: string;
  icon?: string;
}

export interface ScrapedTestimonial {
  authorName: string;
  petName?: string;
  rating?: number;
  quote: string;
  avatarUrl?: string;
  source?: "google" | "yelp" | "facebook" | "website" | "manual";
}

export interface SocialProfile {
  platform: "facebook" | "instagram" | "twitter" | "youtube" | "tiktok" | "linkedin";
  url: string;
  handle?: string;
}

export interface CtaButton {
  label: string;
  href: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Scraper configuration options
 */
export interface ScraperConfig {
  timeout?: number; // ms, default 30000
  maxRetries?: number; // default 3
  retryDelay?: number; // ms, default 1000
  userAgent?: string;
  enableCache?: boolean;
  maxPageSize?: number; // bytes, default 5MB
  extractImages?: boolean;
  extractPricingTable?: boolean;
  extractCalendars?: boolean;
  followRedirects?: boolean;
  insecureSsl?: boolean; // for testing
}

/**
 * Scraper result with full clinic data and metadata
 */
export interface ScrapeResult {
  success: boolean;
  url: string;
  clinicData: Partial<ClinicWebsiteDraft>;
  scrapedContent: ScrapedContent;
  warnings: string[];
  executionTime: number; // ms
  pageTitle?: string;
  pageLanguage?: string;
  pageCharset?: string;
  readability?: {
    estimatedReadingTime: number; // minutes
    textLength: number; // chars
  };
}

/**
 * Batch scrape request
 */
export interface BatchScrapRequest {
  urls: string[];
  config?: ScraperConfig;
  onProgress?: (progress: number, current: number, total: number) => void;
}

/**
 * Batch scrape result
 */
export interface BatchScrapResult {
  total: number;
  successful: number;
  failed: number;
  results: ScrapeResult[];
  executionTime: number;
}
