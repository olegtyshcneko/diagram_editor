# Phase 3: Shape Manipulation - Technical Specification

## Document Information

| Field | Value |
|-------|-------|
| Phase | 3 |
| Status | Draft |
| Dependencies | Phase 0-2 |
| Estimated Files | 8-10 new/modified |

---

## Technical Architecture

### Component Hierarchy

```
Canvas.tsx
├── ShapeLayer.tsx
│   ├── RectangleShape.tsx
│   └── EllipseShape.tsx
├── SelectionLayer.tsx (extended)
│   └── InteractiveSelectionHandles.tsx (new)
└── InteractionLayer.tsx (new)
    ├── MoveHandler
    ├── ResizeHandler
    └── RotateHandler
```

### State Management Changes

**UI Store Extensions:**
```typescript
interface UIState {
  // Existing
  activeTool: ToolType;
  viewport: Viewport;
  isSpacePressed: boolean;
  isPanning: boolean;
  creationState: CreationState | null;

  // New for Phase 3
  manipulationState: ManipulationState | null;
  activeHandle: HandleType | null;
}
```

**Diagram Store Extensions:**
```typescript
interface DiagramState {
  // Existing actions
  addShape: (shape: Partial<Shape>) => string;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  setSelectedShapeIds: (ids: string[]) => void;

  // New actions for Phase 3
  moveShape: (id: string, deltaX: number, deltaY: number) => void;
  resizeShape: (id: string, bounds: Bounds) => void;
  rotateShape: (id: string, angle: number) => void;
  deleteSelectedShapes: () => void;
}
```

---

## Files to Create

### New Files

| File Path | Purpose |
|-----------|---------|
| `src/hooks/useShapeManipulation.ts` | Main manipulation hook |
| `src/hooks/useShapeMove.ts` | Move operation logic |
| `src/hooks/useShapeResize.ts` | Resize operation logic |
| `src/hooks/useShapeRotate.ts` | Rotation operation logic |
| `src/hooks/useKeyboardShortcuts.ts` | Arrow keys and delete handling |
| `src/components/canvas/InteractiveSelectionHandles.tsx` | Clickable handles |
| `src/lib/geometry.ts` | Geometry calculation utilities |
| `src/lib/resize-utils.ts` | Resize calculation utilities |
| `src/lib/rotation-utils.ts` | Rotation calculation utilities |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `src/stores/uiStore.ts` | Add manipulation state |
| `src/stores/diagramStore.ts` | Add manipulation actions |
| `src/types/interaction.ts` | Add manipulation types |
| `src/components/canvas/Canvas.tsx` | Add interaction handling |
| `src/components/canvas/SelectionHandles.tsx` | Replace with interactive version |
| `src/lib/constants.ts` | Add manipulation constants |

---

## Key Interfaces & Types

### Manipulation Types

```typescript
// src/types/interaction.ts

export type HandleType =
  | 'nw' | 'n' | 'ne'    // Top row
  | 'w'  |      'e'       // Middle row
  | 'sw' | 's' | 'se'    // Bottom row
  | 'rotation';           // Rotation handle

export type ManipulationType = 'move' | 'resize' | 'rotate';

export interface ManipulationState {
  type: ManipulationType;
  shapeId: string;
  startPoint: Point;        // Screen coordinates at drag start
  startBounds: Bounds;      // Shape bounds at drag start
  startRotation: number;    // Shape rotation at drag start
  handle?: HandleType;      // Which handle is being dragged (resize/rotate)
  aspectRatio?: number;     // Original aspect ratio (for constrained resize)
}

export interface HandlePosition {
  type: HandleType;
  x: number;
  y: number;
  cursor: string;
}

export interface ResizeResult {
  x: number;
  y: number;
  width: number;
  height: number;
}
```

### Constants

```typescript
// src/lib/constants.ts (additions)

export const MANIPULATION_DEFAULTS = {
  MIN_SIZE: 10,                    // Minimum width/height in pixels
  HANDLE_SIZE: 8,                  // Handle square size
  HANDLE_HIT_AREA: 12,             // Clickable area around handle
  ROTATION_HANDLE_OFFSET: 30,      // Distance above shape for rotation handle
  ROTATION_SNAP_DEGREES: 15,       // Snap increment when Shift held
  ARROW_KEY_MOVE: 1,               // Pixels per arrow key press
  ARROW_KEY_MOVE_SHIFT: 10,        // Pixels per Shift+arrow
} as const;

export const CURSOR_MAP: Record<HandleType, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
  rotation: 'grab',
};
```

---

## Implementation Order

### Step 1: Types and Constants

Add manipulation-related types and constants.

**Files:** `src/types/interaction.ts`, `src/lib/constants.ts`

### Step 2: Geometry Utilities

Create geometry calculation utilities for manipulation operations.

**File:** `src/lib/geometry.ts`

