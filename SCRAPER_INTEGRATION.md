# Website Scraper Integration Guide

## Quick Start: Add Import Button to Hospital Setup

### 1. Import the Modal Component

In your `HospitalSetupPage.tsx`:

```typescript
import { WebsiteScannerModal } from "@/components/WebsiteScannerModal";
import { useState } from "react";
```

### 2. Add State for Modal

```typescript
const [showImportModal, setShowImportModal] = useState(false);
```

### 3. Add Button to Trigger Modal

Place this button in your Hospital Setup UI (e.g., at the top of the form):

```tsx
<button
  onClick={() => setShowImportModal(true)}
  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition border border-blue-200"
>
  <Zap size={18} />
  Import from Website
</button>
```

### 4. Render the Modal

```tsx
<WebsiteScannerModal
  isOpen={showImportModal}
  onClose={() => setShowImportModal(false)}
/>
```

## Complete Example

Here's a complete section you can add to `HospitalSetupPage.tsx`:

```typescript
// Add to imports
import { WebsiteScannerModal } from "@/components/WebsiteScannerModal";
import { Zap } from "lucide-react";
import { useState } from "react";

// Inside HospitalSetupPage component
export function HospitalSetupPage() {
  const [showImportModal, setShowImportModal] = useState(false);
  // ... rest of your state ...

  return (
    <div>
      {/* Existing header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Setup Your Clinic</h1>
        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition border border-blue-200 font-medium"
        >
          <Zap size={18} />
          Import from Website
        </button>
      </div>

      {/* Your existing form sections */}
      {/* ... */}

      {/* Modal */}
      <WebsiteScannerModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
```

## How It Works

### User Flow

1. **Click "Import from Website"** → Modal opens at "Enter URL" step
2. **Enter their website URL** → e.g., `https://petsparks-vet.com`
3. **Click "Start Import Scan"** → Scanning step with progress bar
4. **Wait for extraction** → Shows "Parsing HTML...", "Extracting content...", etc.
5. **Review extracted data** → "Review" step shows all found fields
6. **Select fields to import** → User checks/unchecks high-confidence matches
7. **Click "Import Selected Data"** → Data flows to ClinicContext
8. **Form auto-fills** → Name, colors, contact info, etc. populate
9. **Complete message** → User clicks "Continue" to close modal

### Data Flow

```
1. Modal captures URL
   ↓
2. WebsiteScraper.scrape() called
   ├─ fetchPage() → HTML
   ├─ parseHtml() → DOM
   ├─ Extract all data in parallel
   │  ├─ extractClinicName()
   │  ├─ extractContactInfo()
   │  ├─ extractPrimaryAndSecondaryColors()
   │  ├─ extractServices()
   │  ├─ extractVeterinarians()
   │  └─ ... etc
   ├─ Build clinicData from scrapedContent
   └─ Return ScrapeResult
   ↓
3. Modal shows Review step
   ├─ Display confidence scores
   └─ Allow user to deselect fields
   ↓
4. User selects fields & clicks Import
   ↓
5. Data dispatched to ClinicContext
   ├─ updateGeneral() → name, colors, logo
   ├─ updateTaxonomy() → hospital type, pet types
   └─ updateContact() → phone, email, address
   ↓
6. Form UI automatically updates
   └─ ClinicContext subscribers re-render
```

## What Gets Imported Where

| Data | Context Method | Form Section |
|------|---|---|
| Clinic name | `updateGeneral()` | Basic Info |
| Primary color | `updateGeneral()` | Basic Info |
| Secondary color | `updateGeneral()` | Basic Info |
| Logo URL | `updateGeneral()` | Basic Info |
| Tagline | `updateGeneral()` | Basic Info |
| Phone | `updateContact()` | Contact |
| Email | `updateContact()` | Contact |
| Address | `updateContact()` | Contact |
| Hospital type | `updateTaxonomy()` | Taxonomy |
| Pet types | `updateTaxonomy()` | Taxonomy |

## Advanced: Custom Confirmation

