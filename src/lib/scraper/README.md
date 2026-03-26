# Website Scraper System

Advanced web scraping system for extracting veterinary clinic information from existing websites. Includes robust parsing, content extraction, color detection, and metadata parsing.

## Features

### Core Capabilities
- **Intelligent Content Extraction**: Extracts clinic name, branding, contact info, hours, services, team, testimonials
- **Color Intelligence**: Automatically detects primary and secondary brand colors from CSS and DOM
- **Metadata Parsing**: Extracts Open Graph, Twitter Card, and Schema.org structured data
- **Confidence Scoring**: Each extracted field has a confidence score (0-1) for user review
- **Batch Processing**: Support for scraping multiple websites with rate limiting
- **Caching**: Built-in caching to avoid re-scraping same URLs
- **Error Resilience**: Retry logic, timeout handling, and graceful degradation
- **Size Limits**: Configurable page size limits and timeouts for safety

### Extracted Data Categories

#### Branding & Identity
- Clinic name
- Tagline / short description
- Logo URL
- Primary color
- Secondary color

#### Contact Information
- Phone number
- Emergency phone
- Email address
- Website URL

#### Location
- Full address (street, city, state, zip, country)
- Map embed URL
- GPS coordinates

#### Operations
- Business hours (7-day schedule)
- Holiday hours
- 24-hour availability detection

#### Classification
- Hospital type (general practice, specialty, emergency, exotic, etc.)
- Pet types served (dogs, cats, birds, reptiles, etc.)

#### People & Expertise
- Veterinarian names
- Credentials (DVM, VMD, specializations)
- Titles
- Biographies
- Photos
- Specializations

#### Services Offered
- Service names
- Descriptions
- Pricing information
- Duration estimates

#### Social Proof
- Customer testimonials
- Ratings and reviews
- Review counts
- Review source (website, Google, Yelp, etc.)

#### SEO & Metadata
- Meta title
- Meta description
- Focus keywords
- Open Graph image
- Canonical URL
- Robots directives

#### Social Media
- Facebook profile
- Instagram handle
- Twitter/X profile
- YouTube channel
- TikTok profile
- LinkedIn profile

#### Page Content
- Hero headline
- Hero subheadline
- Hero image
- Call-to-action buttons
- About/About Us section
- FAQ items

## Usage

### Basic Usage

```typescript
import { scrapeWebsite } from "@/lib/scraper/websiteScraper";

const result = await scrapeWebsite("https://example-vet-clinic.com", {
  timeout: 30000,
  enableCache: true,
}, (progress, status) => {
  console.log(`${progress}% - ${status}`);
});

if (result.success) {
  console.log("Clinic name:", result.clinicData.general?.name);
  console.log("Phone:", result.clinicData.contact?.phone);
} else {
  console.error("Scraping failed:", result.warnings);
}
```

### With React Component

```tsx
import { WebsiteScannerModal } from "@/components/WebsiteScannerModal";
import { useState } from "react";

export function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Import from Website
      </button>

      <WebsiteScannerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
```

### Batch Scraping

```typescript
import { scrapeMultiple } from "@/lib/scraper/websiteScraper";

const results = await scrapeMultiple({
  urls: [
    "https://clinic1.com",
    "https://clinic2.com",
    "https://clinic3.com",
  ],
  config: { timeout: 30000 },
  onProgress: (progress, current, total) => {
    console.log(`${current}/${total} (${Math.round(progress)}%)`);
  },
});

console.log(`Success: ${results.successful}/${results.total}`);
```

## Architecture

### File Structure

```
src/lib/scraper/
├── types.ts                    # Type definitions
├── htmlParser.ts              # DOM parsing utilities
├── colorExtractor.ts          # Color detection engine
├── metadataExtractor.ts       # SEO metadata extraction
├── contentExtractors.ts       # Specialized content extractors
├── websiteScraper.ts          # Main orchestrator
└── README.md                   # This file

src/components/
└── WebsiteScannerModal.tsx    # React UI component
```

### Key Classes & Functions

#### WebsiteScraper
Main orchestrator class that coordinates all extractors.

```typescript
const scraper = new WebsiteScraper({
  timeout: 30000,
  maxRetries: 3,
  enableCache: true,
});

const result = await scraper.scrape(url);
```

#### HTML Parser (`htmlParser.ts`)
Safe DOM manipulation and text extraction utilities:
- `parseHtml()` - Parse HTML string to DOM
- `extractText()` - Extract clean text from elements
- `querySelector()`, `querySelectorAll()` - Safe selectors
- `extractImageUrl()`, `extractImageUrls()` - Image extraction
- `extractPhoneNumbers()`, `extractEmails()`, `extractUrls()` - Pattern matching
- `calculateReadability()` - Estimate reading time

#### Color Extractor (`colorExtractor.ts`)
Intelligent color detection from CSS and DOM:
- `colorToHex()` - Convert any color format to hex
- `extractColorsFromCss()` - Parse stylesheets
- `extractSemanticColors()` - Extract from buttons, headers, etc.
- `extractPrimaryAndSecondaryColors()` - Find brand colors
- `suggestContrastingColor()` - Calculate text color for backgrounds

