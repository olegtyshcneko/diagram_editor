# Phase 1: Canvas Foundation - Technical Specification

## Technical Architecture

### Component Hierarchy

```
App
└── AppShell
    └── CanvasContainer
        ├── Canvas (SVG)
        │   └── (empty for now - shapes added in Phase 2)
        └── CanvasOverlay (for future tools)
```

### State Management

```
uiStore (Zustand)
├── viewport
│   ├── x: number       (pan offset X)
│   ├── y: number       (pan offset Y)
│   └── zoom: number    (zoom factor, 1.0 = 100%)
├── isPanning: boolean
├── panStart: Point | null
└── actions
    ├── setViewport(partial)
    ├── zoom(delta, centerPoint)
    ├── pan(deltaX, deltaY)
    ├── resetZoom()
    └── resetView()
```

---

## Files to Create

### Components

| File | Purpose |
|------|---------|
| `src/components/canvas/Canvas.tsx` | Main SVG canvas component |
| `src/components/canvas/CanvasContainer.tsx` | Canvas wrapper with event handlers |
| `src/components/layout/StatusBar.tsx` | Status bar with zoom and position |

### Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useViewport.ts` | Viewport calculations and transformations |
| `src/hooks/useCanvasEvents.ts` | Canvas mouse/keyboard event handlers |
| `src/hooks/usePan.ts` | Pan interaction logic |
| `src/hooks/useZoom.ts` | Zoom interaction logic |

### Utilities

| File | Purpose |
|------|---------|
| `src/lib/geometry/viewport.ts` | Viewport math utilities |

### Store Updates

| File | Changes |
|------|---------|
| `src/stores/uiStore.ts` | Add viewport actions, pan state |

---

## Key Interfaces & Types

### Viewport Types

```typescript
// src/types/viewport.ts

import { Point } from './common';

export interface Viewport {
  x: number;      // Pan offset X (canvas units)
  y: number;      // Pan offset Y (canvas units)
  zoom: number;   // Zoom factor (0.1 to 4.0)
}

export interface ViewportBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface ScreenToCanvasOptions {
  viewport: Viewport;
  containerWidth: number;
  containerHeight: number;
}
```

### UI Store Extensions

```typescript
// src/stores/uiStore.ts - extended interface

interface UIState {
  // Existing
  activeTool: Tool;
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  sidebarOpen: boolean;
  propertyPanelOpen: boolean;

  // New: Viewport
  viewport: Viewport;

  // New: Pan state
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
```

---

## Implementation Order

### Day 1: Viewport Foundation

1. **Create viewport types and utilities**
   - Define `Viewport` interface
   - Create `screenToCanvas` and `canvasToScreen` functions
   - Create `calculateViewBox` function

2. **Update uiStore with viewport state**
   - Add viewport state
   - Add setViewport action
   - Add resetZoom and resetView actions

### Day 2: Canvas Component

3. **Create Canvas component**
   - SVG element with calculated viewBox
   - Responsive sizing
   - Background styling

4. **Create CanvasContainer**
   - Wrapper div with ref for dimensions
   - Pass dimensions to Canvas

### Day 3: Zoom Implementation

5. **Create useZoom hook**
   - Wheel event handler
   - Cursor-centered zoom calculation
   - Zoom limits enforcement

6. **Integrate zoom with Canvas**
   - Attach wheel handler
   - Update status bar

### Day 4: Pan Implementation

7. **Create usePan hook**
   - Middle mouse detection
   - Spacebar detection
   - Pan delta calculation

8. **Integrate pan with Canvas**
   - Cursor changes
   - State management

### Day 5: Status Bar & Polish

9. **Create StatusBar component**
   - Zoom percentage display
   - Cursor position display

10. **Final integration and testing**
    - Keyboard shortcuts
    - Edge case handling
    - Performance verification

---

## Code Patterns

### Viewport Utilities

