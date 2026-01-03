import { useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useDiagramStore } from '@/stores/diagramStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_CONNECTION_DELTA } from '@/types/history';
import type { AlignmentType } from '@/types/selection';
import {
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  AlignHorizontalSpaceAround,
  AlignVerticalSpaceAround,
} from 'lucide-react';

interface ArrangementSectionProps {
  selectedCount: number;
}

export function ArrangementSection({ selectedCount }: ArrangementSectionProps) {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);
  const alignShapes = useDiagramStore((s) => s.alignShapes);
  const distributeShapes = useDiagramStore((s) => s.distributeShapes);
  const pushEntry = useHistoryStore((s) => s.pushEntry);

  const canAlign = selectedCount >= 2;
  const canDistribute = selectedCount >= 3;

  const handleAlign = useCallback((alignment: AlignmentType) => {
    // Capture positions before
    const beforePositions = selectedShapeIds.map((id) => ({
      id,
      before: { x: shapes[id].x, y: shapes[id].y },
    }));

    alignShapes(alignment);

    // Capture positions after
    const state = useDiagramStore.getState();
    const modifications = beforePositions.map(({ id, before }) => ({
      id,
      before,
      after: { x: state.shapes[id].x, y: state.shapes[id].y },
    }));

    pushEntry({
      type: 'ALIGN',
      description: `Align ${alignment}`,
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });
  }, [selectedShapeIds, shapes, alignShapes, pushEntry]);

  const handleDistribute = useCallback((direction: 'horizontal' | 'vertical') => {
    // Capture positions before
    const beforePositions = selectedShapeIds.map((id) => ({
      id,
      before: { x: shapes[id].x, y: shapes[id].y },
    }));

    distributeShapes(direction);

    // Capture positions after
    const state = useDiagramStore.getState();
    const modifications = beforePositions.map(({ id, before }) => ({
      id,
      before,
      after: { x: state.shapes[id].x, y: state.shapes[id].y },
    }));

    pushEntry({
      type: 'DISTRIBUTE',
      description: `Distribute ${direction}`,
      shapeDelta: { added: [], removed: [], modified: modifications },
      connectionDelta: EMPTY_CONNECTION_DELTA,
      selectionBefore: selectedShapeIds,
      selectionAfter: selectedShapeIds,
    });
  }, [selectedShapeIds, shapes, distributeShapes, pushEntry]);

  if (!canAlign) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-xs text-muted-foreground">Arrangement</Label>

      {/* Alignment */}
      <div className="space-y-1.5">
        <Label className="text-xs">Align</Label>
        <div className="grid grid-cols-6 gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAlign('left')}
            title="Align Left"
          >
            <AlignHorizontalJustifyStart className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAlign('centerHorizontal')}
            title="Align Center (Horizontal)"
          >
            <AlignHorizontalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAlign('right')}
            title="Align Right"
          >
            <AlignHorizontalJustifyEnd className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAlign('top')}
            title="Align Top"
          >
            <AlignVerticalJustifyStart className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAlign('centerVertical')}
            title="Align Middle (Vertical)"
          >
            <AlignVerticalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleAlign('bottom')}
            title="Align Bottom"
          >
            <AlignVerticalJustifyEnd className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Distribution */}
      <div className="space-y-1.5">
        <Label className="text-xs">Distribute</Label>
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => handleDistribute('horizontal')}
            disabled={!canDistribute}
            title={canDistribute ? 'Distribute Horizontally' : 'Select 3+ shapes to distribute'}
          >
            <AlignHorizontalSpaceAround className="h-4 w-4 mr-1" />
            Horizontal
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => handleDistribute('vertical')}
            disabled={!canDistribute}
            title={canDistribute ? 'Distribute Vertically' : 'Select 3+ shapes to distribute'}
          >
            <AlignVerticalSpaceAround className="h-4 w-4 mr-1" />
            Vertical
          </Button>
        </div>
      </div>
    </div>
  );
}
