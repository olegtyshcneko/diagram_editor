# Phase 2: Basic Shapes - Technical Specification

## Technical Architecture

### Component Hierarchy

```
App
└── AppShell
    └── CanvasContainer
        ├── Canvas (SVG)
        │   ├── ShapeLayer (g)
        │   │   ├── Rectangle
        │   │   └── Ellipse
        │   ├── SelectionHandles (g)
        │   └── CreationPreview (conditional)
        └── Toolbar
            ├── SelectTool
            ├── RectangleTool
            └── EllipseTool
```

### State Management

```
diagramStore
├── shapes: Record<string, Shape>
├── selectedShapeIds: string[]
├── nextZIndex: number
└── actions
    ├── addShape(shape)
    ├── updateShape(id, updates)
    ├── deleteShape(id)
    ├── setSelectedShapeIds(ids)
    └── clearSelection()

uiStore
├── activeTool: Tool
├── creationState: CreationState | null
└── actions
    ├── setActiveTool(tool)
    ├── startCreation(type, startPoint)
    ├── updateCreation(currentPoint)
    └── finishCreation() / cancelCreation()
```

---

## Files to Create

### Shape Components

| File | Purpose |
|------|---------|
| `src/components/shapes/Shape.tsx` | Shape renderer (switch on type) |
| `src/components/shapes/Rectangle.tsx` | Rectangle SVG component |
| `src/components/shapes/Ellipse.tsx` | Ellipse SVG component |
| `src/components/shapes/SelectionHandles.tsx` | 8 resize handles |
| `src/components/shapes/ShapeLayer.tsx` | Container for all shapes |

### Canvas Updates

| File | Purpose |
|------|---------|
| `src/components/canvas/CreationPreview.tsx` | Preview during shape creation |

### Toolbar Components

| File | Purpose |
|------|---------|
| `src/components/toolbar/Toolbar.tsx` | Main toolbar container |
| `src/components/toolbar/ToolButton.tsx` | Individual tool button |

### Hooks

| File | Purpose |
|------|---------|
| `src/hooks/useShapeCreation.ts` | Shape creation state machine |
| `src/hooks/useSelection.ts` | Selection logic |
| `src/hooks/useKeyboardShortcuts.ts` | Tool shortcuts |

### Utilities

| File | Purpose |
|------|---------|
| `src/lib/utils/id.ts` | ID generation |
| `src/lib/geometry/shapes.ts` | Shape geometry utilities |
| `src/lib/geometry/hitTest.ts` | Hit testing for selection |

### Store Updates

| File | Changes |
|------|---------|
| `src/stores/diagramStore.ts` | Add shape CRUD actions |
| `src/stores/uiStore.ts` | Add tool and creation state |

---

## Key Interfaces & Types

### Creation State

```typescript
// src/types/creation.ts

import { Point } from './common';
import { ShapeType } from './shapes';

export interface CreationState {
  type: ShapeType;
  startPoint: Point;
  currentPoint: Point;
  isShiftHeld: boolean;
}

export interface CreationBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate bounds from creation state
 */
export function getCreationBounds(state: CreationState): CreationBounds {
  const { startPoint, currentPoint, isShiftHeld } = state;

  let width = currentPoint.x - startPoint.x;
  let height = currentPoint.y - startPoint.y;

  // Handle negative dimensions (drag up/left)
  let x = width < 0 ? currentPoint.x : startPoint.x;
  let y = height < 0 ? currentPoint.y : startPoint.y;

  width = Math.abs(width);
  height = Math.abs(height);

  // Shift constraint: make square/circle
  if (isShiftHeld) {
    const size = Math.max(width, height);
    width = size;
    height = size;
  }

  return { x, y, width, height };
}
```

### Shape Props

```typescript
// src/types/shapes.ts - additions

export interface ShapeRenderProps {
  shape: Shape;
  isSelected: boolean;
  onSelect: (id: string) => void;
}
```

---

## Implementation Order

### Day 1: Store Updates

