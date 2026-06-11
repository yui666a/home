import { describe, it, expect } from 'vitest';
import { getDict, t, otherLocale } from '../src/i18n/utils';

describe('i18n utils', () => {
  it('ja と en が同じキー集合を持つ', () => {
    const ja = getDict('ja');
    const en = getDict('en');
    expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(ja.nav).sort()).toEqual(Object.keys(en.nav).sort());
  });

  it('t() がネストキーを解決する', () => {
    expect(t('ja', 'nav.works')).toBe('Works');
    expect(t('en', 'hero.name')).toBe('AISO, Hitoshi');
  });

  it('otherLocale() が言語を反転する', () => {
    expect(otherLocale('ja')).toBe('en');
    expect(otherLocale('en')).toBe('ja');
  });
});
