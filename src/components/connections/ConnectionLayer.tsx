import React, { useState, useCallback } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import { Connection } from './Connection';

export function ConnectionLayer() {
  const shapes = useDiagramStore((s) => s.shapes);
  const connections = useDiagramStore((s) => s.connections);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);
  const setSelectedConnectionIds = useDiagramStore(
    (s) => s.setSelectedConnectionIds
  );

  const [hoveredConnectionId, setHoveredConnectionId] = useState<string | null>(
    null
  );

  const handleConnectionMouseDown = useCallback(
    (connectionId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedConnectionIds([connectionId]);
    },
    [setSelectedConnectionIds]
  );

  const connectionList = Object.values(connections);

  if (connectionList.length === 0) return null;

  return (
    <g className="connection-layer">
      {connectionList.map((connection) => (
        <Connection
          key={connection.id}
          connection={connection}
          shapes={shapes}
          isSelected={selectedConnectionIds.includes(connection.id)}
          isHovered={hoveredConnectionId === connection.id}
          onMouseDown={(e) => handleConnectionMouseDown(connection.id, e)}
          onMouseEnter={() => setHoveredConnectionId(connection.id)}
          onMouseLeave={() => setHoveredConnectionId(null)}
        />
      ))}
    </g>
  );
}
