# Phase 8.6: Disconnect & Shape-Level Targeting - Technical Specification

## Technical Architecture

### Component Hierarchy

```
Canvas
├── ConnectionRenderer (modified)
│   ├── ... existing connection components
│   ├── FloatingEndpointHandle (new)
│   └── ShapeConnectionHighlight (new)
├── AnchorPointsOverlay (modified)
└── ShapeHighlight (during connection drag)
```

### Connection Type Extension

```typescript
interface Connection {
  // ... existing fields
  sourceAttached: boolean;
  targetAttached: boolean;
  floatingSourcePoint?: Point;  // When sourceAttached is false
  floatingTargetPoint?: Point;  // When targetAttached is false
}
```

---

## Files to Create

### New Files

```
src/
├── utils/
│   └── anchorSelection.ts                # Best anchor calculation
└── components/
    └── canvas/
        └── connections/
            ├── FloatingEndpointHandle.tsx  # Draggable floating endpoint
            └── ShapeConnectionHighlight.tsx # Shape highlight during targeting
```

### Files to Modify

```
src/
├── types/
│   └── connections.ts                    # Add attached state, floating points
├── stores/
│   └── diagramStore.ts                   # Disconnect/reconnect actions
├── hooks/
│   └── useConnectionCreation.ts          # Shape-level targeting
├── components/
│   ├── canvas/
│   │   ├── ConnectionRenderer.tsx        # Floating endpoint rendering
│   │   └── AnchorPointsOverlay.tsx       # Enhanced anchor feedback
```

---

## Implementation Order

### Step 1: Types and Store
1. Add `sourceAttached`, `targetAttached` to Connection
2. Add `floatingSourcePoint`, `floatingTargetPoint`
3. Add disconnect/reconnect actions to store

### Step 2: Anchor Selection Utility
4. Create `anchorSelection.ts`
5. Implement best anchor calculation
6. Implement approach direction scoring
7. Add snap threshold detection

### Step 3: Floating Endpoint
8. Create `FloatingEndpointHandle.tsx`
9. Implement drag to disconnect
10. Track floating point position
11. Add visual indicator (orange/red)

### Step 4: Reconnection
12. Implement anchor hover detection
13. Add snap-to-anchor on release
14. Update connection with new anchor
15. Track in history

### Step 5: Shape-Level Targeting
16. Update `useConnectionCreation.ts`
17. Add shape body hit detection
18. Calculate best anchor on drop
19. Create connection with auto anchor

### Step 6: Visual Feedback
20. Create `ShapeConnectionHighlight.tsx`
21. Show shape border highlight
22. Emphasize predicted anchor
23. Dim other anchors

### Step 7: Snap Override
24. Implement snap threshold check
25. Override auto-selection when close
26. Add snap visual indicator

---

## Code Patterns

### Anchor Selection Utility

