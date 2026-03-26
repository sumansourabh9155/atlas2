/**
 * Color Extraction Engine
 * Extracts colors from CSS, buttons, and branding elements
 */

import { querySelectorAll, getAttribute } from "./htmlParser";

export interface ColorMatch {
  color: string; // hex
  confidence: number; // 0-1
  source: string; // where it came from
  frequency: number; // how many times seen
}

/**
 * Convert CSS color to hex
 */
export function colorToHex(color: string): string | null {
  color = color.trim();

  // Already hex
  if (color.match(/^#[0-9A-Fa-f]{6}$/)) {
    return color.toLowerCase();
  }

  // RGB
  const rgbMatch = color.match(/rgb[a]?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return rgbToHex(r, g, b);
  }

  // Named colors (basic set)
  const namedColors: Record<string, string> = {
    red: "#FF0000",
    green: "#008000",
    blue: "#0000FF",
    white: "#FFFFFF",
    black: "#000000",
    gray: "#808080",
    teal: "#008080",
    navy: "#000080",
    maroon: "#800000",
    olive: "#808000",
    purple: "#800080",
    aqua: "#00FFFF",
  };

  const lower = color.toLowerCase();
  if (namedColors[lower]) {
    return namedColors[lower];
  }

  return null;
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("")
    .toUpperCase()}`;
}

/**
 * Check if hex is valid
 */
export function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Extract all colors from CSS stylesheet
 */
export function extractColorsFromCss(doc: Document): Map<string, number> {
  const colorFreq = new Map<string, number>();

  // Get all stylesheets
  const sheets = Array.from(doc.styleSheets);

  sheets.forEach((sheet) => {
    try {
      const rules = Array.from((sheet as CSSStyleSheet).cssRules || []);

      rules.forEach((rule) => {
        if (rule instanceof CSSStyleRule) {
          const style = rule.style;

          // Extract color properties
          [
            "color",
            "backgroundColor",
            "borderColor",
            "outlineColor",
            "textShadowColor",
            "boxShadowColor",
          ].forEach((prop) => {
            const value = style.getPropertyValue(prop);
            if (value) {
              const hex = colorToHex(value);
              if (hex && isValidHex(hex)) {
                colorFreq.set(hex, (colorFreq.get(hex) || 0) + 1);
              }
            }
          });
        }
      });
    } catch {
      // CORS or parsing errors - skip
    }
  });

  return colorFreq;
}

/**
 * Extract colors from inline styles
 */
export function extractColorsFromInlineStyles(doc: Document): Map<string, number> {
  const colorFreq = new Map<string, number>();

  querySelectorAll(doc, "[style]").forEach((el) => {
    if (el instanceof HTMLElement) {
      const style = el.getAttribute("style") || "";

      // Parse style attribute
      const props = style.split(";");
      props.forEach((prop) => {
        const [key, value] = prop.split(":").map((s) => s.trim());
        if (value) {
          const hex = colorToHex(value);
          if (hex && isValidHex(hex)) {
            colorFreq.set(hex, (colorFreq.get(hex) || 0) + 1);
          }
        }
      });
    }
  });

  return colorFreq;
}

/**
 * Extract colors from specific semantic elements (buttons, headers, etc.)
 */
export function extractSemanticColors(doc: Document): Map<string, number> {
  const colorFreq = new Map<string, number>();

  // Primary buttons
  querySelectorAll(doc, "button, [role='button'], .btn, .button, .cta").forEach((el) => {
    if (el instanceof HTMLElement) {
      const color = window.getComputedStyle(el).backgroundColor;
      const hex = colorToHex(color);
      if (hex && isValidHex(hex)) {
        colorFreq.set(hex, (colorFreq.get(hex) || 0) + 2); // Higher weight
      }
    }
  });

  // Headers
  querySelectorAll(doc, "h1, h2, h3, .heading, .title").forEach((el) => {
    if (el instanceof HTMLElement) {
      const color = window.getComputedStyle(el).color;
      const hex = colorToHex(color);
      if (hex && isValidHex(hex)) {
        colorFreq.set(hex, (colorFreq.get(hex) || 0) + 1);
      }
    }
  });

  // Links
  querySelectorAll(doc, "a, [role='link']").forEach((el) => {
    if (el instanceof HTMLElement) {
      const color = window.getComputedStyle(el).color;
      const hex = colorToHex(color);
      if (hex && isValidHex(hex)) {
        colorFreq.set(hex, (colorFreq.get(hex) || 0) + 1);
      }
    }
  });

  // Brand elements
  querySelectorAll(doc, ".brand, .logo, .header, nav").forEach((el) => {
    if (el instanceof HTMLElement) {
      const color = window.getComputedStyle(el).backgroundColor;
      const hex = colorToHex(color);
      if (hex && isValidHex(hex) && hex !== "#FFFFFF" && hex !== "#000000") {
        colorFreq.set(hex, (colorFreq.get(hex) || 0) + 2);
      }
    }
  });

  return colorFreq;
}

/**
 * Find primary and secondary colors
 */
export function extractPrimaryAndSecondaryColors(doc: Document): {
  primary: ColorMatch | null;
  secondary: ColorMatch | null;
} {
  const allColors = new Map<string, number>();

  // Combine all sources with weights
  const css = extractColorsFromCss(doc);
  const inline = extractColorsFromInlineStyles(doc);
  const semantic = extractSemanticColors(doc);

  // Merge with priorities
  const mergeColors = (source: Map<string, number>, weight: number) => {
    source.forEach((freq, color) => {
      allColors.set(color, (allColors.get(color) || 0) + freq * weight);
    });
  };

  mergeColors(semantic, 3); // Highest priority - semantic elements
  mergeColors(css, 2);
  mergeColors(inline, 1);

  // Filter out achromatic colors
  const chromatic = Array.from(allColors.entries()).filter(([hex]) => {
    return !isAchromatic(hex);
  });

  // Sort by frequency
  chromatic.sort((a, b) => b[1] - a[1]);

  const primary =
    chromatic.length > 0
      ? {
          color: chromatic[0][0],
          confidence: Math.min(1, chromatic[0][1] / 50),
          source: "extracted-primary",
          frequency: chromatic[0][1],
        }
      : null;

  const secondary =
    chromatic.length > 1
      ? {
          color: chromatic[1][0],
          confidence: Math.min(1, chromatic[1][1] / 30),
          source: "extracted-secondary",
          frequency: chromatic[1][1],
        }
      : null;

  return { primary, secondary };
}

/**
 * Check if color is achromatic (gray/black/white)
 */
function isAchromatic(hex: string): boolean {
  // Remove # and parse
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  // Check if R=G=B (grayscale)
  return r === g && g === b;
}

/**
 * Extract brand color from logo element
 */
export function extractBrandColorFromLogo(doc: Document): string | null {
  const logo = querySelectorAll(doc, "img.logo, [class*='logo'], .brand-logo").find(
    (el) => el instanceof HTMLImageElement
  );

  if (logo instanceof HTMLImageElement) {
    // In a real scenario, you'd analyze the image pixel data
    // For now, return null - would need image processing library
    return null;
  }

  return null;
}

/**
 * Suggest a contrasting color for text
 */
export function suggestContrastingColor(bgHex: string): string {
  // Parse RGB
  const r = parseInt(bgHex.substring(1, 3), 16);
  const g = parseInt(bgHex.substring(3, 5), 16);
  const b = parseInt(bgHex.substring(5, 7), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return white or black text based on luminance
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}

/**
 * Color harmony - find complementary colors
 */
export function findComplementaryColor(hex: string): string {
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);

  return rgbToHex(255 - r, 255 - g, 255 - b);
}
