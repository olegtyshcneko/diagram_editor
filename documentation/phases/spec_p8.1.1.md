# Phase 8.1.1: Group Resize & Rotation - Technical Specification

## Technical Architecture

### Component Hierarchy Changes

```
App
├── Canvas
│   ├── ShapeRenderer
│   │   ├── ShapeLayer
│   │   │   ├── InteractiveSelectionHandles (modified - hide when in group)
│   │   │   └── ...
│   ├── GroupOverlay (modified - add interactive handles)
│   │   └── InteractiveGroupHandles (new)
│   └── GroupEditMode
└── ...
```

### State Management

No new stores required. Modifications to existing stores:

```typescript
// interactionStore.ts - Extend manipulation state for group operations
interface ManipulationState {
  // ... existing fields
  type: 'move' | 'resize' | 'rotate' | 'group-resize' | 'group-rotate';
  groupId?: string;           // For group manipulations
  startShapeStates?: Record<string, {  // For tracking all shapes in group
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  }>;
}
```

---

## Files to Create

### New Files

```
src/
├── hooks/
│   └── manipulation/
│       ├── useGroupResize.ts        # Group resize logic
│       └── useGroupRotate.ts        # Group rotation logic
├── components/
│   └── canvas/
│       └── InteractiveGroupHandles.tsx  # Interactive resize/rotation handles for groups
└── lib/
    └── geometry/
        └── groupTransform.ts        # Group transformation calculations
```

### Files to Modify

```
src/
├── stores/
│   └── interactionStore.ts          # Extend ManipulationState
├── components/
│   ├── canvas/
│   │   └── GroupOverlay.tsx         # Integrate InteractiveGroupHandles
│   └── shapes/
│       └── ShapeLayer.tsx           # Hide individual handles when group selected
├── hooks/
│   ├── manipulation/
│   │   └── index.ts                 # Export new hooks
│   └── useKeyboardShortcuts.ts      # Remove Escape handler for group edit
└── types/
    └── interaction.ts               # Add group manipulation types
```

---

## Key Interfaces & Types

### Extended Types

```typescript
// types/interaction.ts - Add to existing file

export type ManipulationType =
  | 'move'
  | 'resize'
  | 'rotate'
  | 'group-resize'
  | 'group-rotate';

export interface GroupManipulationState {
  type: 'group-resize' | 'group-rotate';
  groupId: string;
  startPoint: Point;
  startBounds: Bounds;                // Group bounding box at start
  startShapeStates: Record<string, ShapeState>;  // All member shapes' initial state
  handle?: HandleType;                // For resize
  startAngle?: number;                // For rotation
}

export interface ShapeState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}
```

---

## Implementation Order

### Step 1: Type Extensions
1. Extend `ManipulationType` in `types/interaction.ts`
2. Add `GroupManipulationState` interface
3. Extend `ManipulationState` in `interactionStore.ts`

### Step 2: Group Transform Utilities
4. Create `lib/geometry/groupTransform.ts`:
   - `scaleShapesInGroup(shapes, groupBounds, newBounds, handle)`
   - `rotateShapesAroundCenter(shapes, center, angleDelta)`

### Step 3: Group Resize Hook
5. Create `hooks/manipulation/useGroupResize.ts`:
   - `handleGroupResizeStart(e, handle, groupBounds, memberShapes)`
   - `handleGroupResizeUpdate(e, shiftHeld, altHeld)`
   - `handleGroupResizeEnd()`

### Step 4: Group Rotation Hook
6. Create `hooks/manipulation/useGroupRotate.ts`:
   - `handleGroupRotateStart(e, groupBounds, memberShapes)`
   - `handleGroupRotateUpdate(e, shiftHeld)`
   - `handleGroupRotateEnd()`

### Step 5: Interactive Group Handles Component
7. Create `components/canvas/InteractiveGroupHandles.tsx`:
   - Render 8 resize handles on group bounds
   - Render rotation handle above group
   - Wire up mouse event handlers

### Step 6: Integrate into GroupOverlay
8. Modify `GroupOverlay.tsx`:
   - Import and render `InteractiveGroupHandles`
   - Pass group bounds and member shapes

