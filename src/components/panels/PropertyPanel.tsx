import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { useDiagramStore } from '@/stores/diagramStore';
import { useSelectedShapes } from '@/hooks/useSelectedShapes';
import {
  PositionSection,
  DimensionsSection,
  RotationSection,
  FillSection,
  StrokeSection,
  CornerRadiusSection,
  TextSection,
  ConnectionSection,
  ArrangementSection,
} from './sections';

export function PropertyPanel() {
  const collapsed = usePreferencesStore((s) => s.propertyPanelCollapsed);
  const setCollapsed = usePreferencesStore((s) => s.setPropertyPanelCollapsed);

  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);

  const { selectedShapes, selectedCount, properties } = useSelectedShapes();
  const connectionCount = selectedConnectionIds.length;

  // Calculate max corner radius (half of shortest side among selected rectangles)
  const maxCornerRadius = useMemo(() => {
    const rectangles = selectedShapes.filter((s) => s.type === 'rectangle');
    if (rectangles.length === 0) return 0;

    const minDimension = Math.min(
      ...rectangles.map((s) => Math.min(s.width, s.height))
    );
    return Math.floor(minDimension / 2);
  }, [selectedShapes]);

  const toggleCollapsed = () => setCollapsed(!collapsed);

  // Collapsed state - just a narrow strip with expand button
  if (collapsed) {
    return (
      <aside className="w-10 h-full bg-background border-l border-border flex flex-col items-center py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleCollapsed}
          title="Expand panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </aside>
    );
  }

  return (
    <aside className="w-64 h-full bg-background border-l border-border flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-sm font-medium">
          {connectionCount > 0
            ? connectionCount === 1
              ? 'Connection'
              : `${connectionCount} Connections`
            : selectedCount === 0
              ? 'Properties'
              : selectedCount === 1
                ? 'Shape'
                : `${selectedCount} Shapes`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleCollapsed}
          title="Collapse panel"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Connection properties */}
        {connectionCount > 0 ? (
          <div className="p-3 space-y-4">
            <ConnectionSection selectedConnectionIds={selectedConnectionIds} />
          </div>
        ) : selectedCount === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            Select a shape to view properties
          </div>
        ) : properties ? (
          <div className="p-3 space-y-4">
            {/* Position */}
            <PositionSection
              selectedShapeIds={selectedShapeIds}
              properties={properties}
            />

            <Separator />

            {/* Dimensions */}
            <DimensionsSection
              selectedShapeIds={selectedShapeIds}
              properties={properties}
            />

            <Separator />

            {/* Rotation */}
            <RotationSection
              selectedShapeIds={selectedShapeIds}
              properties={properties}
            />

            <Separator />

            {/* Fill */}
            <FillSection
              selectedShapeIds={selectedShapeIds}
              properties={properties}
            />

            <Separator />

            {/* Stroke */}
            <StrokeSection
              selectedShapeIds={selectedShapeIds}
              properties={properties}
            />

            {/* Corner Radius (only for rectangles) */}
            {properties.cornerRadius !== null && (
              <>
                <Separator />
                <CornerRadiusSection
                  selectedShapeIds={selectedShapeIds}
                  properties={properties}
                  maxRadius={maxCornerRadius}
                />
              </>
            )}

            <Separator />

            {/* Text */}
            <TextSection selectedShapeIds={selectedShapeIds} />

            {/* Arrangement (only for multi-selection) */}
            {selectedCount >= 2 && (
              <>
                <Separator />
                <ArrangementSection selectedCount={selectedCount} />
              </>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
