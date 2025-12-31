import { create } from 'zustand';
import type { Tool } from '@/types/tools';

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface UIState {
  // Tools
  activeTool: Tool;

  // Viewport
  viewport: Viewport;

  // UI toggles
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;

  // Actions (to be implemented in later phases)
  // setActiveTool: (tool: Tool) => void;
  // setViewport: (viewport: Partial<Viewport>) => void;
  // ... more actions
}

export const useUIStore = create<UIState>()(() => ({
  // Initial state
  activeTool: 'select',

  viewport: {
    x: 0,
    y: 0,
    zoom: 1,
  },

  showGrid: true,
  snapToGrid: true,
  showRulers: false,
  sidebarOpen: true,
  propertyPanelOpen: true,

  // Actions will be added in subsequent phases
}));
