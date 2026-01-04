# Phase 8.3: Curved Connections - Technical Specification

## Technical Architecture

### Component Hierarchy

```
Canvas
├── ConnectionRenderer (modified)
│   ├── StraightConnection (existing)
│   └── CurvedConnection (new)
│       └── ConnectionControlPoints (new)
└── SelectionOverlay
```

### Connection Type Extension

```typescript
// Extended Connection type
interface Connection {
  // ... existing fields
  style: ConnectionStyle;      // 'straight' | 'curved'
  controlPoints?: {
    cp1: Point;                // Control point near source
    cp2: Point;                // Control point near target
  };
}

type ConnectionStyle = 'straight' | 'curved';
```

---

## Files to Create

### New Files

```
src/
├── utils/
│   └── bezierUtils.ts                    # Bezier curve calculations
└── components/
    └── canvas/
        └── connections/
            ├── CurvedConnection.tsx      # Curved connection renderer
            └── ConnectionControlPoints.tsx # Control point handles
```

### Files to Modify

```
src/
├── types/
│   └── connections.ts                    # Add style, controlPoints
├── stores/
│   └── diagramStore.ts                   # Control point actions
├── components/
│   ├── canvas/
│   │   └── ConnectionRenderer.tsx        # Route to curved/straight
│   └── panels/
│       └── PropertyPanel.tsx             # Connection style dropdown
```

---

## Key Interfaces & Types

### Connection Extensions

```typescript
// types/connections.ts

export type ConnectionStyle = 'straight' | 'curved';

export interface ConnectionControlPoints {
  cp1: Point;  // Control point near source
  cp2: Point;  // Control point near target
}

export interface Connection {
  id: string;
  sourceShapeId: string;
  targetShapeId: string;
  sourceAnchor: AnchorPosition;
  targetAnchor: AnchorPosition;
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  startArrow: ArrowStyle;
  endArrow: ArrowStyle;

  // New fields
  style: ConnectionStyle;
  controlPoints?: ConnectionControlPoints;
}
```

---

## Implementation Order

### Step 1: Types and Utilities
1. Add `style` and `controlPoints` to Connection type
2. Create `bezierUtils.ts` with curve calculations
3. Add default style to connection creation

### Step 2: Curved Connection Component
4. Create `CurvedConnection.tsx` component
5. Implement SVG path generation for bezier curves
6. Add selection hit area for curves
7. Implement arrow marker positioning on curves

### Step 3: Control Point Handles
8. Create `ConnectionControlPoints.tsx`
9. Implement draggable control point handles
10. Update control points on drag
11. Persist control points to connection

### Step 4: Connection Renderer Routing
12. Modify ConnectionRenderer to route by style
13. Pass control point handlers to curved component
14. Handle style switching

### Step 5: Property Panel Integration
15. Add connection style dropdown
16. Implement style change handler
17. Recalculate control points on style change

### Step 6: Auto-recalculation
18. Recalculate control points on shape move
19. Preserve manual adjustments flag
20. Add history tracking for control point changes

---

## Code Patterns

### Bezier Utilities

```typescript
// utils/bezierUtils.ts
import type { Point, AnchorPosition } from '../types';

export interface BezierCurve {
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
}

/**
 * Calculate automatic control points for a smooth curve
 */
export function calculateAutoControlPoints(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition
): { cp1: Point; cp2: Point } {
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const offset = Math.min(distance * 0.4, 100); // Cap at 100px

  const cp1 = getAnchorOffset(start, startAnchor, offset);
  const cp2 = getAnchorOffset(end, endAnchor, offset);

  return { cp1, cp2 };
}

function getAnchorOffset(
  point: Point,
  anchor: AnchorPosition,
  distance: number
): Point {
  switch (anchor) {
    case 'top':
      return { x: point.x, y: point.y - distance };
    case 'bottom':
      return { x: point.x, y: point.y + distance };
    case 'left':
      return { x: point.x - distance, y: point.y };
    case 'right':
      return { x: point.x + distance, y: point.y };
  }
}

/**
 * Generate SVG path for bezier curve
 */
export function bezierToSVGPath(curve: BezierCurve): string {
  const { start, cp1, cp2, end } = curve;
  return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
}

/**
 * Get point along bezier curve at t (0-1)
 */
export function getPointOnBezier(curve: BezierCurve, t: number): Point {
  const { start, cp1, cp2, end } = curve;
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;

  return {
    x: mt3 * start.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * end.x,
    y: mt3 * start.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * end.y,
  };
}

/**
 * Get tangent angle at point on curve (for arrow rotation)
 */
export function getTangentAngle(curve: BezierCurve, t: number): number {
  const { start, cp1, cp2, end } = curve;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  // First derivative of bezier
  const dx =
    3 * mt2 * (cp1.x - start.x) +
    6 * mt * t * (cp2.x - cp1.x) +
    3 * t2 * (end.x - cp2.x);
  const dy =
    3 * mt2 * (cp1.y - start.y) +
    6 * mt * t * (cp2.y - cp1.y) +
    3 * t2 * (end.y - cp2.y);

  return Math.atan2(dy, dx);
}

/**
 * Calculate midpoint of bezier curve
 */
export function getBezierMidpoint(curve: BezierCurve): Point {
  return getPointOnBezier(curve, 0.5);
}
```

