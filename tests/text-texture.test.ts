import { describe, it, expect } from 'vitest';
import { measureLines, createTextCanvas, type TextStyle } from '../src/scripts/text-texture';

const style: TextStyle = { font: '48px sans-serif', color: '#ffffff', padding: 16, lineHeight: 56 };

describe('measureLines', () => {
  it('総高は lineHeight × 行数 + padding×2', () => {
    const r = measureLines(['相曽 結', 'Software Engineer'], style);
    expect(r.height).toBe(56 * 2 + 16 * 2);
  });
  it('幅は最低でも padding×2 を超える', () => {
    const r = measureLines(['x'], style);
    expect(r.width).toBeGreaterThan(16 * 2);
  });
});

describe('createTextCanvas', () => {
  it('HTMLCanvasElement を返す', () => {
    const canvas = createTextCanvas(['相曽 結'], style);
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBe(56 + 16 * 2);
  });
});
