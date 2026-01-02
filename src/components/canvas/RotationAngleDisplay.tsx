import { memo } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';
import { useDiagramStore } from '@/stores/diagramStore';

/**
 * Displays the current rotation angle during a rotation operation.
 * Shows a tooltip-like display near the shape being rotated.
 */
export const RotationAngleDisplay = memo(function RotationAngleDisplay() {
  const manipulationState = useInteractionStore((s) => s.manipulationState);
  const shapes = useDiagramStore((s) => s.shapes);

  // Only show during rotation
  if (manipulationState?.type !== 'rotate') {
    return null;
  }

  const shape = shapes[manipulationState.shapeId];
  if (!shape) return null;

  // Position below the shape
  const displayX = shape.x + shape.width / 2;
  const displayY = shape.y + shape.height + 25;

  // Round to whole degrees
  const formattedAngle = Math.round(shape.rotation);

  return (
    <g className="rotation-display" pointerEvents="none">
      {/* Background pill */}
      <rect
        x={displayX - 25}
        y={displayY - 10}
        width={50}
        height={20}
        rx={4}
        fill="rgba(0, 0, 0, 0.8)"
      />
      {/* Angle text */}
      <text
        x={displayX}
        y={displayY + 4}
        textAnchor="middle"
        fill="white"
        fontSize={12}
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {formattedAngle}°
      </text>
    </g>
  );
});
