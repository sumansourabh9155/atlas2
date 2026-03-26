/**
 * Deep Diff Generator for Clinic Website Changes
 * Detects field-level changes between two ClinicWebsite versions
 * Provides transparent, detailed change tracking for approval workflow
 */

import { ClinicWebsite } from "../../types/clinic";

export interface FieldChange {
  id: string; // uuid
  path: string; // "general.name" | "services[0].description"
  section: "general" | "taxonomy" | "contact" | "services" | "veterinarians" | "blocks" | "other";
  previousValue: any; // Value before change
  updatedValue: any; // Value after change
  label: string; // "Clinic Name" - human-readable field name
  humanSummary: string; // "Changed from 'Happy Paws' to 'Happy Paws Specialty Clinic'"
  changeType: "created" | "updated" | "deleted" | "reordered";
  dataType: "string" | "number" | "boolean" | "array" | "object";
  status: "pending" | "approved" | "rejected" | "needs_revision";
  adminFeedback?: string;
  timestamp?: string;
  changedBy?: string;
}

export interface ChangeGroupSummary {
  section: string; // "General Info", "Contact", "Services"
  sectionKey: "general" | "taxonomy" | "contact" | "services" | "veterinarians" | "blocks" | "other";
  changeCount: number;
  changes: FieldChange[];
  status: "pending" | "approved" | "rejected";
  canPartiallyApprove: boolean;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
}

// Human-friendly labels for all tracked fields
const FIELD_LABELS: Record<string, string> = {
  // General Info
  "general.name": "Clinic Name",
  "general.slug": "URL Slug",
  "general.tagline": "Tagline",
  "general.logoUrl": "Logo URL",
  "general.primaryColor": "Primary Color",
  "general.secondaryColor": "Secondary Color",
  "general.metaDescription": "Meta Description",

  // Contact
  "contact.phone": "Main Phone",
  "contact.emergencyPhone": "Emergency Phone",
  "contact.email": "Email Address",
  "contact.website": "Website URL",
  "contact.address.street": "Street Address",
  "contact.address.street2": "Street Address 2",
  "contact.address.city": "City",
  "contact.address.state": "State",
  "contact.address.zip": "ZIP Code",
  "contact.address.country": "Country",
  "contact.address.mapEmbedUrl": "Map Embed URL",
  "contact.address.coordinates": "Coordinates",
  "contact.businessHours": "Business Hours",

  // Taxonomy
  "taxonomy.hospitalType": "Hospital Type",
  "taxonomy.petTypes": "Pet Types",

  // Collections (for summary)
  "services": "Services",
  "veterinarians": "Team Members",
  "blocks": "Page Blocks",
};

/**
 * Generate deep diff between two ClinicWebsite objects
 * Returns array of all field-level changes
 */
export function generateDeepDiff(
  baseVersion: ClinicWebsite | null,
  newVersion: ClinicWebsite
): FieldChange[] {
  const changes: FieldChange[] = [];

  if (!baseVersion) {
    // First version - all fields are "created"
    return buildInitialChanges(newVersion);
  }

  // Walk through all sections and detect changes
  const changedFields = diffObjects(baseVersion, newVersion, "");

  for (const field of changedFields) {
    const fieldChange = createFieldChange(
      field.path,
      field.section,
      field.previousValue,
      field.updatedValue,
      field.changeType
    );
    changes.push(fieldChange);
  }

  return changes;
}

/**
 * Group changes by section for UI display
 */
