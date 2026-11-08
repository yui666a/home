export type TextStyle = { font: string; color: string; padding: number; lineHeight: number };

export function measureLines(lines: string[], style: TextStyle): { width: number; height: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let maxWidth = 0;
  if (ctx) {
    ctx.font = style.font;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxWidth) maxWidth = w;
    }
  }
  const width = Math.ceil(maxWidth) + style.padding * 2 + 1; // +1 で 0幅環境でも padding×2 を必ず超える
  const height = style.lineHeight * lines.length + style.padding * 2;
  return { width, height };
}

export function createTextCanvas(lines: string[], style: TextStyle): HTMLCanvasElement {
  const { width, height } = measureLines(lines, style);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = style.font;
    ctx.fillStyle = style.color;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.fillText(line, style.padding, style.padding + i * style.lineHeight);
    });
  }
  return canvas;
}
