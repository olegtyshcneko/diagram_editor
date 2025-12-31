# Phase 6: Multi-Selection & Advanced Manipulation - Technical Specification

## Document Information

| Field | Value |
|-------|-------|
| Phase | 6 |
| Status | Draft |
| Dependencies | Phase 0-5 |
| Estimated Files | 10-15 new/modified |

---

## Technical Architecture

### Component Hierarchy

```
Canvas.tsx
├── SelectionBoxLayer.tsx (new)
├── ShapeLayer.tsx
├── ConnectionLayer.tsx
└── SelectionLayer.tsx (updated for multi-selection)

PropertyPanel.tsx
└── Sections now handle multi-selection

ArrangeMenu.tsx (new)
├── AlignmentMenu.tsx
└── DistributionMenu.tsx
```

### State Management

**Diagram Store Extensions:**
```typescript
interface DiagramState {
  // Existing
  shapes: Record<string, Shape>;
  connections: Record<string, Connection>;
  selectedShapeIds: string[];

  // New for clipboard
  clipboard: ClipboardData | null;

  // Extended actions
  setSelectedShapeIds: (ids: string[]) => void;
  addToSelection: (ids: string[]) => void;
  removeFromSelection: (ids: string[]) => void;
  selectAll: () => void;
  copySelection: () => void;
  pasteClipboard: (offset?: Point) => void;
  cutSelection: () => void;
  duplicateSelection: () => void;
  alignShapes: (alignment: AlignmentType) => void;
  distributeShapes: (direction: 'horizontal' | 'vertical') => void;
}
```

**UI Store Extensions:**
```typescript
interface UIState {
  // Selection box state
  selectionBox: SelectionBoxState | null;
  startSelectionBox: (startPoint: Point) => void;
  updateSelectionBox: (currentPoint: Point) => void;
  endSelectionBox: () => void;
}
```

---

## Files to Create

### New Files

| File Path | Purpose |
|-----------|---------|
| `src/components/canvas/SelectionBoxLayer.tsx` | Render selection rectangle |
| `src/components/menus/ArrangeMenu.tsx` | Arrange menu with align/distribute |
| `src/components/menus/AlignmentSubmenu.tsx` | Alignment options |
| `src/components/menus/DistributionSubmenu.tsx` | Distribution options |
| `src/hooks/useSelectionBox.ts` | Selection box interaction logic |
| `src/hooks/useMultiSelection.ts` | Multi-selection management |
| `src/hooks/useClipboard.ts` | Copy/paste/duplicate logic |
| `src/lib/alignment-utils.ts` | Alignment calculation functions |
| `src/lib/distribution-utils.ts` | Distribution calculation functions |
| `src/lib/selection-utils.ts` | Selection geometry utilities |
| `src/types/clipboard.ts` | Clipboard data types |

### Modified Files

| File Path | Changes |
|-----------|---------|
| `src/stores/diagramStore.ts` | Add clipboard and selection actions |
| `src/stores/uiStore.ts` | Add selection box state |
| `src/components/canvas/Canvas.tsx` | Add selection box layer |
| `src/components/canvas/SelectionLayer.tsx` | Multi-selection bounding box |
| `src/hooks/useKeyboardShortcuts.ts` | Add copy/paste/duplicate shortcuts |
| `src/components/toolbar/Toolbar.tsx` | Add arrange menu |

---

## Key Interfaces & Types

### Selection Types

```typescript
// src/types/selection.ts

export interface SelectionBoxState {
  startPoint: Point;
  currentPoint: Point;
  isShiftHeld: boolean;
}

export type AlignmentType =
  | 'left'
  | 'centerHorizontal'
  | 'right'
  | 'top'
  | 'centerVertical'
  | 'bottom';

export interface SelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
```

### Clipboard Types