```typescript
// src/lib/geometry/viewport.ts

import { Point, Size } from '@/types/common';
import { Viewport } from '@/types/viewport';
import { CANVAS_DEFAULTS } from '@/lib/constants';

/**
 * Calculate SVG viewBox string from viewport state
 */
export function calculateViewBox(
  viewport: Viewport,
  containerSize: Size
): string {
  const { x, y, zoom } = viewport;
  const { width, height } = containerSize;

  const viewWidth = width / zoom;
  const viewHeight = height / zoom;

  return `${x} ${y} ${viewWidth} ${viewHeight}`;
}

/**
 * Convert screen coordinates to canvas coordinates
 */
export function screenToCanvas(
  screenPoint: Point,
  viewport: Viewport,
  containerSize: Size
): Point {
  const { x: viewX, y: viewY, zoom } = viewport;
  const { width, height } = containerSize;

  return {
    x: viewX + (screenPoint.x / zoom),
    y: viewY + (screenPoint.y / zoom),
  };
}

/**
 * Convert canvas coordinates to screen coordinates
 */
export function canvasToScreen(
  canvasPoint: Point,
  viewport: Viewport,
  containerSize: Size
): Point {
  const { x: viewX, y: viewY, zoom } = viewport;

  return {
    x: (canvasPoint.x - viewX) * zoom,
    y: (canvasPoint.y - viewY) * zoom,
  };
}

/**
 * Calculate new viewport after zooming at a point
 */
export function zoomAtPoint(
  currentViewport: Viewport,
  zoomDelta: number,
  screenPoint: Point,
  containerSize: Size
): Viewport {
  const { zoom: currentZoom, x: currentX, y: currentY } = currentViewport;

  // Calculate new zoom level with limits
  const newZoom = Math.max(
    CANVAS_DEFAULTS.MIN_ZOOM,
    Math.min(CANVAS_DEFAULTS.MAX_ZOOM, currentZoom + zoomDelta)
  );

  // If zoom didn't change (at limits), return current viewport
  if (newZoom === currentZoom) {
    return currentViewport;
  }

  // Calculate canvas point under cursor before zoom
  const canvasX = currentX + (screenPoint.x / currentZoom);
  const canvasY = currentY + (screenPoint.y / currentZoom);

  // Calculate new viewport position to keep canvas point under cursor
  const newX = canvasX - (screenPoint.x / newZoom);
  const newY = canvasY - (screenPoint.y / newZoom);

  return {
    x: newX,
    y: newY,
    zoom: newZoom,
  };
}

/**
 * Clamp zoom to valid range
 */
export function clampZoom(zoom: number): number {
  return Math.max(
    CANVAS_DEFAULTS.MIN_ZOOM,
    Math.min(CANVAS_DEFAULTS.MAX_ZOOM, zoom)
  );
}
```

### UI Store Implementation

```typescript
// src/stores/uiStore.ts

import { create } from 'zustand';
import { Tool } from '@/types/tools';
import { Viewport } from '@/types/viewport';
import { Point, Size } from '@/types/common';
import { zoomAtPoint, clampZoom } from '@/lib/geometry/viewport';
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

  // UI toggles
  showGrid: boolean;
  snapToGrid: boolean;

  // Actions
  setActiveTool: (tool: Tool) => void;
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

export const useUIStore = create<UIState>()((set, get) => ({
  // Initial state
  activeTool: 'select',
  viewport: { ...DEFAULT_VIEWPORT },
  isPanning: false,
  panStartPoint: null,
  panStartViewport: null,
  spacebarHeld: false,
  showGrid: true,
  snapToGrid: true,

  // Actions
  setActiveTool: (tool) => set({ activeTool: tool }),

  setViewport: (partial) =>
    set((state) => ({
      viewport: { ...state.viewport, ...partial },
    })),

  zoomAtPoint: (delta, screenPoint, containerSize) =>
    set((state) => ({
      viewport: zoomAtPoint(state.viewport, delta, screenPoint, containerSize),
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
```

### Canvas Component

```typescript
// src/components/canvas/Canvas.tsx

import { forwardRef } from 'react';
import { Viewport } from '@/types/viewport';
import { Size } from '@/types/common';
import { calculateViewBox } from '@/lib/geometry/viewport';

interface CanvasProps {
  viewport: Viewport;
  containerSize: Size;
  children?: React.ReactNode;
}

export const Canvas = forwardRef<SVGSVGElement, CanvasProps>(
  function Canvas({ viewport, containerSize, children }, ref) {
    const viewBox = calculateViewBox(viewport, containerSize);

    return (
      <svg
        ref={ref}
        className="w-full h-full"
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        style={{
          backgroundColor: '#f8f9fa',
          cursor: 'default',
        }}
      >
        {/* Background pattern (optional) */}
        <rect
          x={viewport.x - 10000}
          y={viewport.y - 10000}
          width={20000}
          height={20000}
          fill="#f8f9fa"
        />

        {/* Children (shapes, connections) will be added in later phases */}
        {children}
      </svg>
    );
  }
);
```

