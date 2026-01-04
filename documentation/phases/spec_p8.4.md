# Phase 8.4: Orthogonal Connections - Technical Specification

## Technical Architecture

### Component Hierarchy

```
Canvas
├── ConnectionRenderer (modified)
│   ├── StraightConnection
│   ├── CurvedConnection
│   └── OrthogonalConnection (new)
```

### Connection Type Extension

```typescript
// ConnectionStyle now includes 'orthogonal'
type ConnectionStyle = 'straight' | 'curved' | 'orthogonal';
```

---

## Files to Create

### New Files

```
src/
├── utils/
│   └── orthogonalRouting.ts              # Orthogonal path calculations
└── components/
    └── canvas/
        └── connections/
            └── OrthogonalConnection.tsx  # Orthogonal renderer
```

### Files to Modify

```
src/
├── types/
│   └── connections.ts                    # Add 'orthogonal' to ConnectionStyle
├── components/
│   ├── canvas/
│   │   └── ConnectionRenderer.tsx        # Route to orthogonal
│   └── panels/
│       └── PropertyPanel.tsx             # Add orthogonal option
```

---

## Implementation Order

### Step 1: Routing Algorithm
1. Create `orthogonalRouting.ts`
2. Implement strategy detection
3. Implement L/Z/U path generation
4. Add path simplification

### Step 2: Orthogonal Component
5. Create `OrthogonalConnection.tsx`
6. Render polyline path
7. Add selection hit area
8. Handle arrow markers

### Step 3: Integration
9. Add 'orthogonal' to ConnectionStyle type
10. Update ConnectionRenderer routing
11. Add to property panel dropdown

### Step 4: Dynamic Updates
12. Recalculate path on shape move
13. Update during drag operations
14. Add to history tracking

---

## Code Patterns

### Orthogonal Routing Algorithm

```typescript
// utils/orthogonalRouting.ts
import type { Point, AnchorPosition } from '../types';

export type RoutingStrategy = 'direct' | 'z-shape' | 'u-shape';

export interface OrthogonalRoute {
  points: Point[];
  strategy: RoutingStrategy;
}

const EXIT_OFFSET = 20; // Distance to exit perpendicular

/**
 * Calculate orthogonal path between two anchors
 */
export function calculateOrthogonalPath(
  start: Point,
  startAnchor: AnchorPosition,
  end: Point,
  endAnchor: AnchorPosition
): Point[] {
  const points: Point[] = [start];

  // Get exit and entry points
  const exitPoint = getExitPoint(start, startAnchor, EXIT_OFFSET);
  const entryPoint = getExitPoint(end, endAnchor, EXIT_OFFSET);

  // Determine routing strategy
  const strategy = determineStrategy(startAnchor, endAnchor, exitPoint, entryPoint);

  switch (strategy) {
    case 'direct':
      // L-shaped: one turn
      points.push(exitPoint);
      if (isHorizontal(startAnchor)) {
        points.push({ x: exitPoint.x, y: entryPoint.y });
      } else {
        points.push({ x: entryPoint.x, y: exitPoint.y });
      }
      break;

    case 'z-shape':
      // Z-shaped: two turns with midpoint
      const midX = (exitPoint.x + entryPoint.x) / 2;
      const midY = (exitPoint.y + entryPoint.y) / 2;

      points.push(exitPoint);
      if (isHorizontal(startAnchor)) {
        points.push({ x: midX, y: exitPoint.y });
        points.push({ x: midX, y: entryPoint.y });
      } else {
        points.push({ x: exitPoint.x, y: midY });
        points.push({ x: entryPoint.x, y: midY });
      }
      break;

    case 'u-shape':
      // U-shaped: goes around
      const offset = Math.max(
        Math.abs(end.x - start.x) * 0.3,
        Math.abs(end.y - start.y) * 0.3,
        50
      );
      points.push(exitPoint);

      if (isHorizontal(startAnchor)) {
        const farX = startAnchor === 'right'
          ? Math.max(exitPoint.x, entryPoint.x) + offset
          : Math.min(exitPoint.x, entryPoint.x) - offset;
        points.push({ x: farX, y: exitPoint.y });
        points.push({ x: farX, y: entryPoint.y });
      } else {
        const farY = startAnchor === 'bottom'
          ? Math.max(exitPoint.y, entryPoint.y) + offset
          : Math.min(exitPoint.y, entryPoint.y) - offset;
        points.push({ x: exitPoint.x, y: farY });
        points.push({ x: entryPoint.x, y: farY });
      }
      break;
  }

  points.push(entryPoint);
  points.push(end);

  return simplifyPath(points);
}

function getExitPoint(point: Point, anchor: AnchorPosition, offset: number): Point {
  switch (anchor) {
    case 'top': return { x: point.x, y: point.y - offset };
    case 'bottom': return { x: point.x, y: point.y + offset };
    case 'left': return { x: point.x - offset, y: point.y };
    case 'right': return { x: point.x + offset, y: point.y };
  }
}

function isHorizontal(anchor: AnchorPosition): boolean {
  return anchor === 'left' || anchor === 'right';
}

function determineStrategy(
  startAnchor: AnchorPosition,
  endAnchor: AnchorPosition,
  exitPoint: Point,
  entryPoint: Point
): RoutingStrategy {
  // Same direction anchors need U-shape
  if (startAnchor === endAnchor) {
    return 'u-shape';
  }

  // Perpendicular anchors can use direct L-shape
  if (isHorizontal(startAnchor) !== isHorizontal(endAnchor)) {
    return 'direct';
  }

  // Opposite directions on same axis use Z-shape
  return 'z-shape';
}

/**
 * Remove redundant points on same line
 */
function simplifyPath(points: Point[]): Point[] {
  if (points.length <= 2) return points;

  const simplified: Point[] = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = simplified[simplified.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    const onHorizontalLine = prev.y === curr.y && curr.y === next.y;
    const onVerticalLine = prev.x === curr.x && curr.x === next.x;

    if (!onHorizontalLine && !onVerticalLine) {
      simplified.push(curr);
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
}

/**
 * Generate SVG path string for orthogonal route
 */
export function orthogonalToSVGPath(points: Point[]): string {
  if (points.length < 2) return '';

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }

  return path;
}
```

