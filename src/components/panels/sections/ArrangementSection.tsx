import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useDiagramStore } from '@/stores/diagramStore';
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
  const alignShapes = useDiagramStore((s) => s.alignShapes);
  const distributeShapes = useDiagramStore((s) => s.distributeShapes);

  const canAlign = selectedCount >= 2;
  const canDistribute = selectedCount >= 3;

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
            onClick={() => alignShapes('left')}
            title="Align Left"
          >
            <AlignHorizontalJustifyStart className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => alignShapes('centerHorizontal')}
            title="Align Center (Horizontal)"
          >
            <AlignHorizontalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => alignShapes('right')}
            title="Align Right"
          >
            <AlignHorizontalJustifyEnd className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => alignShapes('top')}
            title="Align Top"
          >
            <AlignVerticalJustifyStart className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => alignShapes('centerVertical')}
            title="Align Middle (Vertical)"
          >
            <AlignVerticalJustifyCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => alignShapes('bottom')}
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
            onClick={() => distributeShapes('horizontal')}
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
            onClick={() => distributeShapes('vertical')}
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