1. **Update diagramStore**
   - Add shapes record
   - Add shape CRUD actions
   - Add selection state and actions

2. **Update uiStore**
   - Add creation state
   - Add creation actions

### Day 2: Shape Components

3. **Create Rectangle component**
   - SVG rect rendering
   - Props from Shape interface
   - Click handler for selection

4. **Create Ellipse component**
   - SVG ellipse rendering
   - Same interface as Rectangle

5. **Create Shape switch component**
   - Render correct component based on type

### Day 3: Toolbar

6. **Create ToolButton component**
   - Active state styling
   - Click handler
   - Tooltip with shortcut

7. **Create Toolbar component**
   - Layout for tool buttons
   - Connect to uiStore

8. **Add keyboard shortcuts**
   - R for Rectangle
   - E for Ellipse
   - V for Select

### Day 4: Shape Creation

9. **Create useShapeCreation hook**
   - Mouse down: start creation
   - Mouse move: update preview
   - Mouse up: finish creation
   - Escape: cancel

10. **Create CreationPreview component**
    - Semi-transparent shape
    - Updates during drag

### Day 5: Selection & Polish

11. **Create SelectionHandles component**
    - 8 handles positioned on shape bounds
    - Visual styling

12. **Implement hit testing**
    - Point-in-rectangle
    - Point-in-ellipse

13. **Integration and testing**
    - Connect all pieces
    - Manual testing
    - Bug fixes

---

## Code Patterns

### Diagram Store Implementation

```typescript
// src/stores/diagramStore.ts

import { create } from 'zustand';
import { Shape, DEFAULT_SHAPE } from '@/types/shapes';
import { Connection } from '@/types/connections';
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
  addShape: (partialShape: Partial<Shape> & { type: Shape['type'] }) => string;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;

  // Selection actions
  selectShape: (id: string, addToSelection?: boolean) => void;
  setSelectedShapeIds: (ids: string[]) => void;
  clearSelection: () => void;
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
      ...DEFAULT_SHAPE,
      ...partialShape,
      zIndex: nextZIndex,
    };

    set((state) => ({
      shapes: { ...state.shapes, [id]: shape },
      nextZIndex: state.nextZIndex + 1,
      isDirty: true,
      selectedShapeIds: [id], // Select newly created shape
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
}));
```

### Rectangle Component

```typescript
// src/components/shapes/Rectangle.tsx

import { memo } from 'react';
import { Shape } from '@/types/shapes';

interface RectangleProps {
  shape: Shape;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const Rectangle = memo(function Rectangle({
  shape,
  isSelected,
  onClick,
}: RectangleProps) {
  const {
    x,
    y,
    width,
    height,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeStyle,
    cornerRadius = 0,
  } = shape;

  // Stroke dasharray based on style
  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8 4'
      : strokeStyle === 'dotted'
      ? '2 2'
      : undefined;

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      rx={cornerRadius}
      ry={cornerRadius}
      fill={fill === 'transparent' ? 'none' : fill}
      fillOpacity={fillOpacity}
      stroke={stroke === 'transparent' ? 'none' : stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    />
  );
});
```

### Ellipse Component

```typescript
// src/components/shapes/Ellipse.tsx

import { memo } from 'react';
import { Shape } from '@/types/shapes';

interface EllipseProps {
  shape: Shape;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const Ellipse = memo(function Ellipse({
  shape,
  isSelected,
  onClick,
}: EllipseProps) {
  const {
    x,
    y,
    width,
    height,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeStyle,
  } = shape;

  // Calculate center and radii
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;

  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8 4'
      : strokeStyle === 'dotted'
      ? '2 2'
      : undefined;

  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={fill === 'transparent' ? 'none' : fill}
      fillOpacity={fillOpacity}
      stroke={stroke === 'transparent' ? 'none' : stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={strokeDasharray}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    />
  );
});
```

### Shape Renderer

