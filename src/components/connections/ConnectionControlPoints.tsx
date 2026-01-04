import { memo } from 'react';
import type { Point } from '@/types/common';
import { COLORS } from '@/lib/constants';

interface ConnectionControlPointsProps {
  start: Point;
  end: Point;
  cp1: Point;
  cp2: Point;
  onControlPointDragStart: (cpIndex: 1 | 2, e: React.MouseEvent) => void;
}

const CONTROL_POINT_RADIUS = 5;
const GUIDE_LINE_DASH = '4 2';

export const ConnectionControlPoints = memo(function ConnectionControlPoints({
  start,
  end,
  cp1,
  cp2,
  onControlPointDragStart,
}: ConnectionControlPointsProps) {
  return (
    <g className="connection-control-points" pointerEvents="all">
      {/* Guide line from start to cp1 */}
      <line
        x1={start.x}
        y1={start.y}
        x2={cp1.x}
        y2={cp1.y}
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        strokeDasharray={GUIDE_LINE_DASH}
        opacity={0.6}
        pointerEvents="none"
      />

      {/* Guide line from end to cp2 */}
      <line
        x1={end.x}
        y1={end.y}
        x2={cp2.x}
        y2={cp2.y}
        stroke={COLORS.SELECTION}
        strokeWidth={1}
        strokeDasharray={GUIDE_LINE_DASH}
        opacity={0.6}
        pointerEvents="none"
      />

      {/* Control point 1 handle */}
      <circle
        cx={cp1.x}
        cy={cp1.y}
        r={CONTROL_POINT_RADIUS}
        fill="white"
        stroke={COLORS.SELECTION}
        strokeWidth={2}
        style={{ cursor: 'move' }}
        onMouseDown={(e) => onControlPointDragStart(1, e)}
      />

      {/* Control point 2 handle */}
      <circle
        cx={cp2.x}
        cy={cp2.y}
        r={CONTROL_POINT_RADIUS}
        fill="white"
        stroke={COLORS.SELECTION}
        strokeWidth={2}
        style={{ cursor: 'move' }}
        onMouseDown={(e) => onControlPointDragStart(2, e)}
      />
    </g>
  );
});
