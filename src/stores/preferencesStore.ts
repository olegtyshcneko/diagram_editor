import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PreferencesState {
  // UI toggles
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;

  // Property panel state
  propertyPanelCollapsed: boolean;

  // Recent colors (max 8)
  recentColors: string[];

  // Actions
  setShowGrid: (show: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowRulers: (show: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
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
      propertyPanelCollapsed: false,
      recentColors: [],

      // Actions
      setShowGrid: (show) => set({ showGrid: show }),

      setSnapToGrid: (snap) => set({ snapToGrid: snap }),

      setShowRulers: (show) => set({ showRulers: show }),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

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
        propertyPanelCollapsed: state.propertyPanelCollapsed,
        recentColors: state.recentColors,
      }),
    }
  )
);