export function groupChangesBySection(changes: FieldChange[]): ChangeGroupSummary[] {
  const sectionMap = new Map<string, FieldChange[]>();

  for (const change of changes) {
    if (!sectionMap.has(change.section)) {
      sectionMap.set(change.section, []);
    }
    sectionMap.get(change.section)!.push(change);
  }

  const summaries: ChangeGroupSummary[] = [];

  for (const [sectionKey, sectionChanges] of sectionMap.entries()) {
    const created = sectionChanges.filter((c) => c.changeType === "created").length;
    const updated = sectionChanges.filter((c) => c.changeType === "updated").length;
    const deleted = sectionChanges.filter((c) => c.changeType === "deleted").length;

    summaries.push({
      section: getSectionLabel(sectionKey as any),
      sectionKey: sectionKey as any,
      changeCount: sectionChanges.length,
      changes: sectionChanges,
      status: "pending",
      canPartiallyApprove: sectionKey !== "blocks" && sectionKey !== "other",
      createdCount: created,
      updatedCount: updated,
      deletedCount: deleted,
    });
  }

  // Sort by common order
  const sectionOrder = ["general", "taxonomy", "contact", "services", "veterinarians", "blocks"];
  summaries.sort((a, b) => {
    const aIndex = sectionOrder.indexOf(a.sectionKey);
    const bIndex = sectionOrder.indexOf(b.sectionKey);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return summaries;
}

/**
 * Get change statistics for display
 */
export function getChangeStats(changes: FieldChange[]) {
  return {
    totalChanged: changes.length,
    bySection: {
      general: changes.filter((c) => c.section === "general").length,
      taxonomy: changes.filter((c) => c.section === "taxonomy").length,
      contact: changes.filter((c) => c.section === "contact").length,
      services: changes.filter((c) => c.section === "services").length,
      veterinarians: changes.filter((c) => c.section === "veterinarians").length,
      blocks: changes.filter((c) => c.section === "blocks").length,
    },
    createdItems: changes.filter((c) => c.changeType === "created").length,
    deletedItems: changes.filter((c) => c.changeType === "deleted").length,
  };
}

// ============================================================================
// Internal helpers
// ============================================================================

interface DiffField {
  path: string;
  section: string;
  previousValue: any;
  updatedValue: any;
  changeType: "created" | "updated" | "deleted" | "reordered";
}

/**
 * Recursively diff two objects
 */
function diffObjects(
  baseObj: any,
  newObj: any,
  pathPrefix: string,
  parentSection: string = "other"
): DiffField[] {
  const changes: DiffField[] = [];

  // Handle null/undefined cases
  if (baseObj === null || baseObj === undefined) {
    return changes;
  }

  // Determine section from path
  let section = parentSection;
  if (pathPrefix === "") {
    section = "general";
  } else if (pathPrefix.startsWith("general")) {
    section = "general";
  } else if (pathPrefix.startsWith("taxonomy")) {
    section = "taxonomy";
  } else if (pathPrefix.startsWith("contact")) {
    section = "contact";
  } else if (pathPrefix.startsWith("services")) {
    section = "services";
  } else if (pathPrefix.startsWith("veterinarians")) {
    section = "veterinarians";
  } else if (pathPrefix.startsWith("blocks")) {
    section = "blocks";
  }

  // Compare each field
  for (const key of Object.keys(baseObj)) {
    const basePath = pathPrefix ? `${pathPrefix}.${key}` : key;
    const baseValue = baseObj[key];
    const updatedValue = newObj[key];

    // Handle arrays separately
    if (Array.isArray(baseValue) && Array.isArray(updatedValue)) {
      const arrayChanges = diffArrays(baseValue, updatedValue, basePath, section);
      changes.push(...arrayChanges);
    } else if (
      typeof baseValue === "object" &&
      baseValue !== null &&
      typeof updatedValue === "object" &&
      updatedValue !== null
    ) {
      // Nested objects - recurse
      const nestedChanges = diffObjects(baseValue, updatedValue, basePath, section);
      changes.push(...nestedChanges);
    } else {
      // Primitive value - simple comparison
      if (baseValue !== updatedValue) {
        changes.push({
          path: basePath,
          section,
          previousValue: baseValue,
          updatedValue: updatedValue,
          changeType: "updated",
        });
      }
    }
  }

  // Check for new fields in newObj
  for (const key of Object.keys(newObj)) {
    if (!(key in baseObj)) {
      const basePath = pathPrefix ? `${pathPrefix}.${key}` : key;
      changes.push({
        path: basePath,
        section,
        previousValue: undefined,
        updatedValue: newObj[key],
        changeType: "created",
      });
    }
  }

  return changes;
}

/**
 * Diff arrays - detect creates, updates, deletes
 */
function diffArrays(
  baseArr: any[],
  newArr: any[],
  path: string,
  section: string
): DiffField[] {
  const changes: DiffField[] = [];

  // For simple arrays (strings, numbers), just do length check
  if (
    baseArr.length > 0 &&
    (typeof baseArr[0] === "string" || typeof baseArr[0] === "number" || typeof baseArr[0] === "boolean")
  ) {
    if (JSON.stringify(baseArr) !== JSON.stringify(newArr)) {
      changes.push({
        path,
        section,
        previousValue: baseArr,
        updatedValue: newArr,
        changeType: "updated",
      });
    }
    return changes;
  }

  // For arrays of objects (services, vets, blocks), match by ID if available
  const baseMap = new Map<string, any>();
  const newMap = new Map<string, any>();

  // Build maps by ID
  baseArr.forEach((item, idx) => {
    const id = item.id || item.blockId || idx;
    baseMap.set(String(id), { item, index: idx });
  });

  newArr.forEach((item, idx) => {
    const id = item.id || item.blockId || idx;
    newMap.set(String(id), { item, index: idx });
  });

  // Detect created and updated items
  for (const [id, { item: newItem, index: newIdx }] of newMap.entries()) {
    const baseItem = baseMap.get(id);

    if (!baseItem) {
      // Item created
      changes.push({
        path: `${path}[${newIdx}]`,
        section,
        previousValue: undefined,
        updatedValue: newItem,
        changeType: "created",
      });
    } else {
      // Check if item changed
      if (typeof newItem === "object" && newItem !== null) {
        const itemChanges = diffObjects(baseItem.item, newItem, `${path}[${newIdx}]`, section);
        changes.push(...itemChanges);
      }

      // Check if order changed
      if (baseItem.index !== newIdx) {
        changes.push({
          path: `${path}[${id}]`,
          section,
          previousValue: baseItem.index,
          updatedValue: newIdx,
          changeType: "reordered",
        });
      }
    }
  }

  // Detect deleted items
  for (const [id, { item: baseItem, index: baseIdx }] of baseMap.entries()) {
    if (!newMap.has(id)) {
      changes.push({
        path: `${path}[${baseIdx}]`,
        section,
        previousValue: baseItem,
        updatedValue: undefined,
        changeType: "deleted",
      });
    }
  }

  return changes;
}

/**
 * Build initial changes for first version (all "created")
 */
function buildInitialChanges(clinic: ClinicWebsite): FieldChange[] {
  const changes: FieldChange[] = [];

  // Add general fields as created
  Object.keys(clinic.general || {}).forEach((key) => {
    changes.push(
      createFieldChange(`general.${key}`, "general", undefined, clinic.general[key as keyof typeof clinic.general], "created")
    );
  });

  // Add contact fields as created
  Object.keys(clinic.contact || {}).forEach((key) => {
    if (key !== "address" && key !== "businessHours") {
      changes.push(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createFieldChange(`contact.${key}`, "contact", undefined, (clinic.contact as any)[key], "created")
      );
    }
  });

  // Add services as created
  clinic.services?.forEach((service, idx) => {
    changes.push(
      createFieldChange(`services[${idx}]`, "services", undefined, service, "created")
    );
  });

  // Add vets as created
  clinic.veterinarians?.forEach((vet, idx) => {
    changes.push(
      createFieldChange(`veterinarians[${idx}]`, "veterinarians", undefined, vet, "created")
    );
  });

  return changes;
}

/**
 * Create a single FieldChange object with all metadata
 */
function createFieldChange(
  path: string,
  section: string,
  previousValue: any,
  updatedValue: any,
  changeType: "created" | "updated" | "deleted" | "reordered"
): FieldChange {
  const label = FIELD_LABELS[path] || formatPathAsLabel(path);
  const humanSummary = generateHumanSummary(label, previousValue, updatedValue, changeType);

  return {
    id: generateUUID(),
    path,
    section: section as any,
    previousValue,
    updatedValue,
    label,
    humanSummary,
    changeType,
    dataType: getDataType(previousValue || updatedValue),
    status: "pending",
  };
}

/**
 * Determine data type from value
 */
function getDataType(value: any): FieldChange["dataType"] {
  if (Array.isArray(value)) return "array";
  if (value === null || value === undefined) return "object";
  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") return type;
  return "object";
}

/**
 * Generate human-friendly summary of change
 */
function generateHumanSummary(
  label: string,
  previousValue: any,
  updatedValue: any,
  changeType: string
): string {
  switch (changeType) {
    case "created":
      return `Added: ${label}`;
    case "deleted":
      return `Removed: ${label}`;
    case "reordered":
      return `Reordered: ${label} (index changed from ${previousValue} to ${updatedValue})`;
    case "updated":
      if (typeof previousValue === "string" && typeof updatedValue === "string") {
        return `${label}: "${previousValue}" → "${updatedValue}"`;
      }
      if (typeof previousValue === "boolean" || typeof updatedValue === "boolean") {
        return `${label}: ${previousValue} → ${updatedValue}`;
      }
      return `${label}: Updated`;
    default:
      return `Changed: ${label}`;
  }
}

/**
 * Format path as human-readable label
 */
function formatPathAsLabel(path: string): string {
  const parts = path.split(".");
  const lastPart = parts[parts.length - 1];
  return lastPart.replace(/([A-Z])/g, " $1").replace(/\[.*\]/, "").trim();
}

/**
 * Get section label for display
 */
function getSectionLabel(sectionKey: string): string {
  const labels: Record<string, string> = {
    general: "General Information",
    taxonomy: "Classification",
    contact: "Contact Information",
    services: "Services",
    veterinarians: "Team Members",
    blocks: "Page Layout",
    other: "Other",
  };
  return labels[sectionKey] || "Other";
}

/**
 * Generate UUID for change IDs
 */
function generateUUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
