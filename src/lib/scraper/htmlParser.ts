/**
 * HTML Parsing & DOM utilities for safe text extraction
 */

/**
 * Parse HTML string to DOM nodes
 * Returns null if parsing fails
 */
export function parseHtml(html: string): Document | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Check if parsing failed (DOMParser returns error document)
    if (doc.documentElement.tagName === "parsererror") {
      return null;
    }

    return doc;
  } catch {
    return null;
  }
}

/**
 * Extract text from element, stripping tags and extra whitespace
 */
export function extractText(element: Element | null): string {
  if (!element) return "";

  const text = element.textContent || "";
  return text
    .trim()
    .replace(/\s+/g, " ") // normalize whitespace
    .slice(0, 10000); // cap at 10k chars to prevent memory bloat
}

/**
 * Extract all text from element, preserving paragraph breaks
 */
export function extractTextWithBreaks(element: Element | null): string {
  if (!element) return "";

  const clone = element.cloneNode(true) as Element;

  // Add newlines before/after block elements
  clone.querySelectorAll("p, div, section, article, blockquote, li").forEach((el) => {
    const text = document.createTextNode("\n");
    el.parentNode?.insertBefore(text, el.nextSibling);
  });

  const text = clone.textContent || "";
  return text
    .trim()
    .replace(/\n\s+\n/g, "\n\n")
    .replace(/\s+\n/g, "\n")
    .slice(0, 50000);
}

/**
 * Query selector with null-safety
 */
export function querySelector(doc: Document | Element, selector: string): Element | null {
  try {
    return doc.querySelector(selector);
  } catch {
    return null;
  }
}

/**
 * Query all matching elements
 */
export function querySelectorAll(doc: Document | Element, selector: string): Element[] {
  try {
    return Array.from(doc.querySelectorAll(selector));
  } catch {
    return [];
  }
}

/**
 * Get attribute value safely
 */
export function getAttribute(element: Element | null, attr: string): string {
  if (!element) return "";
  return element.getAttribute(attr) || "";
}

/**
 * Get all attributes as object
 */
export function getAttributes(element: Element | null): Record<string, string> {
  if (!element) return {};

  const attrs: Record<string, string> = {};
  if (element.attributes) {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attrs[attr.name] = attr.value;
    }
  }
  return attrs;
}

/**
 * Extract first image URL from element
 */
export function extractImageUrl(element: Element | null): string {
  if (!element) return "";

  // Try <img src>
  const img = querySelector(element, "img");
  if (img) {
    const src = getAttribute(img, "src");
    if (src) return normalizeUrl(src);
  }

  // Try background-image in style
  if (element instanceof HTMLElement) {
    const bgImage = window.getComputedStyle(element).backgroundImage;
    const match = bgImage?.match(/url\(['"]?([^'"]+)['"]?\)/);
    if (match) return normalizeUrl(match[1]);
  }

  return "";
}

/**
 * Extract all image URLs from element
 */
export function extractImageUrls(element: Element | null, maxImages: number = 10): string[] {
  if (!element) return [];

  const urls: string[] = [];
  const seen = new Set<string>();

  // Get all img tags
  querySelectorAll(element, "img").forEach((img) => {
    const src = getAttribute(img, "src");
    if (src && !seen.has(src)) {
      urls.push(normalizeUrl(src));
      seen.add(src);
    }
  });

  return urls.slice(0, maxImages);
}

/**
 * Normalize relative URLs to absolute
 */
export function normalizeUrl(url: string, baseUrl?: string): string {
  if (!url) return "";

  // Already absolute
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Protocol-relative
  if (url.startsWith("//")) {
    return "https:" + url;
  }

  // Relative URL - need base
  if (baseUrl) {
    try {
      return new URL(url, baseUrl).href;
    } catch {
      return url;
    }
  }

  return url;
}

/**
 * Clean HTML entities and decode text
 */
export function decodeHtml(html: string): string {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Check if element is visible (not hidden by display:none, visibility:hidden, etc.)
 */
export function isVisible(element: HTMLElement): boolean {
  if (!element) return false;

  // Check display
  const style = window.getComputedStyle(element);
  if (style.display === "none") return false;
  if (style.visibility === "hidden") return false;
  if (style.opacity === "0") return false;

  // Check dimensions
  if (element.offsetHeight <= 0 && element.offsetWidth <= 0) return false;

  return true;
}

/**
 * Extract structured data (JSON-LD, microdata)
 */
export function extractJsonLd(doc: Document): Record<string, unknown>[] {
  const scripts = querySelectorAll(doc, 'script[type="application/ld+json"]');
  const data: Record<string, unknown>[] = [];

  scripts.forEach((script) => {
    try {
      const json = JSON.parse(script.textContent || "{}");
      data.push(json);
    } catch {
      // ignore parse errors
    }
  });

  return data;
}

/**
 * Extract meta tag content
 */
export function extractMetaTag(doc: Document, name: string, attribute: string = "content"): string {
  const meta = querySelector(doc, `meta[name="${name}"], meta[property="${name}"]`);
  return getAttribute(meta, attribute);
}

/**
 * Extract all meta tags as object
 */
export function extractAllMetaTags(doc: Document): Record<string, string> {
  const metas: Record<string, string> = {};

  querySelectorAll(doc, "meta[name], meta[property]").forEach((meta) => {
    const name = getAttribute(meta, "name") || getAttribute(meta, "property");
    const content = getAttribute(meta, "content");
    if (name && content) {
      metas[name] = content;
    }
  });

  return metas;
}

/**
 * Extract heading hierarchy
 */
export function extractHeadings(doc: Document): Array<{ level: number; text: string }> {
  const headings: Array<{ level: number; text: string }> = [];

  querySelectorAll(doc, "h1, h2, h3, h4, h5, h6").forEach((h) => {
    const level = parseInt(h.tagName[1], 10);
    const text = extractText(h);
    if (text) headings.push({ level, text });
  });

  return headings;
}

/**
 * Find element by text content (partial match)
 */
export function findElementByText(
  container: Element,
  text: string,
  selector: string = "*"
): Element | null {
  const elements = querySelectorAll(container, selector);

  for (const el of elements) {
    if (el.textContent?.includes(text)) {
      return el;
    }
  }

  return null;
}

/**
 * Extract phone numbers from text
 */
export function extractPhoneNumbers(text: string): string[] {
  const patterns = [
    /(\+?1?\s*\(?(\d{3})\)?[\s.-]?(\d{3})[\s.-]?(\d{4}))/g, // US/Canada
    /(\+\d{1,3}[\s.-]?\d{1,14})/g, // International
  ];

  const numbers = new Set<string>();

  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      numbers.add(match[0]);
    }
  });

  return Array.from(numbers);
}

/**
 * Extract email addresses from text
 */
export function extractEmails(text: string): string[] {
  const pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return Array.from(new Set(text.match(pattern) || []));
}

/**
 * Extract URLs from text
 */
export function extractUrls(text: string): string[] {
  const pattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]*[^\s<>"{}|\\^`\[\].,]/g;
  return Array.from(new Set(text.match(pattern) || []));
}

/**
 * Calculate text readability metrics
 */
export function calculateReadability(text: string): { wordCount: number; estimatedReadingTime: number } {
  const words = text.trim().split(/\s+/).length;
  const estimatedReadingTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute

  return { wordCount: words, estimatedReadingTime };
}

/**
 * Check if text contains keywords
 */
export function containsKeywords(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

/**
 * Sanitize text for safe display
 */
export function sanitizeText(text: string, maxLength: number = 1000): string {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ""); // Basic HTML tag stripping
}
