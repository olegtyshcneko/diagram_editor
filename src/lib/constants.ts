// Canvas defaults
export const CANVAS_DEFAULTS = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 4,
  ZOOM_STEP: 0.1,
  DEFAULT_ZOOM: 1,
};

// Grid defaults
export const GRID_DEFAULTS = {
  SIZE: 20,
  COLOR: '#e0e0e0',
  SNAP_THRESHOLD: 5,
};

// Shape defaults
export const SHAPE_DEFAULTS = {
  MIN_SIZE: 10,
  DEFAULT_WIDTH: 100,
  DEFAULT_HEIGHT: 60,
  DEFAULT_FILL: '#ffffff',
  DEFAULT_STROKE: '#000000',
  DEFAULT_STROKE_WIDTH: 2,
};

// Colors
export const COLORS = {
  SELECTION: '#3B82F6',
  SELECTION_FILL: 'rgba(59, 130, 246, 0.1)',
  SELECTION_HOVER: '#60A5FA',
  ANCHOR: '#3B82F6',
  GRID_DOT: '#d0d0d0',
};

// Keyboard
export const KEYBOARD = {
  MOVE_STEP: 1,
  MOVE_STEP_LARGE: 10,
};

// Manipulation (move, resize, rotate)
export const MANIPULATION = {
  HANDLE_SIZE: 8,
  HANDLE_SIZE_SMALL: 6,
  HANDLE_SIZE_TINY: 4,
  HANDLE_HIT_AREA: 12,
  ROTATION_HANDLE_OFFSET: 30,
  ROTATION_SNAP_DEGREES: 15,
  // Thresholds for adaptive handle display
  HIDE_EDGE_HANDLES_THRESHOLD: 50, // Hide edge handles when dimension is below this
  SMALL_HANDLE_THRESHOLD: 40, // Use smaller handles (6px) when dimension is below this
  TINY_HANDLE_THRESHOLD: 20, // Use tiny handles (4px) when dimension is below this
};

// Cursor map for resize handles
export const CURSOR_MAP: Record<string, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
  rotation: 'grab',
};

// Connection defaults
export const CONNECTION_DEFAULTS = {
  ANCHOR_SIZE: 8,
  ANCHOR_HIT_AREA: 12,
  ANCHOR_SNAP_THRESHOLD: 20,
  LINE_HIT_THRESHOLD: 8,
  ARROW_SIZE: 10,
  DEFAULT_STROKE: '#000000',
  DEFAULT_STROKE_WIDTH: 2,
};

// Text defaults
export const TEXT_DEFAULTS = {
  FONT_FAMILIES: [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Times New Roman, serif',
    'Georgia, serif',
    'Courier New, monospace',
    'Verdana, sans-serif',
  ],
  FONT_SIZES: [8, 10, 12, 14, 16, 18, 24, 36, 48],
  MIN_FONT_SIZE: 6,
  MAX_FONT_SIZE: 200,
  DEFAULT_FONT_SIZE: 14,
  DEFAULT_FONT_FAMILY: 'Arial, sans-serif',
  DEFAULT_FONT_COLOR: '#000000',
  TEXT_PADDING: 8,
  LINE_HEIGHT: 1.2,
};

// Numerical constants
export const NUMERICAL = {
  EPSILON: 1e-10, // For floating-point comparisons
};