### Step 7: Hide Individual Handles
9. Modify `ShapeLayer.tsx`:
   - Detect when shape is part of a fully-selected group
   - Hide `InteractiveSelectionHandles` for grouped shapes
   - Show only when in group edit mode

### Step 8: Group Edit Mode Exit Behavior
10. Modify `useKeyboardShortcuts.ts`:
    - Remove Escape key handler for exiting group edit mode
11. Verify click-outside behavior already works (implemented in P8.1)
    - Canvas click handler should call `exitGroupEdit()` when clicking outside

### Step 9: History Integration
12. Update hooks to push proper history entries for group resize/rotate

---

## Code Patterns

### Group Transform Utilities

```typescript
// lib/geometry/groupTransform.ts
import type { Shape } from '@/types/shapes';
import type { Bounds, Point } from '@/types/common';
import type { HandleType } from '@/types/interaction';

export interface ShapeState {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Scale all shapes proportionally when resizing a group.
 * Each shape's position (relative to group) and dimensions are scaled.
 */
export function scaleShapesInGroup(
  startStates: Record<string, ShapeState>,
  startGroupBounds: Bounds,
  newGroupBounds: Bounds,
  handle: HandleType
): Record<string, Partial<Shape>> {
  const updates: Record<string, Partial<Shape>> = {};

  // Calculate scale factors
  const scaleX = newGroupBounds.width / startGroupBounds.width;
  const scaleY = newGroupBounds.height / startGroupBounds.height;

  // Determine anchor point based on handle
  // The opposite corner/edge from the handle stays fixed
  const anchor = getAnchorPoint(startGroupBounds, handle);
  const newAnchor = getAnchorPoint(newGroupBounds, handle);

  for (const [shapeId, state] of Object.entries(startStates)) {
    // Calculate shape center relative to anchor
    const shapeCenterX = state.x + state.width / 2;
    const shapeCenterY = state.y + state.height / 2;

    // Scale the relative position
    const relX = shapeCenterX - anchor.x;
    const relY = shapeCenterY - anchor.y;

    const newRelX = relX * scaleX;
    const newRelY = relY * scaleY;

    // Calculate new center position
    const newCenterX = newAnchor.x + newRelX;
    const newCenterY = newAnchor.y + newRelY;

    // Scale dimensions
    const newWidth = Math.max(10, state.width * scaleX);
    const newHeight = Math.max(10, state.height * scaleY);

    // Calculate new top-left position
    updates[shapeId] = {
      x: Math.round(newCenterX - newWidth / 2),
      y: Math.round(newCenterY - newHeight / 2),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };
  }

  return updates;
}

/**
 * Get the anchor point (opposite to the handle being dragged)
 */
function getAnchorPoint(bounds: Bounds, handle: HandleType): Point {
  const { x, y, width, height } = bounds;

  switch (handle) {
    case 'nw': return { x: x + width, y: y + height };  // Anchor at SE
    case 'n':  return { x: x + width / 2, y: y + height };  // Anchor at S center
    case 'ne': return { x, y: y + height };  // Anchor at SW
    case 'e':  return { x, y: y + height / 2 };  // Anchor at W center
    case 'se': return { x, y };  // Anchor at NW
    case 's':  return { x: x + width / 2, y };  // Anchor at N center
    case 'sw': return { x: x + width, y };  // Anchor at NE
    case 'w':  return { x: x + width, y: y + height / 2 };  // Anchor at E center
    default:   return { x: x + width / 2, y: y + height / 2 };  // Center
  }
}

/**
 * Rotate all shapes around a center point.
 * Updates both position and rotation for each shape.
 */
export function rotateShapesAroundCenter(
  startStates: Record<string, ShapeState>,
  center: Point,
  angleDelta: number
): Record<string, Partial<Shape>> {
  const updates: Record<string, Partial<Shape>> = {};
  const radians = (angleDelta * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  for (const [shapeId, state] of Object.entries(startStates)) {
    // Get shape center
    const shapeCenterX = state.x + state.width / 2;
    const shapeCenterY = state.y + state.height / 2;

    // Translate to origin (group center)
    const relX = shapeCenterX - center.x;
    const relY = shapeCenterY - center.y;

    // Rotate around origin
    const rotatedX = relX * cos - relY * sin;
    const rotatedY = relX * sin + relY * cos;

    // Translate back
    const newCenterX = rotatedX + center.x;
    const newCenterY = rotatedY + center.y;

    // Update position (keep dimensions same)
    updates[shapeId] = {
      x: Math.round(newCenterX - state.width / 2),
      y: Math.round(newCenterY - state.height / 2),
      // Add angle delta to shape's own rotation
      rotation: normalizeAngle(state.rotation + angleDelta),
    };
  }

  return updates;
}

function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) normalized += 360;
  return Math.round(normalized);
}

/**
 * Calculate group bounds that accounts for uniform scaling with Shift key
 */
export function calculateUniformGroupResize(
  startBounds: Bounds,
  newBounds: Bounds,
  handle: HandleType
): Bounds {
  const startAspect = startBounds.width / startBounds.height;
  const newWidth = newBounds.width;
  const newHeight = newBounds.height;

  // Determine which scale factor to use based on which changed more
  const widthScale = newWidth / startBounds.width;
  const heightScale = newHeight / startBounds.height;
  const scale = Math.abs(widthScale - 1) > Math.abs(heightScale - 1)
    ? widthScale
    : heightScale;

  const uniformWidth = startBounds.width * scale;
  const uniformHeight = startBounds.height * scale;

  // Adjust position based on handle
  const anchor = getAnchorPoint(startBounds, handle);
  let x = newBounds.x;
  let y = newBounds.y;

  // Recalculate position to maintain anchor
  if (handle.includes('w')) {
    x = anchor.x - uniformWidth;
  }
  if (handle.includes('n')) {
    y = anchor.y - uniformHeight;
  }

  return { x, y, width: uniformWidth, height: uniformHeight };
}
```

