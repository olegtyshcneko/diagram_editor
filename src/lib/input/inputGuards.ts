/**
 * Input guard utilities for detecting when to skip global keyboard handling
 */

/**
 * Check if the event target is an editable text input
 * Returns true for: <input>, <textarea>, contentEditable elements
 */
export function isTypingInInput(target: EventTarget | null): boolean {
  if (!target) return false;

  if (target instanceof HTMLInputElement) return true;
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLElement && target.isContentEditable) return true;

  return false;
}

/**
 * Check if the event target is a contentEditable element
 */
export function isContentEditable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.isContentEditable;
}

/**
 * Determine if a keyboard event should be skipped by global shortcut handlers
 * Use this at the start of global keydown handlers to avoid interfering with text input
 *
 * @example
 * const handleKeyDown = (e: KeyboardEvent) => {
 *   if (shouldSkipGlobalShortcut(e)) return;
 *   // ... handle global shortcuts
 * };
 */
export function shouldSkipGlobalShortcut(e: KeyboardEvent): boolean {
  return isTypingInInput(e.target);
}