```typescript
import { Point, Bounds } from '@/types/common';

/**
 * Get the center point of a bounds rectangle
 */
export function getBoundsCenter(bounds: Bounds): Point {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Calculate angle in degrees from center to point
 */
export function calculateAngle(center: Point, point: Point): number {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  // atan2 returns radians, convert to degrees
  // Adjust by 90 degrees since rotation handle is above the shape
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  // Normalize to 0-360 range
  while (angle < 0) angle += 360;
  while (angle >= 360) angle -= 360;

  return angle;
}

/**
 * Snap angle to increment (e.g., 15 degrees)
 */
export function snapAngle(angle: number, increment: number): number {
  return Math.round(angle / increment) * increment;
}

/**
 * Calculate delta movement constrained to single axis
 */
export function constrainToAxis(
  delta: Point,
  threshold: number = 5
): Point {
  // Determine dominant axis
  if (Math.abs(delta.x) > Math.abs(delta.y) + threshold) {
    return { x: delta.x, y: 0 };
  } else if (Math.abs(delta.y) > Math.abs(delta.x) + threshold) {
    return { x: 0, y: delta.y };
  }
  // When close to 45 degrees, use raw delta initially
  return Math.abs(delta.x) > Math.abs(delta.y)
    ? { x: delta.x, y: 0 }
    : { x: 0, y: delta.y };
}

/**
 * Get handle positions for a shape's bounding box
 */
export function getHandlePositions(
  bounds: Bounds,
  handleSize: number
): HandlePosition[] {
  const { x, y, width, height } = bounds;
  const half = handleSize / 2;

  return [
    { type: 'nw', x: x - half, y: y - half, cursor: 'nwse-resize' },
    { type: 'n',  x: x + width / 2 - half, y: y - half, cursor: 'ns-resize' },
    { type: 'ne', x: x + width - half, y: y - half, cursor: 'nesw-resize' },
    { type: 'w',  x: x - half, y: y + height / 2 - half, cursor: 'ew-resize' },
    { type: 'e',  x: x + width - half, y: y + height / 2 - half, cursor: 'ew-resize' },
    { type: 'sw', x: x - half, y: y + height - half, cursor: 'nesw-resize' },
    { type: 's',  x: x + width / 2 - half, y: y + height - half, cursor: 'ns-resize' },
    { type: 'se', x: x + width - half, y: y + height - half, cursor: 'nwse-resize' },
  ];
}

/**
 * Get rotation handle position (above top-center)
 */
export function getRotationHandlePosition(
  bounds: Bounds,
  offset: number
): Point {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y - offset,
  };
}
```

### Step 3: Resize Utilities

Create dedicated resize calculation utilities.

**File:** `src/lib/resize-utils.ts`

```typescript
import { Point, Bounds } from '@/types/common';
import { HandleType, ResizeResult } from '@/types/interaction';
import { MANIPULATION_DEFAULTS } from './constants';

const { MIN_SIZE } = MANIPULATION_DEFAULTS;

interface ResizeOptions {
  maintainAspectRatio: boolean;
  resizeFromCenter: boolean;
  originalAspectRatio: number;
}

/**
 * Calculate new bounds based on handle drag
 */
export function calculateResize(
  startBounds: Bounds,
  handle: HandleType,
  delta: Point,
  options: ResizeOptions
): ResizeResult {
  const { maintainAspectRatio, resizeFromCenter, originalAspectRatio } = options;

  let { x, y, width, height } = startBounds;
  let newX = x;
  let newY = y;
  let newWidth = width;
  let newHeight = height;

  // Calculate raw resize based on handle
  switch (handle) {
    case 'nw':
      newX = x + delta.x;
      newY = y + delta.y;
      newWidth = width - delta.x;
      newHeight = height - delta.y;
      break;
    case 'n':
      newY = y + delta.y;
      newHeight = height - delta.y;
      break;
    case 'ne':
      newY = y + delta.y;
      newWidth = width + delta.x;
      newHeight = height - delta.y;
      break;
    case 'w':
      newX = x + delta.x;
      newWidth = width - delta.x;
      break;
    case 'e':
      newWidth = width + delta.x;
      break;
    case 'sw':
      newX = x + delta.x;
      newWidth = width - delta.x;
      newHeight = height + delta.y;
      break;
    case 's':
      newHeight = height + delta.y;
      break;
    case 'se':
      newWidth = width + delta.x;
      newHeight = height + delta.y;
      break;
  }

  // Apply aspect ratio constraint
  if (maintainAspectRatio && isCornerHandle(handle)) {
    const result = applyAspectRatio(
      { x: newX, y: newY, width: newWidth, height: newHeight },
      startBounds,
      handle,
      originalAspectRatio
    );
    newX = result.x;
    newY = result.y;
    newWidth = result.width;
    newHeight = result.height;
  }

  // Apply minimum size constraints
  const constrained = enforceMinimumSize(
    { x: newX, y: newY, width: newWidth, height: newHeight },
    startBounds,
    handle
  );
  newX = constrained.x;
  newY = constrained.y;
  newWidth = constrained.width;
  newHeight = constrained.height;

  // Apply center resize if Alt is held
  if (resizeFromCenter) {
    const result = applyResizeFromCenter(
      { x: newX, y: newY, width: newWidth, height: newHeight },
      startBounds
    );
    newX = result.x;
    newY = result.y;
    newWidth = result.width;
    newHeight = result.height;
  }

  return { x: newX, y: newY, width: newWidth, height: newHeight };
}

function isCornerHandle(handle: HandleType): boolean {
  return ['nw', 'ne', 'sw', 'se'].includes(handle);
}

function applyAspectRatio(
  newBounds: Bounds,
  startBounds: Bounds,
  handle: HandleType,
  aspectRatio: number
): Bounds {
  let { x, y, width, height } = newBounds;

  // Determine which dimension to adjust based on the larger change
  const widthChange = Math.abs(width - startBounds.width);
  const heightChange = Math.abs(height - startBounds.height);

  if (widthChange > heightChange) {
    // Adjust height to match aspect ratio
    const targetHeight = width / aspectRatio;
    const heightDiff = targetHeight - height;

    if (handle === 'nw' || handle === 'ne') {
      y -= heightDiff;
    }
    height = targetHeight;
  } else {
    // Adjust width to match aspect ratio
    const targetWidth = height * aspectRatio;
    const widthDiff = targetWidth - width;

    if (handle === 'nw' || handle === 'sw') {
      x -= widthDiff;
    }
    width = targetWidth;
  }

  return { x, y, width, height };
}

function enforceMinimumSize(
  newBounds: Bounds,
  startBounds: Bounds,
  handle: HandleType
): Bounds {
  let { x, y, width, height } = newBounds;

  // Enforce minimum width
  if (width < MIN_SIZE) {
    width = MIN_SIZE;
    // Adjust position based on which handle was dragged
    if (handle.includes('w')) {
      x = startBounds.x + startBounds.width - MIN_SIZE;
    }
  }

  // Enforce minimum height
  if (height < MIN_SIZE) {
    height = MIN_SIZE;
    // Adjust position based on which handle was dragged
    if (handle.includes('n')) {
      y = startBounds.y + startBounds.height - MIN_SIZE;
    }
  }

  return { x, y, width, height };
}

function applyResizeFromCenter(
  newBounds: Bounds,
  startBounds: Bounds
): Bounds {
  // Calculate how much the bounds changed
  const widthDelta = newBounds.width - startBounds.width;
  const heightDelta = newBounds.height - startBounds.height;

  // Apply the change symmetrically from center
  return {
    x: startBounds.x - widthDelta / 2,
    y: startBounds.y - heightDelta / 2,
    width: startBounds.width + widthDelta,
    height: startBounds.height + heightDelta,
  };
}
```

