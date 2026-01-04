/**
 * Connection Waypoints Component
 *
 * Renders draggable waypoint handles on a connection when selected.
 * Waypoints allow manual control of the connection path.
 */

import { memo } from 'react';
import type { Point } from '@/types/common';
import { COLORS } from '@/lib/constants';

/** Waypoint with computed absolute position for rendering */
export interface WaypointHandle {
  id: string;
  position: Point;
}

interface ConnectionWaypointsProps {
  /** Waypoints with their computed absolute positions */
  waypoints: WaypointHandle[];
  /** Handler for starting waypoint drag */
  onDragStart: (waypointId: string, e: React.MouseEvent) => void;
  /** Handler for double-clicking a waypoint (to remove it) */
  onDoubleClick: (waypointId: string, e: React.MouseEvent) => void;
}

const WAYPOINT_RADIUS = 5;
const WAYPOINT_STROKE_WIDTH = 2;

export const ConnectionWaypoints = memo(function ConnectionWaypoints({
  waypoints,
  onDragStart,
  onDoubleClick,
}: ConnectionWaypointsProps) {
  if (waypoints.length === 0) {
    return null;
  }

  return (
    <g className="connection-waypoints">
      {waypoints.map(({ id, position }) => (
        <g key={id}>
          {/* Invisible larger hit area for easier interaction */}
          <circle
            cx={position.x}
            cy={position.y}
            r={WAYPOINT_RADIUS + 4}
            fill="transparent"
            style={{ cursor: 'grab' }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onDragStart(id, e);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onDoubleClick(id, e);
            }}
          />

          {/* Visible waypoint handle - diamond shape */}
          <rect
            x={position.x - WAYPOINT_RADIUS}
            y={position.y - WAYPOINT_RADIUS}
            width={WAYPOINT_RADIUS * 2}
            height={WAYPOINT_RADIUS * 2}
            fill="white"
            stroke={COLORS.SELECTION}
            strokeWidth={WAYPOINT_STROKE_WIDTH}
            transform={`rotate(45 ${position.x} ${position.y})`}
            pointerEvents="none"
          />
        </g>
      ))}
    </g>
  );
});
