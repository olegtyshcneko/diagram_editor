import { useMemo } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import type { Connection, ArrowType } from '@/types/connections';

type MixedValue<T> = T | 'mixed';

export interface SelectedConnectionProperties {
  stroke: MixedValue<string>;
  strokeWidth: MixedValue<number>;
  sourceArrow: MixedValue<ArrowType>;
  targetArrow: MixedValue<ArrowType>;
}

/**
 * Helper to determine if all values are equal
 */
function allEqual<T>(values: T[]): boolean {
  if (values.length === 0) return true;
  const first = values[0];
  return values.every((v) => v === first);
}

/**
 * Get property value from connections, returning 'mixed' if values differ
 */
function getProperty<K extends keyof Connection>(
  connections: Connection[],
  key: K
): MixedValue<Connection[K]> {
  const values = connections.map((c) => c[key]);
  if (allEqual(values)) {
    return values[0];
  }
  return 'mixed';
}

/**
 * Hook that returns selected connections and their aggregated properties
 */
export function useSelectedConnections() {
  const connections = useDiagramStore((s) => s.connections);
  const selectedConnectionIds = useDiagramStore((s) => s.selectedConnectionIds);

  const selectedConnections = useMemo(() => {
    return selectedConnectionIds
      .map((id) => connections[id])
      .filter((conn): conn is Connection => conn !== undefined);
  }, [connections, selectedConnectionIds]);

  const selectedCount = selectedConnections.length;

  const properties = useMemo((): SelectedConnectionProperties | null => {
    if (selectedConnections.length === 0) {
      return null;
    }

    return {
      stroke: getProperty(selectedConnections, 'stroke'),
      strokeWidth: getProperty(selectedConnections, 'strokeWidth'),
      sourceArrow: getProperty(selectedConnections, 'sourceArrow'),
      targetArrow: getProperty(selectedConnections, 'targetArrow'),
    };
  }, [selectedConnections]);

  return {
    selectedConnections,
    selectedCount,
    properties,
  };
}
