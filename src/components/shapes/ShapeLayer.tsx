import { useDiagramStore } from '@/stores/diagramStore';
import { Shape } from './Shape';
import { SelectionHandles } from './SelectionHandles';

export function ShapeLayer() {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const selectShape = useDiagramStore((s) => s.selectShape);

  // Sort shapes by zIndex for proper layering
  const sortedShapes = Object.values(shapes).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <g className="shape-layer">
      {/* Render all shapes */}
      {sortedShapes.map((shape) => (
        <Shape key={shape.id} shape={shape} onSelect={selectShape} />
      ))}

      {/* Render selection handles on top */}
      {selectedShapeIds.map((id) => {
        const shape = shapes[id];
        return shape ? <SelectionHandles key={`handles-${id}`} shape={shape} /> : null;
      })}
    </g>
  );
}
