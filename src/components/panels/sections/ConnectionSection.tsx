import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { NumberInput } from '@/components/ui/NumberInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ArrowType, Connection, CurveType, ConnectionLabelStyle } from '@/types/connections';
import { DEFAULT_LABEL_STYLE } from '@/types/connections';

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
  { value: 'orthogonal', label: 'Orthogonal' },
];

export function ConnectionSection({
  selectedConnectionIds,
}: ConnectionSectionProps) {
  const connections = useDiagramStore((s) => s.connections);
  const updateConnection = useDiagramStore((s) => s.updateConnection);
  const pushEntry = useHistoryStore((s) => s.pushEntry);

  // Get properties from first selected connection
  const firstConnection = connections[selectedConnectionIds[0]];
  if (!firstConnection) return null;

  const labelStyle = { ...DEFAULT_LABEL_STYLE, ...firstConnection.labelStyle };

  const handleConnectionChange = (updates: Partial<Connection>) => {
    selectedConnectionIds.forEach((id) => {
      updateConnection(id, updates);
    });
  };

  const handleLabelStyleChange = (styleUpdates: Partial<ConnectionLabelStyle>) => {
    const newStyle = { ...labelStyle, ...styleUpdates };
    selectedConnectionIds.forEach((id) => {
      updateConnection(id, { labelStyle: newStyle });
    });
  };

  const handleClearLabel = () => {
    const beforeLabel = firstConnection.label;
    selectedConnectionIds.forEach((id) => {
      updateConnection(id, { label: undefined, labelPosition: undefined });
    });

    if (beforeLabel) {
      pushEntry({
        type: 'REMOVE_LABEL',
        description: 'Remove Label',
        shapeDelta: EMPTY_SHAPE_DELTA,
        connectionDelta: {
          added: [],
          removed: [],
          modified: selectedConnectionIds.map((id) => ({
            id,
            before: { label: connections[id]?.label, labelPosition: connections[id]?.labelPosition },
            after: { label: undefined, labelPosition: undefined },
          })),
        },
        selectionBefore: [],
        selectionAfter: [],
      });
    }
  };

  const handleClearWaypoints = () => {
    const waypointsBefore = selectedConnectionIds.map((id) => ({
      id,
      waypoints: connections[id]?.waypoints || [],
    }));

    selectedConnectionIds.forEach((id) => {
      updateConnection(id, { waypoints: [] });
    });

    const hasWaypoints = waypointsBefore.some((w) => w.waypoints.length > 0);
    if (hasWaypoints) {
      pushEntry({
        type: 'REMOVE_WAYPOINT',
        description: 'Clear Waypoints',
        shapeDelta: EMPTY_SHAPE_DELTA,
        connectionDelta: {
          added: [],
          removed: [],
          modified: waypointsBefore.map(({ id, waypoints }) => ({
            id,
            before: { waypoints },
            after: { waypoints: [] },
          })),
        },
        selectionBefore: [],
        selectionAfter: [],
      });
    }
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
          disabled={firstConnection.waypoints.length > 0}
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

      {/* Separator */}
      <div className="border-t my-2" />

      {/* Label Section */}
      <Label className="text-xs text-muted-foreground">Label</Label>

      {/* Label Text */}
      <div className="flex items-center gap-2">
        <Label className="w-16 text-xs shrink-0">Text</Label>
        <Input
          value={firstConnection.label || ''}
          onChange={(e) => handleConnectionChange({ label: e.target.value || undefined })}
          placeholder="No label"
          className="flex-1 h-8 text-xs"
        />
      </div>

      {firstConnection.label && (
        <>
          {/* Label Position */}
          <div className="flex items-center gap-2">
            <Label className="w-16 text-xs shrink-0">Position</Label>
            <div className="flex-1 flex items-center gap-2">
              <Slider
                value={[(firstConnection.labelPosition ?? 0.5) * 100]}
                onValueChange={([value]) => handleConnectionChange({ labelPosition: value / 100 })}
                min={5}
                max={95}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8">
                {Math.round((firstConnection.labelPosition ?? 0.5) * 100)}%
              </span>
            </div>
          </div>

          {/* Label Font Size */}
          <div className="flex items-center gap-2">
            <Label className="w-16 text-xs shrink-0">Font Size</Label>
            <NumberInput
              value={labelStyle.fontSize}
              onChange={(value) => handleLabelStyleChange({ fontSize: value })}
              min={8}
              max={32}
              className="w-20 h-8"
              suffix="px"
            />
          </div>

          {/* Label Color */}
          <div className="flex items-center gap-2">
            <Label className="w-16 text-xs shrink-0">Color</Label>
            <ColorPicker
              value={labelStyle.color}
              onChange={(color) => handleLabelStyleChange({ color })}
            />
            <span className="text-xs text-muted-foreground">{labelStyle.color}</span>
          </div>

          {/* Clear Label Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearLabel}
            className="w-full h-7 text-xs"
          >
            Clear Label
          </Button>
        </>
      )}

      {/* Separator */}
      <div className="border-t my-2" />

      {/* Waypoints Section - only for straight connections */}
      {firstConnection.curveType === 'straight' && (
        <>
          <Label className="text-xs text-muted-foreground">Waypoints</Label>

          <div className="flex items-center gap-2">
            <span className="text-xs flex-1">
              {firstConnection.waypoints.length} waypoint{firstConnection.waypoints.length !== 1 ? 's' : ''}
            </span>
            {firstConnection.waypoints.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearWaypoints}
                className="h-7 text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