```typescript
// src/types/clipboard.ts

export interface ClipboardShape {
  // Shape data without id (new id generated on paste)
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  cornerRadius?: number;
  text?: string;
  textStyle: TextStyle;
  // Original ID for connection mapping
  originalId: string;
}

export interface ClipboardConnection {
  sourceOriginalId: string;
  targetOriginalId: string;
  sourceAnchor: AnchorPosition;
  targetAnchor: AnchorPosition;
  stroke: string;
  strokeWidth: number;
  startArrow: ArrowStyle;
  endArrow: ArrowStyle;
}

export interface ClipboardData {
  shapes: ClipboardShape[];
  connections: ClipboardConnection[];
  bounds: SelectionBounds;
  timestamp: number;
}
```

---

## Implementation Order

### Step 1: Selection Utilities

**File:** `src/lib/selection-utils.ts`

```typescript
import { Point, Bounds } from '@/types/common';
import { Shape } from '@/types/shape';
import { SelectionBounds } from '@/types/selection';

/**
 * Calculate bounding box of multiple shapes
 */
export function getSelectionBounds(shapes: Shape[]): SelectionBounds {
  if (shapes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  shapes.forEach((shape) => {
    minX = Math.min(minX, shape.x);
    minY = Math.min(minY, shape.y);
    maxX = Math.max(maxX, shape.x + shape.width);
    maxY = Math.max(maxY, shape.y + shape.height);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    minX,
    maxX,
    minY,
    maxY,
  };
}

/**
 * Check if a shape intersects with a selection box
 */
export function shapeIntersectsBox(
  shape: Shape,
  boxStart: Point,
  boxEnd: Point
): boolean {
  const boxMinX = Math.min(boxStart.x, boxEnd.x);
  const boxMaxX = Math.max(boxStart.x, boxEnd.x);
  const boxMinY = Math.min(boxStart.y, boxEnd.y);
  const boxMaxY = Math.max(boxStart.y, boxEnd.y);

  const shapeMinX = shape.x;
  const shapeMaxX = shape.x + shape.width;
  const shapeMinY = shape.y;
  const shapeMaxY = shape.y + shape.height;

  // Check if rectangles overlap
  return !(
    shapeMaxX < boxMinX ||
    shapeMinX > boxMaxX ||
    shapeMaxY < boxMinY ||
    shapeMinY > boxMaxY
  );
}

/**
 * Get all shapes that intersect with a selection box
 */
export function getShapesInBox(
  shapes: Record<string, Shape>,
  boxStart: Point,
  boxEnd: Point
): string[] {
  return Object.entries(shapes)
    .filter(([_, shape]) => shapeIntersectsBox(shape, boxStart, boxEnd))
    .map(([id]) => id);
}
```

### Step 2: Alignment Utilities

**File:** `src/lib/alignment-utils.ts`

```typescript
import { Shape } from '@/types/shape';
import { AlignmentType, SelectionBounds } from '@/types/selection';
import { getSelectionBounds } from './selection-utils';

export interface AlignmentUpdate {
  id: string;
  x?: number;
  y?: number;
}

/**
 * Calculate position updates for alignment
 */
export function calculateAlignment(
  shapes: Shape[],
  alignment: AlignmentType
): AlignmentUpdate[] {
  if (shapes.length < 2) return [];

  const bounds = getSelectionBounds(shapes);
  const updates: AlignmentUpdate[] = [];

  shapes.forEach((shape) => {
    const update: AlignmentUpdate = { id: shape.id };

    switch (alignment) {
      case 'left':
        update.x = bounds.minX;
        break;

      case 'centerHorizontal':
        const centerX = bounds.x + bounds.width / 2;
        update.x = centerX - shape.width / 2;
        break;

      case 'right':
        update.x = bounds.maxX - shape.width;
        break;

      case 'top':
        update.y = bounds.minY;
        break;

      case 'centerVertical':
        const centerY = bounds.y + bounds.height / 2;
        update.y = centerY - shape.height / 2;
        break;

      case 'bottom':
        update.y = bounds.maxY - shape.height;
        break;
    }

    updates.push(update);
  });

  return updates;
}
```

