import React from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { AnchorPoint } from './AnchorPoint';
import { getAllAnchors } from '@/lib/geometry/connection';
import type { AnchorPosition } from '@/types/connections';

interface AnchorPointsOverlayProps {
  hoveredShapeId: string | null;
  onAnchorMouseDown: (
    shapeId: string,
    anchor: AnchorPosition,
    e: React.MouseEvent
  ) => void;
}

export function AnchorPointsOverlay({
  hoveredShapeId,
  onAnchorMouseDown,
}: AnchorPointsOverlayProps) {
  const shapes = useDiagramStore((s) => s.shapes);
  const activeTool = useInteractionStore((s) => s.activeTool);
  const connectionCreationState = useInteractionStore(
    (s) => s.connectionCreationState
  );

  // Only show anchors when connection tool is active
  if (activeTool !== 'connection') {
    return null;
  }

  const hoveredShape = hoveredShapeId ? shapes[hoveredShapeId] : null;

  // Also show anchors on the source shape during creation
  const sourceShape = connectionCreationState
    ? shapes[connectionCreationState.sourceShapeId]
    : null;

  return (
    <g className="anchor-points-overlay">
      {/* Show anchors on source shape during connection creation */}
      {sourceShape &&
        connectionCreationState &&
        getAllAnchors(sourceShape).map(({ anchor, point }) => (
          <AnchorPoint
            key={`source-${connectionCreationState.sourceShapeId}-${anchor}`}
            point={point}
            anchor={anchor}
            isHighlighted={anchor === connectionCreationState.sourceAnchor}
          />
        ))}

      {/* Show anchors on hovered shape */}
      {hoveredShape &&
        hoveredShapeId &&
        hoveredShapeId !== connectionCreationState?.sourceShapeId &&
        getAllAnchors(hoveredShape).map(({ anchor, point }) => (
          <AnchorPoint
            key={`hover-${hoveredShapeId}-${anchor}`}
            point={point}
            anchor={anchor}
            onMouseDown={(e) => onAnchorMouseDown(hoveredShapeId, anchor, e)}
          />
        ))}

      {/* Preview line during connection creation */}
      {connectionCreationState && (
        <line
          x1={connectionCreationState.sourcePoint.x}
          y1={connectionCreationState.sourcePoint.y}
          x2={connectionCreationState.currentPoint.x}
          y2={connectionCreationState.currentPoint.y}
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray="4 4"
          pointerEvents="none"
        />
      )}
    </g>
  );
}
