# Improvements

Planned enhancements and feature ideas for future implementation.

---

## Open Improvements

### IMP-001: Smart Anchor Point Selection During Shape Movement
**Status:** Open
**Priority:** Medium
**Category:** Connections

**Description:**
When moving shapes that have connections, the anchor points remain fixed even if the new position would cause the connection to pass through other shapes. The system should automatically re-evaluate and select better anchor points to avoid connections cutting through connected shapes.

**Current Behavior:**
1. Shape A is connected to Shape B via anchor points (e.g., right side of A to left side of B)
2. User moves Shape A to the opposite side of Shape B
3. The connection still uses the original anchor points, causing the line to pass through Shape B

**Expected Behavior:**
When a shape is moved, the system should:
1. Detect if the connection path now intersects with any connected shapes
2. Automatically select new anchor points that minimize or eliminate shape intersections
3. Consider all available anchor points on both shapes to find the optimal pair

**Technical Considerations:**
- Use existing anchor point infrastructure from `src/lib/geometry/anchorSelection.ts`
- Extend `findOptimalAnchors()` to consider shape obstacles
- Check for intersection between connection path and shape bounds
- May need to run during shape move (real-time) or only on move end (for performance)
- Could be implemented as an optional "smart routing" feature

**Suggested Algorithm:**
```typescript
// Pseudocode
function selectOptimalAnchors(
  sourceShape: Shape,
  targetShape: Shape,
  allShapes: Shape[]
): { sourceAnchor: AnchorPosition, targetAnchor: AnchorPosition } {
  const sourceAnchors = getAnchorPoints(sourceShape);
  const targetAnchors = getAnchorPoints(targetShape);

  let bestPair = { source: 'right', target: 'left' };
  let bestScore = Infinity;

  for (const source of sourceAnchors) {
    for (const target of targetAnchors) {
      const path = createConnectionPath(source, target);
      const intersections = countShapeIntersections(path, allShapes);
      const distance = calculatePathLength(path);
      const score = intersections * 1000 + distance; // Heavily penalize intersections

      if (score < bestScore) {
        bestScore = score;
        bestPair = { source: source.position, target: target.position };
      }
    }
  }

  return bestPair;
}
```

**Related Issues:**
- KI-004: Connection Lines Cut Through Shapes (partially resolved with orthogonal/curved connections)

**Implementation Notes:**
- Could be triggered automatically on shape move end
- Could be a manual "optimize connections" action
- Should respect user-pinned anchor points (if implemented)

---

### IMP-002: Connection Obstacle Avoidance (A* Pathfinding)
**Status:** Open
**Priority:** Low
**Category:** Connections

**Description:**
Implement automatic pathfinding for connections to route around shapes rather than through them. This would complement orthogonal connections with intelligent obstacle avoidance.

**Current State:**
- Orthogonal connections use basic routing that doesn't consider other shapes
- Users must manually reposition shapes or use waypoints to avoid intersections

**Expected Behavior:**
Connections automatically find paths around intermediate shapes using pathfinding algorithms like A*.

**Technical Considerations:**
- Create a grid-based representation of the canvas for pathfinding
- Use A* or similar algorithm to find optimal paths
- Balance path length vs. number of turns
- Performance considerations for real-time updates during shape movement

---

### IMP-003: Anchor Point Pinning
**Status:** Open
**Priority:** Low
**Category:** Connections

**Description:**
Allow users to "pin" anchor points so they don't change when shapes are moved or when smart anchor selection is enabled.

**Use Case:**
User wants a connection to always use specific anchor points regardless of shape positions.

---

## Completed Improvements

(None yet)

---
