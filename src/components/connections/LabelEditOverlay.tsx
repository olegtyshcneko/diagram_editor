/**
 * Label Edit Overlay Component
 *
 * Provides inline text editing for connection labels.
 * Appears as an input positioned over the label location.
 */

import { useRef, useEffect, useCallback } from 'react';
import type { Point } from '@/types/common';
import type { ConnectionLabelStyle, CurveType, AnchorPosition } from '@/types/connections';
import type { Viewport } from '@/types/viewport';
import { DEFAULT_LABEL_STYLE } from '@/types/connections';
import { useDiagramStore } from '@/stores/diagramStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { useHistoryStore } from '@/stores/historyStore';
import { EMPTY_SHAPE_DELTA } from '@/types/history';
import { getPointOnPath, type PathOptions } from '@/lib/geometry/pathUtils';

interface LabelEditOverlayProps {
  connectionId: string;
  /** Current label text */
  label: string;
  /** Position along the path (0-1) */
  position: number;
  /** Label style */
  style?: ConnectionLabelStyle;
  /** Connection curve type */
  curveType: CurveType;
  /** Start point of connection */
  startPoint: Point;
  /** End point of connection */
  endPoint: Point;
  /** Control point 1 for bezier */
  cp1?: Point;
  /** Control point 2 for bezier */
  cp2?: Point;
  /** Source anchor for orthogonal */
  startAnchor?: AnchorPosition;
  /** Target anchor for orthogonal */
  endAnchor?: AnchorPosition;
  /** Absolute positions of waypoints */
  waypointPositions?: Point[];
  /** Current viewport state */
  viewport: Viewport;
}

const INPUT_WIDTH = 150;
const INPUT_HEIGHT = 28;

export function LabelEditOverlay({
  connectionId,
  label,
  position,
  style,
  curveType,
  startPoint,
  endPoint,
  cp1,
  cp2,
  startAnchor,
  endAnchor,
  waypointPositions,
  viewport,
}: LabelEditOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const originalLabelRef = useRef<string>(label);

  const updateConnection = useDiagramStore((s) => s.updateConnection);
  const setEditingLabelConnectionId = useInteractionStore(
    (s) => s.setEditingLabelConnectionId
  );
  const pushEntry = useHistoryStore((s) => s.pushEntry);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);
  const connections = useDiagramStore((s) => s.connections);

  const mergedStyle = { ...DEFAULT_LABEL_STYLE, ...style };

  // Calculate label position on path
  const pathOptions: PathOptions = {
    cp1,
    cp2,
    startAnchor,
    endAnchor,
    waypointPositions,
  };

  const labelPoint = getPointOnPath(curveType, startPoint, endPoint, position, pathOptions);

  // Convert to screen coordinates
  const screenX = (labelPoint.x - viewport.x) * viewport.zoom;
  const screenY = (labelPoint.y - viewport.y) * viewport.zoom;
  const scaledFontSize = mergedStyle.fontSize * viewport.zoom;

  // Focus and select on mount
  useEffect(() => {
    originalLabelRef.current = label;
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleBlur = useCallback(() => {
    const currentLabel = connections[connectionId]?.label || '';
    const originalLabel = originalLabelRef.current;

    // If text is empty, remove the label
    if (!currentLabel.trim()) {
      updateConnection(connectionId, { label: undefined });

      if (originalLabel) {
        // Had a label before, now removed
        pushEntry({
          type: 'REMOVE_LABEL',
          description: 'Remove Label',
          shapeDelta: EMPTY_SHAPE_DELTA,
          connectionDelta: {
            added: [],
            removed: [],
            modified: [{
              id: connectionId,
              before: { label: originalLabel },
              after: { label: undefined },
            }],
          },
          selectionBefore: selectedConnectionIds,
          selectionAfter: selectedConnectionIds,
        });
      }
    } else if (originalLabel !== currentLabel) {
      // Text changed
      const actionType = originalLabel ? 'UPDATE_LABEL' : 'ADD_LABEL';
      const description = originalLabel ? 'Edit Label' : 'Add Label';

      pushEntry({
        type: actionType,
        description,
        shapeDelta: EMPTY_SHAPE_DELTA,
        connectionDelta: {
          added: [],
          removed: [],
          modified: [{
            id: connectionId,
            before: { label: originalLabel || undefined },
            after: { label: currentLabel },
          }],
        },
        selectionBefore: selectedConnectionIds,
        selectionAfter: selectedConnectionIds,
      });
    }

    setEditingLabelConnectionId(null);
  }, [connectionId, connections, updateConnection, pushEntry, selectedConnectionIds, setEditingLabelConnectionId]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLabel = e.target.value;
      updateConnection(connectionId, { label: newLabel });
    },
    [connectionId, updateConnection]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.blur();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        // Restore original label
        updateConnection(connectionId, { label: originalLabelRef.current || undefined });
        setEditingLabelConnectionId(null);
        return;
      }

      // Stop propagation to prevent canvas shortcuts
      e.stopPropagation();
    },
    [connectionId, updateConnection, setEditingLabelConnectionId]
  );

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={label}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label="Edit connection label"
      style={{
        position: 'absolute',
        left: screenX - INPUT_WIDTH / 2,
        top: screenY - INPUT_HEIGHT / 2,
        width: INPUT_WIDTH,
        height: INPUT_HEIGHT,
        fontFamily: mergedStyle.fontFamily,
        fontSize: scaledFontSize,
        color: mergedStyle.color,
        textAlign: 'center',
        background: 'white',
        border: '2px solid #3B82F6',
        borderRadius: '4px',
        outline: 'none',
        padding: '4px 8px',
        boxSizing: 'border-box',
      }}
    />
  );
}