### Step 3: Distribution Utilities

**File:** `src/lib/distribution-utils.ts`

```typescript
import { Shape } from '@/types/shape';

export interface DistributionUpdate {
  id: string;
  x?: number;
  y?: number;
}

/**
 * Calculate position updates for horizontal distribution
 */
export function calculateHorizontalDistribution(
  shapes: Shape[]
): DistributionUpdate[] {
  if (shapes.length < 3) return [];

  // Sort by x position
  const sorted = [...shapes].sort((a, b) => a.x - b.x);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calculate total available space
  const totalSpace = last.x - first.x;

  // Calculate total width of all shapes except first and last
  const middleShapesWidth = sorted
    .slice(1, -1)
    .reduce((sum, s) => sum + s.width, 0);

  // Calculate gap between shapes
  const gap = (totalSpace - first.width - middleShapesWidth) / (shapes.length - 1);

  const updates: DistributionUpdate[] = [];

  // Position middle shapes
  let currentX = first.x + first.width + gap;
  for (let i = 1; i < sorted.length - 1; i++) {
    updates.push({
      id: sorted[i].id,
      x: currentX,
    });
    currentX += sorted[i].width + gap;
  }

  return updates;
}

/**
 * Calculate position updates for vertical distribution
 */
export function calculateVerticalDistribution(
  shapes: Shape[]
): DistributionUpdate[] {
  if (shapes.length < 3) return [];

  // Sort by y position
  const sorted = [...shapes].sort((a, b) => a.y - b.y);

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calculate total available space
  const totalSpace = last.y - first.y;

  // Calculate total height of all shapes except first and last
  const middleShapesHeight = sorted
    .slice(1, -1)
    .reduce((sum, s) => sum + s.height, 0);

  // Calculate gap between shapes
  const gap = (totalSpace - first.height - middleShapesHeight) / (shapes.length - 1);

  const updates: DistributionUpdate[] = [];

  // Position middle shapes
  let currentY = first.y + first.height + gap;
  for (let i = 1; i < sorted.length - 1; i++) {
    updates.push({
      id: sorted[i].id,
      y: currentY,
    });
    currentY += sorted[i].height + gap;
  }

  return updates;
}
```

### Step 4: Clipboard Store Actions

**File:** `src/stores/diagramStore.ts` (additions)