#### Metadata Extractor (`metadataExtractor.ts`)
Parse Open Graph, Schema.org, Twitter Cards:
- `extractOpenGraphData()` - OG meta tags
- `extractSchemaOrgData()` - JSON-LD schemas
- `extractAllSeoData()` - Complete SEO snapshot
- `isVeterinaryClinicPage()` - Confidence that page is a vet clinic

#### Content Extractors (`contentExtractors.ts`)
Specialized extraction for each data type:
- `extractClinicName()` - Name from title, OG, h1, logo alt
- `extractContactInfo()` - Phone, email, websites
- `extractVeterinarians()` - Team member details
- `extractServices()` - Service offerings
- `extractTestimonials()` - Reviews and testimonials
- `extractSocialLinks()` - Social media profiles
- `extractHospitalType()` - Clinic classification
- `extractPetTypes()` - Pet species served
- `extractBusinessHours()` - Operating hours

## Configuration

### ScraperConfig Options

```typescript
interface ScraperConfig {
  timeout?: number;              // Max time per request (ms), default 30000
  maxRetries?: number;           // Retry attempts on failure, default 3
  retryDelay?: number;           // Delay between retries (ms), default 1000
  userAgent?: string;            // Custom User-Agent string
  enableCache?: boolean;         // Cache results, default true
  maxPageSize?: number;          // Max HTML size (bytes), default 5MB
  extractImages?: boolean;       // Extract image URLs, default true
  extractPricingTable?: boolean; // Extract pricing, default true
  extractCalendars?: boolean;    // Parse calendar/booking, default true
  followRedirects?: boolean;     // Follow redirects, default true
  insecureSsl?: boolean;         // Skip SSL verification (unsafe), default false
}
```

## Confidence Scoring

Each extracted field includes a confidence score (0-1):

- **0.9-1.0**: High confidence (explicit meta tags, Schema.org, well-structured data)
- **0.7-0.8**: Good confidence (clear semantic HTML, prominent elements)
- **0.5-0.6**: Moderate confidence (heuristic-based, pattern matching)
- **0.3-0.4**: Low confidence (guesses, domain-based)
- **< 0.3**: Very low confidence (not recommended for import)

Users can review and deselect low-confidence fields before importing.

## Performance

### Typical Extraction Times
- Small clinic website (< 500KB): 2-5 seconds
- Medium website (500KB-2MB): 5-10 seconds
- Large website (2-5MB): 10-15 seconds

### Optimization Tips
1. Use caching for frequently scraped sites
2. Set appropriate timeout values
3. Batch scraping has built-in 1-second delays between requests
4. Consider running scraping on a backend service for heavy loads

## Error Handling

The scraper handles:
- Network errors with automatic retries
- Parse failures (invalid HTML)
- CORS restrictions
- Timeout scenarios
- Missing/malformed data
- SSL/certificate issues
- Page size limits
- JavaScript-rendered content (client-side only)

All errors are collected in `result.warnings[]` and gracefully degrade.

## Limitations

1. **JavaScript-Rendered Content**: Cannot execute JavaScript - data must be in HTML
2. **Authentication**: Cannot scrape pages that require login
3. **CORS**: Restricted by browser CORS policy (works in Electron/Node)
4. **Rate Limiting**: Some sites may block rapid requests
5. **Dynamic Content**: Only sees initial HTML, not dynamically-loaded content
6. **Images**: Extracts URLs only, doesn't download or analyze images
7. **PDF/Documents**: Cannot extract from PDF attachments

## Security & Privacy

### Safety Features
- No credentials sent or stored
- No cookies used
- Only public page content read
- User reviews all data before importing
- No external service calls except fetch
- HTML parsing is safe (no eval/execution)

### Best Practices
1. Users should verify imported data
2. Low-confidence fields should be manually reviewed
3. No sensitive data (SSN, credit cards) should ever be in pages
4. Respect website robots.txt and terms of service

## Testing

### Manual Testing
```typescript
const result = await scrapeWebsite("https://example-clinic.com");
console.log(JSON.stringify(result, null, 2));
```

### Batch Testing
```typescript
const batch = await scrapeMultiple({
  urls: ["site1.com", "site2.com", "site3.com"],
  onProgress: (p, c, t) => console.log(`${c}/${t}`),
});
console.log(`Results: ${batch.successful}/${batch.total}`);
```

## Future Enhancements

- [ ] Support for JavaScript-rendered content (Puppeteer/Playwright)
- [ ] Backend scraping service with job queue
- [ ] Image analysis for better color detection
- [ ] PDF document extraction
- [ ] Business listing APIs (Google Business, Yelp)
- [ ] Calendar/appointment system detection
- [ ] Payment method detection
- [ ] Accessibility score calculation
- [ ] Mobile optimization detection
