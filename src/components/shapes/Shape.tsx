import { memo, useCallback } from 'react';
import type { Shape as ShapeType } from '@/types/shapes';
import { Rectangle } from './Rectangle';
import { Ellipse } from './Ellipse';
import { useShapeManipulation } from '@/hooks/manipulation';
import { useInteractionStore } from '@/stores/interactionStore';

interface ShapeProps {
  shape: ShapeType;
  isSelected: boolean;
  onSelect: (id: string, addToSelection: boolean) => void;
  onDoubleClick?: (id: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Shape = memo(function Shape({
  shape,
  isSelected,
  onSelect,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}: ShapeProps) {
  const activeTool = useInteractionStore((s) => s.activeTool);
  const { onShapeMouseDown } = useShapeManipulation({ shape });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // When using drawing tools, let click pass through to canvas for creation
    if (activeTool !== 'select') {
      return; // Don't stop propagation - canvas will handle shape creation
    }

    e.stopPropagation();

    const isMultiSelectModifier = e.shiftKey || e.ctrlKey || e.metaKey;

    // If not selected, select first (with Shift/Ctrl for multi-select)
    if (!isSelected) {
      onSelect(shape.id, isMultiSelectModifier);
      return;
    }

    // If already selected with modifier, toggle selection (remove from selection)
    if (isMultiSelectModifier) {
      onSelect(shape.id, true); // This will toggle it off
      return;
    }

    // If already selected without modifier, start move
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

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'select') return;
      e.stopPropagation();
      onDoubleClick?.(shape.id);
    },
    [activeTool, shape.id, onDoubleClick]
  );

  return (
    <g
      style={{ cursor }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDoubleClick={handleDoubleClick}
    >
      {renderShape()}
    </g>
  );
});