### Step 4: Store Extensions

Extend stores with manipulation state and actions.

**File:** `src/stores/uiStore.ts` (additions)

```typescript
import { ManipulationState, HandleType } from '@/types/interaction';

interface UIState {
  // ... existing state

  // Manipulation state
  manipulationState: ManipulationState | null;
  activeHandle: HandleType | null;

  // Manipulation actions
  startManipulation: (state: ManipulationState) => void;
  updateManipulation: (updates: Partial<ManipulationState>) => void;
  endManipulation: () => void;
  setActiveHandle: (handle: HandleType | null) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  // ... existing state and actions

  manipulationState: null,
  activeHandle: null,

  startManipulation: (manipState) => set({
    manipulationState: manipState,
    activeHandle: manipState.handle ?? null,
  }),

  updateManipulation: (updates) => set((state) => ({
    manipulationState: state.manipulationState
      ? { ...state.manipulationState, ...updates }
      : null,
  })),

  endManipulation: () => set({
    manipulationState: null,
    activeHandle: null,
  }),

  setActiveHandle: (handle) => set({ activeHandle: handle }),
}));
```

**File:** `src/stores/diagramStore.ts` (additions)

```typescript
interface DiagramState {
  // ... existing state and actions

  // Manipulation actions
  moveShape: (id: string, deltaX: number, deltaY: number) => void;
  resizeShape: (id: string, bounds: Bounds) => void;
  rotateShape: (id: string, angle: number) => void;
  deleteSelectedShapes: () => void;
}

export const useDiagramStore = create<DiagramState>()((set, get) => ({
  // ... existing implementation

  moveShape: (id, deltaX, deltaY) => set((state) => {
    const shape = state.shapes[id];
    if (!shape || shape.locked) return state;

    return {
      shapes: {
        ...state.shapes,
        [id]: {
          ...shape,
          x: shape.x + deltaX,
          y: shape.y + deltaY,
        },
      },
    };
  }),

  resizeShape: (id, bounds) => set((state) => {
    const shape = state.shapes[id];
    if (!shape || shape.locked) return state;

    return {
      shapes: {
        ...state.shapes,
        [id]: {
          ...shape,
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height,
        },
      },
    };
  }),

  rotateShape: (id, angle) => set((state) => {
    const shape = state.shapes[id];
    if (!shape || shape.locked) return state;

    return {
      shapes: {
        ...state.shapes,
        [id]: {
          ...shape,
          rotation: angle,
        },
      },
    };
  }),

  deleteSelectedShapes: () => set((state) => {
    const { selectedShapeIds, shapes } = state;
    if (selectedShapeIds.length === 0) return state;

    const newShapes = { ...shapes };
    for (const id of selectedShapeIds) {
      delete newShapes[id];
    }

    return {
      shapes: newShapes,
      selectedShapeIds: [],
    };
  }),
}));
```

### Step 5: Shape Move Hook

Create dedicated hook for move operations.

**File:** `src/hooks/useShapeMove.ts`

