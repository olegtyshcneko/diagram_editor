import { describe, it, expect } from 'vitest';
import { calculateResize } from '../resize';
import type { Bounds } from '@/types/common';
import type { ResizeOptions } from '@/types/interaction';

const defaultOptions: ResizeOptions = {
  maintainAspectRatio: false,
  resizeFromCenter: false,
  originalAspectRatio: 1,
  minSize: 10,
};

const startBounds: Bounds = { x: 100, y: 100, width: 200, height: 100 };

describe('calculateResize', () => {
  describe('corner handles', () => {
    it('se: should resize from bottom-right with positive delta', () => {
      const result = calculateResize(
        startBounds,
        'se',
        { x: 50, y: 30 },
        defaultOptions
      );

      expect(result.x).toBe(100);       // x unchanged
      expect(result.y).toBe(100);       // y unchanged
      expect(result.width).toBe(250);   // 200 + 50
      expect(result.height).toBe(130);  // 100 + 30
    });

    it('nw: should resize from top-left with negative delta', () => {
      const result = calculateResize(
        startBounds,
        'nw',
        { x: -30, y: -20 },
        defaultOptions
      );

      expect(result.x).toBe(70);        // 100 - 30
      expect(result.y).toBe(80);        // 100 - 20
      expect(result.width).toBe(230);   // 200 + 30
      expect(result.height).toBe(120);  // 100 + 20
    });

    it('ne: should resize from top-right', () => {
      const result = calculateResize(
        startBounds,
        'ne',
        { x: 50, y: -30 },
        defaultOptions
      );

      expect(result.x).toBe(100);       // x unchanged
      expect(result.y).toBe(70);        // 100 - 30
      expect(result.width).toBe(250);   // 200 + 50
      expect(result.height).toBe(130);  // 100 + 30
    });

    it('sw: should resize from bottom-left', () => {
      const result = calculateResize(
        startBounds,
        'sw',
        { x: -40, y: 25 },
        defaultOptions
      );

      expect(result.x).toBe(60);        // 100 - 40
      expect(result.y).toBe(100);       // y unchanged
      expect(result.width).toBe(240);   // 200 + 40
      expect(result.height).toBe(125);  // 100 + 25
    });
  });

  describe('edge handles', () => {
    it('n: should only change y and height', () => {
      const result = calculateResize(
        startBounds,
        'n',
        { x: 100, y: -30 },  // x should be ignored
        defaultOptions
      );

      expect(result.x).toBe(100);       // x unchanged
      expect(result.y).toBe(70);        // 100 - 30
      expect(result.width).toBe(200);   // width unchanged
      expect(result.height).toBe(130);  // 100 + 30
    });

    it('s: should only change height', () => {
      const result = calculateResize(
        startBounds,
        's',
        { x: 100, y: 40 },  // x should be ignored
        defaultOptions
      );

      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
      expect(result.width).toBe(200);
      expect(result.height).toBe(140);  // 100 + 40
    });

    it('e: should only change width', () => {
      const result = calculateResize(
        startBounds,
        'e',
        { x: 60, y: 100 },  // y should be ignored
        defaultOptions
      );

      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
      expect(result.width).toBe(260);   // 200 + 60
      expect(result.height).toBe(100);
    });

    it('w: should only change x and width', () => {
      const result = calculateResize(
        startBounds,
        'w',
        { x: -50, y: 100 },  // y should be ignored
        defaultOptions
      );

      expect(result.x).toBe(50);        // 100 - 50
      expect(result.y).toBe(100);
      expect(result.width).toBe(250);   // 200 + 50
      expect(result.height).toBe(100);
    });
  });

  describe('minimum size enforcement', () => {
    it('should not allow width below minimum', () => {
      const result = calculateResize(
        startBounds,
        'e',
        { x: -195, y: 0 },  // Would make width = 5, below min 10
        defaultOptions
      );

      expect(result.width).toBe(10);
    });

    it('should not allow height below minimum', () => {
      const result = calculateResize(
        startBounds,
        's',
        { x: 0, y: -95 },  // Would make height = 5, below min 10
        defaultOptions
      );

      expect(result.height).toBe(10);
    });

    it('should adjust position when hitting minimum from left', () => {
      const result = calculateResize(
        startBounds,
        'w',
        { x: 250, y: 0 },  // Would make width negative
        defaultOptions
      );

      expect(result.width).toBe(10);
      expect(result.x).toBe(290);  // 100 + 200 - 10 = right edge minus min width
    });

    it('should adjust position when hitting minimum from top', () => {
      const result = calculateResize(
        startBounds,
        'n',
        { x: 0, y: 150 },  // Would make height negative
        defaultOptions
      );

      expect(result.height).toBe(10);
      expect(result.y).toBe(190);  // 100 + 100 - 10 = bottom edge minus min height
    });
  });

  describe('aspect ratio constraint', () => {
    const aspectRatioBounds: Bounds = { x: 100, y: 100, width: 200, height: 100 };
    const aspectRatio = 2;  // 200/100 = 2:1

    it('should maintain aspect ratio when width change is larger', () => {
      const result = calculateResize(
        aspectRatioBounds,
        'se',
        { x: 100, y: 20 },  // Large x change, small y change
        { ...defaultOptions, maintainAspectRatio: true, originalAspectRatio: aspectRatio }
      );

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 1);
    });

    it('should maintain aspect ratio when height change is larger', () => {
      const result = calculateResize(
        aspectRatioBounds,
        'se',
        { x: 20, y: 100 },  // Small x change, large y change
        { ...defaultOptions, maintainAspectRatio: true, originalAspectRatio: aspectRatio }
      );

      expect(result.width / result.height).toBeCloseTo(aspectRatio, 1);
    });

    it('should only apply aspect ratio to corner handles', () => {
      const result = calculateResize(
        aspectRatioBounds,
        'e',  // Edge handle
        { x: 100, y: 0 },
        { ...defaultOptions, maintainAspectRatio: true, originalAspectRatio: aspectRatio }
      );

      // Edge handles should NOT maintain aspect ratio
      expect(result.width).toBe(300);
      expect(result.height).toBe(100);  // Height unchanged
    });
  });

  describe('resize from center', () => {
    it('should keep center stationary with se handle', () => {
      const result = calculateResize(
        startBounds,
        'se',
        { x: 50, y: 50 },
        { ...defaultOptions, resizeFromCenter: true }
      );

      // Center should remain the same: (200, 150)
      const originalCenterX = startBounds.x + startBounds.width / 2;
      const originalCenterY = startBounds.y + startBounds.height / 2;
      const newCenterX = result.x + result.width / 2;
      const newCenterY = result.y + result.height / 2;

      expect(newCenterX).toBeCloseTo(originalCenterX, 0);
      expect(newCenterY).toBeCloseTo(originalCenterY, 0);
    });

    it('should double the size change in each direction', () => {
      const result = calculateResize(
        startBounds,
        'se',
        { x: 50, y: 30 },
        { ...defaultOptions, resizeFromCenter: true }
      );

      // Size should increase by 2x the delta
      expect(result.width).toBe(300);   // 200 + (50 * 2)
      expect(result.height).toBe(160);  // 100 + (30 * 2)
    });
  });

  describe('combined constraints', () => {
    it('should apply both aspect ratio and center resize', () => {
      const bounds: Bounds = { x: 100, y: 100, width: 100, height: 100 };

      const result = calculateResize(
        bounds,
        'se',
        { x: 50, y: 30 },
        {
          ...defaultOptions,
          maintainAspectRatio: true,
          resizeFromCenter: true,
          originalAspectRatio: 1,  // Square
        }
      );

      // Should maintain 1:1 aspect ratio
      expect(result.width).toBeCloseTo(result.height, 0);

      // Center should remain at (150, 150)
      const newCenterX = result.x + result.width / 2;
      const newCenterY = result.y + result.height / 2;
      expect(newCenterX).toBeCloseTo(150, 0);
      expect(newCenterY).toBeCloseTo(150, 0);
    });
  });
});
