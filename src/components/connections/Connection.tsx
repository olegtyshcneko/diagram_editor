import { memo, useMemo, useCallback } from 'react';
import type { Point } from '@/types/common';
import type { Connection as ConnectionType } from '@/types/connections';
import type { Shape } from '@/types/shapes';
import { getConnectionEndpoints } from '@/lib/geometry/connection';
import { getAbsoluteControlPoints } from '@/lib/geometry/bezier';
import { waypointsToAbsolute, getPointOnPath } from '@/lib/geometry/pathUtils';
import { COLORS, CONNECTION_DEFAULTS } from '@/lib/constants';
import { CurvedConnection } from './CurvedConnection';
import { OrthogonalConnection } from './OrthogonalConnection';
import { ConnectionControlPoints } from './ConnectionControlPoints';
import { ConnectionLabel } from './ConnectionLabel';
import { ConnectionWaypoints } from './ConnectionWaypoints';
import { useControlPointDrag } from '@/hooks/useControlPointDrag';
import { useLabelDrag } from '@/hooks/useLabelDrag';
import { useWaypointDrag } from '@/hooks/useWaypointDrag';

interface ConnectionProps {
  connection: ConnectionType;
  shapes: Record<string, Shape>;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onLabelDoubleClick?: () => void;
  onWaypointDoubleClick?: (waypointId: string) => void;
}

const ARROW_SIZE = CONNECTION_DEFAULTS.ARROW_SIZE;
const MIN_HIT_AREA_WIDTH = CONNECTION_DEFAULTS.MIN_HIT_AREA_WIDTH;

/**
 * Generate SVG path for straight connection with waypoints
 */
function straightPathWithWaypoints(start: Point, end: Point, waypointPositions: Point[]): string {
  const allPoints = [start, ...waypointPositions, end];
  let path = `M ${allPoints[0].x} ${allPoints[0].y}`;
  for (let i = 1; i < allPoints.length; i++) {
    path += ` L ${allPoints[i].x} ${allPoints[i].y}`;
  }
  return path;
}