### Group Resize Hook

```typescript
// hooks/manipulation/useGroupResize.ts
import { useCallback, useRef } from 'react';
import type { Bounds, Point } from '@/types/common';
import type { HandleType } from '@/types/interaction';
import type { Shape } from '@/types/shapes';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { usePreferencesStore } from '@/stores/preferencesStore';
import {
  scaleShapesInGroup,
  calculateUniformGroupResize,
  type ShapeState
} from '@/lib/geometry/groupTransform';
import { calculateResize } from '@/lib/geometry/resize';
import { snapToGrid } from '@/lib/geometry/snap';
import { SHAPE_DEFAULTS } from '@/lib/constants';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

interface UseGroupResizeOptions {
  groupId: string;
  memberIds: string[];
}

export function useGroupResize({ groupId, memberIds }: UseGroupResizeOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const shapes = useDiagramStore((s) => s.shapes);
  const viewport = useViewportStore((s) => s.viewport);
  const startManipulation = useInteractionStore((s) => s.startManipulation);
  const endManipulation = useInteractionStore((s) => s.endManipulation);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const snapEnabled = usePreferencesStore((s) => s.snapToGrid);
  const gridSize = usePreferencesStore((s) => s.gridSize);

  const selectionAtStartRef = useRef<string[]>([]);
  const startShapeStatesRef = useRef<Record<string, ShapeState>>({});

  const handleGroupResizeStart = useCallback((
    e: React.MouseEvent,
    handle: HandleType,
    groupBounds: Bounds
  ) => {
    e.stopPropagation();

    // Capture start state for all member shapes
    const startStates: Record<string, ShapeState> = {};
    for (const id of memberIds) {
      const shape = shapes[id];
      if (shape) {
        startStates[id] = {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rotation: shape.rotation,
        };
      }
    }
    startShapeStatesRef.current = startStates;
    selectionAtStartRef.current = [...selectedShapeIds];

    startManipulation({
      type: 'group-resize',
      shapeId: groupId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: groupBounds,
      startRotation: 0,
      handle,
      aspectRatio: groupBounds.width / groupBounds.height,
    });
  }, [groupId, memberIds, shapes, startManipulation, selectedShapeIds]);

  const handleGroupResizeUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean,
    altHeld: boolean
  ) => {
    const manipState = useInteractionStore.getState().manipulationState;
    if (!manipState || manipState.type !== 'group-resize' || !manipState.handle) {
      return;
    }

    const { startPoint, startBounds, handle, aspectRatio } = manipState;
    const startStates = startShapeStatesRef.current;

    // Calculate delta in canvas space
    const delta: Point = {
      x: (e.clientX - startPoint.x) / viewport.zoom,
      y: (e.clientY - startPoint.y) / viewport.zoom,
    };

    // Calculate new group bounds
    let newBounds = calculateResize(
      startBounds,
      handle,
      delta,
      {
        maintainAspectRatio: shiftHeld,
        resizeFromCenter: altHeld,
        originalAspectRatio: aspectRatio || startBounds.width / startBounds.height,
        minSize: SHAPE_DEFAULTS.MIN_SIZE,
      }
    );

    // Apply grid snapping to group bounds
    if (snapEnabled && !altHeld) {
      newBounds = {
        x: snapToGrid(newBounds.x, gridSize),
        y: snapToGrid(newBounds.y, gridSize),
        width: snapToGrid(newBounds.x + newBounds.width, gridSize) - snapToGrid(newBounds.x, gridSize),
        height: snapToGrid(newBounds.y + newBounds.height, gridSize) - snapToGrid(newBounds.y, gridSize),
      };
    }

    // Scale all member shapes
    const updates = scaleShapesInGroup(startStates, startBounds, newBounds, handle);

    // Apply updates to all shapes
    for (const [shapeId, update] of Object.entries(updates)) {
      updateShape(shapeId, update);
    }
  }, [viewport.zoom, updateShape, snapEnabled, gridSize]);

  const handleGroupResizeEnd = useCallback(() => {
    const manipState = useInteractionStore.getState().manipulationState;
    const startStates = startShapeStatesRef.current;

    if (manipState && manipState.type === 'group-resize' && Object.keys(startStates).length > 0) {
      const currentShapes = useDiagramStore.getState().shapes;
      const modified: Array<{
        id: string;
        before: Partial<Shape>;
        after: Partial<Shape>;
      }> = [];

      // Build modification list for all changed shapes
      for (const [shapeId, startState] of Object.entries(startStates)) {
        const currentShape = currentShapes[shapeId];
        if (currentShape) {
          const hasChange =
            currentShape.x !== startState.x ||
            currentShape.y !== startState.y ||
            currentShape.width !== startState.width ||
            currentShape.height !== startState.height;

          if (hasChange) {
            modified.push({
              id: shapeId,
              before: {
                x: startState.x,
                y: startState.y,
                width: startState.width,
                height: startState.height,
              },
              after: {
                x: currentShape.x,
                y: currentShape.y,
                width: currentShape.width,
                height: currentShape.height,
              },
            });
          }
        }
      }

      if (modified.length > 0) {
        const selection = selectionAtStartRef.current.length > 0
          ? selectionAtStartRef.current
          : useDiagramStore.getState().selectedShapeIds;

        pushEntry({
          type: 'RESIZE_SHAPE',
          description: `Resize ${modified.length} shapes`,
          shapeDelta: {
            added: [],
            removed: [],
            modified,
          },
          connectionDelta: EMPTY_CONNECTION_DELTA,
          selectionBefore: selection,
          selectionAfter: selection,
        });
      }
    }

    // Clear refs
    startShapeStatesRef.current = {};
    selectionAtStartRef.current = [];
    endManipulation();
  }, [endManipulation, pushEntry]);

  return {
    handleGroupResizeStart,
    handleGroupResizeUpdate,
    handleGroupResizeEnd,
  };
}
```

