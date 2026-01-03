import { create } from 'zustand';
import { toast } from 'sonner';
import type { Shape, ShapeType } from '@/types/shapes';
import { DEFAULT_SHAPE } from '@/types/shapes';
import type { Connection } from '@/types/connections';
import { DEFAULT_CONNECTION } from '@/types/connections';
import { generateId } from '@/lib/utils/id';
import type { ClipboardData, ClipboardShape, ClipboardConnection } from '@/types/clipboard';
import type { AlignmentType } from '@/types/selection';
import { getSelectionBounds } from '@/lib/geometry/selection';
import { calculateAlignment } from '@/lib/geometry/alignment';
import {
  calculateHorizontalDistribution,
  calculateVerticalDistribution,
  canDistributeHorizontally,
  canDistributeVertically,
} from '@/lib/geometry/distribution';

const PASTE_OFFSET = 20;

interface DiagramState {
  // Document
  documentId: string | null;
  documentTitle: string;
  isDirty: boolean;

  // Elements
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;

  // Selection
  selectedShapeIds: string[];
  selectedConnectionIds: string[];

  // Z-index tracking
  nextZIndex: number;

  // Clipboard
  clipboard: ClipboardData | null;
  pasteCount: number;

  // Shape actions
  addShape: (partialShape: Partial<Shape> & { type: ShapeType }) => string;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;

  // Selection actions
  selectShape: (id: string, addToSelection?: boolean) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  setSelectedConnectionIds: (ids: string[]) => void;
  clearSelection: () => void;

  // Connection actions
  addConnection: (partialConnection: Partial<Connection> & {
    sourceShapeId: string;
    sourceAnchor: Connection['sourceAnchor'];
    targetShapeId: string;
    targetAnchor: Connection['targetAnchor'];
  }) => string;
  updateConnection: (id: string, updates: Partial<Connection>) => void;
  deleteConnection: (id: string) => void;

  // Bulk actions
  deleteSelectedShapes: () => void;
  deleteSelectedConnections: () => void;

  // Multi-selection actions
  selectAll: () => void;
  addToSelection: (ids: string[]) => void;

  // Clipboard actions
  copySelection: () => void;
  cutSelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;

  // Alignment/distribution actions (to be implemented in later step)
  alignShapes: (alignment: AlignmentType) => void;
  distributeShapes: (direction: 'horizontal' | 'vertical') => void;
}