```typescript
// utils/anchorSelection.ts
import type { Point, AnchorPosition, Shape } from '../types';

interface AnchorCandidate {
  anchor: AnchorPosition;
  point: Point;
  score: number;
}

const SNAP_THRESHOLD = 25; // px

/**
 * Calculate the best anchor point on a target shape
 */
export function calculateBestAnchor(
  targetShape: Shape,
  dragPoint: Point,
  sourcePoint: Point,
  sourceAnchor?: AnchorPosition
): { anchor: AnchorPosition; point: Point; snapped: boolean } {
  const anchors = getAllAnchors(targetShape);

  // Check if we should snap to a specific anchor
  for (const { anchor, point } of anchors) {
    const distance = Math.hypot(point.x - dragPoint.x, point.y - dragPoint.y);
    if (distance <= SNAP_THRESHOLD) {
      return { anchor, point, snapped: true };
    }
  }

  // Score each anchor for auto-selection
  const candidates: AnchorCandidate[] = anchors.map(({ anchor, point }) => {
    let score = 0;

    // Factor 1: Distance to drag point (closer = better, max 50 points)
    const distanceToDrag = Math.hypot(point.x - dragPoint.x, point.y - dragPoint.y);
    const maxDistance = Math.max(targetShape.width, targetShape.height);
    score += 50 * (1 - Math.min(distanceToDrag / maxDistance, 1));

    // Factor 2: Approach direction (anchor facing source = better, max 30 points)
    const approachAngle = Math.atan2(
      sourcePoint.y - point.y,
      sourcePoint.x - point.x
    );
    const anchorDirection = getAnchorDirection(anchor);
    const angleDiff = Math.abs(normalizeAngle(approachAngle - anchorDirection));
    score += 30 * (1 - angleDiff / Math.PI);

    // Factor 3: Opposite anchor bonus (max 20 points)
    if (sourceAnchor && isOppositeAnchor(sourceAnchor, anchor)) {
      score += 20;
    }

    return { anchor, point, score };
  });

  // Return highest scoring
  candidates.sort((a, b) => b.score - a.score);
  return {
    anchor: candidates[0].anchor,
    point: candidates[0].point,
    snapped: false,
  };
}

function getAllAnchors(shape: Shape): Array<{ anchor: AnchorPosition; point: Point }> {
  const cx = shape.x + shape.width / 2;
  const cy = shape.y + shape.height / 2;

  return [
    { anchor: 'top', point: { x: cx, y: shape.y } },
    { anchor: 'bottom', point: { x: cx, y: shape.y + shape.height } },
    { anchor: 'left', point: { x: shape.x, y: cy } },
    { anchor: 'right', point: { x: shape.x + shape.width, y: cy } },
  ];
}

function getAnchorDirection(anchor: AnchorPosition): number {
  switch (anchor) {
    case 'top': return -Math.PI / 2;
    case 'bottom': return Math.PI / 2;
    case 'left': return Math.PI;
    case 'right': return 0;
  }
}

function isOppositeAnchor(a: AnchorPosition, b: AnchorPosition): boolean {
  return (
    (a === 'left' && b === 'right') ||
    (a === 'right' && b === 'left') ||
    (a === 'top' && b === 'bottom') ||
    (a === 'bottom' && b === 'top')
  );
}

function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return Math.abs(angle);
}

/**
 * Check if point is inside shape bounds
 */
export function isPointInShape(point: Point, shape: Shape): boolean {
  return (
    point.x >= shape.x &&
    point.x <= shape.x + shape.width &&
    point.y >= shape.y &&
    point.y <= shape.y + shape.height
  );
}

/**
 * Find shape at point
 */
export function findShapeAtPoint(
  point: Point,
  shapes: Shape[],
  excludeIds: string[] = []
): Shape | null {
  // Check in reverse order (top-most first)
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (!excludeIds.includes(shapes[i].id) && isPointInShape(point, shapes[i])) {
      return shapes[i];
    }
  }
  return null;
}
```

### Floating Endpoint Handle

```typescript
// components/canvas/connections/FloatingEndpointHandle.tsx
import React, { useCallback, useState } from 'react';
import type { Point } from '../../../types';

interface FloatingEndpointHandleProps {
  point: Point;
  endpoint: 'source' | 'target';
  onDrag: (point: Point) => void;
  onDrop: (point: Point) => void;
}

export const FloatingEndpointHandle: React.FC<FloatingEndpointHandleProps> = ({
  point,
  endpoint,
  onDrag,
  onDrop,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      onDrag({ x: moveEvent.clientX, y: moveEvent.clientY });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDragging(false);
      onDrop({ x: upEvent.clientX, y: upEvent.clientY });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [onDrag, onDrop]);

  return (
    <g className="floating-endpoint">
      {/* Outer glow ring */}
      <circle
        cx={point.x}
        cy={point.y}
        r={12}
        fill="none"
        stroke="#F97316"
        strokeWidth={2}
        opacity={0.3}
      />

      {/* Inner handle */}
      <circle
        cx={point.x}
        cy={point.y}
        r={8}
        fill={isDragging ? '#F97316' : '#FED7AA'}
        stroke="#F97316"
        strokeWidth={2}
        className="cursor-move"
        onMouseDown={handleMouseDown}
      />

      {/* Center dot */}
      <circle
        cx={point.x}
        cy={point.y}
        r={3}
        fill="#F97316"
        pointerEvents="none"
      />
    </g>
  );
};
```

