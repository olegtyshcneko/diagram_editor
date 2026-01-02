import { useUIStore } from '@/stores/uiStore';

/**
 * Status bar component displaying zoom level and cursor position.
 * Reads cursor position from uiStore (updated by CanvasContainer).
 */
export function StatusBar() {
  const { viewport, cursorCanvasPosition, resetZoom, resetView } = useUIStore();

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
        onClick={resetView}
        className="hover:text-gray-800 hover:underline"
        title="Reset view (Ctrl+Shift+F)"
      >
        Reset View
      </button>
    </footer>
  );
}
