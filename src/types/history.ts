import type { Shape } from './shapes';
import type { Connection } from './connections';

/**
 * Types of actions that can be recorded in history
 */
export type ActionType =
  | 'CREATE_SHAPE'
  | 'DELETE_SHAPES'
  | 'MOVE_SHAPES'
  | 'RESIZE_SHAPE'
  | 'ROTATE_SHAPE'
  | 'UPDATE_STYLE'
  | 'UPDATE_TEXT'
  | 'CREATE_CONNECTION'
  | 'DELETE_CONNECTIONS'
  | 'PASTE'
  | 'DUPLICATE'
  | 'ALIGN'
  | 'DISTRIBUTE'
  | 'Z_ORDER'
  | 'GROUP'
  | 'UNGROUP';

/**
 * Shape modification delta - stores before/after state for a single shape
 */
export interface ShapeModification {
  id: string;
  before: Partial<Shape>;
  after: Partial<Shape>;
}

/**
 * Connection modification delta - stores before/after state for a single connection
 */
export interface ConnectionModification {
  id: string;
  before: Partial<Connection>;
  after: Partial<Connection>;
}

/**
 * Delta for shape changes - stores only what changed
 */
export interface ShapeDelta {
  added: Shape[];
  removed: Shape[];
  modified: ShapeModification[];
}

/**
 * Delta for connection changes - stores only what changed
 */
export interface ConnectionDelta {
  added: Connection[];
  removed: Connection[];
  modified: ConnectionModification[];
}

/**
 * A single history entry representing one undoable action
 */
export interface HistoryEntry {
  id: string;
  type: ActionType;
  description: string;
  timestamp: number;
  shapeDelta: ShapeDelta;
  connectionDelta: ConnectionDelta;
  selectionBefore: string[];
  selectionAfter: string[];
}

/**
 * Data needed to create a history entry (without auto-generated fields)
 */
export type HistoryEntryInput = Omit<HistoryEntry, 'id' | 'timestamp'>;

/**
 * Empty deltas for convenience
 */
export const EMPTY_SHAPE_DELTA: ShapeDelta = {
  added: [],
  removed: [],
  modified: [],
};

export const EMPTY_CONNECTION_DELTA: ConnectionDelta = {
  added: [],
  removed: [],
  modified: [],
};
