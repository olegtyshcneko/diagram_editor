import { useMemo } from 'react';
import type { Connection as ConnectionType } from '@/types/connections';
import type { Shape } from '@/types/shapes';
import { getConnectionEndpoints } from '@/lib/geometry/connection';

interface ConnectionProps {
  connection: ConnectionType;
  shapes: Record<string, Shape>;
  isSelected: boolean;
  isHovered: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ARROW_SIZE = 10;

export function Connection({
  connection,
  shapes,
  isSelected,
  isHovered,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
}: ConnectionProps) {
  const endpoints = useMemo(
    () => getConnectionEndpoints(connection, shapes),
    [connection, shapes]
  );

  if (!endpoints) return null;

  const { start, end } = endpoints;
  const { id, stroke, strokeWidth, sourceArrow, targetArrow } = connection;

  // Determine colors based on state
  const lineColor = isSelected ? '#3B82F6' : isHovered ? '#60A5FA' : stroke;
  const lineWidth = isSelected ? strokeWidth + 1 : strokeWidth;

  // Arrow marker IDs unique to this connection
  const startMarkerId = `arrow-start-${id}`;
  const endMarkerId = `arrow-end-${id}`;

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

      {/* Invisible wider hit area for easier clicking */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke="transparent"
        strokeWidth={Math.max(12, strokeWidth + 10)}
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
        markerEnd={targetArrow !== 'none' ? `url(#${endMarkerId})` : undefined}
        markerStart={
          sourceArrow !== 'none' ? `url(#${startMarkerId})` : undefined
        }
        pointerEvents="none"
      />

      {/* Endpoint handles when selected */}
      {isSelected && (
        <>
          <circle
            cx={start.x}
            cy={start.y}
            r={4}
            fill="white"
            stroke="#3B82F6"
            strokeWidth={2}
            pointerEvents="none"
          />
          <circle
            cx={end.x}
            cy={end.y}
            r={4}
            fill="white"
            stroke="#3B82F6"
            strokeWidth={2}
            pointerEvents="none"
          />
        </>
      )}
    </g>
  );
}