### Canvas Container with Events

```typescript
// src/components/canvas/CanvasContainer.tsx

import { useRef, useCallback, useEffect } from 'react';
import { Canvas } from './Canvas';
import { useUIStore } from '@/stores/uiStore';
import { useContainerSize } from '@/hooks/useContainerSize';
import { CANVAS_DEFAULTS } from '@/lib/constants';
import { screenToCanvas } from '@/lib/geometry/viewport';

export function CanvasContainer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerSize = useContainerSize(containerRef);

  const {
    viewport,
    isPanning,
    spacebarHeld,
    zoomAtPoint,
    startPan,
    updatePan,
    endPan,
    setSpacebarHeld,
  } = useUIStore();

  // Wheel handler for zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Normalize wheel delta
      const delta = -Math.sign(e.deltaY) * CANVAS_DEFAULTS.ZOOM_STEP;

      zoomAtPoint(delta, screenPoint, containerSize);
    },
    [zoomAtPoint, containerSize]
  );

  // Mouse handlers for pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Middle mouse button OR spacebar held + left click
      if (e.button === 1 || (e.button === 0 && spacebarHeld)) {
        e.preventDefault();
        startPan(screenPoint);
      }
    },
    [spacebarHeld, startPan]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const screenPoint = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      if (isPanning) {
        updatePan(screenPoint);
      }
    },
    [isPanning, updatePan]
  );

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      endPan();
    }
  }, [isPanning, endPan]);

  // Global mouse up (in case mouse leaves canvas while dragging)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isPanning) {
        endPan();
      }
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isPanning, endPan]);

  // Keyboard handlers for spacebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setSpacebarHeld(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacebarHeld(false);
        if (isPanning) {
          endPan();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setSpacebarHeld, isPanning, endPan]);

  // Attach wheel listener with passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  // Cursor style
  const getCursor = () => {
    if (isPanning) return 'grabbing';
    if (spacebarHeld) return 'grab';
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden"
      style={{ cursor: getCursor() }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {containerSize.width > 0 && containerSize.height > 0 && (
        <Canvas
          ref={svgRef}
          viewport={viewport}
          containerSize={containerSize}
        />
      )}
    </div>
  );
}
```

### Container Size Hook

```typescript
// src/hooks/useContainerSize.ts

import { useState, useEffect, RefObject } from 'react';
import { Size } from '@/types/common';

export function useContainerSize(ref: RefObject<HTMLElement>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    // Initial size
    updateSize();

    // Resize observer for responsive updates
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(element);

    return () => resizeObserver.disconnect();
  }, [ref]);

  return size;
}
```

### Status Bar Component

```typescript
// src/components/layout/StatusBar.tsx

import { useUIStore } from '@/stores/uiStore';
import { useState, useEffect, useCallback } from 'react';
import { screenToCanvas } from '@/lib/geometry/viewport';

export function StatusBar() {
  const { viewport, resetZoom, resetView } = useUIStore();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position on canvas
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // This would need the container reference
      // For now, we'll show screen coordinates
      setMousePosition({ x: Math.round(e.clientX), y: Math.round(e.clientY) });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
        Position: {mousePosition.x}, {mousePosition.y}
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
```

---

## Key Decisions

### Decision 1: ViewBox vs Transform

**Decision:** Use SVG viewBox for viewport transformation

**Rationale:**
- Native SVG approach
- Clean coordinate system
- Better for hit testing
- Easier to add shapes later

**Alternative Considered:**
- CSS transform on SVG: More complex hit testing

### Decision 2: Pan State Storage

**Decision:** Store pan start state for delta calculation

**Rationale:**
- Prevents drift from floating point accumulation
- Smoother pan experience
- Clear state management

### Decision 3: Zoom Step Size

**Decision:** Use 10% (0.1) as zoom step

**Rationale:**
- Matches draw.io behavior
- Provides good granularity
- 10 steps from min to 100%, 30 steps from 100% to max

### Decision 4: Event Handling Location

**Decision:** Handle events on container div, not SVG

**Rationale:**
- Consistent event coordinates
- Easier to manage overlays later
- Better wheel event handling

---

## Testing Approach

### Unit Tests