```typescript
import { ClipboardData, ClipboardShape, ClipboardConnection } from '@/types/clipboard';
import { generateId } from '@/lib/utils';
import { getSelectionBounds } from '@/lib/selection-utils';
import { calculateAlignment } from '@/lib/alignment-utils';
import {
  calculateHorizontalDistribution,
  calculateVerticalDistribution,
} from '@/lib/distribution-utils';

const PASTE_OFFSET = 20;

interface DiagramState {
  // ... existing state

  clipboard: ClipboardData | null;
  pasteCount: number; // Track paste count for offset

  // Selection actions
  addToSelection: (ids: string[]) => void;
  removeFromSelection: (ids: string[]) => void;
  toggleSelection: (id: string) => void;
  selectAll: () => void;

  // Clipboard actions
  copySelection: () => void;
  cutSelection: () => void;
  pasteClipboard: () => void;
  duplicateSelection: () => void;

  // Arrangement actions
  alignShapes: (alignment: AlignmentType) => void;
  distributeShapes: (direction: 'horizontal' | 'vertical') => void;
}

export const useDiagramStore = create<DiagramState>()((set, get) => ({
  // ... existing state
  clipboard: null,
  pasteCount: 0,

  // Selection actions
  addToSelection: (ids) => set((state) => ({
    selectedShapeIds: [...new Set([...state.selectedShapeIds, ...ids])],
    selectedConnectionIds: [],
  })),

  removeFromSelection: (ids) => set((state) => ({
    selectedShapeIds: state.selectedShapeIds.filter((id) => !ids.includes(id)),
  })),

  toggleSelection: (id) => set((state) => {
    const isSelected = state.selectedShapeIds.includes(id);
    return {
      selectedShapeIds: isSelected
        ? state.selectedShapeIds.filter((sid) => sid !== id)
        : [...state.selectedShapeIds, id],
      selectedConnectionIds: [],
    };
  }),

  selectAll: () => set((state) => ({
    selectedShapeIds: Object.keys(state.shapes),
    selectedConnectionIds: [],
  })),

  // Clipboard actions
  copySelection: () => set((state) => {
    const { shapes, connections, selectedShapeIds } = state;
    if (selectedShapeIds.length === 0) return state;

    // Get selected shapes
    const selectedShapes = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    // Convert to clipboard format
    const clipboardShapes: ClipboardShape[] = selectedShapes.map((shape) => ({
      ...shape,
      originalId: shape.id,
    }));

    // Get connections between selected shapes
    const clipboardConnections: ClipboardConnection[] = Object.values(connections)
      .filter(
        (conn) =>
          selectedShapeIds.includes(conn.sourceShapeId) &&
          selectedShapeIds.includes(conn.targetShapeId)
      )
      .map((conn) => ({
        sourceOriginalId: conn.sourceShapeId,
        targetOriginalId: conn.targetShapeId,
        sourceAnchor: conn.sourceAnchor,
        targetAnchor: conn.targetAnchor,
        stroke: conn.stroke,
        strokeWidth: conn.strokeWidth,
        startArrow: conn.startArrow,
        endArrow: conn.endArrow,
      }));

    const bounds = getSelectionBounds(selectedShapes);

    return {
      clipboard: {
        shapes: clipboardShapes,
        connections: clipboardConnections,
        bounds,
        timestamp: Date.now(),
      },
      pasteCount: 0,
    };
  }),

  cutSelection: () => {
    const state = get();
    state.copySelection();
    state.deleteSelectedShapes();
  },

  pasteClipboard: () => set((state) => {
    const { clipboard, shapes, connections, nextZIndex, pasteCount } = state;
    if (!clipboard || clipboard.shapes.length === 0) return state;

    // Calculate offset for this paste
    const offset = (pasteCount + 1) * PASTE_OFFSET;

    // Map old IDs to new IDs
    const idMap = new Map<string, string>();

    // Create new shapes
    const newShapes: Record<string, Shape> = { ...shapes };
    const newShapeIds: string[] = [];
    let currentZIndex = nextZIndex;

    clipboard.shapes.forEach((clipShape) => {
      const newId = generateId('shape');
      idMap.set(clipShape.originalId, newId);

      const { originalId, ...shapeData } = clipShape;
      const newShape: Shape = {
        ...shapeData,
        id: newId,
        x: shapeData.x + offset,
        y: shapeData.y + offset,
        zIndex: currentZIndex++,
        locked: false,
        visible: true,
      };

      newShapes[newId] = newShape;
      newShapeIds.push(newId);
    });

    // Create new connections
    const newConnections: Record<string, Connection> = { ...connections };

    clipboard.connections.forEach((clipConn) => {
      const newSourceId = idMap.get(clipConn.sourceOriginalId);
      const newTargetId = idMap.get(clipConn.targetOriginalId);

      if (newSourceId && newTargetId) {
        const newId = generateId('conn');
        newConnections[newId] = {
          id: newId,
          sourceShapeId: newSourceId,
          targetShapeId: newTargetId,
          sourceAnchor: clipConn.sourceAnchor,
          targetAnchor: clipConn.targetAnchor,
          stroke: clipConn.stroke,
          strokeWidth: clipConn.strokeWidth,
          startArrow: clipConn.startArrow,
          endArrow: clipConn.endArrow,
        };
      }
    });

    return {
      shapes: newShapes,
      connections: newConnections,
      selectedShapeIds: newShapeIds,
      selectedConnectionIds: [],
      nextZIndex: currentZIndex,
      pasteCount: pasteCount + 1,
    };
  }),

  duplicateSelection: () => {
    const state = get();
    state.copySelection();
    set({ pasteCount: 0 }); // Reset to get first offset
    state.pasteClipboard();
  },

  // Arrangement actions
  alignShapes: (alignment) => set((state) => {
    const { shapes, selectedShapeIds } = state;
    if (selectedShapeIds.length < 2) return state;

    const selectedShapes = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    const updates = calculateAlignment(selectedShapes, alignment);

    const newShapes = { ...shapes };
    updates.forEach((update) => {
      const shape = newShapes[update.id];
      if (shape) {
        newShapes[update.id] = {
          ...shape,
          ...(update.x !== undefined && { x: update.x }),
          ...(update.y !== undefined && { y: update.y }),
        };
      }
    });

    return { shapes: newShapes };
  }),

  distributeShapes: (direction) => set((state) => {
    const { shapes, selectedShapeIds } = state;
    if (selectedShapeIds.length < 3) return state;

    const selectedShapes = selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);

    const updates =
      direction === 'horizontal'
        ? calculateHorizontalDistribution(selectedShapes)
        : calculateVerticalDistribution(selectedShapes);

    const newShapes = { ...shapes };
    updates.forEach((update) => {
      const shape = newShapes[update.id];
      if (shape) {
        newShapes[update.id] = {
          ...shape,
          ...(update.x !== undefined && { x: update.x }),
          ...(update.y !== undefined && { y: update.y }),
        };
      }
    });

    return { shapes: newShapes };
  }),
}));
```

