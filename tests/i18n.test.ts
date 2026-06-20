import { describe, expect, it } from 'vitest';
import { type Locale, locales, type MessageKey, t, ui } from '../src/i18n/ui';

describe('i18n 自前辞書', () => {
  it('ja と en が同じキー集合を持つ', () => {
    const keysOf = (loc: Locale) => Object.keys(ui[loc]).sort();
    expect(keysOf('ja')).toEqual(keysOf('en'));
  });

  it('t() が locale に応じた文字列を返す', () => {
    expect(t('ja', 'nav_works')).toBe('Works');
    expect(t('ja', 'hero_name')).toBe('相曽 結');
    expect(t('en', 'hero_name')).toBe('AISO, Hitoshi');
  });

  it('言語切替ラベルが相手の言語を指す', () => {
    expect(t('ja', 'lang_switch_to')).toBe('EN');
    expect(t('en', 'lang_switch_to')).toBe('JP');
  });

  it('locales は ja と en を含む', () => {
    expect([...locales].sort()).toEqual(['en', 'ja']);
  });

  it('全 locale × 全 key が空でない文字列', () => {
    const keys = Object.keys(ui.ja) as MessageKey[];
    for (const loc of locales) {
      for (const k of keys) {
        expect(typeof t(loc, k)).toBe('string');
        expect(t(loc, k).length).toBeGreaterThan(0);
      }
    }
  });
});