```typescript
import { useCallback, useRef } from 'react';
import { Point } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { constrainToAxis } from '@/lib/geometry';
import { screenToCanvas } from '@/lib/viewport';

interface UseMoveOptions {
  shapeId: string;
}

export function useShapeMove({ shapeId }: UseMoveOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useUIStore((s) => s.viewport);
  const startManipulation = useUIStore((s) => s.startManipulation);
  const endManipulation = useUIStore((s) => s.endManipulation);

  const startPointRef = useRef<Point | null>(null);
  const startPositionRef = useRef<Point | null>(null);

  const handleMoveStart = useCallback((
    e: React.MouseEvent,
    shape: { x: number; y: number; width: number; height: number }
  ) => {
    e.stopPropagation();

    startPointRef.current = { x: e.clientX, y: e.clientY };
    startPositionRef.current = { x: shape.x, y: shape.y };

    startManipulation({
      type: 'move',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: shape,
      startRotation: 0,
    });
  }, [shapeId, startManipulation]);

  const handleMoveUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    if (!startPointRef.current || !startPositionRef.current) return;

    // Calculate delta in screen space
    let delta: Point = {
      x: e.clientX - startPointRef.current.x,
      y: e.clientY - startPointRef.current.y,
    };

    // Apply axis constraint if Shift is held
    if (shiftHeld) {
      delta = constrainToAxis(delta);
    }

    // Scale delta by zoom level to get canvas-space movement
    const scaledDelta: Point = {
      x: delta.x / viewport.zoom,
      y: delta.y / viewport.zoom,
    };

    // Calculate new position
    const newX = startPositionRef.current.x + scaledDelta.x;
    const newY = startPositionRef.current.y + scaledDelta.y;

    updateShape(shapeId, { x: newX, y: newY });
  }, [shapeId, viewport.zoom, updateShape]);

  const handleMoveEnd = useCallback(() => {
    startPointRef.current = null;
    startPositionRef.current = null;
    endManipulation();
  }, [endManipulation]);

  return {
    handleMoveStart,
    handleMoveUpdate,
    handleMoveEnd,
  };
}
```

### Step 6: Shape Resize Hook

Create dedicated hook for resize operations.

**File:** `src/hooks/useShapeResize.ts`

```typescript
import { useCallback, useRef } from 'react';
import { Point, Bounds } from '@/types/common';
import { HandleType } from '@/types/interaction';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { calculateResize } from '@/lib/resize-utils';

interface UseResizeOptions {
  shapeId: string;
}

export function useShapeResize({ shapeId }: UseResizeOptions) {
  const resizeShape = useDiagramStore((s) => s.resizeShape);
  const viewport = useUIStore((s) => s.viewport);
  const startManipulation = useUIStore((s) => s.startManipulation);
  const endManipulation = useUIStore((s) => s.endManipulation);

  const startPointRef = useRef<Point | null>(null);
  const startBoundsRef = useRef<Bounds | null>(null);
  const handleRef = useRef<HandleType | null>(null);
  const aspectRatioRef = useRef<number>(1);

  const handleResizeStart = useCallback((
    e: React.MouseEvent,
    handle: HandleType,
    bounds: Bounds
  ) => {
    e.stopPropagation();

    startPointRef.current = { x: e.clientX, y: e.clientY };
    startBoundsRef.current = bounds;
    handleRef.current = handle;
    aspectRatioRef.current = bounds.width / bounds.height;

    startManipulation({
      type: 'resize',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: 0,
      handle,
      aspectRatio: bounds.width / bounds.height,
    });
  }, [shapeId, startManipulation]);

  const handleResizeUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean,
    altHeld: boolean
  ) => {
    if (!startPointRef.current || !startBoundsRef.current || !handleRef.current) {
      return;
    }

    // Calculate delta in screen space, scaled by zoom
    const delta: Point = {
      x: (e.clientX - startPointRef.current.x) / viewport.zoom,
      y: (e.clientY - startPointRef.current.y) / viewport.zoom,
    };

    const newBounds = calculateResize(
      startBoundsRef.current,
      handleRef.current,
      delta,
      {
        maintainAspectRatio: shiftHeld,
        resizeFromCenter: altHeld,
        originalAspectRatio: aspectRatioRef.current,
      }
    );

    resizeShape(shapeId, newBounds);
  }, [shapeId, viewport.zoom, resizeShape]);

  const handleResizeEnd = useCallback(() => {
    startPointRef.current = null;
    startBoundsRef.current = null;
    handleRef.current = null;
    endManipulation();
  }, [endManipulation]);

  return {
    handleResizeStart,
    handleResizeUpdate,
    handleResizeEnd,
  };
}
```

### Step 7: Shape Rotate Hook

Create dedicated hook for rotation operations.

**File:** `src/hooks/useShapeRotate.ts`

```typescript
import { useCallback, useRef } from 'react';
import { Point, Bounds } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { calculateAngle, snapAngle, getBoundsCenter } from '@/lib/geometry';
import { MANIPULATION_DEFAULTS } from '@/lib/constants';

const { ROTATION_SNAP_DEGREES } = MANIPULATION_DEFAULTS;

interface UseRotateOptions {
  shapeId: string;
}

export function useShapeRotate({ shapeId }: UseRotateOptions) {
  const rotateShape = useDiagramStore((s) => s.rotateShape);
  const viewport = useUIStore((s) => s.viewport);
  const startManipulation = useUIStore((s) => s.startManipulation);
  const endManipulation = useUIStore((s) => s.endManipulation);

  const centerRef = useRef<Point | null>(null);
  const startAngleRef = useRef<number>(0);
  const initialRotationRef = useRef<number>(0);

  const handleRotateStart = useCallback((
    e: React.MouseEvent,
    bounds: Bounds,
    currentRotation: number
  ) => {
    e.stopPropagation();

    // Calculate center in canvas coordinates
    const center = getBoundsCenter(bounds);
    centerRef.current = center;
    initialRotationRef.current = currentRotation;

    // Calculate starting angle from center to cursor
    // Convert cursor position to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;
    startAngleRef.current = calculateAngle(center, { x: canvasX, y: canvasY });

    startManipulation({
      type: 'rotate',
      shapeId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: bounds,
      startRotation: currentRotation,
      handle: 'rotation',
    });
  }, [shapeId, viewport, startManipulation]);

  const handleRotateUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    if (!centerRef.current) return;

    // Convert cursor to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;

    // Calculate current angle from center to cursor
    const currentAngle = calculateAngle(centerRef.current, { x: canvasX, y: canvasY });

    // Calculate rotation delta
    let angleDelta = currentAngle - startAngleRef.current;

    // Calculate new rotation
    let newRotation = initialRotationRef.current + angleDelta;

    // Normalize to 0-360 range
    while (newRotation < 0) newRotation += 360;
    while (newRotation >= 360) newRotation -= 360;

    // Apply snapping if Shift is held
    if (shiftHeld) {
      newRotation = snapAngle(newRotation, ROTATION_SNAP_DEGREES);
    }

    rotateShape(shapeId, newRotation);
  }, [shapeId, viewport, rotateShape]);

  const handleRotateEnd = useCallback(() => {
    centerRef.current = null;
    endManipulation();
  }, [endManipulation]);

  return {
    handleRotateStart,
    handleRotateUpdate,
    handleRotateEnd,
  };
}
```

