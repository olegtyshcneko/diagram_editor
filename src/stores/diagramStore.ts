import { create } from 'zustand';
import type { Shape, ShapeType } from '@/types/shapes';
import { DEFAULT_SHAPE } from '@/types/shapes';
import type { Connection } from '@/types/connections';
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
  clearSelection: () => void;

  // Bulk actions
  deleteSelectedShapes: () => void;
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
      const { [id]: deleted, ...remaining } = state.shapes;
      return {
        shapes: remaining,
        selectedShapeIds: state.selectedShapeIds.filter((sid) => sid !== id),
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
        };
      }
      return { selectedShapeIds: [id] };
    });
  },

  setSelectedShapeIds: (ids) => set({ selectedShapeIds: ids }),

  clearSelection: () =>
    set({ selectedShapeIds: [], selectedConnectionIds: [] }),

  // Bulk actions
  deleteSelectedShapes: () => {
    set((state) => {
      const { selectedShapeIds, shapes } = state;
      if (selectedShapeIds.length === 0) return state;

      const newShapes = { ...shapes };
      for (const id of selectedShapeIds) {
        delete newShapes[id];
      }

      return {
        shapes: newShapes,
        selectedShapeIds: [],
        isDirty: true,
      };
    });
  },
}));
