import { memo, useMemo } from 'react';
import type { Point } from '@/types/common';
import type { ArrowType } from '@/types/connections';
import type { StrokeStyle } from '@/types/shapes';
import { bezierToSVGPath } from '@/lib/geometry/bezier';
import { CONNECTION_DEFAULTS } from '@/lib/constants';

interface CurvedConnectionProps {
  startPoint: Point;
  endPoint: Point;
  cp1: Point;  // Absolute control point 1 (pre-calculated)
  cp2: Point;  // Absolute control point 2 (pre-calculated)
  lineColor: string;
  lineWidth: number;
  strokeStyle: StrokeStyle;
  sourceArrow: ArrowType;
  targetArrow: ArrowType;
  startMarkerId: string;
  endMarkerId: string;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const CurvedConnection = memo(function CurvedConnection({
  startPoint,
  endPoint,
  cp1,
  cp2,
  lineColor,
  lineWidth,
  strokeStyle,
  sourceArrow,
  targetArrow,
  startMarkerId,
  endMarkerId,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: CurvedConnectionProps) {
  const pathData = useMemo(() => {
    return bezierToSVGPath({ start: startPoint, cp1, cp2, end: endPoint });
  }, [startPoint, cp1, cp2, endPoint]);

  // Get stroke dasharray based on stroke style
  const strokeDasharray = useMemo(() => {
    switch (strokeStyle) {
      case 'dashed':
        return '8 4';
      case 'dotted':
        return '2 4';
      default:
        return undefined;
    }
  }, [strokeStyle]);

  return (
    <>
      {/* Invisible wider hit area for easier clicking */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth={Math.max(CONNECTION_DEFAULTS.MIN_HIT_AREA_WIDTH, lineWidth + 10)}
        fill="none"
        style={{ cursor: 'pointer' }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />

      {/* Visible bezier curve */}
      <path
        d={pathData}
        stroke={lineColor}
        strokeWidth={lineWidth}
        strokeDasharray={strokeDasharray}
        fill="none"
        markerEnd={
          targetArrow !== 'none'
            ? `url(#${endMarkerId})`
            : undefined
        }
        markerStart={
          sourceArrow !== 'none'
            ? `url(#${startMarkerId})`
            : undefined
        }
        pointerEvents="none"
      />
    </>
  );
});