### Step 8: Keyboard Shortcuts Hook

Create hook for arrow key movement and delete.

**File:** `src/hooks/useKeyboardShortcuts.ts`

```typescript
import { useEffect, useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { MANIPULATION_DEFAULTS } from '@/lib/constants';

const { ARROW_KEY_MOVE, ARROW_KEY_MOVE_SHIFT } = MANIPULATION_DEFAULTS;

export function useKeyboardShortcuts() {
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const shapes = useDiagramStore((s) => s.shapes);
  const moveShape = useDiagramStore((s) => s.moveShape);
  const deleteSelectedShapes = useDiagramStore((s) => s.deleteSelectedShapes);
  const activeTool = useUIStore((s) => s.activeTool);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if focus is in an input element
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const hasSelection = selectedShapeIds.length > 0;

    // Arrow key movement
    if (hasSelection && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();

      const moveAmount = e.shiftKey ? ARROW_KEY_MOVE_SHIFT : ARROW_KEY_MOVE;

      let deltaX = 0;
      let deltaY = 0;

      switch (e.key) {
        case 'ArrowUp':
          deltaY = -moveAmount;
          break;
        case 'ArrowDown':
          deltaY = moveAmount;
          break;
        case 'ArrowLeft':
          deltaX = -moveAmount;
          break;
        case 'ArrowRight':
          deltaX = moveAmount;
          break;
      }

      // Move all selected shapes
      for (const id of selectedShapeIds) {
        const shape = shapes[id];
        if (shape && !shape.locked) {
          moveShape(id, deltaX, deltaY);
        }
      }
    }

    // Delete/Backspace
    if (hasSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      deleteSelectedShapes();
    }
  }, [selectedShapeIds, shapes, moveShape, deleteSelectedShapes]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

### Step 9: Interactive Selection Handles Component

Replace static handles with interactive ones.

**File:** `src/components/canvas/InteractiveSelectionHandles.tsx`

```typescript
import React, { useCallback, useMemo } from 'react';
import { Shape } from '@/types/shape';
import { HandleType, HandlePosition } from '@/types/interaction';
import { getHandlePositions, getRotationHandlePosition } from '@/lib/geometry';
import { MANIPULATION_DEFAULTS, CURSOR_MAP } from '@/lib/constants';
import { useUIStore } from '@/stores/uiStore';

const { HANDLE_SIZE, ROTATION_HANDLE_OFFSET } = MANIPULATION_DEFAULTS;

interface Props {
  shape: Shape;
  onResizeStart: (e: React.MouseEvent, handle: HandleType) => void;
  onRotateStart: (e: React.MouseEvent) => void;
}

export function InteractiveSelectionHandles({
  shape,
  onResizeStart,
  onRotateStart,
}: Props) {
  const activeHandle = useUIStore((s) => s.activeHandle);

  const bounds = useMemo(() => ({
    x: shape.x,
    y: shape.y,
    width: shape.width,
    height: shape.height,
  }), [shape.x, shape.y, shape.width, shape.height]);

  const handles = useMemo(
    () => getHandlePositions(bounds, HANDLE_SIZE),
    [bounds]
  );

  const rotationHandle = useMemo(
    () => getRotationHandlePosition(bounds, ROTATION_HANDLE_OFFSET),
    [bounds]
  );

  const handleMouseDown = useCallback((
    e: React.MouseEvent,
    handleType: HandleType
  ) => {
    if (handleType === 'rotation') {
      onRotateStart(e);
    } else {
      onResizeStart(e, handleType);
    }
  }, [onResizeStart, onRotateStart]);

  return (
    <g className="selection-handles">
      {/* Selection outline */}
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.width}
        height={shape.height}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={1}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* Rotation handle connector line */}
      <line
        x1={bounds.x + bounds.width / 2}
        y1={bounds.y}
        x2={rotationHandle.x}
        y2={rotationHandle.y}
        stroke="#3B82F6"
        strokeWidth={1}
        pointerEvents="none"
      />

      {/* Rotation handle */}
      <circle
        cx={rotationHandle.x}
        cy={rotationHandle.y}
        r={HANDLE_SIZE / 2}
        fill="white"
        stroke="#3B82F6"
        strokeWidth={2}
        style={{ cursor: 'grab' }}
        onMouseDown={(e) => handleMouseDown(e, 'rotation')}
      />

      {/* Resize handles */}
      {handles.map((handle) => (
        <rect
          key={handle.type}
          x={handle.x}
          y={handle.y}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill={activeHandle === handle.type ? '#3B82F6' : 'white'}
          stroke="#3B82F6"
          strokeWidth={2}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => handleMouseDown(e, handle.type)}
        />
      ))}
    </g>
  );
}
```

### Step 10: Unified Shape Manipulation Hook

Create main hook that coordinates all manipulation operations.

**File:** `src/hooks/useShapeManipulation.ts`

```typescript
import { useCallback, useEffect, useRef } from 'react';
import { Shape } from '@/types/shape';
import { HandleType } from '@/types/interaction';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { useShapeMove } from './useShapeMove';
import { useShapeResize } from './useShapeResize';
import { useShapeRotate } from './useShapeRotate';

