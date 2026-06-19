import { describe, expect, it } from 'vitest';
import en from '../messages/en.json';
import ja from '../messages/ja.json';
import { m } from '../src/paraglide/messages.js';

describe('i18n (Paraglide)', () => {
  it('ja と en が同じメッセージキー集合を持つ', () => {
    const keysOf = (dict: Record<string, unknown>) =>
      Object.keys(dict)
        .filter((k) => k !== '$schema')
        .sort();
    expect(keysOf(ja)).toEqual(keysOf(en));
  });

  it('メッセージ関数が locale に応じた文字列を返す', () => {
    expect(m.nav_works({}, { locale: 'ja' })).toBe('Works');
    expect(m.hero_name({}, { locale: 'ja' })).toBe('相曽 結');
    expect(m.hero_name({}, { locale: 'en' })).toBe('AISO, Hitoshi');
  });

  it('言語切替ラベルが相手の言語を指す', () => {
    expect(m.lang_switch_to({}, { locale: 'ja' })).toBe('EN');
    expect(m.lang_switch_to({}, { locale: 'en' })).toBe('JP');
  });
});
