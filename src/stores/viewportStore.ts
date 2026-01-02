import { create } from 'zustand';
import type { Viewport } from '@/types/viewport';
import type { Point, Size } from '@/types/common';
import { zoomAtPoint as zoomAtPointUtil } from '@/lib/geometry/viewport';
import { CANVAS_DEFAULTS } from '@/lib/constants';

interface ViewportState {
  // Viewport
  viewport: Viewport;

  // Pan state
  isPanning: boolean;
  panStartPoint: Point | null;
  panStartViewport: Viewport | null;
  spacebarHeld: boolean;

  // Actions
  setViewport: (viewport: Partial<Viewport>) => void;
  zoomAtPoint: (delta: number, screenPoint: Point, containerSize: Size) => void;
  startPan: (screenPoint: Point) => void;
  updatePan: (screenPoint: Point) => void;
  endPan: () => void;
  setSpacebarHeld: (held: boolean) => void;
  resetZoom: () => void;
  resetView: () => void;
}

const DEFAULT_VIEWPORT: Viewport = {
  x: 0,
  y: 0,
  zoom: CANVAS_DEFAULTS.DEFAULT_ZOOM,
};

export const useViewportStore = create<ViewportState>()((set) => ({
  // Initial state
  viewport: { ...DEFAULT_VIEWPORT },

  isPanning: false,
  panStartPoint: null,
  panStartViewport: null,
  spacebarHeld: false,

  // Actions
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

  resetZoom: () =>
    set((state) => ({
      viewport: { ...state.viewport, zoom: CANVAS_DEFAULTS.DEFAULT_ZOOM },
    })),

  resetView: () =>
    set({
      viewport: { ...DEFAULT_VIEWPORT },
    }),
}));
