import { memo } from 'react';
import type { Shape } from '@/types/shapes';

interface EllipseProps {
  shape: Shape;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const Ellipse = memo(function Ellipse({
  shape,
  onMouseDown,
}: EllipseProps) {
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
  } = shape;

  // Calculate center and radii from bounding box
  const cx = x + width / 2;
  const cy = y + height / 2;
  const rx = width / 2;
  const ry = height / 2;

  const strokeDasharray =
    strokeStyle === 'dashed'
      ? '8 4'
      : strokeStyle === 'dotted'
        ? '2 2'
        : undefined;

  // Only apply rotation if non-zero
  const transform = rotation ? `rotate(${rotation}, ${cx}, ${cy})` : undefined;

  return (
    <g transform={transform}>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
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
