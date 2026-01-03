import { create } from 'zustand';
import type { Shape, ShapeType } from '@/types/shapes';
import { DEFAULT_SHAPE } from '@/types/shapes';
import type { Connection } from '@/types/connections';
import { DEFAULT_CONNECTION } from '@/types/connections';
import { generateId } from '@/lib/utils/id';

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
}));