### Step 5: Selection Box Hook

**File:** `src/hooks/useSelectionBox.ts`

```typescript
import { useCallback, useEffect } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { getShapesInBox } from '@/lib/selection-utils';
import { Point } from '@/types/common';

export function useSelectionBox() {
  const shapes = useDiagramStore((s) => s.shapes);
  const setSelectedShapeIds = useDiagramStore((s) => s.setSelectedShapeIds);
  const addToSelection = useDiagramStore((s) => s.addToSelection);

  const viewport = useUIStore((s) => s.viewport);
  const selectionBox = useUIStore((s) => s.selectionBox);
  const startSelectionBox = useUIStore((s) => s.startSelectionBox);
  const updateSelectionBox = useUIStore((s) => s.updateSelectionBox);
  const endSelectionBox = useUIStore((s) => s.endSelectionBox);

  const handleCanvasMouseDown = useCallback((
    e: React.MouseEvent,
    canvasPoint: Point,
    isShiftHeld: boolean
  ) => {
    // Only start selection box if clicking on empty canvas
    startSelectionBox(canvasPoint, isShiftHeld);
  }, [startSelectionBox]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!selectionBox) return;

    // Convert screen to canvas coordinates
    const canvasX = viewport.x + e.clientX / viewport.zoom;
    const canvasY = viewport.y + e.clientY / viewport.zoom;

    updateSelectionBox({ x: canvasX, y: canvasY });
  }, [selectionBox, viewport, updateSelectionBox]);

  const handleMouseUp = useCallback(() => {
    if (!selectionBox) return;

    // Get shapes in selection box
    const selectedIds = getShapesInBox(
      shapes,
      selectionBox.startPoint,
      selectionBox.currentPoint
    );

    if (selectionBox.isShiftHeld) {
      // Add to existing selection
      addToSelection(selectedIds);
    } else {
      // Replace selection
      setSelectedShapeIds(selectedIds);
    }

    endSelectionBox();
  }, [selectionBox, shapes, setSelectedShapeIds, addToSelection, endSelectionBox]);

  // Attach global listeners during selection box drag
  useEffect(() => {
    if (!selectionBox) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [selectionBox, handleMouseMove, handleMouseUp]);

  return {
    selectionBox,
    handleCanvasMouseDown,
  };
}
```

### Step 6: Selection Box Component

**File:** `src/components/canvas/SelectionBoxLayer.tsx`

