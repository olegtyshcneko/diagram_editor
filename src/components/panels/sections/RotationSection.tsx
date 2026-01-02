import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/label';
import { useDiagramStore } from '@/stores/diagramStore';
import type { SelectedShapeProperties } from '@/hooks/useSelectedShapes';

interface RotationSectionProps {
  selectedShapeIds: string[];
  properties: SelectedShapeProperties;
}

export function RotationSection({ selectedShapeIds, properties }: RotationSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);

  const handleRotationChange = (value: number) => {
    // Normalize rotation to 0-360 range
    let normalizedRotation = value % 360;
    if (normalizedRotation < 0) {
      normalizedRotation += 360;
    }

    selectedShapeIds.forEach((id) => {
      updateShape(id, { rotation: normalizedRotation });
    });
  };

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Rotation</Label>
      <NumberInput
        value={properties.rotation}
        onChange={handleRotationChange}
        min={0}
        max={360}
        step={1}
        suffix="°"
      />
    </div>
  );
}