### Group Rotation Hook

```typescript
// hooks/manipulation/useGroupRotate.ts
import { useCallback, useRef } from 'react';
import type { Bounds } from '@/types/common';
import type { Shape } from '@/types/shapes';
import { useDiagramStore } from '@/stores/diagramStore';
import { useViewportStore } from '@/stores/viewportStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import {
  rotateShapesAroundCenter,
  type ShapeState,
} from '@/lib/geometry/groupTransform';
import {
  calculateAngle,
  snapAngle,
  getBoundsCenter,
  normalizeAngle,
} from '@/lib/geometry/manipulation';
import { MANIPULATION } from '@/lib/constants';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';

interface UseGroupRotateOptions {
  groupId: string;
  memberIds: string[];
}

export function useGroupRotate({ groupId, memberIds }: UseGroupRotateOptions) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const shapes = useDiagramStore((s) => s.shapes);
  const viewport = useViewportStore((s) => s.viewport);
  const startManipulation = useInteractionStore((s) => s.startManipulation);
  const endManipulation = useInteractionStore((s) => s.endManipulation);
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  const selectionAtStartRef = useRef<string[]>([]);
  const startShapeStatesRef = useRef<Record<string, ShapeState>>({});
  const startAngleRef = useRef<number>(0);
  const groupCenterRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleGroupRotateStart = useCallback((
    e: React.MouseEvent,
    groupBounds: Bounds
  ) => {
    e.stopPropagation();

    // Calculate and store group center
    const center = getBoundsCenter(groupBounds);
    groupCenterRef.current = center;

    // Calculate starting angle from center to cursor
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;
    startAngleRef.current = calculateAngle(center, { x: canvasX, y: canvasY });

    // Capture start state for all member shapes
    const startStates: Record<string, ShapeState> = {};
    for (const id of memberIds) {
      const shape = shapes[id];
      if (shape) {
        startStates[id] = {
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rotation: shape.rotation,
        };
      }
    }
    startShapeStatesRef.current = startStates;
    selectionAtStartRef.current = [...selectedShapeIds];

    startManipulation({
      type: 'group-rotate',
      shapeId: groupId,
      startPoint: { x: e.clientX, y: e.clientY },
      startBounds: groupBounds,
      startRotation: 0,  // Group rotation is relative
      handle: 'rotation',
    });
  }, [groupId, memberIds, shapes, viewport, startManipulation, selectedShapeIds]);

  const handleGroupRotateUpdate = useCallback((
    e: MouseEvent,
    shiftHeld: boolean
  ) => {
    const manipState = useInteractionStore.getState().manipulationState;
    if (!manipState || manipState.type !== 'group-rotate') {
      return;
    }

    const startStates = startShapeStatesRef.current;
    const center = groupCenterRef.current;

    // Convert cursor to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;

    // Calculate current angle and delta
    const currentAngle = calculateAngle(center, { x: canvasX, y: canvasY });
    let angleDelta = currentAngle - startAngleRef.current;

    // Apply snapping if Shift held
    if (shiftHeld) {
      // Snap the total rotation, not just delta
      const snappedTotal = snapAngle(angleDelta, MANIPULATION.ROTATION_SNAP_DEGREES);
      angleDelta = snappedTotal;
    }

    // Rotate all shapes around group center
    const updates = rotateShapesAroundCenter(startStates, center, angleDelta);

    // Apply updates to all shapes
    for (const [shapeId, update] of Object.entries(updates)) {
      updateShape(shapeId, update);
    }
  }, [viewport, updateShape]);

  const handleGroupRotateEnd = useCallback(() => {
    const manipState = useInteractionStore.getState().manipulationState;
    const startStates = startShapeStatesRef.current;

    if (manipState && manipState.type === 'group-rotate' && Object.keys(startStates).length > 0) {
      const currentShapes = useDiagramStore.getState().shapes;
      const modified: Array<{
        id: string;
        before: Partial<Shape>;
        after: Partial<Shape>;
      }> = [];

      // Build modification list for all changed shapes
      for (const [shapeId, startState] of Object.entries(startStates)) {
        const currentShape = currentShapes[shapeId];
        if (currentShape) {
          const hasChange =
            currentShape.x !== startState.x ||
            currentShape.y !== startState.y ||
            currentShape.rotation !== startState.rotation;

          if (hasChange) {
            modified.push({
              id: shapeId,
              before: {
                x: startState.x,
                y: startState.y,
                rotation: startState.rotation,
              },
              after: {
                x: currentShape.x,
                y: currentShape.y,
                rotation: currentShape.rotation,
              },
            });
          }
        }
      }

      if (modified.length > 0) {
        const selection = selectionAtStartRef.current.length > 0
          ? selectionAtStartRef.current
          : useDiagramStore.getState().selectedShapeIds;

        pushEntry({
          type: 'ROTATE_SHAPE',
          description: `Rotate ${modified.length} shapes`,
          shapeDelta: {
            added: [],
            removed: [],
            modified,
          },
          connectionDelta: EMPTY_CONNECTION_DELTA,
          selectionBefore: selection,
          selectionAfter: selection,
        });
      }
    }

    // Clear refs
    startShapeStatesRef.current = {};
    selectionAtStartRef.current = [];
    startAngleRef.current = 0;
    groupCenterRef.current = { x: 0, y: 0 };
    endManipulation();
  }, [endManipulation, pushEntry]);

  return {
    handleGroupRotateStart,
    handleGroupRotateUpdate,
    handleGroupRotateEnd,
  };
}
```

