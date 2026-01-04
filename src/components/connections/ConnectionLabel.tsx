/**
 * Connection Label Component
 *
 * Renders a text label on a connection path with a white background.
 * Supports dragging to reposition along the path and double-click to edit.
 */

import { memo, useMemo } from 'react';
import type { Point } from '@/types/common';
import type { ConnectionLabelStyle } from '@/types/connections';
import { DEFAULT_LABEL_STYLE } from '@/types/connections';
import { COLORS } from '@/lib/constants';

interface ConnectionLabelProps {
  /** The label text to display */
  label: string;
  /** Pre-computed position on the path */
  labelPoint: Point;
  /** Label styling options */
  style?: ConnectionLabelStyle;
  /** Whether the connection is selected */
  isSelected: boolean;
  /** Double-click handler to edit label */
  onDoubleClick: (e: React.MouseEvent) => void;
  /** Mouse down handler for dragging */
  onMouseDown: (e: React.MouseEvent) => void;
}

const PADDING = 4;
const BORDER_RADIUS = 3;

export const ConnectionLabel = memo(function ConnectionLabel({
  label,
  labelPoint,
  style,
  isSelected,
  onDoubleClick,
  onMouseDown,
}: ConnectionLabelProps) {
  const mergedStyle = { ...DEFAULT_LABEL_STYLE, ...style };

  // Estimate text dimensions (rough approximation)
  const textWidth = useMemo(() => {
    const avgCharWidth = mergedStyle.fontSize * 0.6;
    return label.length * avgCharWidth;
  }, [label, mergedStyle.fontSize]);

  const textHeight = mergedStyle.fontSize;

  // Background dimensions
  const bgWidth = textWidth + PADDING * 2;
  const bgHeight = textHeight + PADDING * 2;

  // Background position (centered on label point)
  const bgX = labelPoint.x - bgWidth / 2;
  const bgY = labelPoint.y - bgHeight / 2;

  return (
    <g
      className="connection-label"
      style={{ cursor: isSelected ? 'grab' : 'pointer' }}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      {/* White background with border */}
      <rect
        x={bgX}
        y={bgY}
        width={bgWidth}
        height={bgHeight}
        fill="white"
        fillOpacity={0.95}
        stroke={isSelected ? COLORS.SELECTION : '#E5E7EB'}
        strokeWidth={isSelected ? 1.5 : 1}
        rx={BORDER_RADIUS}
        ry={BORDER_RADIUS}
      />

      {/* Label text */}
      <text
        x={labelPoint.x}
        y={labelPoint.y}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{
          fontFamily: mergedStyle.fontFamily,
          fontSize: mergedStyle.fontSize,
          fill: mergedStyle.color,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        {label}
      </text>

      {/* Selection indicator (small drag handle) */}
      {isSelected && (
        <circle
          cx={labelPoint.x}
          cy={bgY - 4}
          r={3}
          fill={COLORS.SELECTION}
          pointerEvents="none"
        />
      )}
    </g>
  );
});