```typescript
import React from 'react';
import { useUIStore } from '@/stores/uiStore';

export function SelectionBoxLayer() {
  const selectionBox = useUIStore((s) => s.selectionBox);

  if (!selectionBox) return null;

  const { startPoint, currentPoint } = selectionBox;

  const x = Math.min(startPoint.x, currentPoint.x);
  const y = Math.min(startPoint.y, currentPoint.y);
  const width = Math.abs(currentPoint.x - startPoint.x);
  const height = Math.abs(currentPoint.y - startPoint.y);

  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill="rgba(59, 130, 246, 0.1)"
      stroke="#3B82F6"
      strokeWidth={1}
      strokeDasharray="4 4"
      pointerEvents="none"
    />
  );
}
```

### Step 7: Multi-Selection Bounding Box

**File:** `src/components/canvas/SelectionLayer.tsx` (updated)

```typescript
import React, { useMemo } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { InteractiveSelectionHandles } from './InteractiveSelectionHandles';
import { getSelectionBounds } from '@/lib/selection-utils';
import { Shape } from '@/types/shape';

export function SelectionLayer() {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  const selectedShapes = useMemo(() => {
    return selectedShapeIds
      .map((id) => shapes[id])
      .filter((s): s is Shape => s !== undefined);
  }, [shapes, selectedShapeIds]);

  if (selectedShapes.length === 0) return null;

  // Single selection - show handles on the shape
  if (selectedShapes.length === 1) {
    return (
      <InteractiveSelectionHandles
        shape={selectedShapes[0]}
        onResizeStart={() => {}}
        onRotateStart={() => {}}
      />
    );
  }

  // Multi-selection - show bounding box and individual outlines
  const bounds = getSelectionBounds(selectedShapes);

  return (
    <g className="multi-selection">
      {/* Individual shape outlines */}
      {selectedShapes.map((shape) => (
        <rect
          key={shape.id}
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
      ))}

      {/* Bounding box for all selected shapes */}
      <rect
        x={bounds.x - 4}
        y={bounds.y - 4}
        width={bounds.width + 8}
        height={bounds.height + 8}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={1}
        pointerEvents="none"
      />

      {/* Corner handles for the bounding box */}
      {[
        { x: bounds.x - 4, y: bounds.y - 4 },
        { x: bounds.x + bounds.width, y: bounds.y - 4 },
        { x: bounds.x - 4, y: bounds.y + bounds.height },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      ].map((pos, i) => (
        <rect
          key={i}
          x={pos.x - 3}
          y={pos.y - 3}
          width={6}
          height={6}
          fill="white"
          stroke="#3B82F6"
          strokeWidth={1}
        />
      ))}
    </g>
  );
}
```

### Step 8: Keyboard Shortcuts Extension

