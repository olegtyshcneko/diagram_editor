import { ColorPicker } from '@/components/ui/ColorPicker';
import { Label } from '@/components/ui/label';
import { useDiagramStore } from '@/stores/diagramStore';
import type { SelectedShapeProperties } from '@/hooks/useSelectedShapes';

interface FillSectionProps {
  selectedShapeIds: string[];
  properties: SelectedShapeProperties;
}

export function FillSection({ selectedShapeIds, properties }: FillSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  // Get the current fill color (use first value if mixed)
  const currentFill = properties.fill === 'mixed' ? '#FFFFFF' : properties.fill;
  const currentOpacity =
    properties.fillOpacity === 'mixed'
      ? 100
      : Math.round(properties.fillOpacity * 100);

  const handleFillChange = (color: string) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { fill: color });
    });
  };

  const handleOpacityChange = (opacity: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { fillOpacity: opacity / 100 });
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Fill</Label>
      <div className="flex items-center gap-2">
        <ColorPicker
          value={currentFill}
          onChange={handleFillChange}
          showOpacity
          opacity={currentOpacity}
          onOpacityChange={handleOpacityChange}
          allowTransparent
        />
        <span className="text-sm text-muted-foreground">
          {properties.fill === 'mixed' ? 'Mixed' : properties.fill}
        </span>
      </div>
    </div>
  );
}