```typescript
// src/components/shapes/Shape.tsx

import { memo } from 'react';
import { Shape as ShapeType } from '@/types/shapes';
import { Rectangle } from './Rectangle';
import { Ellipse } from './Ellipse';

interface ShapeProps {
  shape: ShapeType;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const Shape = memo(function Shape({
  shape,
  isSelected,
  onSelect,
}: ShapeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(shape.id);
  };

  switch (shape.type) {
    case 'rectangle':
      return (
        <Rectangle
          shape={shape}
          isSelected={isSelected}
          onClick={handleClick}
        />
      );
    case 'ellipse':
      return (
        <Ellipse
          shape={shape}
          isSelected={isSelected}
          onClick={handleClick}
        />
      );
    default:
      return null;
  }
});
```

### Selection Handles

```typescript
// src/components/shapes/SelectionHandles.tsx

import { memo } from 'react';
import { Shape } from '@/types/shapes';
import { COLORS } from '@/lib/constants';

interface SelectionHandlesProps {
  shape: Shape;
}

const HANDLE_SIZE = 8;

export const SelectionHandles = memo(function SelectionHandles({
  shape,
}: SelectionHandlesProps) {
  const { x, y, width, height } = shape;
  const halfHandle = HANDLE_SIZE / 2;

  // 8 handle positions: 4 corners + 4 midpoints
  const handles = [
    { cx: x, cy: y, cursor: 'nwse-resize' },                    // top-left
    { cx: x + width / 2, cy: y, cursor: 'ns-resize' },          // top-center
    { cx: x + width, cy: y, cursor: 'nesw-resize' },            // top-right
    { cx: x + width, cy: y + height / 2, cursor: 'ew-resize' }, // right-center
    { cx: x + width, cy: y + height, cursor: 'nwse-resize' },   // bottom-right
    { cx: x + width / 2, cy: y + height, cursor: 'ns-resize' }, // bottom-center
    { cx: x, cy: y + height, cursor: 'nesw-resize' },           // bottom-left
    { cx: x, cy: y + height / 2, cursor: 'ew-resize' },         // left-center
  ];

  return (
    <g className="selection-handles">
      {/* Selection outline */}
      <rect
        x={x - 1}
        y={y - 1}
        width={width + 2}
        height={height + 2}
        fill="none"
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* Handles */}
      {handles.map((handle, index) => (
        <rect
          key={index}
          x={handle.cx - halfHandle}
          y={handle.cy - halfHandle}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill="white"
          stroke={COLORS.SELECTION}
          strokeWidth={1}
          style={{ cursor: handle.cursor }}
          // Resize logic will be added in Phase 3
        />
      ))}
    </g>
  );
});
```

### Shape Creation Hook

```typescript
// src/hooks/useShapeCreation.ts

import { useCallback, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { Point, Size } from '@/types/common';
import { ShapeType, SHAPE_DEFAULTS } from '@/types/shapes';
import { screenToCanvas } from '@/lib/geometry/viewport';
import { getCreationBounds } from '@/types/creation';

interface UseShapeCreationProps {
  containerSize: Size;
}

export function useShapeCreation({ containerSize }: UseShapeCreationProps) {
  const {
    activeTool,
    viewport,
    creationState,
    startCreation,
    updateCreation,
    cancelCreation,
  } = useUIStore();

  const { addShape, clearSelection } = useDiagramStore();

  const isCreationTool = activeTool === 'rectangle' || activeTool === 'ellipse';

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, screenPoint: Point) => {
      if (!isCreationTool) return;
      if (e.button !== 0) return; // Left click only

      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);

      startCreation(activeTool as ShapeType, canvasPoint);
    },
    [isCreationTool, activeTool, viewport, containerSize, startCreation]
  );

  const handleMouseMove = useCallback(
    (screenPoint: Point, isShiftHeld: boolean) => {
      if (!creationState) return;

      const canvasPoint = screenToCanvas(screenPoint, viewport, containerSize);

      updateCreation(canvasPoint, isShiftHeld);
    },
    [creationState, viewport, containerSize, updateCreation]
  );

  const handleMouseUp = useCallback(() => {
    if (!creationState) return;

    const bounds = getCreationBounds(creationState);

    // Minimum size check
    const minSize = 5;
    if (bounds.width < minSize && bounds.height < minSize) {
      // Click (not drag) - use default size
      addShape({
        type: creationState.type,
        x: creationState.startPoint.x - SHAPE_DEFAULTS.DEFAULT_WIDTH / 2,
        y: creationState.startPoint.y - SHAPE_DEFAULTS.DEFAULT_HEIGHT / 2,
        width: SHAPE_DEFAULTS.DEFAULT_WIDTH,
        height: SHAPE_DEFAULTS.DEFAULT_HEIGHT,
      });
    } else {
      // Drag - use drawn size
      addShape({
        type: creationState.type,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      });
    }

    cancelCreation();
  }, [creationState, addShape, cancelCreation]);

  // Escape to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && creationState) {
        cancelCreation();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [creationState, cancelCreation]);

  return {
    isCreating: creationState !== null,
    creationState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
```

