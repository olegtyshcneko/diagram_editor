import { memo } from 'react';
import type { Shape } from '@/types/shapes';

interface RectangleProps {
  shape: Shape;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const Rectangle = memo(function Rectangle({
  shape,
  onMouseDown,
}: RectangleProps) {
  const {
    x,
    y,
    width,
    height,
    rotation,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeStyle,
    cornerRadius = 0,
  } = shape;

  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8 4'
      : strokeStyle === 'dotted'
        ? '2 2'
        : undefined;

  // Calculate center for rotation transform
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  // Only apply rotation if non-zero
  const transform = rotation ? `rotate(${rotation}, ${centerX}, ${centerY})` : undefined;

  return (
    <g transform={transform}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={cornerRadius}
        ry={cornerRadius}
        fill={fill === 'transparent' ? 'none' : fill}
        fillOpacity={fillOpacity}
        stroke={stroke === 'transparent' ? 'none' : stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        onMouseDown={onMouseDown}
      />
    </g>
  );
});
