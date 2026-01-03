import { NumberInput } from '@/components/ui/NumberInput';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';
import type { SelectedShapeProperties } from '@/hooks/useSelectedShapes';

interface CornerRadiusSectionProps {
  selectedShapeIds: string[];
  properties: SelectedShapeProperties;
  maxRadius: number;
}

export function CornerRadiusSection({
  selectedShapeIds,
  properties,
  maxRadius,
}: CornerRadiusSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const shapes = useDiagramStore((s) => s.shapes);
  const pushEntry = useHistoryStore((s) => s.pushEntry);

  // Only update rectangles
  const rectangleIds = selectedShapeIds.filter(
    (id) => shapes[id]?.type === 'rectangle'
  );

  // Get current value (use 0 if mixed)
  const currentRadius = properties.cornerRadius === 'mixed' ? 0 : (properties.cornerRadius ?? 0);

  const handleRadiusChange = (value: number) => {
    const clampedValue = Math.max(0, Math.min(maxRadius, Math.round(value)));

    // Capture before state for rectangles only
    const modifications = rectangleIds.map((id) => ({
      id,
      before: { cornerRadius: shapes[id].cornerRadius },
      after: { cornerRadius: clampedValue },
    }));

    // Apply changes
    rectangleIds.forEach((id) => {
      updateShape(id, { cornerRadius: clampedValue });
    });

    // Push history entry
    if (modifications.length > 0) {
      pushEntry({
        type: 'UPDATE_STYLE',
        description: 'Change Corner Radius',
        shapeDelta: { added: [], removed: [], modified: modifications },
        connectionDelta: EMPTY_CONNECTION_DELTA,
        selectionBefore: selectedShapeIds,
        selectionAfter: selectedShapeIds,
      });
    }
  };

  const handleSliderChange = (values: number[]) => {
    handleRadiusChange(values[0]);
  };

  // Don't render if no rectangles are selected
  if (properties.cornerRadius === null) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">Corner Radius</Label>
      <div className="flex items-center gap-3">
        <Slider
          value={[currentRadius]}
          onValueChange={handleSliderChange}
          min={0}
          max={maxRadius}
          step={1}
          className="flex-1"
        />
        <NumberInput
          value={properties.cornerRadius}
          onChange={handleRadiusChange}
          min={0}
          max={maxRadius}
          step={1}
          suffix="px"
          className="w-20"
        />
      </div>
    </div>
  );
}
