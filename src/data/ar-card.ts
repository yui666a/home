export type ArLink = { id: string; label: string; url: string; icon: string };
export type ArCard = { name: string; role: string; links: ArLink[] };

export const arCard: ArCard = {
  name: '相曽 結',
  role: 'Software Engineer',
  links: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/yui666a', icon: 'github.svg' },
    { id: 'qiita', label: 'Qiita', url: 'https://qiita.com/yui666a', icon: 'qiita.svg' },
    { id: 'zenn', label: 'Zenn', url: 'https://zenn.dev/yui666a', icon: 'zenn.svg' },
    { id: 'x', label: 'X', url: 'https://x.com/yui_ai0216', icon: 'x.svg' },
  ],
};

export function isSafeExternalUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function iconPath(link: ArLink): string {
  const name = link.icon.replace(/^\/+/, '');
  return `/ar/icons/${name}`;
}
