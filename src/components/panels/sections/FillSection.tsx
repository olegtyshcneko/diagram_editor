import { ColorPicker } from '@/components/ui/ColorPicker';
import { Label } from '@/components/ui/label';
import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';
import type { SelectedShapeProperties } from '@/hooks/useSelectedShapes';

interface FillSectionProps {
  selectedShapeIds: string[];
  properties: SelectedShapeProperties;
}

export function FillSection({ selectedShapeIds, properties }: FillSectionProps) {
  const updateShape = useDiagramStore((s) => s.updateShape);
  const shapes = useDiagramStore((s) => s.shapes);
  const pushEntry = useHistoryStore((s) => s.pushEntry);

  // Get the current fill color (use first value if mixed)
  const currentFill = properties.fill === 'mixed' ? '#FFFFFF' : properties.fill;
  const currentOpacity =
    properties.fillOpacity === 'mixed'
      ? 100
      : Math.round(properties.fillOpacity * 100);

  const handleFillChange = (color: string) => {
    // Capture before state
    const modifications = selectedShapeIds.map((id) => ({
      id,
      before: { fill: shapes[id].fill },
      after: { fill: color },
    }));

    // Apply changes
    selectedShapeIds.forEach((id) => {
      updateShape(id, { fill: color });
    });

    // Push history entry
    pushEntry({
      type: 'UPDATE_STYLE',
      description: 'Change Fill Color',
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });
  };

  const handleOpacityChange = (opacity: number) => {
    const opacityValue = opacity / 100;

    // Capture before state
    const modifications = selectedShapeIds.map((id) => ({
      id,
      before: { fillOpacity: shapes[id].fillOpacity },
      after: { fillOpacity: opacityValue },
    }));

    // Apply changes
    selectedShapeIds.forEach((id) => {
      updateShape(id, { fillOpacity: opacityValue });
    });

    // Push history entry
    pushEntry({
      type: 'UPDATE_STYLE',
      description: 'Change Fill Opacity',
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
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