interface UseShapeManipulationOptions {
  shape: Shape;
}

export function useShapeManipulation({ shape }: UseShapeManipulationOptions) {
  const manipulationState = useUIStore((s) => s.manipulationState);
  const activeTool = useUIStore((s) => s.activeTool);

  const modifiersRef = useRef({ shift: false, alt: false });

  const { handleMoveStart, handleMoveUpdate, handleMoveEnd } = useShapeMove({
    shapeId: shape.id,
  });

  const { handleResizeStart, handleResizeUpdate, handleResizeEnd } = useShapeResize({
    shapeId: shape.id,
  });

  const { handleRotateStart, handleRotateUpdate, handleRotateEnd } = useShapeRotate({
    shapeId: shape.id,
  });

  // Track modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      modifiersRef.current.shift = e.shiftKey;
      modifiersRef.current.alt = e.altKey;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      modifiersRef.current.shift = e.shiftKey;
      modifiersRef.current.alt = e.altKey;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse move/up handlers
  useEffect(() => {
    if (!manipulationState || manipulationState.shapeId !== shape.id) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const { shift, alt } = modifiersRef.current;

      switch (manipulationState.type) {
        case 'move':
          handleMoveUpdate(e, shift);
          break;
        case 'resize':
          handleResizeUpdate(e, shift, alt);
          break;
        case 'rotate':
          handleRotateUpdate(e, shift);
          break;
      }
    };

    const handleMouseUp = () => {
      switch (manipulationState.type) {
        case 'move':
          handleMoveEnd();
          break;
        case 'resize':
          handleResizeEnd();
          break;
        case 'rotate':
          handleRotateEnd();
          break;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    manipulationState,
    shape.id,
    handleMoveUpdate,
    handleMoveEnd,
    handleResizeUpdate,
    handleResizeEnd,
    handleRotateUpdate,
    handleRotateEnd,
  ]);

  // Start move on shape body drag
  const onShapeMouseDown = useCallback((e: React.MouseEvent) => {
    if (activeTool !== 'select') return;
    if (shape.locked) return;

    handleMoveStart(e, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    });
  }, [activeTool, shape, handleMoveStart]);

  // Start resize on handle drag
  const onResizeHandleMouseDown = useCallback((
    e: React.MouseEvent,
    handle: HandleType
  ) => {
    if (shape.locked) return;

    handleResizeStart(e, handle, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    });
  }, [shape, handleResizeStart]);

  // Start rotation on rotation handle drag
  const onRotationHandleMouseDown = useCallback((e: React.MouseEvent) => {
    if (shape.locked) return;

    handleRotateStart(e, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
    }, shape.rotation);
  }, [shape, handleRotateStart]);

  return {
    onShapeMouseDown,
    onResizeHandleMouseDown,
    onRotationHandleMouseDown,
    isManipulating: manipulationState?.shapeId === shape.id,
  };
}
```

### Step 11: Rotation Angle Display

Create component to show rotation angle during rotation.

**File:** `src/components/canvas/RotationAngleDisplay.tsx`

```typescript
import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useDiagramStore } from '@/stores/diagramStore';

export function RotationAngleDisplay() {
  const manipulationState = useUIStore((s) => s.manipulationState);
  const shapes = useDiagramStore((s) => s.shapes);

  // Only show during rotation
  if (manipulationState?.type !== 'rotate') {
    return null;
  }

  const shape = shapes[manipulationState.shapeId];
  if (!shape) return null;

  // Position near the shape
  const displayX = shape.x + shape.width / 2;
  const displayY = shape.y + shape.height + 25;

  const formattedAngle = Math.round(shape.rotation);

  return (
    <g className="rotation-display" pointerEvents="none">
      <rect
        x={displayX - 25}
        y={displayY - 10}
        width={50}
        height={20}
        rx={4}
        fill="rgba(0, 0, 0, 0.8)"
      />
      <text
        x={displayX}
        y={displayY + 5}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontFamily="system-ui"
      >
        {formattedAngle}°
      </text>
    </g>
  );
}
```

### Step 12: Update Shape Components

Update shape components to support rotation transform.

**File:** `src/components/shapes/RectangleShape.tsx` (updated)

```typescript
import React from 'react';
import { Shape } from '@/types/shape';
import { useShapeManipulation } from '@/hooks/useShapeManipulation';

interface Props {
  shape: Shape;
  isSelected: boolean;
}

export function RectangleShape({ shape, isSelected }: Props) {
  const { onShapeMouseDown } = useShapeManipulation({ shape });

  const {
    x, y, width, height, rotation,
    fill, fillOpacity, stroke, strokeWidth, strokeStyle,
    cornerRadius = 0,
  } = shape;

  // Calculate center for rotation transform
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const strokeDasharray = strokeStyle === 'dashed' ? '8 4'
    : strokeStyle === 'dotted' ? '2 2'
    : undefined;

  return (
    <g
      transform={rotation ? `rotate(${rotation}, ${centerX}, ${centerY})` : undefined}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={cornerRadius}
        ry={cornerRadius}
        fill={fill}
        fillOpacity={fillOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        style={{ cursor: isSelected ? 'move' : 'pointer' }}
        onMouseDown={onShapeMouseDown}
      />
    </g>
  );
}
```

### Step 13: Canvas Integration

Update Canvas component to integrate manipulation system.

**File:** `src/components/canvas/Canvas.tsx` (updates)

```typescript
import React from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { useViewport } from '@/hooks/useViewport';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShapeLayer } from './ShapeLayer';
import { SelectionLayer } from './SelectionLayer';
import { RotationAngleDisplay } from './RotationAngleDisplay';
import { calculateViewBox } from '@/lib/viewport';

