import { useMemo } from 'react';
import { useDiagramStore } from '@/stores/diagramStore';
import type { Shape, StrokeStyle, HorizontalAlign, VerticalAlign } from '@/types/shapes';
import { DEFAULT_TEXT_STYLE } from '@/types/shapes';

type MixedValue<T> = T | 'mixed';

export interface SelectedShapeProperties {
  // Position
  x: MixedValue<number>;
  y: MixedValue<number>;

  // Dimensions
  width: MixedValue<number>;
  height: MixedValue<number>;

  // Rotation
  rotation: MixedValue<number>;

  // Fill
  fill: MixedValue<string>;
  fillOpacity: MixedValue<number>;

  // Stroke
  stroke: MixedValue<string>;
  strokeWidth: MixedValue<number>;
  strokeStyle: MixedValue<StrokeStyle>;

  // Corner radius (null if no rectangles selected)
  cornerRadius: MixedValue<number> | null;

  // Text style
  fontFamily: MixedValue<string>;
  fontSize: MixedValue<number>;
  fontWeight: MixedValue<'normal' | 'bold'>;
  fontStyle: MixedValue<'normal' | 'italic'>;
  textDecoration: MixedValue<'none' | 'underline' | 'line-through'>;
  fontColor: MixedValue<string>;
  horizontalAlign: MixedValue<HorizontalAlign>;
  verticalAlign: MixedValue<VerticalAlign>;
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
 * Get property value from shapes, returning 'mixed' if values differ
 */
function getProperty<K extends keyof Shape>(
  shapes: Shape[],
  key: K
): MixedValue<Shape[K]> {
  const values = shapes.map((s) => s[key]);
  if (allEqual(values)) {
    return values[0];
  }
  return 'mixed';
}

/**
 * Get text style property from shapes
 */
function getTextStyleProperty<K extends keyof typeof DEFAULT_TEXT_STYLE>(
  shapes: Shape[],
  key: K
): MixedValue<(typeof DEFAULT_TEXT_STYLE)[K]> {
  const values = shapes.map((s) => (s.textStyle || DEFAULT_TEXT_STYLE)[key]);
  if (allEqual(values)) {
    return values[0];
  }
  return 'mixed';
}

/**
 * Hook that returns selected shapes and their aggregated properties
 */
export function useSelectedShapes() {
  const shapes = useDiagramStore((s) => s.shapes);
  const selectedShapeIds = useDiagramStore((s) => s.selectedShapeIds);

  const selectedShapes = useMemo(() => {
    return selectedShapeIds
      .map((id) => shapes[id])
      .filter((shape): shape is Shape => shape !== undefined);
  }, [shapes, selectedShapeIds]);

  const selectedCount = selectedShapes.length;

  const properties = useMemo((): SelectedShapeProperties | null => {
    if (selectedShapes.length === 0) {
      return null;
    }

    // Check if any rectangles are selected (for corner radius)
    const rectangles = selectedShapes.filter((s) => s.type === 'rectangle');
    const hasRectangles = rectangles.length > 0;

    // Get corner radius from rectangles only
    let cornerRadius: MixedValue<number> | null = null;
    if (hasRectangles) {
      const cornerRadiusValues = rectangles.map((s) => s.cornerRadius ?? 0);
      cornerRadius = allEqual(cornerRadiusValues) ? cornerRadiusValues[0] : 'mixed';
    }

    return {
      x: getProperty(selectedShapes, 'x'),
      y: getProperty(selectedShapes, 'y'),
      width: getProperty(selectedShapes, 'width'),
      height: getProperty(selectedShapes, 'height'),
      rotation: getProperty(selectedShapes, 'rotation'),
      fill: getProperty(selectedShapes, 'fill'),
      fillOpacity: getProperty(selectedShapes, 'fillOpacity'),
      stroke: getProperty(selectedShapes, 'stroke'),
      strokeWidth: getProperty(selectedShapes, 'strokeWidth'),
      strokeStyle: getProperty(selectedShapes, 'strokeStyle'),
      cornerRadius,
      // Text style properties
      fontFamily: getTextStyleProperty(selectedShapes, 'fontFamily'),
      fontSize: getTextStyleProperty(selectedShapes, 'fontSize'),
      fontWeight: getTextStyleProperty(selectedShapes, 'fontWeight'),
      fontStyle: getTextStyleProperty(selectedShapes, 'fontStyle'),
      textDecoration: getTextStyleProperty(selectedShapes, 'textDecoration'),
      fontColor: getTextStyleProperty(selectedShapes, 'fontColor'),
      horizontalAlign: getTextStyleProperty(selectedShapes, 'horizontalAlign'),
      verticalAlign: getTextStyleProperty(selectedShapes, 'verticalAlign'),
    };
  }, [selectedShapes]);

  return {
    selectedShapes,
    selectedCount,
    properties,
  };
}