### Toolbar Component

```typescript
// src/components/toolbar/Toolbar.tsx

import { MousePointer2, Square, Circle } from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';
import { ToolButton } from './ToolButton';
import { Tool, TOOLS } from '@/types/tools';

export function Toolbar() {
  const { activeTool, setActiveTool } = useUIStore();

  const tools: { id: Tool; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'select', icon: <MousePointer2 size={20} />, label: 'Select', shortcut: 'V' },
    { id: 'rectangle', icon: <Square size={20} />, label: 'Rectangle', shortcut: 'R' },
    { id: 'ellipse', icon: <Circle size={20} />, label: 'Ellipse', shortcut: 'E' },
  ];

  return (
    <aside className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-2 gap-1">
      {tools.map((tool) => (
        <ToolButton
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          shortcut={tool.shortcut}
          isActive={activeTool === tool.id}
          onClick={() => setActiveTool(tool.id)}
        />
      ))}
    </aside>
  );
}
```

### Hit Testing

```typescript
// src/lib/geometry/hitTest.ts

import { Point } from '@/types/common';
import { Shape } from '@/types/shapes';

/**
 * Check if a point is inside a shape
 */
export function hitTestShape(point: Point, shape: Shape): boolean {
  switch (shape.type) {
    case 'rectangle':
      return hitTestRectangle(point, shape);
    case 'ellipse':
      return hitTestEllipse(point, shape);
    default:
      return false;
  }
}

/**
 * Check if point is inside rectangle bounds
 */
function hitTestRectangle(point: Point, shape: Shape): boolean {
  const { x, y, width, height, strokeWidth } = shape;
  const padding = strokeWidth / 2;

  return (
    point.x >= x - padding &&
    point.x <= x + width + padding &&
    point.y >= y - padding &&
    point.y <= y + height + padding
  );
}

/**
 * Check if point is inside ellipse
 */
function hitTestEllipse(point: Point, shape: Shape): boolean {
  const { x, y, width, height, strokeWidth } = shape;

  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2 + strokeWidth / 2;
  const ry = height / 2 + strokeWidth / 2;

  // Ellipse equation: (px-cx)²/rx² + (py-cy)²/ry² <= 1
  const dx = point.x - cx;
  const dy = point.y - cy;

  return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
}

/**
 * Find topmost shape at point (respecting z-order)
 */
export function findShapeAtPoint(
  point: Point,
  shapes: Shape[]
): Shape | null {
  // Sort by zIndex descending (top shapes first)
  const sortedShapes = [...shapes].sort((a, b) => b.zIndex - a.zIndex);

  for (const shape of sortedShapes) {
    if (shape.visible && hitTestShape(point, shape)) {
      return shape;
    }
  }

  return null;
}
```

---

## Key Decisions

### Decision 1: Shape Storage

**Decision:** Store shapes in a Record<string, Shape> keyed by ID

**Rationale:**
- O(1) lookup by ID
- Easy to update individual shapes
- Simple to convert to array when needed
- Compatible with immutable updates

