import { create } from 'zustand';
import type { Tool } from '@/types/tools';
import type { Viewport } from '@/types/viewport';
import type { Point, Size } from '@/types/common';
import type { ShapeType } from '@/types/shapes';
import type { CreationState } from '@/types/creation';
import { zoomAtPoint as zoomAtPointUtil } from '@/lib/geometry/viewport';
import { CANVAS_DEFAULTS } from '@/lib/constants';

interface UIState {
  // Tools
  activeTool: Tool;

  // Viewport
  viewport: Viewport;

  // Pan state
  isPanning: boolean;
  panStartPoint: Point | null;
  panStartViewport: Viewport | null;
  spacebarHeld: boolean;

  // Shape creation state
  creationState: CreationState | null;

  // Cursor position for status bar
  cursorCanvasPosition: Point;

  // UI toggles
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;

  // Actions
  setActiveTool: (tool: Tool) => void;
  setViewport: (viewport: Partial<Viewport>) => void;
  zoomAtPoint: (delta: number, screenPoint: Point, containerSize: Size) => void;
  startPan: (screenPoint: Point) => void;
  updatePan: (screenPoint: Point) => void;
  endPan: () => void;
  setSpacebarHeld: (held: boolean) => void;
  setCursorCanvasPosition: (point: Point) => void;
  resetZoom: () => void;
  resetView: () => void;

  // Creation actions
  startCreation: (type: ShapeType, startPoint: Point) => void;
  updateCreation: (currentPoint: Point, isShiftHeld: boolean) => void;
  cancelCreation: () => void;
}

const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: CANVAS_DEFAULTS.DEFAULT_ZOOM,
};

export const useUIStore = create<UIState>()((set) => ({
  // Initial state
  activeTool: 'select',

  viewport: { ...DEFAULT_VIEWPORT },

  isPanning: false,
  panStartPoint: null,
  panStartViewport: null,
  spacebarHeld: false,

  creationState: null,

  cursorCanvasPosition: { x: 0, y: 0 },

  showGrid: true,
  snapToGrid: true,
  showRulers: false,
  sidebarOpen: true,
  propertyPanelOpen: true,

  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  setViewport: (partial) =>
    set((state) => ({
      viewport: { ...state.viewport, ...partial },
    })),

  zoomAtPoint: (delta, screenPoint, containerSize) =>
    set((state) => ({
      viewport: zoomAtPointUtil(state.viewport, delta, screenPoint, containerSize),
    })),

  startPan: (screenPoint) =>
    set((state) => ({
      isPanning: true,
      panStartPoint: screenPoint,
      panStartViewport: { ...state.viewport },
    })),

  updatePan: (screenPoint) =>
    set((state) => {
      if (!state.isPanning || !state.panStartPoint || !state.panStartViewport) {
        return state;
      }

      // Calculate delta from pan start to current point (drift-free)
      const deltaX = (state.panStartPoint.x - screenPoint.x) / state.viewport.zoom;
      const deltaY = (state.panStartPoint.y - screenPoint.y) / state.viewport.zoom;

      return {
        viewport: {
          ...state.viewport,
          x: state.panStartViewport.x + deltaX,
          y: state.panStartViewport.y + deltaY,
        },
      };
    }),

  endPan: () =>
    set({
      isPanning: false,
      panStartPoint: null,
      panStartViewport: null,
    }),

  setSpacebarHeld: (held) => set({ spacebarHeld: held }),

  setCursorCanvasPosition: (point) => set({ cursorCanvasPosition: point }),

  resetZoom: () =>
    set((state) => ({
      viewport: { ...state.viewport, zoom: CANVAS_DEFAULTS.DEFAULT_ZOOM },
    })),

  resetView: () =>
    set({
      viewport: { ...DEFAULT_VIEWPORT },
    }),

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
}));