### Shape Connection Highlight

```typescript
// components/canvas/connections/ShapeConnectionHighlight.tsx
import React from 'react';
import type { Shape, AnchorPosition, Point } from '../../../types';

interface ShapeConnectionHighlightProps {
  shape: Shape;
  predictedAnchor: AnchorPosition | null;
  isSnapped: boolean;
}

export const ShapeConnectionHighlight: React.FC<ShapeConnectionHighlightProps> = ({
  shape,
  predictedAnchor,
  isSnapped,
}) => {
  const anchors = [
    { anchor: 'top' as const, point: { x: shape.x + shape.width / 2, y: shape.y } },
    { anchor: 'bottom' as const, point: { x: shape.x + shape.width / 2, y: shape.y + shape.height } },
    { anchor: 'left' as const, point: { x: shape.x, y: shape.y + shape.height / 2 } },
    { anchor: 'right' as const, point: { x: shape.x + shape.width, y: shape.y + shape.height / 2 } },
  ];

  return (
    <g className="shape-connection-highlight" pointerEvents="none">
      {/* Shape highlight border */}
      <rect
        x={shape.x - 3}
        y={shape.y - 3}
        width={shape.width + 6}
        height={shape.height + 6}
        fill="none"
        stroke="#3B82F6"
        strokeWidth={2}
        strokeDasharray={isSnapped ? 'none' : '4 2'}
        rx={4}
        opacity={0.7}
      />

      {/* Anchor points */}
      {anchors.map(({ anchor, point }) => {
        const isPredicted = anchor === predictedAnchor;
        return (
          <g key={anchor}>
            {/* Emphasis ring for predicted anchor */}
            {isPredicted && (
              <circle
                cx={point.x}
                cy={point.y}
                r={14}
                fill="none"
                stroke="#3B82F6"
                strokeWidth={2}
                opacity={0.3}
              />
            )}

            {/* Anchor dot */}
            <circle
              cx={point.x}
              cy={point.y}
              r={isPredicted ? 7 : 4}
              fill={isPredicted ? '#3B82F6' : 'white'}
              stroke="#3B82F6"
              strokeWidth={isPredicted ? 2 : 1}
              opacity={isPredicted ? 1 : 0.5}
            />
          </g>
        );
      })}
    </g>
  );
};
```

### Updated Connection Creation Hook

```typescript
// hooks/useConnectionCreation.ts (updated sections)
import { calculateBestAnchor, findShapeAtPoint, isPointInShape } from '../utils/anchorSelection';

export function useConnectionCreation() {
  // ... existing state ...

  const [hoveredShape, setHoveredShape] = useState<Shape | null>(null);
  const [predictedAnchor, setPredictedAnchor] = useState<AnchorPosition | null>(null);
  const [isSnapped, setIsSnapped] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!creationState) return;

    const canvasPoint = screenToCanvas(e.clientX, e.clientY);
    updatePreviewLine(canvasPoint);

    // Find shape under cursor (excluding source)
    const shapesArray = Object.values(shapes).filter(
      s => s.id !== creationState.sourceShapeId
    );
    const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

    setHoveredShape(targetShape);

    if (targetShape) {
      const result = calculateBestAnchor(
        targetShape,
        canvasPoint,
        creationState.sourcePoint,
        creationState.sourceAnchor
      );
      setPredictedAnchor(result.anchor);
      setIsSnapped(result.snapped);
    } else {
      setPredictedAnchor(null);
      setIsSnapped(false);
    }
  }, [creationState, shapes, screenToCanvas]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!creationState) return;

    const canvasPoint = screenToCanvas(e.clientX, e.clientY);

    // Find target shape
    const shapesArray = Object.values(shapes).filter(
      s => s.id !== creationState.sourceShapeId
    );
    const targetShape = findShapeAtPoint(canvasPoint, shapesArray);

    if (targetShape) {
      const { anchor } = calculateBestAnchor(
        targetShape,
        canvasPoint,
        creationState.sourcePoint,
        creationState.sourceAnchor
      );

      // Create connection with auto-selected anchor
      addConnection({
        sourceShapeId: creationState.sourceShapeId,
        sourceAnchor: creationState.sourceAnchor,
        targetShapeId: targetShape.id,
        targetAnchor: anchor,
        style: defaultConnectionStyle,
        sourceAttached: true,
        targetAttached: true,
      });
    }

    // Clean up
    setHoveredShape(null);
    setPredictedAnchor(null);
    setIsSnapped(false);
    endCreation();
  }, [creationState, shapes, screenToCanvas, addConnection, endCreation, defaultConnectionStyle]);

  return {
    // ... existing returns ...
    hoveredShape,
    predictedAnchor,
    isSnapped,
  };
}
```

