import { memo, useCallback } from 'react';
import type { Shape as ShapeType } from '@/types/shapes';
import { Rectangle } from './Rectangle';
import { Ellipse } from './Ellipse';
import { useShapeManipulation } from '@/hooks/manipulation';
import { useUIStore } from '@/stores/uiStore';

interface ShapeProps {
  shape: ShapeType;
  isSelected: boolean;
  onSelect: (id: string, addToSelection: boolean) => void;
}

export const Shape = memo(function Shape({
  shape,
  isSelected,
  onSelect,
}: ShapeProps) {
  const activeTool = useUIStore((s) => s.activeTool);
  const { onShapeMouseDown } = useShapeManipulation({ shape });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // When using drawing tools, let click pass through to canvas for creation
    if (activeTool !== 'select') {
      return; // Don't stop propagation - canvas will handle shape creation
    }

    e.stopPropagation();

    // If not selected, select first (with Shift for multi-select)
    if (!isSelected) {
      onSelect(shape.id, e.shiftKey);
      return;
    }

    // If already selected, start move
    onShapeMouseDown(e);
  }, [activeTool, shape.id, isSelected, onSelect, onShapeMouseDown]);

  // Centralized cursor logic: only show interactive cursors with select tool
  const cursor = activeTool === 'select'
    ? (isSelected ? 'move' : 'pointer')
    : 'default';

  const renderShape = () => {
    switch (shape.type) {
      case 'rectangle':
        return <Rectangle shape={shape} onMouseDown={handleMouseDown} />;
      case 'ellipse':
        return <Ellipse shape={shape} onMouseDown={handleMouseDown} />;
      default:
        return null;
    }
  };

  return (
    <g style={{ cursor }}>
      {renderShape()}
    </g>
  );
});
