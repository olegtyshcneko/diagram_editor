import { memo } from 'react';
import type { Shape as ShapeType } from '@/types/shapes';
import { Rectangle } from './Rectangle';
import { Ellipse } from './Ellipse';

interface ShapeProps {
  shape: ShapeType;
  onSelect: (id: string) => void;
}

export const Shape = memo(function Shape({
  shape,
  onSelect,
}: ShapeProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(shape.id);
  };

  switch (shape.type) {
    case 'rectangle':
      return <Rectangle shape={shape} onClick={handleClick} />;
    case 'ellipse':
      return <Ellipse shape={shape} onClick={handleClick} />;
    default:
      return null;
  }
});