export function Canvas() {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const viewport = useUIStore((s) => s.viewport);
  const manipulationState = useUIStore((s) => s.manipulationState);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Use custom hooks
  useViewport(containerRef);
  useKeyboardShortcuts();

  // Resize observer
  useEffect(() => {
    // ... existing resize observer code
  }, []);

  const viewBox = calculateViewBox(viewport, containerSize);

  // Determine cursor based on manipulation state
  const getCursor = () => {
    if (manipulationState) {
      switch (manipulationState.type) {
        case 'move': return 'move';
        case 'resize': return CURSOR_MAP[manipulationState.handle!] ?? 'default';
        case 'rotate': return 'grabbing';
      }
    }
    return 'default';
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden"
      style={{ cursor: getCursor() }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={viewBox}
        className="bg-gray-50"
      >
        {/* Shape rendering layer */}
        <ShapeLayer shapes={shapes} selectedShapeIds={selectedShapeIds} />

        {/* Selection handles layer */}
        <SelectionLayer
          shapes={shapes}
          selectedShapeIds={selectedShapeIds}
        />

        {/* Rotation angle display */}
        <RotationAngleDisplay />
      </svg>
    </div>
  );
}
```

---

## Code Patterns

### Pattern: Manipulation State Machine

```typescript
// Manipulation follows a state machine pattern:
// idle -> move/resize/rotate -> idle

type ManipulationPhase = 'idle' | 'active';

// Start: mousedown on shape body (move) or handle (resize/rotate)
// Update: mousemove while manipulating
// End: mouseup anywhere

// Key principle: Store start state, calculate deltas, apply to current
```

### Pattern: Modifier Key Handling

```typescript
// Modifiers are tracked via refs for real-time access during drag
const modifiersRef = useRef({ shift: false, alt: false });

// Updated on keydown/keyup
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    modifiersRef.current.shift = e.shiftKey;
    modifiersRef.current.alt = e.altKey;
  };
  // ... event listeners
}, []);

// Checked during drag updates
const handleDrag = (e: MouseEvent) => {
  if (modifiersRef.current.shift) {
    // Apply constraint
  }
};
```

### Pattern: Coordinate System Transforms

```typescript
// Screen to canvas conversion for manipulation deltas
const screenDelta = { x: e.clientX - startX, y: e.clientY - startY };
const canvasDelta = {
  x: screenDelta.x / viewport.zoom,
  y: screenDelta.y / viewport.zoom,
};

// Apply to start position (not current position) to avoid drift
const newX = startPosition.x + canvasDelta.x;
```

---

## Key Decisions

### 1. Axis-Aligned Handles for Rotated Shapes

**Decision:** Keep selection handles aligned to screen axes even for rotated shapes.

**Rationale:**
- Simpler implementation
- Matches draw.io behavior
- Easier hit testing
- Users can still resize rotated shapes effectively

**Trade-off:** Resize direction doesn't perfectly match visual orientation.

### 2. Separate Hooks per Operation

**Decision:** Create separate hooks for move, resize, and rotate operations.

**Rationale:**
- Clear separation of concerns
- Each operation has distinct logic
- Easier testing and maintenance
- Can be composed in different ways

### 3. Store Start State, Calculate From Delta

**Decision:** Store initial state at drag start, recalculate from original + delta each frame.

**Rationale:**
- Avoids floating point accumulation errors
- Makes undo/redo simpler (just restore start state on cancel)
- Consistent behavior regardless of frame rate

### 4. Global Mouse Events During Drag

**Decision:** Attach mousemove/mouseup to window during manipulation.

**Rationale:**
- Continues working even when cursor leaves shape/canvas
- Standard drag behavior users expect
- Prevents stuck drag states

---

## Testing Approach

### Unit Tests

**File:** `src/lib/__tests__/resize-utils.test.ts`

```typescript
import { calculateResize } from '../resize-utils';

describe('calculateResize', () => {
  const startBounds = { x: 100, y: 100, width: 200, height: 150 };

  describe('corner handles', () => {
    it('should resize from bottom-right', () => {
      const result = calculateResize(
        startBounds,
        'se',
        { x: 50, y: 30 },
        { maintainAspectRatio: false, resizeFromCenter: false, originalAspectRatio: 1 }
      );

      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
      expect(result.width).toBe(250);
      expect(result.height).toBe(180);
    });

    it('should resize from top-left and adjust position', () => {
      const result = calculateResize(
        startBounds,
        'nw',
        { x: -30, y: -20 },
        { maintainAspectRatio: false, resizeFromCenter: false, originalAspectRatio: 1 }
      );

      expect(result.x).toBe(70);
      expect(result.y).toBe(80);
      expect(result.width).toBe(230);
      expect(result.height).toBe(170);
    });
  });

  describe('minimum size enforcement', () => {
    it('should not allow width below minimum', () => {
      const result = calculateResize(
        startBounds,
        'e',
        { x: -195, y: 0 },
        { maintainAspectRatio: false, resizeFromCenter: false, originalAspectRatio: 1 }
      );

      expect(result.width).toBe(10); // MIN_SIZE
    });
  });

  describe('aspect ratio constraint', () => {
    it('should maintain aspect ratio when Shift held', () => {
      const aspectRatio = 200 / 150; // 4:3
      const result = calculateResize(
        startBounds,
        'se',
        { x: 100, y: 0 },
        { maintainAspectRatio: true, resizeFromCenter: false, originalAspectRatio: aspectRatio }
      );

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 2);
    });
  });
});
```

**File:** `src/lib/__tests__/geometry.test.ts`

```typescript
import { calculateAngle, snapAngle, constrainToAxis } from '../geometry';