### Orthogonal Connection Component

```typescript
// components/canvas/connections/OrthogonalConnection.tsx
import React, { useMemo } from 'react';
import type { Connection, Point, AnchorPosition } from '../../../types';
import { calculateOrthogonalPath, orthogonalToSVGPath } from '../../../utils/orthogonalRouting';

interface OrthogonalConnectionProps {
  connection: Connection;
  startPoint: Point;
  endPoint: Point;
  startAnchor: AnchorPosition;
  endAnchor: AnchorPosition;
  isSelected: boolean;
}

export const OrthogonalConnection: React.FC<OrthogonalConnectionProps> = ({
  connection,
  startPoint,
  endPoint,
  startAnchor,
  endAnchor,
  isSelected,
}) => {
  const pathData = useMemo(() => {
    const points = calculateOrthogonalPath(startPoint, startAnchor, endPoint, endAnchor);
    return orthogonalToSVGPath(points);
  }, [startPoint, startAnchor, endPoint, endAnchor]);

  return (
    <g className="orthogonal-connection">
      {/* Hit area for selection */}
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

      {/* Visible path */}
      <path
        d={pathData}
        stroke={connection.stroke || '#000'}
        strokeWidth={connection.strokeWidth || 2}
        strokeDasharray={connection.strokeDasharray}
        fill="none"
        strokeLinejoin="miter"
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
    </g>
  );
};
```

### Updated Connection Renderer

```typescript
// ConnectionRenderer.tsx (updated)
import { OrthogonalConnection } from './connections/OrthogonalConnection';

export const ConnectionRenderer: React.FC<ConnectionRendererProps> = ({
  connection,
  ...props
}) => {
  switch (connection.style) {
    case 'curved':
      return <CurvedConnection connection={connection} {...props} />;
    case 'orthogonal':
      return <OrthogonalConnection connection={connection} {...props} />;
    default:
      return <StraightConnection connection={connection} {...props} />;
  }
};
```

---

## Testing Approach

### Unit Tests

```typescript
// __tests__/orthogonalRouting.test.ts
describe('orthogonalRouting', () => {
  it('should create L-shape for perpendicular anchors', () => {
    const points = calculateOrthogonalPath(
      { x: 100, y: 100 }, 'right',
      { x: 200, y: 200 }, 'top'
    );

    // All segments should be H or V
    for (let i = 1; i < points.length; i++) {
      const isH = points[i].y === points[i - 1].y;
      const isV = points[i].x === points[i - 1].x;
      expect(isH || isV).toBe(true);
    }
  });

  it('should create Z-shape for opposite anchors', () => {
    const points = calculateOrthogonalPath(
      { x: 100, y: 100 }, 'right',
      { x: 300, y: 100 }, 'left'
    );

    expect(points.length).toBeGreaterThanOrEqual(4);
  });

  it('should create U-shape for same-side anchors', () => {
    const points = calculateOrthogonalPath(
      { x: 100, y: 100 }, 'right',
      { x: 200, y: 200 }, 'right'
    );

    // Should go further right than both points
    const maxX = Math.max(...points.map(p => p.x));
    expect(maxX).toBeGreaterThan(200);
  });

  it('should generate valid SVG path', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
      { x: 100, y: 50 },
    ];
    const path = orthogonalToSVGPath(points);

    expect(path).toBe('M 0 0 L 50 0 L 50 50 L 100 50');
  });
});
```

---

## Performance Considerations

- Cache calculated paths when shapes don't move
- Use `useMemo` for path calculation
- Avoid recalculating during selection changes

---

## Future Enhancements (Not in Scope)

- Obstacle avoidance (A* pathfinding)
- Rounded corners option
- Manual waypoint adjustment (covered in 8.5)
- Minimum segment length constraints
