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
  HANDLE_HIT_AREA: 12,
  ROTATION_HANDLE_OFFSET: 30,
  ROTATION_SNAP_DEGREES: 15,
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
