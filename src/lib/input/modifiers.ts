/**
 * Modifier key utilities for consistent keyboard/mouse modifier handling
 */

/**
 * Represents the state of all modifier keys
 */
export interface ModifierState {
  shift: boolean;
  ctrl: boolean;
  alt: boolean;
  meta: boolean;
  /** True if either Ctrl (Windows/Linux) or Meta/Cmd (Mac) is pressed */
  ctrlOrMeta: boolean;
}

/**
 * Extract modifier key state from a mouse or keyboard event
 */
export function getModifiers(e: MouseEvent | KeyboardEvent): ModifierState {
  return {
    shift: e.shiftKey,
    ctrl: e.ctrlKey,
    alt: e.altKey,
    meta: e.metaKey,
    ctrlOrMeta: e.ctrlKey || e.metaKey,
  };
}

/**
 * Check if a multi-select modifier is held (Shift, Ctrl, or Meta/Cmd)
 * Used for: Shift+click or Ctrl+click to add/toggle selection
 */
export function isMultiSelectModifier(e: MouseEvent | KeyboardEvent): boolean {
  return e.shiftKey || e.ctrlKey || e.metaKey;
}

/**
 * Check if Ctrl (Windows/Linux) or Meta/Cmd (Mac) is pressed
 * Used for: Ctrl+Z, Ctrl+C, etc. keyboard shortcuts
 */
export function isCtrlOrMeta(e: MouseEvent | KeyboardEvent): boolean {
  return e.ctrlKey || e.metaKey;
}

/**
 * Check if Alt/Option key is pressed
 * Used for: Disabling snap-to-grid, resize from center
 */
export function isAltHeld(e: MouseEvent | KeyboardEvent): boolean {
  return e.altKey;
}

/**
 * Check if Shift key is pressed
 * Used for: Constrain to axis, maintain aspect ratio, snap angle
 */
export function isShiftHeld(e: MouseEvent | KeyboardEvent): boolean {
  return e.shiftKey;
}
