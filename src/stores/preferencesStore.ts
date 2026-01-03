import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  // UI toggles
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;

  // Grid settings
  gridSize: number;

  // Property panel state
  propertyPanelCollapsed: boolean;

  // Recent colors (max 8)
  recentColors: string[];

  // Actions
  setShowGrid: (show: boolean) => void;
  toggleGrid: () => void;
  setSnapToGrid: (snap: boolean) => void;
  toggleSnapToGrid: () => void;
  setShowRulers: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  setGridSize: (size: number) => void;
  setPropertyPanelCollapsed: (collapsed: boolean) => void;
  addRecentColor: (color: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      // Initial state
      showGrid: true,
      snapToGrid: true,
      showRulers: false,
      sidebarOpen: true,
      gridSize: 20,
      propertyPanelCollapsed: false,
      recentColors: [],

      // Actions
      setShowGrid: (show) => set({ showGrid: show }),

      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

      setSnapToGrid: (snap) => set({ snapToGrid: snap }),

      toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

      setShowRulers: (show) => set({ showRulers: show }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setGridSize: (size) => set({ gridSize: size }),

      setPropertyPanelCollapsed: (collapsed) => set({ propertyPanelCollapsed: collapsed }),

      addRecentColor: (color) =>
        set((state) => {
          // Skip transparent/none colors
          if (color === 'transparent' || color === 'none') {
            return state;
          }

          // Skip if color already in list (move to front)
          const filtered = state.recentColors.filter((c) => c !== color);

          // Prepend new color and limit to 8
          const updated = [color, ...filtered].slice(0, 8);

          return { recentColors: updated };
        }),
    }),
    {
      name: 'naive-draw-preferences',
      // Only persist specific keys (not actions)
      partialize: (state) => ({
        showGrid: state.showGrid,
        snapToGrid: state.snapToGrid,
        showRulers: state.showRulers,
        sidebarOpen: state.sidebarOpen,
        gridSize: state.gridSize,
        propertyPanelCollapsed: state.propertyPanelCollapsed,
        recentColors: state.recentColors,
      }),
    }
  )
);