export const useDiagramStore = create<DiagramState>()((set, get) => ({
  // Initial state
  documentId: null,
  documentTitle: 'Untitled Diagram',
  isDirty: false,

  shapes: {},
  connections: {},

  selectedShapeIds: [],
  selectedConnectionIds: [],

  nextZIndex: 1,

  clipboard: null,
  pasteCount: 0,

  // Shape actions
  addShape: (partialShape) => {
    const id = generateId();
    const { nextZIndex } = get();

    const shape: Shape = {
      id,
      x: 0,
      y: 0,
      ...DEFAULT_SHAPE,
      ...partialShape,
      zIndex: nextZIndex,
    };

    set((state) => ({
      shapes: { ...state.shapes, [id]: shape },
      nextZIndex: state.nextZIndex + 1,
      isDirty: true,
      selectedShapeIds: [id], // Auto-select new shape
    }));

    return id;
  },

  updateShape: (id, updates) => {
    set((state) => ({
      shapes: {
        ...state.shapes,
        [id]: { ...state.shapes[id], ...updates },
      },
      isDirty: true,
    }));
  },

  deleteShape: (id) => {
    set((state) => {
      const { [id]: deleted, ...remainingShapes } = state.shapes;

      // Also delete any connections attached to this shape
      const remainingConnections: Record<string, Connection> = {};
      const deletedConnectionIds: string[] = [];

      for (const [connId, conn] of Object.entries(state.connections)) {
        if (conn.sourceShapeId === id || conn.targetShapeId === id) {
          deletedConnectionIds.push(connId);
        } else {
          remainingConnections[connId] = conn;
        }
      }

      return {
        shapes: remainingShapes,
        connections: remainingConnections,
        selectedShapeIds: state.selectedShapeIds.filter((sid) => sid !== id),
        selectedConnectionIds: state.selectedConnectionIds.filter(
          (cid) => !deletedConnectionIds.includes(cid)
        ),
        isDirty: true,
      };
    });
  },

  // Selection actions
  selectShape: (id, addToSelection = false) => {
    set((state) => {
      if (addToSelection) {
        // Toggle selection
        const isSelected = state.selectedShapeIds.includes(id);
        return {
          selectedShapeIds: isSelected
            ? state.selectedShapeIds.filter((sid) => sid !== id)
            : [...state.selectedShapeIds, id],
          selectedConnectionIds: [], // Clear connection selection when adding to shape selection
        };
      }
      return { selectedShapeIds: [id], selectedConnectionIds: [] };
    });
  },

  setSelectedShapeIds: (ids) =>
    set({ selectedShapeIds: ids, selectedConnectionIds: [] }),

  setSelectedConnectionIds: (ids) =>
    set({ selectedConnectionIds: ids, selectedShapeIds: [] }),

  clearSelection: () =>
    set({ selectedShapeIds: [], selectedConnectionIds: [] }),

  // Connection actions
  addConnection: (partialConnection) => {
    const id = generateId();

    const connection: Connection = {
      id,
      ...DEFAULT_CONNECTION,
      ...partialConnection,
    };

    set((state) => ({
      connections: { ...state.connections, [id]: connection },
      selectedShapeIds: [],
      selectedConnectionIds: [id], // Auto-select new connection
      isDirty: true,
    }));

    return id;
  },

  updateConnection: (id, updates) => {
    set((state) => ({
      connections: {
        ...state.connections,
        [id]: { ...state.connections[id], ...updates },
      },
      isDirty: true,
    }));
  },

  deleteConnection: (id) => {
    set((state) => {
      const { [id]: deleted, ...remaining } = state.connections;
      return {
        connections: remaining,
        selectedConnectionIds: state.selectedConnectionIds.filter(
          (cid) => cid !== id
        ),
        isDirty: true,
      };
    });
  },

  // Bulk actions
  deleteSelectedShapes: () => {
    set((state) => {
      const { selectedShapeIds, shapes, connections } = state;
      if (selectedShapeIds.length === 0) return state;

      const newShapes = { ...shapes };
      for (const id of selectedShapeIds) {
        delete newShapes[id];
      }

      // Also delete connections attached to deleted shapes
      const newConnections: Record<string, Connection> = {};
      for (const [connId, conn] of Object.entries(connections)) {
        if (
          !selectedShapeIds.includes(conn.sourceShapeId) &&
          (conn.targetShapeId === null ||
            !selectedShapeIds.includes(conn.targetShapeId))
        ) {
          newConnections[connId] = conn;
        }
      }

      return {
        shapes: newShapes,
        connections: newConnections,
        selectedShapeIds: [],
        isDirty: true,
      };
    });
  },

  deleteSelectedConnections: () => {
    set((state) => {
      const { selectedConnectionIds, connections } = state;
      if (selectedConnectionIds.length === 0) return state;

      const newConnections = { ...connections };
      for (const id of selectedConnectionIds) {
        delete newConnections[id];
      }

      return {
        connections: newConnections,
        selectedConnectionIds: [],
        isDirty: true,
      };
    });
  },

  // Multi-selection actions
  selectAll: () => {
    set((state) => ({
      selectedShapeIds: Object.keys(state.shapes),
      selectedConnectionIds: [],
    }));
  },

  addToSelection: (ids) => {
    set((state) => ({
      selectedShapeIds: [...new Set([...state.selectedShapeIds, ...ids])],
      selectedConnectionIds: [],
    }));
  },

  // Clipboard actions
  copySelection: () => {
    const { shapes, connections, selectedShapeIds } = get();
    if (selectedShapeIds.length === 0) return;

    // Get selected shapes
    const selectedShapes = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    if (selectedShapes.length === 0) return;

    // Convert to clipboard format
    const clipboardShapes: ClipboardShape[] = selectedShapes.map((shape) => ({
      originalId: shape.id,
      type: shape.type,
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      rotation: shape.rotation,
      fill: shape.fill,
      fillOpacity: shape.fillOpacity,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      strokeStyle: shape.strokeStyle,
      cornerRadius: shape.cornerRadius,
      text: shape.text,
      textStyle: shape.textStyle,
    }));

    // Get connections between selected shapes only
    const clipboardConnections: ClipboardConnection[] = Object.values(connections)
      .filter(
        (conn) =>
          selectedShapeIds.includes(conn.sourceShapeId) &&
          conn.targetShapeId !== null &&
          selectedShapeIds.includes(conn.targetShapeId)
      )
      .map((conn) => ({
        sourceOriginalId: conn.sourceShapeId,
        targetOriginalId: conn.targetShapeId as string,
        sourceAnchor: conn.sourceAnchor,
        targetAnchor: conn.targetAnchor as NonNullable<typeof conn.targetAnchor>,
        stroke: conn.stroke,
        strokeWidth: conn.strokeWidth,
        strokeStyle: conn.strokeStyle,
        sourceArrow: conn.sourceArrow,
        targetArrow: conn.targetArrow,
      }));

    const bounds = getSelectionBounds(selectedShapes);

    set({
      clipboard: {
        shapes: clipboardShapes,
        connections: clipboardConnections,
        bounds,
        timestamp: Date.now(),
      },
      pasteCount: 0,
    });
  },

  cutSelection: () => {
    const store = get();
    store.copySelection();
    store.deleteSelectedShapes();
  },

  pasteClipboard: () => {
    const { clipboard, shapes, connections, nextZIndex, pasteCount } = get();
    if (!clipboard || clipboard.shapes.length === 0) return;

    // Calculate offset for this paste
    const offset = (pasteCount + 1) * PASTE_OFFSET;

    // Map old IDs to new IDs
    const idMap = new Map<string, string>();

    // Create new shapes
    const newShapes: Record<string, Shape> = { ...shapes };
    const newShapeIds: string[] = [];
    let currentZIndex = nextZIndex;

    for (const clipShape of clipboard.shapes) {
      const newId = generateId();
      idMap.set(clipShape.originalId, newId);

      const newShape: Shape = {
        id: newId,
        type: clipShape.type,
        x: clipShape.x + offset,
        y: clipShape.y + offset,
        width: clipShape.width,
        height: clipShape.height,
        rotation: clipShape.rotation,
        fill: clipShape.fill,
        fillOpacity: clipShape.fillOpacity,
        stroke: clipShape.stroke,
        strokeWidth: clipShape.strokeWidth,
        strokeStyle: clipShape.strokeStyle,
        cornerRadius: clipShape.cornerRadius,
        text: clipShape.text,
        textStyle: clipShape.textStyle,
        locked: false,
        visible: true,
        zIndex: currentZIndex++,
      };

      newShapes[newId] = newShape;
      newShapeIds.push(newId);
    }

    // Create new connections
    const newConnections: Record<string, Connection> = { ...connections };

    for (const clipConn of clipboard.connections) {
      const newSourceId = idMap.get(clipConn.sourceOriginalId);
      const newTargetId = idMap.get(clipConn.targetOriginalId);

      if (newSourceId && newTargetId) {
        const newConnId = generateId();
        newConnections[newConnId] = {
          id: newConnId,
          sourceShapeId: newSourceId,
          targetShapeId: newTargetId,
          sourceAnchor: clipConn.sourceAnchor,
          targetAnchor: clipConn.targetAnchor,
          waypoints: [],
          stroke: clipConn.stroke,
          strokeWidth: clipConn.strokeWidth,
          strokeStyle: clipConn.strokeStyle,
          sourceArrow: clipConn.sourceArrow,
          targetArrow: clipConn.targetArrow,
          curveType: 'straight',
        };
      }
    }

    set({
      shapes: newShapes,
      connections: newConnections,
      selectedShapeIds: newShapeIds,
      selectedConnectionIds: [],
      nextZIndex: currentZIndex,
      pasteCount: pasteCount + 1,
      isDirty: true,
    });
  },

  duplicateSelection: () => {
    const { shapes, connections, selectedShapeIds, nextZIndex } = get();
    if (selectedShapeIds.length === 0) return;

    // Get selected shapes
    const selectedShapes = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    if (selectedShapes.length === 0) return;

    // Get connections between selected shapes only
    const internalConnections = Object.values(connections).filter(
      (conn) =>
        selectedShapeIds.includes(conn.sourceShapeId) &&
        conn.targetShapeId !== null &&
        selectedShapeIds.includes(conn.targetShapeId)
    );

    // Generate new shapes with offset
    const idMap = new Map<string, string>();
    const newShapes: Record<string, Shape> = { ...shapes };
    const newShapeIds: string[] = [];
    let currentZIndex = nextZIndex;

    for (const shape of selectedShapes) {
      const newId = generateId();
      idMap.set(shape.id, newId);

      newShapes[newId] = {
        ...shape,
        id: newId,
        x: shape.x + PASTE_OFFSET,
        y: shape.y + PASTE_OFFSET,
        zIndex: currentZIndex++,
        locked: false,
        visible: true,
      };
      newShapeIds.push(newId);
    }

    // Create new connections between duplicated shapes
    const newConnections: Record<string, Connection> = { ...connections };
    for (const conn of internalConnections) {
      const newSourceId = idMap.get(conn.sourceShapeId);
      const newTargetId = idMap.get(conn.targetShapeId as string);
      if (newSourceId && newTargetId) {
        const newConnId = generateId();
        newConnections[newConnId] = {
          ...conn,
          id: newConnId,
          sourceShapeId: newSourceId,
          targetShapeId: newTargetId,
        };
      }
    }

    // Single atomic set() call - no race conditions
    set({
      shapes: newShapes,
      connections: newConnections,
      selectedShapeIds: newShapeIds,
      selectedConnectionIds: [],
      nextZIndex: currentZIndex,
      isDirty: true,
    });
  },

  // Alignment/distribution actions
  alignShapes: (alignment) => {
    const { shapes, selectedShapeIds } = get();
    if (selectedShapeIds.length < 2) {
      toast.info('Select at least 2 shapes to align');
      return;
    }

    const selectedShapes = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    const updates = calculateAlignment(selectedShapes, alignment);

    set((state) => {
      const newShapes = { ...state.shapes };
      for (const update of updates) {
        const shape = newShapes[update.id];
        if (shape) {
          newShapes[update.id] = {
            ...shape,
            ...(update.x !== undefined && { x: Math.round(update.x) }),
            ...(update.y !== undefined && { y: Math.round(update.y) }),
          };
        }
      }
      return { shapes: newShapes, isDirty: true };
    });
  },

  distributeShapes: (direction) => {
    const { shapes, selectedShapeIds } = get();
    if (selectedShapeIds.length < 3) {
      toast.info('Select at least 3 shapes to distribute');
      return;
    }

    const selectedShapes = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    // Check if distribution is possible (gap >= 0)
    const canDistribute = direction === 'horizontal'
      ? canDistributeHorizontally(selectedShapes)
      : canDistributeVertically(selectedShapes);

    if (!canDistribute) {
      toast.warning('Shapes are too close to distribute evenly');
      return;
    }

    const updates = direction === 'horizontal'
      ? calculateHorizontalDistribution(selectedShapes)
      : calculateVerticalDistribution(selectedShapes);

    set((state) => {
      const newShapes = { ...state.shapes };
      for (const update of updates) {
        const shape = newShapes[update.id];
        if (shape) {
          newShapes[update.id] = {
            ...shape,
            ...(update.x !== undefined && { x: update.x }),
            ...(update.y !== undefined && { y: update.y }),
          };
        }
      }
      return { shapes: newShapes, isDirty: true };
    });
  },
}));