export const Connection = memo(function Connection({
  connection,
  shapes,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onDoubleClick,
  onLabelDoubleClick,
  onWaypointDoubleClick,
}: ConnectionProps) {
  // Only depend on the specific shapes this connection uses, not the entire shapes object
  const sourceShape = shapes[connection.sourceShapeId];
  const targetShape = connection.targetShapeId
    ? shapes[connection.targetShapeId]
    : undefined;

  const endpoints = useMemo(
    () => getConnectionEndpoints(connection, shapes),
    [connection, sourceShape, targetShape]
  );

  if (!endpoints) return null;

  const { start, end } = endpoints;
  const { id, stroke, strokeWidth, sourceArrow, targetArrow, curveType, sourceAnchor, targetAnchor } = connection;

  // Determine connection type
  const isCurved = curveType === 'bezier';
  const isOrthogonal = curveType === 'orthogonal';

  // Calculate control points for curved connections using utility
  // Note: connection.controlPoints stores RELATIVE OFFSETS from endpoints
  // This ensures curves maintain their shape when shapes are moved
  const { cp1, cp2 } = useMemo(() => {
    if (!isCurved) {
      // For straight connections, control points aren't used but we provide defaults
      return { cp1: start, cp2: end };
    }
    // Use utility to convert relative offsets to absolute positions (or auto-calculate)
    return getAbsoluteControlPoints(
      connection.controlPoints,
      start,
      end,
      sourceAnchor,
      targetAnchor || 'left'
    );
  }, [isCurved, start, end, sourceAnchor, targetAnchor, connection.controlPoints]);

  // Convert relative waypoints to absolute positions
  // This ensures waypoints move correctly when connected shapes are moved
  const waypointPositions = useMemo(() =>
    waypointsToAbsolute(connection.waypoints, start, end),
    [connection.waypoints, start, end]
  );

  // Enriched waypoints with IDs and positions for rendering handles
  const waypointHandles = useMemo(() =>
    connection.waypoints.map((wp, i) => ({
      id: wp.id,
      position: waypointPositions[i],
    })),
    [connection.waypoints, waypointPositions]
  );

  // Compute label position on path
  const labelPoint = useMemo(() => {
    if (!connection.label) return null;
    return getPointOnPath(curveType, start, end, connection.labelPosition ?? 0.5, {
      cp1: isCurved ? cp1 : undefined,
      cp2: isCurved ? cp2 : undefined,
      startAnchor: sourceAnchor,
      endAnchor: targetAnchor || 'left',
      waypointPositions,
    });
  }, [connection.label, connection.labelPosition, curveType, start, end, cp1, cp2, isCurved, sourceAnchor, targetAnchor, waypointPositions]);

  // Control point drag hook (only active for curved connections)
  // Pass start/end points so the hook can calculate relative offsets when storing
  const controlPointDrag = useControlPointDrag({
    connectionId: id,
    currentCp1: cp1,
    currentCp2: cp2,
    startPoint: start,
    endPoint: end,
    enabled: isCurved,
  });

  // Label drag hook (only active when connection has a label)
  const labelDrag = useLabelDrag({
    connectionId: id,
    enabled: !!connection.label && isSelected,
  });

  // Waypoint drag hook
  const waypointDrag = useWaypointDrag({
    connectionId: id,
    enabled: isSelected && connection.waypoints.length > 0,
  });

  // Handle label double-click
  const handleLabelDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLabelDoubleClick?.();
  }, [onLabelDoubleClick]);

  // Handle waypoint double-click (removes waypoint)
  const handleWaypointDoubleClick = useCallback((waypointId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onWaypointDoubleClick?.(waypointId);
  }, [onWaypointDoubleClick]);

  // Handle label mouse down - select connection AND start drag
  const handleLabelMouseDown = useCallback((e: React.MouseEvent) => {
    // First select the connection (same as clicking on the line)
    onMouseDown(e);
    // Then start the label drag if connection is selected
    if (isSelected) {
      labelDrag.handleDragStart(e);
    }
  }, [onMouseDown, isSelected, labelDrag]);

  // Determine colors based on state
  const lineColor = isSelected
    ? COLORS.SELECTION
    : isHovered
      ? COLORS.SELECTION_HOVER
      : stroke;
  const lineWidth = isSelected ? strokeWidth + 1 : strokeWidth;

  // Arrow marker IDs unique to this connection
  const startMarkerId = `arrow-start-${id}`;
  const endMarkerId = `arrow-end-${id}`;

  // Get stroke dasharray for line styles
  const strokeDasharray = useMemo(() => {
    switch (connection.strokeStyle) {
      case 'dashed':
        return '8 4';
      case 'dotted':
        return '2 4';
      default:
        return undefined;
    }
  }, [connection.strokeStyle]);

  return (
    <g className="connection">
      {/* Arrow marker definitions */}
      <defs>
        {targetArrow !== 'none' && (
          <marker
            id={endMarkerId}
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            refX={ARROW_SIZE - 1}
            refY={ARROW_SIZE / 2}
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={
                targetArrow === 'arrow'
                  ? `M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE / 2} L 0 ${ARROW_SIZE} Z`
                  : `M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE / 2} L 0 ${ARROW_SIZE}`
              }
              fill={targetArrow === 'arrow' ? lineColor : 'none'}
              stroke={lineColor}
              strokeWidth={1.5}
            />
          </marker>
        )}
        {sourceArrow !== 'none' && (
          <marker
            id={startMarkerId}
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            refX={1}
            refY={ARROW_SIZE / 2}
            orient="auto-start-reverse"
            markerUnits="userSpaceOnUse"
          >
            <path
              d={
                sourceArrow === 'arrow'
                  ? `M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE / 2} L 0 ${ARROW_SIZE} Z`
                  : `M 0 0 L ${ARROW_SIZE} ${ARROW_SIZE / 2} L 0 ${ARROW_SIZE}`
              }
              fill={sourceArrow === 'arrow' ? lineColor : 'none'}
              stroke={lineColor}
              strokeWidth={1.5}
            />
          </marker>
        )}
      </defs>

      {/* Render connection based on curve type */}
      {isCurved ? (
        <CurvedConnection
          startPoint={start}
          endPoint={end}
          cp1={cp1}
          cp2={cp2}
          startAnchor={sourceAnchor}
          endAnchor={targetAnchor || 'left'}
          waypointPositions={waypointPositions}
          lineColor={lineColor}
          lineWidth={lineWidth}
          strokeStyle={connection.strokeStyle}
          sourceArrow={sourceArrow}
          targetArrow={targetArrow}
          startMarkerId={startMarkerId}
          endMarkerId={endMarkerId}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onDoubleClick={onDoubleClick}
        />
      ) : isOrthogonal ? (
        <OrthogonalConnection
          startPoint={start}
          endPoint={end}
          startAnchor={sourceAnchor}
          endAnchor={targetAnchor || 'left'}
          waypointPositions={waypointPositions}
          lineColor={lineColor}
          lineWidth={lineWidth}
          strokeStyle={connection.strokeStyle}
          sourceArrow={sourceArrow}
          targetArrow={targetArrow}
          startMarkerId={startMarkerId}
          endMarkerId={endMarkerId}
          onMouseDown={onMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onDoubleClick={onDoubleClick}
        />
      ) : waypointPositions.length > 0 ? (
        // Straight connection with waypoints - render as polyline
        <>
          {/* Invisible wider hit area */}
          <path
            d={straightPathWithWaypoints(start, end, waypointPositions)}
            stroke="transparent"
            strokeWidth={Math.max(MIN_HIT_AREA_WIDTH, strokeWidth + 10)}
            fill="none"
            style={{ cursor: 'pointer' }}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onDoubleClick={onDoubleClick}
          />
          {/* Visible line */}
          <path
            d={straightPathWithWaypoints(start, end, waypointPositions)}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray={strokeDasharray}
            fill="none"
            markerEnd={targetArrow !== 'none' ? `url(#${endMarkerId})` : undefined}
            markerStart={sourceArrow !== 'none' ? `url(#${startMarkerId})` : undefined}
            pointerEvents="none"
          />
        </>
      ) : (
        <>
          {/* Invisible wider hit area for easier clicking */}
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke="transparent"
            strokeWidth={Math.max(MIN_HIT_AREA_WIDTH, strokeWidth + 10)}
            style={{ cursor: 'pointer' }}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onDoubleClick={onDoubleClick}
          />

          {/* Visible line */}
          <line
            x1={start.x}
            y1={start.y}
            x2={end.x}
            y2={end.y}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray={strokeDasharray}
            markerEnd={targetArrow !== 'none' ? `url(#${endMarkerId})` : undefined}
            markerStart={
              sourceArrow !== 'none' ? `url(#${startMarkerId})` : undefined
            }
            pointerEvents="none"
          />
        </>
      )}

      {/* Endpoint handles when selected */}
      {isSelected && (
        <>
          <circle
            cx={start.x}
            cy={start.y}
            r={4}
            fill="white"
            stroke={COLORS.SELECTION}
            strokeWidth={2}
            pointerEvents="none"
          />
          <circle
            cx={end.x}
            cy={end.y}
            r={4}
            fill="white"
            stroke={COLORS.SELECTION}
            strokeWidth={2}
            pointerEvents="none"
          />
        </>
      )}

      {/* Control point handles for curved connections when selected */}
      {isSelected && isCurved && (
        <ConnectionControlPoints
          start={start}
          end={end}
          cp1={cp1}
          cp2={cp2}
          onControlPointDragStart={controlPointDrag.handleDragStart}
        />
      )}

      {/* Waypoint handles when selected */}
      {isSelected && waypointHandles.length > 0 && (
        <ConnectionWaypoints
          waypoints={waypointHandles}
          onDragStart={waypointDrag.handleDragStart}
          onDoubleClick={handleWaypointDoubleClick}
        />
      )}

      {/* Connection label */}
      {connection.label && labelPoint && (
        <ConnectionLabel
          label={connection.label}
          labelPoint={labelPoint}
          style={connection.labelStyle}
          isSelected={isSelected}
          onDoubleClick={handleLabelDoubleClick}
          onMouseDown={handleLabelMouseDown}
        />
      )}
    </g>
  );
});