### Interactive Group Handles Component

```typescript
// components/canvas/InteractiveGroupHandles.tsx
import React, { memo, useMemo, useCallback, useEffect } from 'react';
import type { Shape } from '@/types/shapes';
import type { HandleType } from '@/types/interaction';
import { calculateGroupBounds } from '@/lib/groupUtils';
import { getHandlePositions, getRotationHandlePosition } from '@/lib/geometry/manipulation';
import { useGroupResize } from '@/hooks/manipulation/useGroupResize';
import { useGroupRotate } from '@/hooks/manipulation/useGroupRotate';
import { useInteractionStore } from '@/stores/interactionStore';
import { COLORS, MANIPULATION } from '@/lib/constants';

interface InteractiveGroupHandlesProps {
  groupId: string;
  memberIds: string[];
  memberShapes: Shape[];
}

const { HANDLE_SIZE, ROTATION_HANDLE_OFFSET } = MANIPULATION;

export const InteractiveGroupHandles = memo(function InteractiveGroupHandles({
  groupId,
  memberIds,
  memberShapes,
}: InteractiveGroupHandlesProps) {
  const bounds = useMemo(
    () => calculateGroupBounds(memberShapes),
    [memberShapes]
  );

  const { handleGroupResizeStart, handleGroupResizeUpdate, handleGroupResizeEnd } =
    useGroupResize({ groupId, memberIds });

  const { handleGroupRotateStart, handleGroupRotateUpdate, handleGroupRotateEnd } =
    useGroupRotate({ groupId, memberIds });

  const manipulationState = useInteractionStore((s) => s.manipulationState);
  const isResizing = manipulationState?.type === 'group-resize';
  const isRotating = manipulationState?.type === 'group-rotate';
  const isManipulating = isResizing || isRotating;

  // Handle mouse move/up during manipulation
  useEffect(() => {
    if (!isManipulating) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        handleGroupResizeUpdate(e, e.shiftKey, e.altKey);
      } else if (isRotating) {
        handleGroupRotateUpdate(e, e.shiftKey);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        handleGroupResizeEnd();
      } else if (isRotating) {
        handleGroupRotateEnd();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isManipulating,
    isResizing,
    isRotating,
    handleGroupResizeUpdate,
    handleGroupResizeEnd,
    handleGroupRotateUpdate,
    handleGroupRotateEnd,
  ]);

  // Handle positions
  const handlePositions = useMemo(
    () => getHandlePositions(bounds),
    [bounds]
  );

  const rotationHandle = useMemo(
    () => getRotationHandlePosition(bounds, ROTATION_HANDLE_OFFSET),
    [bounds]
  );

  const halfHandle = HANDLE_SIZE / 2;

  // Resize handle mouse down
  const onResizeHandleMouseDown = useCallback(
    (e: React.MouseEvent, handle: HandleType) => {
      handleGroupResizeStart(e, handle, bounds);
    },
    [handleGroupResizeStart, bounds]
  );

  // Rotation handle mouse down
  const onRotationHandleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleGroupRotateStart(e, bounds);
    },
    [handleGroupRotateStart, bounds]
  );

  return (
    <g className="group-handles">
      {/* Selection outline */}
      <rect
        x={bounds.x - 1}
        y={bounds.y - 1}
        width={bounds.width + 2}
        height={bounds.height + 2}
        fill="none"
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* Rotation handle connector line and handle */}
      <line
        x1={bounds.x + bounds.width / 2}
        y1={bounds.y}
        x2={rotationHandle.x}
        y2={rotationHandle.y}
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        pointerEvents="none"
      />
      <circle
        cx={rotationHandle.x}
        cy={rotationHandle.y}
        r={halfHandle + 1}
        fill={isRotating ? COLORS.SELECTION : 'white'}
        stroke={COLORS.SELECTION}
        strokeWidth={2}
        style={{ cursor: 'grab' }}
        onMouseDown={onRotationHandleMouseDown}
      />

      {/* Resize handles */}
      {handlePositions.map((handle) => (
        <rect
          key={handle.type}
          x={handle.x - halfHandle}
          y={handle.y - halfHandle}
          width={HANDLE_SIZE}
          height={HANDLE_SIZE}
          fill={isResizing ? COLORS.SELECTION : 'white'}
          stroke={COLORS.SELECTION}
          strokeWidth={1}
          style={{ cursor: handle.cursor }}
          onMouseDown={(e) => onResizeHandleMouseDown(e, handle.type as HandleType)}
        />
      ))}
    </g>
  );
});
```