**File:** `src/hooks/useKeyboardShortcuts.ts` (updated)

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
  const selectAll = useDiagramStore((s) => s.selectAll);
  const copySelection = useDiagramStore((s) => s.copySelection);
  const cutSelection = useDiagramStore((s) => s.cutSelection);
  const pasteClipboard = useDiagramStore((s) => s.pasteClipboard);
  const duplicateSelection = useDiagramStore((s) => s.duplicateSelection);
  const editingTextShapeId = useUIStore((s) => s.editingTextShapeId);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if in text input
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      editingTextShapeId
    ) {
      return;
    }

    const hasSelection = selectedShapeIds.length > 0;
    const ctrlOrMeta = e.ctrlKey || e.metaKey;

    // Select All - Ctrl+A
    if (ctrlOrMeta && e.key === 'a') {
      e.preventDefault();
      selectAll();
      return;
    }

    // Copy - Ctrl+C
    if (ctrlOrMeta && e.key === 'c' && hasSelection) {
      e.preventDefault();
      copySelection();
      return;
    }

    // Cut - Ctrl+X
    if (ctrlOrMeta && e.key === 'x' && hasSelection) {
      e.preventDefault();
      cutSelection();
      return;
    }

    // Paste - Ctrl+V
    if (ctrlOrMeta && e.key === 'v') {
      e.preventDefault();
      pasteClipboard();
      return;
    }

    // Duplicate - Ctrl+D
    if (ctrlOrMeta && e.key === 'd' && hasSelection) {
      e.preventDefault();
      duplicateSelection();
      return;
    }

    // Delete - Delete/Backspace
    if (hasSelection && (e.key === 'Delete' || e.key === 'Backspace')) {
      e.preventDefault();
      deleteSelectedShapes();
      return;
    }

    // Arrow key movement
    if (hasSelection && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();

      const moveAmount = e.shiftKey ? ARROW_KEY_MOVE_SHIFT : ARROW_KEY_MOVE;

      let deltaX = 0;
      let deltaY = 0;

      switch (e.key) {
        case 'ArrowUp': deltaY = -moveAmount; break;
        case 'ArrowDown': deltaY = moveAmount; break;
        case 'ArrowLeft': deltaX = -moveAmount; break;
        case 'ArrowRight': deltaX = moveAmount; break;
      }

      for (const id of selectedShapeIds) {
        const shape = shapes[id];
        if (shape && !shape.locked) {
          moveShape(id, deltaX, deltaY);
        }
      }
    }
  }, [
    selectedShapeIds,
    shapes,
    editingTextShapeId,
    selectAll,
    copySelection,
    cutSelection,
    pasteClipboard,
    duplicateSelection,
    deleteSelectedShapes,
    moveShape,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
```

### Step 9: Arrange Menu Component

**File:** `src/components/menus/ArrangeMenu.tsx`

```typescript
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useDiagramStore } from '@/stores/diagramStore';
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  Rows,
  Columns,
} from 'lucide-react';

