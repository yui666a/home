import { describe, it, expect } from 'vitest';
import { arCard, isSafeExternalUrl, iconPath, type ArLink } from '../src/data/ar-card';

describe('ar-card data', () => {
  it('name と role が空でない', () => {
    expect(arCard.name.length).toBeGreaterThan(0);
    expect(arCard.role.length).toBeGreaterThan(0);
  });

  it('全リンクが https かつ id 重複なし', () => {
    const ids = new Set<string>();
    for (const l of arCard.links) {
      expect(isSafeExternalUrl(l.url)).toBe(true);
      expect(l.icon.length).toBeGreaterThan(0);
      expect(ids.has(l.id)).toBe(false);
      ids.add(l.id);
    }
  });
});

describe('isSafeExternalUrl', () => {
  it('https は true', () => {
    expect(isSafeExternalUrl('https://github.com/yui666a')).toBe(true);
  });
  it('http / javascript / 相対 は false', () => {
    expect(isSafeExternalUrl('http://example.com')).toBe(false);
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('/foo')).toBe(false);
    expect(isSafeExternalUrl('not a url')).toBe(false);
  });
});

describe('iconPath', () => {
  it('/ar/icons/ 配下に解決する', () => {
    const l: ArLink = { id: 'x', label: 'X', url: 'https://x.com/yui_ai0216', icon: 'x.svg' };
    expect(iconPath(l)).toBe('/ar/icons/x.svg');
  });
  it('先頭スラッシュ付き icon でも二重にしない', () => {
    const l: ArLink = { id: 'x', label: 'X', url: 'https://x.com/yui_ai0216', icon: '/x.svg' };
    expect(iconPath(l)).toBe('/ar/icons/x.svg');
  });
});