### Curved Connection Component

```typescript
// components/canvas/connections/CurvedConnection.tsx
import React, { useMemo } from 'react';
import type { Connection, Point, AnchorPosition } from '../../../types';
import {
  calculateAutoControlPoints,
  bezierToSVGPath,
  getTangentAngle,
} from '../../../utils/bezierUtils';
import { ConnectionControlPoints } from './ConnectionControlPoints';

interface CurvedConnectionProps {
  connection: Connection;
  startPoint: Point;
  endPoint: Point;
  startAnchor: AnchorPosition;
  endAnchor: AnchorPosition;
  isSelected: boolean;
  onControlPointDrag?: (cp: 'cp1' | 'cp2', point: Point) => void;
}

export const CurvedConnection: React.FC<CurvedConnectionProps> = ({
  connection,
  startPoint,
  endPoint,
  startAnchor,
  endAnchor,
  isSelected,
  onControlPointDrag,
}) => {
  // Use stored control points or calculate auto
  const { cp1, cp2 } = useMemo(() => {
    if (connection.controlPoints) {
      return connection.controlPoints;
    }
    return calculateAutoControlPoints(startPoint, startAnchor, endPoint, endAnchor);
  }, [startPoint, startAnchor, endPoint, endAnchor, connection.controlPoints]);

  const curve = { start: startPoint, cp1, cp2, end: endPoint };
  const pathData = bezierToSVGPath(curve);

  // Calculate arrow rotation angles
  const startAngle = getTangentAngle(curve, 0) * (180 / Math.PI);
  const endAngle = getTangentAngle(curve, 1) * (180 / Math.PI);

  return (
    <g className="curved-connection">
      {/* Hit area for selection (wider, invisible) */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth={12}
        fill="none"
        className="cursor-pointer"
        pointerEvents="stroke"
      />

      {/* Selection highlight */}
      {isSelected && (
        <path
          d={pathData}
          stroke="#3B82F6"
          strokeWidth={(connection.strokeWidth || 2) + 4}
          fill="none"
          opacity={0.3}
          pointerEvents="none"
        />
      )}

      {/* Visible connection path */}
      <path
        d={pathData}
        stroke={connection.stroke || '#000'}
        strokeWidth={connection.strokeWidth || 2}
        strokeDasharray={connection.strokeDasharray}
        fill="none"
        markerEnd={
          connection.endArrow !== 'none'
            ? `url(#arrow-${connection.endArrow})`
            : undefined
        }
        markerStart={
          connection.startArrow !== 'none'
            ? `url(#arrow-${connection.startArrow})`
            : undefined
        }
        pointerEvents="none"
      />

      {/* Control point handles when selected */}
      {isSelected && (
        <ConnectionControlPoints
          startPoint={startPoint}
          endPoint={endPoint}
          cp1={cp1}
          cp2={cp2}
          onDrag={onControlPointDrag}
        />
      )}
    </g>
  );
};
```

### Connection Control Points Component

```typescript
// components/canvas/connections/ConnectionControlPoints.tsx
import React, { useCallback, useState } from 'react';
import type { Point } from '../../../types';

interface ConnectionControlPointsProps {
  startPoint: Point;
  endPoint: Point;
  cp1: Point;
  cp2: Point;
  onDrag?: (cp: 'cp1' | 'cp2', point: Point) => void;
}

