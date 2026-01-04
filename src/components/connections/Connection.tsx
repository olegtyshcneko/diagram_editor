import { memo, useMemo } from 'react';
import type { Connection as ConnectionType } from '@/types/connections';
import type { Shape } from '@/types/shapes';
import { getConnectionEndpoints } from '@/lib/geometry/connection';
import { getAbsoluteControlPoints } from '@/lib/geometry/bezier';
import { COLORS, CONNECTION_DEFAULTS } from '@/lib/constants';
import { CurvedConnection } from './CurvedConnection';
import { OrthogonalConnection } from './OrthogonalConnection';
import { ConnectionControlPoints } from './ConnectionControlPoints';
import { useControlPointDrag } from '@/hooks/useControlPointDrag';

interface ConnectionProps {
  connection: ConnectionType;
  shapes: Record<string, Shape>;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ARROW_SIZE = CONNECTION_DEFAULTS.ARROW_SIZE;
const MIN_HIT_AREA_WIDTH = CONNECTION_DEFAULTS.MIN_HIT_AREA_WIDTH;

export const Connection = memo(function Connection({
  connection,
  shapes,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
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
        />
      ) : isOrthogonal ? (
        <OrthogonalConnection
          startPoint={start}
          endPoint={end}
          startAnchor={sourceAnchor}
          endAnchor={targetAnchor || 'left'}
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
        />
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
    </g>
  );
});