### Store Actions for Disconnect/Reconnect

```typescript
// diagramStore.ts additions

disconnectEndpoint: (connectionId: string, endpoint: 'source' | 'target', point: Point) => {
  set((state) => {
    const connection = state.connections[connectionId];
    if (!connection) return state;

    const updates = endpoint === 'source'
      ? { sourceAttached: false, floatingSourcePoint: point }
      : { targetAttached: false, floatingTargetPoint: point };

    return {
      connections: {
        ...state.connections,
        [connectionId]: { ...connection, ...updates },
      },
    };
  });
},

reconnectEndpoint: (
  connectionId: string,
  endpoint: 'source' | 'target',
  shapeId: string,
  anchor: AnchorPosition
) => {
  set((state) => {
    const connection = state.connections[connectionId];
    if (!connection) return state;

    const updates = endpoint === 'source'
      ? {
          sourceShapeId: shapeId,
          sourceAnchor: anchor,
          sourceAttached: true,
          floatingSourcePoint: undefined,
        }
      : {
          targetShapeId: shapeId,
          targetAnchor: anchor,
          targetAttached: true,
          floatingTargetPoint: undefined,
        };

    return {
      connections: {
        ...state.connections,
        [connectionId]: { ...connection, ...updates },
      },
    };
  });
},
```

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/anchorSelection.test.ts
describe('anchorSelection', () => {
  const testShape = { id: '1', x: 100, y: 100, width: 100, height: 100 };

  it('should select left anchor when approaching from left', () => {
    const result = calculateBestAnchor(
      testShape,
      { x: 50, y: 150 },  // Drag point to the left
      { x: 0, y: 150 },   // Source point far left
      'right'
    );
    expect(result.anchor).toBe('left');
  });

  it('should snap when close to specific anchor', () => {
    const result = calculateBestAnchor(
      testShape,
      { x: 152, y: 100 },  // Very close to top anchor (150, 100)
      { x: 0, y: 0 },
      undefined
    );
    expect(result.snapped).toBe(true);
    expect(result.anchor).toBe('top');
  });

  it('should prefer opposite anchor', () => {
    const result = calculateBestAnchor(
      testShape,
      { x: 150, y: 150 },  // Center of shape
      { x: 0, y: 150 },
      'right'  // Coming from right anchor
    );
    expect(result.anchor).toBe('left');  // Prefers opposite
  });
});
```

---

## History Integration

```typescript
interface DisconnectHistoryEntry {
  type: 'connection-disconnect';
  connectionId: string;
  endpoint: 'source' | 'target';
  previousShapeId: string;
  previousAnchor: AnchorPosition;
  floatingPoint: Point;
}

interface ReconnectHistoryEntry {
  type: 'connection-reconnect';
  connectionId: string;
  endpoint: 'source' | 'target';
  previousShapeId: string;
  previousAnchor: AnchorPosition;
  newShapeId: string;
  newAnchor: AnchorPosition;
}
```

---

## Performance Considerations

- Cache anchor positions per shape
- Throttle best anchor calculation during drag
- Use spatial indexing for shape-at-point queries with many shapes
- Debounce highlight updates

---

## Accessibility

- Screen reader announces "Connection endpoint disconnected"
- Announce predicted anchor: "Targeting left anchor of Shape 2"
- Keyboard: Tab to select endpoints, Enter to drop
