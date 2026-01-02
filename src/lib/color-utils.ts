/**
 * Color utilities for validation, conversion, and preset colors
 */

/**
 * Validates if a string is a valid hex color (#RGB or #RRGGBB)
 */
export function isValidHexColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false;
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color);
}

/**
 * Normalizes a hex color to uppercase 6-digit format
 * Expands 3-digit to 6-digit (#RGB -> #RRGGBB)
 */
export function normalizeHexColor(color: string): string {
  if (!isValidHexColor(color)) return color;

  let hex = color.toUpperCase();

  // Expand 3-digit to 6-digit
  if (hex.length === 4) {
    hex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  return hex;
}

/**
 * Converts a hex color to RGB object
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(hex);
  if (!isValidHexColor(normalized)) return null;

  const result = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/.exec(normalized);
  if (!result) return null;

  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Converts RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Returns a contrasting text color (black or white) for a given background color
 * Uses relative luminance formula
 */
export function getContrastingTextColor(bgColor: string): '#000000' | '#FFFFFF' {
  const rgb = hexToRgb(bgColor);
  if (!rgb) return '#000000';

  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * 64 preset colors organized as 8x8 grid by hue families
 * Row 1: Grays
 * Row 2: Reds/Pinks
 * Row 3: Oranges
 * Row 4: Yellows
 * Row 5: Greens
 * Row 6: Cyans/Teals
 * Row 7: Blues
 * Row 8: Purples/Magentas
 */
export const PRESET_COLORS: string[] = [
  // Row 1: Grays (light to dark)
  '#FFFFFF', '#E0E0E0', '#C0C0C0', '#A0A0A0', '#808080', '#606060', '#404040', '#000000',
  // Row 2: Reds/Pinks
  '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#C62828', '#B71C1C',
  // Row 3: Oranges
  '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#EF6C00', '#E65100',
  // Row 4: Yellows
  '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#F9A825', '#F57F17',
  // Row 5: Greens
  '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#2E7D32', '#1B5E20',
  // Row 6: Cyans/Teals
  '#B2EBF2', '#80DEEA', '#4DD0E1', '#26C6DA', '#00BCD4', '#00ACC1', '#0097A7', '#006064',
  // Row 7: Blues
  '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1565C0', '#0D47A1',
  // Row 8: Purples/Magentas
  '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#9C27B0', '#8E24AA', '#6A1B9A', '#4A148C',
];

/**
 * Default colors for shapes
 */
export const DEFAULT_FILL_COLOR = '#FFFFFF';
export const DEFAULT_STROKE_COLOR = '#000000';
export const TRANSPARENT = 'transparent';

/**
 * Checks if a color is transparent
 */
export function isTransparent(color: string | undefined): boolean {
  return !color || color === 'transparent' || color === 'none';
}