export function ArrangeMenu() {
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const alignShapes = useDiagramStore((s) => s.alignShapes);
  const distributeShapes = useDiagramStore((s) => s.distributeShapes);

  const canAlign = selectedShapeIds.length >= 2;
  const canDistribute = selectedShapeIds.length >= 3;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Arrange
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {/* Align submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!canAlign}>
            Align
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => alignShapes('left')}>
              <AlignHorizontalJustifyStart className="w-4 h-4 mr-2" />
              Align Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignShapes('centerHorizontal')}>
              <AlignHorizontalJustifyCenter className="w-4 h-4 mr-2" />
              Align Center
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignShapes('right')}>
              <AlignHorizontalJustifyEnd className="w-4 h-4 mr-2" />
              Align Right
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => alignShapes('top')}>
              <AlignVerticalJustifyStart className="w-4 h-4 mr-2" />
              Align Top
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignShapes('centerVertical')}>
              <AlignVerticalJustifyCenter className="w-4 h-4 mr-2" />
              Align Middle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alignShapes('bottom')}>
              <AlignVerticalJustifyEnd className="w-4 h-4 mr-2" />
              Align Bottom
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Distribute submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={!canDistribute}>
            Distribute
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => distributeShapes('horizontal')}>
              <Columns className="w-4 h-4 mr-2" />
              Distribute Horizontally
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => distributeShapes('vertical')}>
              <Rows className="w-4 h-4 mr-2" />
              Distribute Vertically
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Step 10: Update Multi-Shape Movement

**File:** `src/hooks/useShapeMove.ts` (updated for multi-selection)

```typescript
import { useCallback, useRef } from 'react';
import { Point } from '@/types/common';
import { useDiagramStore } from '@/stores/diagramStore';
import { useUIStore } from '@/stores/uiStore';
import { constrainToAxis } from '@/lib/geometry';

export function useMultiShapeMove() {
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const shapes = useDiagramStore((s) => s.shapes);
  const updateShape = useDiagramStore((s) => s.updateShape);
  const viewport = useUIStore((s) => s.viewport);

  const startPointRef = useRef<Point | null>(null);
  const startPositionsRef = useRef<Map<string, Point>>(new Map());

  const handleMoveStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    startPointRef.current = { x: e.clientX, y: e.clientY };

    // Store start positions for all selected shapes
    const positions = new Map<string, Point>();
    selectedShapeIds.forEach((id) => {
      const shape = shapes[id];
      if (shape) {
        positions.set(id, { x: shape.x, y: shape.y });
      }
    });
    startPositionsRef.current = positions;
  }, [selectedShapeIds, shapes]);

  const handleMoveUpdate = useCallback((e: MouseEvent, shiftHeld: boolean) => {
    if (!startPointRef.current) return;

    let delta: Point = {
      x: e.clientX - startPointRef.current.x,
      y: e.clientY - startPointRef.current.y,
    };

    if (shiftHeld) {
      delta = constrainToAxis(delta);
    }

    // Scale by zoom
    const scaledDelta: Point = {
      x: delta.x / viewport.zoom,
      y: delta.y / viewport.zoom,
    };

    // Update all selected shapes
    startPositionsRef.current.forEach((startPos, id) => {
      updateShape(id, {
        x: startPos.x + scaledDelta.x,
        y: startPos.y + scaledDelta.y,
      });
    });
  }, [viewport.zoom, updateShape]);

  const handleMoveEnd = useCallback(() => {
    startPointRef.current = null;
    startPositionsRef.current.clear();
  }, []);

  return {
    handleMoveStart,
    handleMoveUpdate,
    handleMoveEnd,
  };
}
```

---

## Key Decisions

### 1. Selection Box Includes Partial Intersections

**Decision:** Select shapes that are partially inside the selection box.

**Rationale:**
- More intuitive user experience
- Matches draw.io behavior
- Easier to select large shapes

### 2. Internal Clipboard vs System Clipboard

**Decision:** Use internal clipboard (not browser clipboard API).

**Rationale:**
- Simpler implementation
- Shape data is complex (connections, styles)
- System clipboard would require serialization
- Future: Could add system clipboard for cross-tab copying

### 3. Paste Offset Strategy

**Decision:** Increment offset by 20px for each consecutive paste.

**Rationale:**
- Prevents shapes from stacking exactly on top
- User can see multiple pastes
- Reset when copying new selection

---

## Testing Approach

### Unit Tests

```typescript
// src/lib/__tests__/selection-utils.test.ts
import { shapeIntersectsBox, getSelectionBounds } from '../selection-utils';

describe('shapeIntersectsBox', () => {
  const shape = { x: 100, y: 100, width: 50, height: 50 };

  it('detects overlap', () => {
    expect(shapeIntersectsBox(shape, { x: 80, y: 80 }, { x: 120, y: 120 })).toBe(true);
  });

  it('detects no overlap', () => {
    expect(shapeIntersectsBox(shape, { x: 0, y: 0 }, { x: 50, y: 50 })).toBe(false);
  });
});

// src/lib/__tests__/alignment-utils.test.ts
import { calculateAlignment } from '../alignment-utils';

describe('calculateAlignment', () => {
  const shapes = [
    { id: '1', x: 10, y: 50, width: 50, height: 30 },
    { id: '2', x: 100, y: 20, width: 60, height: 40 },
    { id: '3', x: 50, y: 80, width: 40, height: 20 },
  ];

  it('aligns left to leftmost shape', () => {
    const updates = calculateAlignment(shapes, 'left');
    expect(updates.every(u => u.x === 10)).toBe(true);
  });
});
```

---

## Performance Considerations

- Selection box rendering at 60fps during drag
- Batch shape updates during multi-shape movement
- Use `useMemo` for selection bounds calculation
- Debounce clipboard operations if performance issues

---

## Accessibility Requirements

- Ctrl+A announces "All shapes selected"
- Shift+click announces "Added to selection" / "Removed from selection"
- Alignment/distribution actions should be keyboard accessible through menu
- Focus management after paste operation