If you want custom behavior when import completes, use a callback:

```typescript
// After WebsiteScannerModal closes
const handleImportClose = () => {
  setShowImportModal(false);

  // Optionally show a toast notification
  // toast.success("Website imported! Review the details and continue.");

  // Optionally scroll to the section that was updated
  // document.getElementById("basic-info-section")?.scrollIntoView();
};

<WebsiteScannerModal
  isOpen={showImportModal}
  onClose={handleImportClose}
/>
```

## Error Handling

The modal handles errors gracefully:

1. **Invalid URL** → Error message, user tries again
2. **Network timeout** → Automatic retry (up to 3x)
3. **Page not found** → Error message
4. **Low confidence** → Still shows results, user can deselect
5. **Not a vet clinic** → Warning message, user can proceed anyway

## Performance Notes

- **First scrape**: 3-15 seconds depending on site size
- **Cached scrape**: < 500ms (cached results)
- **Multiple requests**: 1-second delay between to respect rate limits
- **Large sites**: Progress bar updates every ~10% for UX

## Customization

### Change Modal Title/Subtitle

Edit `WebsiteScannerModal.tsx` header:

```tsx
<h2 className="text-lg font-bold text-gray-900">
  Import from Your Existing Website
</h2>
<p className="text-sm text-gray-600">
  We'll scan your clinic site and auto-fill your profile
</p>
```

### Adjust Confidence Thresholds

In `WebsiteScannerModal.tsx`, change pre-selection logic:

```typescript
// Currently selects fields with confidence >= 0.6
// Change to 0.7 for more strict filtering
if (extraction.confidence >= 0.7 && extraction.value !== null) {
  selected.add(key);
}
```

### Add Custom Field Processing

In `handleImport()` function, add post-processing:

```typescript
// Example: Auto-generate slug from name
if (selectedFields.has("clinicName") && result.scrapedContent.clinicName.value) {
  const name = result.scrapedContent.clinicName.value;
  updates.general.slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
```

## Troubleshooting

### "Failed to fetch page"
- Check if URL is correct (should start with https://)
- Verify website is publicly accessible
- Check browser console for CORS errors

### "Low confidence this is a vet clinic"
- Website might not have clear veterinary indicators
- Add vet keywords to your site's meta description
- Add Schema.org markup for VeterinaryClinic

### "Fields not importing"
- Check that ClinicContext is properly provided to component
- Verify updateGeneral/updateTaxonomy/updateContact are exported
- Check browser console for errors

### "Colors not detected"
- Website might use image-based branding
- Try adding explicit CSS color properties
- Ensure logo/header have clear background colors

## API Reference

### WebsiteScannerModal Props

```typescript
interface WebsiteScannerModalProps {
  isOpen: boolean;           // Modal visibility
  onClose: () => void;       // Called when modal closes
}
```

### ScrapeResult Type

```typescript
interface ScrapeResult {
  success: boolean;                      // Scrape was successful
  url: string;                           // The URL that was scraped
  clinicData: Partial<ClinicWebsiteDraft>; // Ready-to-use clinic data
  scrapedContent: ScrapedContent;        // Raw extracted content
  warnings: string[];                    // Any issues encountered
  executionTime: number;                 // Time in milliseconds
  pageTitle?: string;                    // <title> tag content
  pageLanguage?: string;                 // HTML lang attribute
  readability?: {                        // Estimated reading time
    estimatedReadingTime: number;
    textLength: number;
  };
}
```

### ScrapedContent Type

```typescript
interface ScrapedContent {
  clinicName: ExtractionResult<string>;
  logo: ExtractionResult<string>;
  primaryColor: ExtractionResult<string>;
  // ... 30+ extraction fields, each with:
  //   value: T | null
  //   confidence: number (0-1)
  //   source: string (where it came from)
  //   raw: string (original text)
}
```

## See Also

- `src/lib/scraper/README.md` - Detailed scraper documentation
- `src/lib/scraper/types.ts` - Type definitions
- `src/components/WebsiteScannerModal.tsx` - Modal component source