export const ConnectionControlPoints: React.FC<ConnectionControlPointsProps> = ({
  startPoint,
  endPoint,
  cp1,
  cp2,
  onDrag,
}) => {
  const [dragging, setDragging] = useState<'cp1' | 'cp2' | null>(null);

  const handleMouseDown = useCallback(
    (cp: 'cp1' | 'cp2') => (e: React.MouseEvent) => {
      e.stopPropagation();
      setDragging(cp);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (onDrag) {
          // Convert to canvas coordinates (simplified - actual implementation needs viewport transform)
          onDrag(cp, { x: moveEvent.clientX, y: moveEvent.clientY });
        }
      };

      const handleMouseUp = () => {
        setDragging(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [onDrag]
  );

  return (
    <g className="control-points" pointerEvents="all">
      {/* Line from start to cp1 */}
      <line
        x1={startPoint.x}
        y1={startPoint.y}
        x2={cp1.x}
        y2={cp1.y}
        stroke="#94A3B8"
        strokeWidth={1}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* Line from end to cp2 */}
      <line
        x1={endPoint.x}
        y1={endPoint.y}
        x2={cp2.x}
        y2={cp2.y}
        stroke="#94A3B8"
        strokeWidth={1}
        strokeDasharray="4 2"
        pointerEvents="none"
      />

      {/* CP1 handle */}
      <circle
        cx={cp1.x}
        cy={cp1.y}
        r={6}
        fill={dragging === 'cp1' ? '#3B82F6' : 'white'}
        stroke="#3B82F6"
        strokeWidth={2}
        className="cursor-move"
        onMouseDown={handleMouseDown('cp1')}
      />

      {/* CP2 handle */}
      <circle
        cx={cp2.x}
        cy={cp2.y}
        r={6}
        fill={dragging === 'cp2' ? '#3B82F6' : 'white'}
        stroke="#3B82F6"
        strokeWidth={2}
        className="cursor-move"
        onMouseDown={handleMouseDown('cp2')}
      />
    </g>
  );
};
```

### Connection Renderer Routing

```typescript
// components/canvas/ConnectionRenderer.tsx (modified)
import React from 'react';
import { CurvedConnection } from './connections/CurvedConnection';
import { StraightConnection } from './connections/StraightConnection';

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connection,
  startPoint,
  endPoint,
  startAnchor,
  endAnchor,
  isSelected,
  onControlPointDrag,
}) => {
  if (connection.style === 'curved') {
    return (
      <CurvedConnection
        connection={connection}
        startPoint={startPoint}
        endPoint={endPoint}
        startAnchor={startAnchor}
        endAnchor={endAnchor}
        isSelected={isSelected}
        onControlPointDrag={onControlPointDrag}
      />
    );
  }

  return (
    <StraightConnection
      connection={connection}
      startPoint={startPoint}
      endPoint={endPoint}
      isSelected={isSelected}
    />
  );
};
```

### Property Panel - Connection Style

```typescript
// Add to PropertyPanel connection section

const ConnectionStyleSection: React.FC<{ connection: Connection }> = ({ connection }) => {
  const { updateConnection } = useDiagramStore();

  const handleStyleChange = (style: ConnectionStyle) => {
    updateConnection(connection.id, {
      style,
      // Reset control points when switching to curved (will auto-calculate)
      controlPoints: style === 'curved' ? undefined : undefined,
    });
  };

  return (
    <div className="connection-style-section">
      <Label>Style</Label>
      <Select
        value={connection.style || 'straight'}
        onValueChange={handleStyleChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="straight">Straight</SelectItem>
          <SelectItem value="curved">Curved</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
```

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/bezierUtils.test.ts
describe('bezierUtils', () => {
  it('should calculate control points for right-to-left connection', () => {
    const start = { x: 100, y: 100 };
    const end = { x: 300, y: 200 };
    const { cp1, cp2 } = calculateAutoControlPoints(start, 'right', end, 'left');

    expect(cp1.x).toBeGreaterThan(start.x);
    expect(cp1.y).toBe(start.y);
    expect(cp2.x).toBeLessThan(end.x);
    expect(cp2.y).toBe(end.y);
  });

  it('should generate valid SVG path', () => {
    const curve = {
      start: { x: 0, y: 0 },
      cp1: { x: 50, y: 0 },
      cp2: { x: 50, y: 100 },
      end: { x: 100, y: 100 },
    };
    const path = bezierToSVGPath(curve);

    expect(path).toMatch(/^M 0 0 C/);
    expect(path).toContain('50 0');
    expect(path).toContain('100 100');
  });

  it('should get point on curve at midpoint', () => {
    const curve = {
      start: { x: 0, y: 0 },
      cp1: { x: 50, y: 0 },
      cp2: { x: 50, y: 100 },
      end: { x: 100, y: 100 },
    };
    const midpoint = getPointOnBezier(curve, 0.5);

    expect(midpoint.x).toBeCloseTo(50);
    expect(midpoint.y).toBeCloseTo(50);
  });
});
```

---

## Performance Considerations

- Cache control points on connection object
- Only recalculate when shapes move or style changes
- Use `useMemo` for path calculations
- Debounce control point drag updates

---

## History Integration

Control point changes tracked in history:

```typescript
interface ControlPointHistoryEntry {
  type: 'connection-control-points';
  connectionId: string;
  previousControlPoints: ConnectionControlPoints | undefined;
  newControlPoints: ConnectionControlPoints;
}
```