```typescript
// src/lib/geometry/__tests__/viewport.test.ts

import {
  calculateViewBox,
  screenToCanvas,
  canvasToScreen,
  zoomAtPoint
} from '../viewport';

describe('calculateViewBox', () => {
  test('at default zoom (1.0)', () => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const size = { width: 800, height: 600 };

    expect(calculateViewBox(viewport, size)).toBe('0 0 800 600');
  });

  test('at 2x zoom', () => {
    const viewport = { x: 0, y: 0, zoom: 2 };
    const size = { width: 800, height: 600 };

    expect(calculateViewBox(viewport, size)).toBe('0 0 400 300');
  });

  test('with pan offset', () => {
    const viewport = { x: 100, y: 50, zoom: 1 };
    const size = { width: 800, height: 600 };

    expect(calculateViewBox(viewport, size)).toBe('100 50 800 600');
  });
});

describe('screenToCanvas', () => {
  test('at default viewport', () => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const size = { width: 800, height: 600 };

    const result = screenToCanvas({ x: 400, y: 300 }, viewport, size);

    expect(result).toEqual({ x: 400, y: 300 });
  });

  test('with zoom', () => {
    const viewport = { x: 0, y: 0, zoom: 2 };
    const size = { width: 800, height: 600 };

    const result = screenToCanvas({ x: 400, y: 300 }, viewport, size);

    expect(result).toEqual({ x: 200, y: 150 });
  });
});

describe('zoomAtPoint', () => {
  test('keeps point under cursor', () => {
    const viewport = { x: 0, y: 0, zoom: 1 };
    const screenPoint = { x: 400, y: 300 };
    const size = { width: 800, height: 600 };

    const newViewport = zoomAtPoint(viewport, 0.1, screenPoint, size);

    // Point (400, 300) should still map to screen (400, 300)
    const canvasBefore = screenToCanvas(screenPoint, viewport, size);
    const canvasAfter = screenToCanvas(screenPoint, newViewport, size);

    expect(canvasAfter.x).toBeCloseTo(canvasBefore.x, 5);
    expect(canvasAfter.y).toBeCloseTo(canvasBefore.y, 5);
  });

  test('respects zoom limits', () => {
    const viewport = { x: 0, y: 0, zoom: 4 };
    const screenPoint = { x: 400, y: 300 };
    const size = { width: 800, height: 600 };

    const newViewport = zoomAtPoint(viewport, 0.1, screenPoint, size);

    expect(newViewport.zoom).toBe(4); // Should not exceed max
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/canvas.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Canvas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders canvas', async ({ page }) => {
    const canvas = page.locator('svg');
    await expect(canvas).toBeVisible();
  });

  test('zooms with mouse wheel', async ({ page }) => {
    const statusBar = page.locator('footer');
    await expect(statusBar).toContainText('Zoom: 100%');

    // Zoom in
    const canvas = page.locator('[data-testid="canvas-container"]');
    await canvas.hover();
    await page.mouse.wheel(0, -100);

    await expect(statusBar).toContainText('Zoom: 110%');
  });

  test('pans with middle mouse', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-container"]');

    await canvas.hover({ position: { x: 400, y: 300 } });
    await page.mouse.down({ button: 'middle' });
    await page.mouse.move(500, 400);
    await page.mouse.up({ button: 'middle' });

    // Verify viewport changed (check status bar or store)
  });

  test('resets zoom with Ctrl+1', async ({ page }) => {
    const canvas = page.locator('[data-testid="canvas-container"]');

    // First zoom
    await canvas.hover();
    await page.mouse.wheel(0, -200);

    // Reset
    await page.keyboard.press('Control+1');

    const statusBar = page.locator('footer');
    await expect(statusBar).toContainText('Zoom: 100%');
  });
});
```

---

## Performance Considerations

1. **Avoid re-renders during pan/zoom**
   - Use Zustand selectors to subscribe to specific state
   - Memoize viewport calculations

2. **Smooth animations**
   - Use CSS transitions for cursor changes
   - Consider requestAnimationFrame for smooth updates

3. **Event throttling**
   - Wheel events should be handled without throttling for responsiveness
   - Consider debouncing status bar updates if needed

4. **ViewBox precision**
   - Use sufficient decimal places to prevent visual jitter
   - Round display values only

---

## Accessibility Requirements

- Keyboard zoom alternatives (Ctrl++, Ctrl+-)
- Status bar is readable by screen readers
- Sufficient contrast for UI elements
- Focus indicators visible when navigating by keyboard
