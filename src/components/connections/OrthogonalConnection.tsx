import { memo, useMemo } from 'react';
import type { Point } from '@/types/common';
import type { ArrowType, AnchorPosition } from '@/types/connections';
import type { StrokeStyle } from '@/types/shapes';
import {
  calculateOrthogonalPath,
  calculateOrthogonalPathWithWaypoints,
  orthogonalToSVGPath,
} from '@/lib/geometry/orthogonal';
import { CONNECTION_DEFAULTS } from '@/lib/constants';

interface OrthogonalConnectionProps {
  startPoint: Point;
  endPoint: Point;
  startAnchor: AnchorPosition;
  endAnchor: AnchorPosition;
  waypointPositions?: Point[];
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
  onDoubleClick?: (e: React.MouseEvent) => void;
}

export const OrthogonalConnection = memo(function OrthogonalConnection({
  startPoint,
  endPoint,
  startAnchor,
  endAnchor,
  waypointPositions,
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
  onDoubleClick,
}: OrthogonalConnectionProps) {
  // Calculate orthogonal path based on anchor positions
  const pathData = useMemo(() => {
    const points = waypointPositions && waypointPositions.length > 0
      ? calculateOrthogonalPathWithWaypoints(
          startPoint,
          startAnchor,
          endPoint,
          endAnchor,
          waypointPositions
        )
      : calculateOrthogonalPath(
          startPoint,
          startAnchor,
          endPoint,
          endAnchor
        );
    return orthogonalToSVGPath(points);
  }, [startPoint, startAnchor, endPoint, endAnchor, waypointPositions]);

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
        strokeWidth={Math.max(
          CONNECTION_DEFAULTS.MIN_HIT_AREA_WIDTH,
          lineWidth + 10
        )}
        fill="none"
        style={{ cursor: 'pointer' }}
        onMouseDown={onMouseDown}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDoubleClick={onDoubleClick}
      />

      {/* Visible orthogonal path */}
      <path
        d={pathData}
        stroke={lineColor}
        strokeWidth={lineWidth}
        strokeDasharray={strokeDasharray}
        strokeLinejoin="miter"
        fill="none"
        markerEnd={
          targetArrow !== 'none' ? `url(#${endMarkerId})` : undefined
        }
        markerStart={
          sourceArrow !== 'none' ? `url(#${startMarkerId})` : undefined
        }
        pointerEvents="none"
      />
    </>
  );
});
