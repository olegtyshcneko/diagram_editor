/**
 * Input handling utilities
 *
 * This module provides centralized utilities for handling user input:
 * - Modifier key detection (Shift, Ctrl, Alt, Meta)
 * - Input guards (skip shortcuts when typing)
 * - Global drag operations (window-level mouse tracking)
 * - Keyboard shortcut definitions and matching
 */

// Modifier key utilities
export {
  type ModifierState,
  getModifiers,
  isMultiSelectModifier,
  isCtrlOrMeta,
  isAltHeld,
  isShiftHeld,
} from './modifiers';

// Input guards
export {
  isTypingInInput,
  isContentEditable,
  shouldSkipGlobalShortcut,
} from './inputGuards';

// Global drag hook
export { useGlobalDrag, type UseGlobalDragOptions } from './useGlobalDrag';

// Keyboard shortcuts
export {
  type ShortcutDefinition,
  type ShortcutName,
  SHORTCUTS,
  matchesShortcut,
  isArrowKey,
  getArrowKeyDelta,
} from './shortcuts';
