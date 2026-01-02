import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/label';
import { useDiagramStore } from '@/stores/diagramStore';
import type { SelectedShapeProperties } from '@/hooks/useSelectedShapes';

interface DimensionsSectionProps {
  selectedShapeIds: string[];
  properties: SelectedShapeProperties;
}

const MIN_SIZE = 10;

export function DimensionsSection({ selectedShapeIds, properties }: DimensionsSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  const handleWidthChange = (value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { width: Math.round(value) });
    });
  };

  const handleHeightChange = (value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { height: Math.round(value) });
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Size</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-1 block">W</Label>
          <NumberInput
            value={properties.width}
            onChange={handleWidthChange}
            min={MIN_SIZE}
            step={1}
            suffix="px"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">H</Label>
          <NumberInput
            value={properties.height}
            onChange={handleHeightChange}
            min={MIN_SIZE}
            step={1}
            suffix="px"
          />
        </div>
      </div>
    </div>
  );
}