### Modified GroupOverlay

```typescript
// components/canvas/GroupOverlay.tsx (modified)
import React, { useMemo } from 'react';
import { useGroupStore } from '@/stores/groupStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { calculateGroupBounds } from '@/lib/groupUtils';
import { InteractiveGroupHandles } from './InteractiveGroupHandles';

export const GroupOverlay: React.FC = React.memo(() => {
  const groups = useGroupStore((s) => s.groups);
  const editingGroupId = useGroupStore((s) => s.editingGroupId);
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  // Find all groups that are fully selected
  const selectedGroups = useMemo(() => {
    const result: {
      groupId: string;
      memberIds: string[];
      memberShapes: typeof shapes[string][];
    }[] = [];

    for (const group of Object.values(groups)) {
      // Skip the group being edited
      if (group.id === editingGroupId) continue;

      // Check if all members of this group are selected
      const allMembersSelected = group.memberIds.every((id) =>
        selectedShapeIds.includes(id)
      );

      if (allMembersSelected && group.memberIds.length > 0) {
        const memberShapes = group.memberIds
          .map((id) => shapes[id])
          .filter(Boolean);

        if (memberShapes.length > 0) {
          result.push({
            groupId: group.id,
            memberIds: group.memberIds,
            memberShapes,
          });
        }
      }
    }

    return result;
  }, [groups, editingGroupId, shapes, selectedShapeIds]);

  if (selectedGroups.length === 0) return null;

  return (
    <g className="group-overlays">
      {selectedGroups.map(({ groupId, memberIds, memberShapes }) => (
        <InteractiveGroupHandles
          key={groupId}
          groupId={groupId}
          memberIds={memberIds}
          memberShapes={memberShapes}
        />
      ))}
    </g>
  );
});

GroupOverlay.displayName = 'GroupOverlay';
```

