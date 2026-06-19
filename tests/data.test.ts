import { describe, it, expect } from 'vitest';
import { works } from '../src/data/works';
import { skills } from '../src/data/skills';
import { timeline } from '../src/data/timeline';

describe('works data', () => {
  it('各 work は必須フィールドを持つ', () => {
    expect(works.length).toBeGreaterThan(0);
    for (const w of works) {
      expect(w.slug).toMatch(/^[a-z0-9-]+$/);
      expect(w.title.ja).toBeTruthy();
      expect(w.title.en).toBeTruthy();
      expect(Array.isArray(w.tags)).toBe(true);
      expect(w.url).toMatch(/^https?:\/\//);
    }
  });
  it('slug は一意', () => {
    const slugs = works.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('skills data', () => {
  it('各カテゴリは name と items を持つ', () => {
    expect(skills.length).toBeGreaterThan(0);
    for (const c of skills) {
      expect(c.category.ja).toBeTruthy();
      expect(c.category.en).toBeTruthy();
      expect(c.items.length).toBeGreaterThan(0);
    }
  });
});

describe('timeline data', () => {
  it('各エントリは period と両言語の title を持つ', () => {
    expect(timeline.length).toBeGreaterThan(0);
    for (const e of timeline) {
      expect(e.period).toBeTruthy();
      expect(e.title.ja).toBeTruthy();
      expect(e.title.en).toBeTruthy();
    }
  });
});