describe('calculateAngle', () => {
  it('should calculate angle correctly', () => {
    const center = { x: 100, y: 100 };

    // Point directly above (should be ~0 degrees after 90° adjustment)
    expect(calculateAngle(center, { x: 100, y: 50 })).toBeCloseTo(0, 0);

    // Point to the right (should be ~90 degrees)
    expect(calculateAngle(center, { x: 150, y: 100 })).toBeCloseTo(90, 0);
  });
});

describe('snapAngle', () => {
  it('should snap to nearest increment', () => {
    expect(snapAngle(17, 15)).toBe(15);
    expect(snapAngle(23, 15)).toBe(30);
    expect(snapAngle(0, 15)).toBe(0);
  });
});

describe('constrainToAxis', () => {
  it('should constrain to horizontal when x is dominant', () => {
    const result = constrainToAxis({ x: 100, y: 20 });
    expect(result.x).toBe(100);
    expect(result.y).toBe(0);
  });

  it('should constrain to vertical when y is dominant', () => {
    const result = constrainToAxis({ x: 15, y: 100 });
    expect(result.x).toBe(0);
    expect(result.y).toBe(100);
  });
});
```

### Integration Tests

**File:** `src/__tests__/shape-manipulation.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Canvas } from '@/components/canvas/Canvas';
import { useDiagramStore } from '@/stores/diagramStore';

describe('Shape Manipulation', () => {
  beforeEach(() => {
    // Reset store
    useDiagramStore.setState({
      shapes: {},
      selectedShapeIds: [],
    });
  });

  describe('Move', () => {
    it('should move shape when dragging', async () => {
      // Add a shape
      useDiagramStore.getState().addShape({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });

      render(<Canvas />);

      const shape = screen.getByTestId('shape-...');

      // Simulate drag
      fireEvent.mouseDown(shape, { clientX: 150, clientY: 150 });
      fireEvent.mouseMove(window, { clientX: 250, clientY: 200 });
      fireEvent.mouseUp(window);

      // Verify position changed
      const shapes = useDiagramStore.getState().shapes;
      const updatedShape = Object.values(shapes)[0];
      expect(updatedShape.x).toBe(200); // 100 + 100 delta
      expect(updatedShape.y).toBe(150); // 100 + 50 delta
    });
  });

  describe('Delete', () => {
    it('should delete selected shape on Delete key', () => {
      const id = useDiagramStore.getState().addShape({
        type: 'rectangle',
        x: 100,
        y: 100,
        width: 200,
        height: 150,
      });

      useDiagramStore.getState().setSelectedShapeIds([id]);

      render(<Canvas />);

      fireEvent.keyDown(window, { key: 'Delete' });

      expect(useDiagramStore.getState().shapes[id]).toBeUndefined();
      expect(useDiagramStore.getState().selectedShapeIds).toHaveLength(0);
    });
  });
});
```

---

## Performance Considerations

### Optimization: Avoid Unnecessary Re-renders

```typescript
// Use selectors to minimize re-renders
const manipulationState = useUIStore(
  useCallback((s) => s.manipulationState, [])
);

// Only shape being manipulated needs to re-render during drag
const isManipulating = manipulationState?.shapeId === shape.id;
```

### Optimization: RAF for Smooth Updates

```typescript
// For very frequent updates, use requestAnimationFrame
const rafRef = useRef<number>();

const handleMouseMove = useCallback((e: MouseEvent) => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);

  rafRef.current = requestAnimationFrame(() => {
    // Update shape
  });
}, []);
```

### Target Metrics

| Operation | Target | Method |
|-----------|--------|--------|
| Move update | < 16ms | Direct store update |
| Resize calculation | < 5ms | Simple math |
| Rotation calculation | < 5ms | atan2 + normalization |
| Handle hover | < 16ms | CSS cursors |

---

## Accessibility Requirements

### Keyboard Navigation

- Arrow keys move selected shapes (1px / 10px with Shift)
- Delete/Backspace removes selected shapes
- Tab navigation through handles (future enhancement)

### Focus Management

- Selection handles should be focusable (future enhancement)
- Focus indicator on selected shapes
- Screen reader announcements for shape changes (future)

### Motion Sensitivity

- No animations during manipulation (direct feedback)
- Optional: Reduce motion preference support for smooth zoom

---

## Notes

### Handle Hit Testing

For rotated shapes, handles remain axis-aligned but use transformed coordinates for hit testing. The visual handle positions don't need to match exact shape corners when rotated.

### Rotation Origin

Shapes rotate around their geometric center (`x + width/2`, `y + height/2`). The SVG transform uses this as the rotation origin.

### Edge Cases

1. **Resize to negative dimensions**: Prevent by enforcing minimum size
2. **Rotation exceeds 360°**: Normalize to 0-360 range
3. **Very small shapes**: Handles may overlap; consider hiding some handles
4. **Locked shapes**: Check locked state before any manipulation
