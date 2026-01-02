import { useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { Shape } from './Shape';
import { InteractiveSelectionHandles } from './InteractiveSelectionHandles';

interface ShapeLayerProps {
  onShapeHover?: (shapeId: string | null) => void;
  onShapeDoubleClick?: (shapeId: string) => void;
}

export function ShapeLayer({ onShapeHover, onShapeDoubleClick }: ShapeLayerProps) {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const selectShape = useDiagramStore((s) => s.selectShape);

  // Sort shapes by zIndex for proper layering
  const sortedShapes = Object.values(shapes).sort((a, b) => a.zIndex - b.zIndex);

  // Selection handler that supports addToSelection
  const handleSelect = useCallback((id: string, addToSelection: boolean) => {
    selectShape(id, addToSelection);
  }, [selectShape]);

  return (
    <g className="shape-layer">
      {/* Render all shapes */}
      {sortedShapes.map((shape) => (
        <Shape
          key={shape.id}
          shape={shape}
          isSelected={selectedShapeIds.includes(shape.id)}
          onSelect={handleSelect}
          onDoubleClick={onShapeDoubleClick}
          onMouseEnter={() => onShapeHover?.(shape.id)}
          onMouseLeave={() => onShapeHover?.(null)}
        />
      ))}

      {/* Render interactive selection handles on top */}
      {selectedShapeIds.map((id) => {
        const shape = shapes[id];
        return shape ? (
          <InteractiveSelectionHandles key={`handles-${id}`} shape={shape} />
        ) : null;
      })}
    </g>
  );
}
