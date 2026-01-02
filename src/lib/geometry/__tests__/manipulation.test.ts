import { describe, it, expect } from 'vitest';
import {
  getBoundsCenter,
  calculateAngle,
  normalizeAngle,
  snapAngle,
  constrainToAxis,
  getHandlePositions,
  getRotationHandlePosition,
  isCornerHandle,
} from '../manipulation';

describe('getBoundsCenter', () => {
  it('should calculate center of bounds', () => {
    const center = getBoundsCenter({ x: 100, y: 100, width: 200, height: 100 });
    expect(center.x).toBe(200);
    expect(center.y).toBe(150);
  });

  it('should handle zero position', () => {
    const center = getBoundsCenter({ x: 0, y: 0, width: 50, height: 50 });
    expect(center.x).toBe(25);
    expect(center.y).toBe(25);
  });
});

describe('calculateAngle', () => {
  const center = { x: 100, y: 100 };

  it('should return 0 for point directly above center', () => {
    const angle = calculateAngle(center, { x: 100, y: 50 });
    expect(angle).toBeCloseTo(0, 0);
  });

  it('should return 90 for point directly right of center', () => {
    const angle = calculateAngle(center, { x: 150, y: 100 });
    expect(angle).toBeCloseTo(90, 0);
  });

  it('should return 180 for point directly below center', () => {
    const angle = calculateAngle(center, { x: 100, y: 150 });
    expect(angle).toBeCloseTo(180, 0);
  });

  it('should return 270 for point directly left of center', () => {
    const angle = calculateAngle(center, { x: 50, y: 100 });
    expect(angle).toBeCloseTo(270, 0);
  });

  it('should handle diagonal angles correctly', () => {
    // Upper-right diagonal (should be ~45 degrees)
    const angle = calculateAngle(center, { x: 150, y: 50 });
    expect(angle).toBeCloseTo(45, 0);
  });
});

describe('normalizeAngle', () => {
  it('should keep angles in 0-360 range unchanged', () => {
    expect(normalizeAngle(45)).toBe(45);
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(180)).toBe(180);
  });

  it('should normalize negative angles', () => {
    expect(normalizeAngle(-45)).toBe(315);
    expect(normalizeAngle(-90)).toBe(270);
    expect(normalizeAngle(-360)).toBe(0);
  });

  it('should normalize angles >= 360', () => {
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(405)).toBe(45);
    expect(normalizeAngle(720)).toBe(0);
  });
});

describe('snapAngle', () => {
  it('should snap to nearest increment', () => {
    expect(snapAngle(7, 15)).toBe(0);
    expect(snapAngle(8, 15)).toBe(15);
    expect(snapAngle(22, 15)).toBe(15);
    expect(snapAngle(23, 15)).toBe(30);
  });

  it('should snap to exact values', () => {
    expect(snapAngle(0, 15)).toBe(0);
    expect(snapAngle(15, 15)).toBe(15);
    expect(snapAngle(90, 15)).toBe(90);
  });

  it('should handle angles near 360', () => {
    expect(snapAngle(352, 15)).toBe(345);
    expect(snapAngle(353, 15)).toBe(360);
  });
});

describe('constrainToAxis', () => {
  it('should constrain to horizontal when x movement is dominant', () => {
    const result = constrainToAxis({ x: 100, y: 20 });
    expect(result.x).toBe(100);
    expect(result.y).toBe(0);
  });

  it('should constrain to vertical when y movement is dominant', () => {
    const result = constrainToAxis({ x: 15, y: 100 });
    expect(result.x).toBe(0);
    expect(result.y).toBe(100);
  });

  it('should handle negative values', () => {
    const result = constrainToAxis({ x: -100, y: 20 });
    expect(result.x).toBe(-100);
    expect(result.y).toBe(0);
  });

  it('should pick larger axis when close to 45 degrees', () => {
    // Within threshold, should pick the larger absolute value
    const result = constrainToAxis({ x: 50, y: 48 });
    expect(result.x).toBe(50);
    expect(result.y).toBe(0);
  });

  it('should respect custom threshold', () => {
    // With larger threshold, similar values should pick larger
    const result = constrainToAxis({ x: 50, y: 40 }, 15);
    expect(result.x).toBe(50);
    expect(result.y).toBe(0);
  });
});

describe('getHandlePositions', () => {
  const bounds = { x: 100, y: 100, width: 200, height: 100 };

  it('should return 8 handles', () => {
    const handles = getHandlePositions(bounds);
    expect(handles).toHaveLength(8);
  });

  it('should position corner handles correctly', () => {
    const handles = getHandlePositions(bounds);

    const nw = handles.find(h => h.type === 'nw');
    expect(nw?.x).toBe(100);
    expect(nw?.y).toBe(100);

    const ne = handles.find(h => h.type === 'ne');
    expect(ne?.x).toBe(300);
    expect(ne?.y).toBe(100);

    const sw = handles.find(h => h.type === 'sw');
    expect(sw?.x).toBe(100);
    expect(sw?.y).toBe(200);

    const se = handles.find(h => h.type === 'se');
    expect(se?.x).toBe(300);
    expect(se?.y).toBe(200);
  });

  it('should position edge handles at midpoints', () => {
    const handles = getHandlePositions(bounds);

    const n = handles.find(h => h.type === 'n');
    expect(n?.x).toBe(200);
    expect(n?.y).toBe(100);

    const s = handles.find(h => h.type === 's');
    expect(s?.x).toBe(200);
    expect(s?.y).toBe(200);

    const e = handles.find(h => h.type === 'e');
    expect(e?.x).toBe(300);
    expect(e?.y).toBe(150);

    const w = handles.find(h => h.type === 'w');
    expect(w?.x).toBe(100);
    expect(w?.y).toBe(150);
  });

  it('should include correct cursors', () => {
    const handles = getHandlePositions(bounds);

    expect(handles.find(h => h.type === 'nw')?.cursor).toBe('nwse-resize');
    expect(handles.find(h => h.type === 'n')?.cursor).toBe('ns-resize');
    expect(handles.find(h => h.type === 'e')?.cursor).toBe('ew-resize');
  });
});

describe('getRotationHandlePosition', () => {
  it('should position handle above top-center', () => {
    const bounds = { x: 100, y: 100, width: 200, height: 100 };
    const pos = getRotationHandlePosition(bounds, 30);

    expect(pos.x).toBe(200); // Center x
    expect(pos.y).toBe(70);  // 100 - 30 = above top edge
  });

  it('should handle different offsets', () => {
    const bounds = { x: 0, y: 50, width: 100, height: 100 };
    const pos = getRotationHandlePosition(bounds, 20);

    expect(pos.x).toBe(50);
    expect(pos.y).toBe(30); // 50 - 20
  });
});

describe('isCornerHandle', () => {
  it('should return true for corner handles', () => {
    expect(isCornerHandle('nw')).toBe(true);
    expect(isCornerHandle('ne')).toBe(true);
    expect(isCornerHandle('sw')).toBe(true);
    expect(isCornerHandle('se')).toBe(true);
  });

  it('should return false for edge handles', () => {
    expect(isCornerHandle('n')).toBe(false);
    expect(isCornerHandle('s')).toBe(false);
    expect(isCornerHandle('e')).toBe(false);
    expect(isCornerHandle('w')).toBe(false);
  });

  it('should return false for rotation handle', () => {
    expect(isCornerHandle('rotation')).toBe(false);
  });
});