### Decision 2: Creation State

**Decision:** Store creation state in uiStore, not component state

**Rationale:**
- Accessible from multiple components
- Persists across component re-renders
- Can be used for undo/redo later
- Cleaner component code

### Decision 3: Selection After Creation

**Decision:** Automatically select newly created shapes

**Rationale:**
- Matches user expectation
- Allows immediate manipulation
- Standard UX in drawing apps

### Decision 4: Click vs Drag Detection

**Decision:** Use minimum size threshold (5px) to distinguish click from drag

**Rationale:**
- Simple to implement
- Handles small accidental movements
- Consistent with other drawing apps

---

## Testing Approach

### Unit Tests

```typescript
// src/lib/geometry/__tests__/hitTest.test.ts

import { hitTestShape, findShapeAtPoint } from '../hitTest';

describe('hitTestRectangle', () => {
  const rect: Shape = {
    id: 'test',
    type: 'rectangle',
    x: 100,
    y: 100,
    width: 100,
    height: 50,
    // ... other props
  };

  test('returns true for point inside', () => {
    expect(hitTestShape({ x: 150, y: 125 }, rect)).toBe(true);
  });

  test('returns false for point outside', () => {
    expect(hitTestShape({ x: 50, y: 50 }, rect)).toBe(false);
  });

  test('returns true for point on edge', () => {
    expect(hitTestShape({ x: 100, y: 100 }, rect)).toBe(true);
  });
});

describe('hitTestEllipse', () => {
  const ellipse: Shape = {
    id: 'test',
    type: 'ellipse',
    x: 100,
    y: 100,
    width: 100,
    height: 50,
    // ... other props
  };

  test('returns true for point at center', () => {
    expect(hitTestShape({ x: 150, y: 125 }, ellipse)).toBe(true);
  });

  test('returns false for corner of bounding box', () => {
    expect(hitTestShape({ x: 100, y: 100 }, ellipse)).toBe(false);
  });
});
```

### E2E Tests

```typescript
// tests/e2e/shapes.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shape Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('creates rectangle by clicking', async ({ page }) => {
    // Select rectangle tool
    await page.click('[data-tool="rectangle"]');

    // Click on canvas
    await page.click('[data-testid="canvas-container"]', {
      position: { x: 200, y: 200 },
    });

    // Verify rectangle exists
    const rect = page.locator('svg rect').first();
    await expect(rect).toBeVisible();
  });

  test('creates rectangle by dragging', async ({ page }) => {
    await page.click('[data-tool="rectangle"]');

    const canvas = page.locator('[data-testid="canvas-container"]');
    await canvas.hover({ position: { x: 100, y: 100 } });
    await page.mouse.down();
    await page.mouse.move(250, 200);
    await page.mouse.up();

    const rect = page.locator('svg rect').first();
    await expect(rect).toHaveAttribute('width', '150');
    await expect(rect).toHaveAttribute('height', '100');
  });

  test('selects shape on click', async ({ page }) => {
    // Create and select rectangle
    await page.click('[data-tool="rectangle"]');
    await page.click('[data-testid="canvas-container"]');

    // Switch to select tool
    await page.keyboard.press('v');

    // Click on shape
    await page.click('svg rect');

    // Verify selection handles visible
    const handles = page.locator('.selection-handles rect');
    await expect(handles).toHaveCount(8);
  });
});
```

---

## Performance Considerations

1. **Memoize shape components**
   - Use React.memo to prevent unnecessary re-renders
   - Shapes only re-render when their data changes

2. **Efficient hit testing**
   - Check bounding box first before precise ellipse test
   - Sort shapes by zIndex once, not on every click

3. **Batch store updates**
   - Single state update for shape creation
   - Avoid multiple re-renders

4. **SVG rendering**
   - Use simple shapes (rect, ellipse) not paths
   - Minimize DOM nodes

---

## Accessibility

- Tool buttons have aria-labels
- Keyboard shortcuts documented in tooltips
- Selection state announced (future)
- Focus management for keyboard navigation
