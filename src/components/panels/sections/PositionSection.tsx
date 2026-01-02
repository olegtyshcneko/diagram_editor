import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/label';
import { useDiagramStore } from '@/stores/diagramStore';
import type { SelectedShapeProperties } from '@/hooks/useSelectedShapes';

interface PositionSectionProps {
  selectedShapeIds: string[];
  properties: SelectedShapeProperties;
}

export function PositionSection({ selectedShapeIds, properties }: PositionSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  const handleXChange = (value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { x: Math.round(value) });
    });
  };

  const handleYChange = (value: number) => {
    selectedShapeIds.forEach((id) => {
      updateShape(id, { y: Math.round(value) });
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Position</Label>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs mb-1 block">X</Label>
          <NumberInput
            value={properties.x}
            onChange={handleXChange}
            step={1}
            suffix="px"
          />
        </div>
        <div>
          <Label className="text-xs mb-1 block">Y</Label>
          <NumberInput
            value={properties.y}
            onChange={handleYChange}
            step={1}
            suffix="px"
          />
        </div>
      </div>
    </div>
  );
}
