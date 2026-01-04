import { useDiagramStore } from '@/stores/diagramStore';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { NumberInput } from '@/components/ui/NumberInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ArrowType, Connection, CurveType } from '@/types/connections';

interface ConnectionSectionProps {
  selectedConnectionIds: string[];
}

const ARROW_OPTIONS: { value: ArrowType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'arrow', label: 'Arrow' },
  { value: 'open-arrow', label: 'Open Arrow' },
];

const CURVE_TYPE_OPTIONS: { value: CurveType; label: string }[] = [
  { value: 'straight', label: 'Straight' },
  { value: 'bezier', label: 'Curved' },
  // { value: 'orthogonal', label: 'Orthogonal' }, // Phase 8.4
];

export function ConnectionSection({
  selectedConnectionIds,
}: ConnectionSectionProps) {
  const connections = useDiagramStore((s) => s.connections);
  const updateConnection = useDiagramStore((s) => s.updateConnection);

  // Get properties from first selected connection
  const firstConnection = connections[selectedConnectionIds[0]];
  if (!firstConnection) return null;

  const handleConnectionChange = (updates: Partial<Connection>) => {
    selectedConnectionIds.forEach((id) => {
      updateConnection(id, updates);
    });
  };

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Connection</Label>

      {/* Stroke Color */}
      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs shrink-0">Color</Label>
        <ColorPicker
          value={firstConnection.stroke}
          onChange={(color) => handleConnectionChange({ stroke: color })}
        />
        <span className="text-xs text-muted-foreground">
          {firstConnection.stroke}
        </span>
      </div>

      {/* Stroke Width */}
      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs shrink-0">Width</Label>
        <NumberInput
          value={firstConnection.strokeWidth}
          onChange={(value) => handleConnectionChange({ strokeWidth: value })}
          min={1}
          max={20}
          className="w-20 h-8"
          suffix="px"
        />
      </div>

      {/* Connection Style */}
      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs shrink-0">Style</Label>
        <Select
          value={firstConnection.curveType}
          onValueChange={(value) =>
            handleConnectionChange({
              curveType: value as CurveType,
              // Clear manual control points when switching to straight
              controlPoints: value === 'straight' ? undefined : firstConnection.controlPoints,
            })
          }
        >
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURVE_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Source Arrow */}
      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs shrink-0">Start</Label>
        <Select
          value={firstConnection.sourceArrow}
          onValueChange={(value) =>
            handleConnectionChange({ sourceArrow: value as ArrowType })
          }
        >
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARROW_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Target Arrow */}
      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs shrink-0">End</Label>
        <Select
          value={firstConnection.targetArrow}
          onValueChange={(value) =>
            handleConnectionChange({ targetArrow: value as ArrowType })
          }
        >
          <SelectTrigger className="flex-1 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ARROW_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
