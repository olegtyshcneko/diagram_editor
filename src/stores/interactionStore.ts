import { create } from 'zustand';
import type { Tool } from '@/types/tools';
import type { Point } from '@/types/common';
import type { ShapeType } from '@/types/shapes';
import type { CreationState } from '@/types/creation';
import type { ManipulationState } from '@/types/interaction';
import type { AnchorPosition, ConnectionCreationState } from '@/types/connections';
import type { SelectionBoxState } from '@/types/selection';

interface InteractionState {
  // Tools
  activeTool: Tool;

  // Shape creation state
  creationState: CreationState | null;

  // Shape manipulation state (move, resize, rotate)
  manipulationState: ManipulationState | null;

  // Cursor position for status bar
  cursorCanvasPosition: Point;

  // Text editing state
  editingTextShapeId: string | null;

  // Connection creation state
  connectionCreationState: ConnectionCreationState | null;

  // Selection box state (marquee selection)
  selectionBoxState: SelectionBoxState | null;

  // Actions
  setActiveTool: (tool: Tool) => void;
  setCursorCanvasPosition: (point: Point) => void;

  // Creation actions
  startCreation: (type: ShapeType, startPoint: Point) => void;
  updateCreation: (currentPoint: Point, isShiftHeld: boolean) => void;
  cancelCreation: () => void;

  // Manipulation actions
  startManipulation: (state: ManipulationState) => void;
  endManipulation: () => void;

  // Text editing actions
  setEditingTextShapeId: (id: string | null) => void;

  // Connection creation actions
  startConnectionCreation: (
    sourceShapeId: string,
    sourceAnchor: AnchorPosition,
    sourcePoint: Point
  ) => void;
  updateConnectionCreation: (currentPoint: Point) => void;
  endConnectionCreation: () => void;

  // Selection box actions
  startSelectionBox: (startPoint: Point, isShiftHeld: boolean) => void;
  updateSelectionBox: (currentPoint: Point) => void;
  endSelectionBox: () => void;
}

export const useInteractionStore = create<InteractionState>()((set) => ({
  // Initial state
  activeTool: 'select',

  creationState: null,

  manipulationState: null,

  cursorCanvasPosition: { x: 0, y: 0 },

  editingTextShapeId: null,

  connectionCreationState: null,

  selectionBoxState: null,

  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  setCursorCanvasPosition: (point) => set({ cursorCanvasPosition: point }),

  // Creation actions
  startCreation: (type, startPoint) =>
    set({
      creationState: {
        type,
        startPoint,
        currentPoint: startPoint,
        isShiftHeld: false,
      },
    }),

  updateCreation: (currentPoint, isShiftHeld) =>
    set((state) => ({
      creationState: state.creationState
        ? { ...state.creationState, currentPoint, isShiftHeld }
        : null,
    })),

  cancelCreation: () => set({ creationState: null }),

  // Manipulation actions
  startManipulation: (manipState) => set({ manipulationState: manipState }),

  endManipulation: () => set({ manipulationState: null }),

  // Text editing actions
  setEditingTextShapeId: (id) => set({ editingTextShapeId: id }),

  // Connection creation actions
  startConnectionCreation: (sourceShapeId, sourceAnchor, sourcePoint) =>
    set({
      connectionCreationState: {
        sourceShapeId,
        sourceAnchor,
        sourcePoint,
        currentPoint: sourcePoint,
      },
    }),

  updateConnectionCreation: (currentPoint) =>
    set((state) => ({
      connectionCreationState: state.connectionCreationState
        ? { ...state.connectionCreationState, currentPoint }
        : null,
    })),

  endConnectionCreation: () => set({ connectionCreationState: null }),

  // Selection box actions
  startSelectionBox: (startPoint, isShiftHeld) =>
    set({
      selectionBoxState: {
        startPoint,
        currentPoint: startPoint,
        isShiftHeld,
      },
    }),

  updateSelectionBox: (currentPoint) =>
    set((state) => ({
      selectionBoxState: state.selectionBoxState
        ? { ...state.selectionBoxState, currentPoint }
        : null,
    })),

  endSelectionBox: () => set({ selectionBoxState: null }),
}));
