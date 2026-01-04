// Available shape types
export type ShapeType =
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'triangle'
  | 'line'
  | 'text';

// Stroke style options
export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

// Text alignment options
export type HorizontalAlign = 'left' | 'center' | 'right';
export type VerticalAlign = 'top' | 'middle' | 'bottom';

// Text content within a shape
export interface TextContent {
  html: string;
  plainText: string;
}

// Text styling
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  horizontalAlign: HorizontalAlign;
  verticalAlign: VerticalAlign;
}

// Main Shape interface
export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;

  // Styling
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  cornerRadius?: number;

  // Text
  text?: TextContent;
  textStyle?: TextStyle;

  // State
  locked: boolean;
  visible: boolean;
  zIndex: number;

  // Grouping
  groupId?: string;
}

// Default shape values
export const DEFAULT_SHAPE: Omit<Shape, 'id' | 'type' | 'x' | 'y'> = {
  width: 100,
  height: 60,
  rotation: 0,
  fill: '#ffffff',
  fillOpacity: 1,
  stroke: '#000000',
  strokeWidth: 2,
  strokeStyle: 'solid',
  locked: false,
  visible: true,
  zIndex: 0,
};

// Default text style
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Arial, sans-serif',
  fontSize: 14,
  fontColor: '#000000',
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  horizontalAlign: 'center',
  verticalAlign: 'middle',
};
