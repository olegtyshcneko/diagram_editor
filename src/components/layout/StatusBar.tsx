import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { usePreferencesStore } from '@/stores/preferencesStore';

/**
 * Status bar component displaying zoom level, cursor position, grid/snap status.
 * Reads cursor position from interactionStore (updated by CanvasContainer).
 */
export function StatusBar() {
  const viewport = useViewportStore((s) => s.viewport);
  const resetZoom = useViewportStore((s) => s.resetZoom);
  const resetView = useViewportStore((s) => s.resetView);
  const cursorCanvasPosition = useInteractionStore((s) => s.cursorCanvasPosition);
  const showGrid = usePreferencesStore((s) => s.showGrid);
  const snapToGrid = usePreferencesStore((s) => s.snapToGrid);
  const toggleGrid = usePreferencesStore((s) => s.toggleGrid);
  const toggleSnapToGrid = usePreferencesStore((s) => s.toggleSnapToGrid);

  const zoomPercentage = Math.round(viewport.zoom * 100);

  return (
    <footer className="h-6 bg-white border-t border-gray-200 flex items-center px-4 text-xs text-gray-500 select-none">
      <button
        onClick={resetZoom}
        className="hover:text-gray-800 hover:underline"
        title="Click to reset to 100% (Ctrl+1)"
      >
        Zoom: {zoomPercentage}%
      </button>
      <span className="mx-4 text-gray-300">|</span>
      <span>
        Position: {cursorCanvasPosition.x}, {cursorCanvasPosition.y}
      </span>
      <span className="mx-4 text-gray-300">|</span>
      <button
        onClick={toggleGrid}
        className={`hover:text-gray-800 ${showGrid ? 'text-gray-700 font-medium' : 'text-gray-400'}`}
        title="Toggle grid visibility (Ctrl+G)"
      >
        Grid: {showGrid ? 'On' : 'Off'}
      </button>
      <span className="mx-4 text-gray-300">|</span>
      <button
        onClick={toggleSnapToGrid}
        className={`hover:text-gray-800 ${snapToGrid ? 'text-gray-700 font-medium' : 'text-gray-400'}`}
        title="Toggle snap to grid (Ctrl+Shift+G)"
      >
        Snap: {snapToGrid ? 'On' : 'Off'}
      </button>
      <span className="mx-4 text-gray-300">|</span>
      <button
        onClick={resetView}
        className="hover:text-gray-800 hover:underline"
        title="Reset view (Ctrl+Shift+F)"
      >
        Reset View
      </button>
    </footer>
  );
}
