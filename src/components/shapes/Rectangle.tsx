import { memo } from 'react';
import type { Shape } from '@/types/shapes';

interface RectangleProps {
  shape: Shape;
  onClick: (e: React.MouseEvent) => void;
}

export const Rectangle = memo(function Rectangle({
  shape,
  onClick,
}: RectangleProps) {
  const {
    x,
    y,
    width,
    height,
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

  return (
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
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    />
  );
});
