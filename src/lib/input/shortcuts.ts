/**
 * Centralized keyboard shortcut definitions and matching utilities
 */

/**
 * Definition for a keyboard shortcut
 */
export interface ShortcutDefinition {
  /** The key to match (e.g., 'z', 'Delete', 'ArrowUp') */
  key: string | string[];
  /** Require Ctrl (Windows/Linux) or Meta/Cmd (Mac) */
  ctrlOrMeta?: boolean;
  /** Require Shift key */
  shift?: boolean;
  /** Require Alt/Option key */
  alt?: boolean;
  /** Description for UI/documentation */
  description?: string;
}

/**
 * All keyboard shortcuts used in the application
 */
export const SHORTCUTS = {
  // History
  undo: {
    key: 'z',
    ctrlOrMeta: true,
    description: 'Undo',
  },
  redo: {
    key: ['y', 'z', 'Z'],
    ctrlOrMeta: true,
    shift: true, // Note: 'y' doesn't need shift, handled in matcher
    description: 'Redo',
  },

  // Clipboard
  copy: {
    key: 'c',
    ctrlOrMeta: true,
    description: 'Copy',
  },
  cut: {
    key: 'x',
    ctrlOrMeta: true,
    description: 'Cut',
  },
  paste: {
    key: 'v',
    ctrlOrMeta: true,
    description: 'Paste',
  },
  duplicate: {
    key: 'd',
    ctrlOrMeta: true,
    description: 'Duplicate',
  },
  selectAll: {
    key: 'a',
    ctrlOrMeta: true,
    description: 'Select All',
  },

  // Delete
  delete: {
    key: ['Delete', 'Backspace'],
    description: 'Delete',
  },

  // Grouping
  group: {
    key: 'g',
    ctrlOrMeta: true,
    description: 'Group',
  },
  ungroup: {
    key: ['g', 'G'],
    ctrlOrMeta: true,
    shift: true,
    description: 'Ungroup',
  },

  // Z-Order
  bringToFront: {
    key: [']', '}'],
    ctrlOrMeta: true,
    shift: true,
    description: 'Bring to Front',
  },
  sendToBack: {
    key: ['[', '{'],
    ctrlOrMeta: true,
    shift: true,
    description: 'Send to Back',
  },
  bringForward: {
    key: ']',
    ctrlOrMeta: true,
    description: 'Bring Forward',
  },
  sendBackward: {
    key: '[',
    ctrlOrMeta: true,
    description: 'Send Backward',
  },

  // Tools (single key, no modifiers)
  toolSelect: {
    key: 'v',
    description: 'Select Tool',
  },
  toolRectangle: {
    key: 'r',
    description: 'Rectangle Tool',
  },
  toolEllipse: {
    key: 'e',
    description: 'Ellipse Tool',
  },
  toolConnection: {
    key: 'c',
    description: 'Connection Tool',
  },

  // Grid
  toggleGrid: {
    key: 'g',
    description: 'Toggle Grid',
  },
  toggleSnapToGrid: {
    key: 'g',
    shift: true,
    description: 'Toggle Snap to Grid',
  },

  // Movement (Arrow keys)
  moveUp: {
    key: 'ArrowUp',
    description: 'Move Up',
  },
  moveDown: {
    key: 'ArrowDown',
    description: 'Move Down',
  },
  moveLeft: {
    key: 'ArrowLeft',
    description: 'Move Left',
  },
  moveRight: {
    key: 'ArrowRight',
    description: 'Move Right',
  },

  // Text formatting (used in TextEditOverlay)
  formatBold: {
    key: 'b',
    ctrlOrMeta: true,
    description: 'Bold',
  },
  formatItalic: {
    key: 'i',
    ctrlOrMeta: true,
    description: 'Italic',
  },
  formatUnderline: {
    key: 'u',
    ctrlOrMeta: true,
    description: 'Underline',
  },

  // Viewport (used in CanvasContainer)
  resetZoom: {
    key: ['0', '1'],
    ctrlOrMeta: true,
    description: 'Reset Zoom to 100%',
  },
  zoomIn: {
    key: ['+', '='],
    ctrlOrMeta: true,
    description: 'Zoom In',
  },
  zoomOut: {
    key: '-',
    ctrlOrMeta: true,
    description: 'Zoom Out',
  },
  resetView: {
    key: ['f', 'F'],
    ctrlOrMeta: true,
    shift: true,
    description: 'Reset View',
  },

  // Cancel/Escape
  escape: {
    key: 'Escape',
    description: 'Cancel / Escape',
  },
} as const;

export type ShortcutName = keyof typeof SHORTCUTS;

/**
 * Check if a keyboard event matches a shortcut definition
 *
 * @example
 * if (matchesShortcut(e, SHORTCUTS.undo)) {
 *   e.preventDefault();
 *   undo();
 * }
 */
export function matchesShortcut(
  e: KeyboardEvent,
  shortcut: ShortcutDefinition
): boolean {
  // Check key match
  const keys = Array.isArray(shortcut.key) ? shortcut.key : [shortcut.key];
  const keyMatches = keys.some(
    (k) => e.key === k || e.key.toLowerCase() === k.toLowerCase()
  );
  if (!keyMatches) return false;

  // Check Ctrl/Meta requirement
  const ctrlOrMeta = e.ctrlKey || e.metaKey;
  if (shortcut.ctrlOrMeta && !ctrlOrMeta) return false;
  if (!shortcut.ctrlOrMeta && ctrlOrMeta) return false;

  // Check Shift requirement
  // Special case: redo accepts both Ctrl+Y (no shift) and Ctrl+Shift+Z
  if (shortcut.key === 'y' || (Array.isArray(shortcut.key) && shortcut.key.includes('y'))) {
    // For redo, accept Ctrl+Y without shift
    if (e.key === 'y' || e.key === 'Y') {
      // Ctrl+Y case - no shift required
      return true;
    }
  }
  if (shortcut.shift && !e.shiftKey) return false;
  if (!shortcut.shift && e.shiftKey) {
    // Allow shift for keys that have shift variants in their key array
    if (Array.isArray(shortcut.key)) {
      const hasShiftVariant = shortcut.key.some(
        (k) => k === k.toUpperCase() && k !== k.toLowerCase()
      );
      if (!hasShiftVariant) return false;
    } else {
      return false;
    }
  }

  // Check Alt requirement
  if (shortcut.alt && !e.altKey) return false;
  if (!shortcut.alt && e.altKey) return false;

  return true;
}

/**
 * Check if any arrow key is pressed
 */
export function isArrowKey(e: KeyboardEvent): boolean {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
}

/**
 * Get the movement delta for an arrow key press
 * Returns null if not an arrow key
 */
export function getArrowKeyDelta(
  e: KeyboardEvent,
  stepSize: number = 1,
  largeStepSize: number = 10
): { deltaX: number; deltaY: number } | null {
  if (!isArrowKey(e)) return null;

  const step = e.shiftKey ? largeStepSize : stepSize;

  switch (e.key) {
    case 'ArrowUp':
      return { deltaX: 0, deltaY: -step };
    case 'ArrowDown':
      return { deltaX: 0, deltaY: step };
    case 'ArrowLeft':
      return { deltaX: -step, deltaY: 0 };
    case 'ArrowRight':
      return { deltaX: step, deltaY: 0 };
    default:
      return null;
  }
}
