import { memo, useMemo } from 'react';
import type { Shape } from '@/types/shapes';
import type { AnchorPosition } from '@/types/connections';

interface ShapeConnectionHighlightProps {
  shape: Shape;
  predictedAnchor: AnchorPosition | null;
  isSnapped: boolean;
}

/**
 * Visual highlight shown on a shape during connection targeting.
 * Shows:
 * - Border highlight around the shape (dashed if auto-selecting, solid if snapped)
 * - All 4 anchor points (dimmed)
 * - Predicted anchor point emphasized (larger, filled)
 */
export const ShapeConnectionHighlight = memo(function ShapeConnectionHighlight({
  shape,
  predictedAnchor,
  isSnapped,
}: ShapeConnectionHighlightProps) {
  // Calculate anchor positions
  const anchors = useMemo(() => {
    const cx = shape.x + shape.width / 2;
    const cy = shape.y + shape.height / 2;

    return [
      { anchor: 'top' as const, point: { x: cx, y: shape.y } },
      { anchor: 'bottom' as const, point: { x: cx, y: shape.y + shape.height } },
      { anchor: 'left' as const, point: { x: shape.x, y: cy } },
      { anchor: 'right' as const, point: { x: shape.x + shape.width, y: cy } },
    ];
  }, [shape.x, shape.y, shape.width, shape.height]);

  // Get shape bounds for highlight
  const highlightBounds = useMemo(() => {
    const padding = 3;
    return {
      x: shape.x - padding,
      y: shape.y - padding,
      width: shape.width + padding * 2,
      height: shape.height + padding * 2,
    };
  }, [shape.x, shape.y, shape.width, shape.height]);

  return (
    <g className="shape-connection-highlight" pointerEvents="none">
      {/* Shape highlight border */}
      {shape.type === 'ellipse' ? (
        <ellipse
          cx={shape.x + shape.width / 2}
          cy={shape.y + shape.height / 2}
          rx={shape.width / 2 + 3}
          ry={shape.height / 2 + 3}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray={isSnapped ? 'none' : '4 2'}
          opacity={0.7}
        />
      ) : (
        <rect
          x={highlightBounds.x}
          y={highlightBounds.y}
          width={highlightBounds.width}
          height={highlightBounds.height}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={2}
          strokeDasharray={isSnapped ? 'none' : '4 2'}
          rx={4}
          opacity={0.7}
        />
      )}

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
});