### Group Edit Mode Exit Behavior Changes

```typescript
// useKeyboardShortcuts.ts - REMOVE this block:

// OLD CODE TO REMOVE:
// Escape to exit group edit mode
// if (e.key === 'Escape' && editingGroupId) {
//   exitGroupEdit();
//   return;
// }

// The click-outside behavior is already implemented in P8.1 via:
// - useGroupAwareSelection.ts handleShapeClick() - exits when clicking outside group
// - Canvas click handler - should exit when clicking empty canvas

// Ensure canvas click handler exits group edit mode:
// In Canvas.tsx or useSelection.ts:
const handleCanvasClick = (e: React.MouseEvent) => {
  // ... existing logic

  // Exit group edit mode when clicking on empty canvas
  const editingGroupId = useGroupStore.getState().editingGroupId;
  if (editingGroupId) {
    useGroupStore.getState().exitGroupEdit();
  }

  // ... rest of selection logic
};
```

### ShapeLayer Modification (Hide Individual Handles)

```typescript
// In ShapeLayer.tsx - modify the render logic

// Add this function to check if shape is in a fully-selected group
function isShapeInSelectedGroup(
  shapeId: string,
  selectedShapeIds: string[],
  groups: Record<string, Group>,
  editingGroupId: string | null
): boolean {
  // If in edit mode, show individual handles
  if (editingGroupId) {
    const editingGroup = groups[editingGroupId];
    if (editingGroup?.memberIds.includes(shapeId)) {
      return false; // Show individual handles in edit mode
    }
  }

  // Check if this shape is part of any fully-selected group
  for (const group of Object.values(groups)) {
    if (group.memberIds.includes(shapeId)) {
      const allMembersSelected = group.memberIds.every((id) =>
        selectedShapeIds.includes(id)
      );
      if (allMembersSelected) {
        return true; // Hide individual handles, group handles will show
      }
    }
  }

  return false;
}

// In the render:
const hideIndividualHandles = isShapeInSelectedGroup(
  shape.id,
  selectedShapeIds,
  groups,
  editingGroupId
);

// Conditional rendering of handles
{isSelected && !hideIndividualHandles && (
  <InteractiveSelectionHandles shape={shape} />
)}
```

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/groupTransform.test.ts
describe('groupTransform', () => {
  describe('scaleShapesInGroup', () => {
    it('should scale shapes proportionally from SE corner', () => {
      const startStates = {
        shape1: { x: 10, y: 10, width: 50, height: 50, rotation: 0 },
        shape2: { x: 70, y: 70, width: 50, height: 50, rotation: 0 },
      };
      const startBounds = { x: 10, y: 10, width: 110, height: 110 };
      const newBounds = { x: 10, y: 10, width: 220, height: 220 }; // 2x scale

      const updates = scaleShapesInGroup(startStates, startBounds, newBounds, 'se');

      // Shape1 should be at (10, 10) with size (100, 100)
      expect(updates.shape1.width).toBe(100);
      expect(updates.shape1.height).toBe(100);

      // Shape2 should be at relative 2x position
      expect(updates.shape2.width).toBe(100);
      expect(updates.shape2.height).toBe(100);
    });
  });

  describe('rotateShapesAroundCenter', () => {
    it('should rotate shapes around group center', () => {
      const startStates = {
        shape1: { x: 0, y: 0, width: 50, height: 50, rotation: 0 },
      };
      const center = { x: 100, y: 100 };

      const updates = rotateShapesAroundCenter(startStates, center, 90);

      // Shape center was at (25, 25), after 90° rotation around (100, 100)
      // relative position (-75, -75) rotates to (75, -75)
      // new center should be at (175, 25)
      expect(updates.shape1.rotation).toBe(90);
    });
  });
});
```

---

## Verification Checklist

### Unified Selection
- [ ] Clicking grouped shape shows group bounding box with handles
- [ ] Individual shape handles are hidden when group is selected
- [ ] In edit mode, individual handles are shown
- [ ] 8 resize handles visible on group bounds
- [ ] Rotation handle visible above group

### Group Resize
- [ ] Dragging corner handle scales all shapes
- [ ] Shapes maintain relative positions
- [ ] Shapes maintain relative sizes
- [ ] Shift key maintains aspect ratio
- [ ] Alt key scales from center
- [ ] Minimum size enforced per shape
- [ ] Grid snapping works
- [ ] Nested groups scale correctly

### Group Rotation
- [ ] Rotation handle rotates all shapes
- [ ] Shapes rotate around group center
- [ ] Shape positions update correctly
- [ ] Shape rotations update correctly
- [ ] Shift key snaps to 15°
- [ ] Nested groups rotate correctly

### Group Edit Mode Exit
- [ ] Clicking empty canvas exits group edit mode
- [ ] Clicking ungrouped shape exits edit mode and selects it
- [ ] Escape key does NOT exit group edit mode
- [ ] Clicking inside group (in edit mode) does NOT exit

### History
- [ ] Ctrl+Z undoes group resize
- [ ] Ctrl+Z undoes group rotation
- [ ] Ctrl+Y redoes operations
- [ ] History description shows shape count

---

## Performance Considerations

### Batched Updates
When resizing/rotating a group with many shapes, batch the state updates:

```typescript
// Instead of multiple updateShape calls:
useDiagramStore.getState().batchUpdateShapes(updates);

// Add to diagramStore:
batchUpdateShapes: (updates: Record<string, Partial<Shape>>) => {
  set((state) => {
    const newShapes = { ...state.shapes };
    for (const [id, update] of Object.entries(updates)) {
      if (newShapes[id]) {
        newShapes[id] = { ...newShapes[id], ...update };
      }
    }
    return { shapes: newShapes };
  });
}
```

### Memoization
- Memoize group bounds calculation
- Memoize handle positions
- Use React.memo for handle components

---

## Accessibility

- Announce "Resizing group" / "Rotating group" during manipulation
- Keyboard support for group resize (future enhancement)
- Focus management on group handles
