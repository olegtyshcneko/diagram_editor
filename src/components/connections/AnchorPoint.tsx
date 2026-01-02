import type { Point } from '@/types/common';
import type { AnchorPosition } from '@/types/connections';

interface AnchorPointProps {
  point: Point;
  anchor: AnchorPosition;
  isHighlighted?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const ANCHOR_SIZE = 8;

export function AnchorPoint({
  point,
  anchor: _anchor,
  isHighlighted = false,
  onMouseDown,
}: AnchorPointProps) {
  // anchor is included in props for future use (e.g., anchor-specific styling)
  void _anchor;
  return (
    <circle
      cx={point.x}
      cy={point.y}
      r={ANCHOR_SIZE / 2}
      fill={isHighlighted ? '#3B82F6' : 'white'}
      stroke="#3B82F6"
      strokeWidth={2}
      style={{ cursor: 'crosshair' }}
      onMouseDown={onMouseDown}
    />
  );
}
