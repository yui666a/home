import { type ElementImageContext2D, makeDrawable } from './html-in-canvas';

const SLICE = 3; // 短冊の高さ(canvas px)
const AMPLITUDE = 9; // CSS px

// 波紋は横ずらしの短冊で描く。ピクセル単位の変位は 2D では読み戻しが要り、毎フレームには重い。
function enhance(host: HTMLElement, card: HTMLElement) {
  const canvas = document.createElement('canvas');
  const drawable = makeDrawable(canvas);
  if (!drawable) return;
  const ctx = canvas.getContext('2d') as ElementImageContext2D;
  canvas.style.cssText = 'display:block;width:100%';
  card.setAttribute('drawable', '');
  card.style.boxSizing = 'border-box';
  card.style.width = '100%';
  host.append(canvas);
  canvas.append(card);

  let strength = 0;
  let target = 0;
  let pointerY = 0;

  new ResizeObserver(([entry]) => {
    canvas.style.height = `${card.offsetHeight}px`;
    const size = entry.devicePixelContentBoxSize?.[0];
    canvas.width = size?.inlineSize ?? Math.round(entry.contentRect.width * devicePixelRatio);
    canvas.height = size?.blockSize ?? Math.round(entry.contentRect.height * devicePixelRatio);
    drawable.requestPaint();
  }).observe(canvas);
  new ResizeObserver(() => {
    canvas.style.height = `${card.offsetHeight}px`;
  }).observe(card);

  card.addEventListener('pointerenter', () => {
    target = 1;
    drawable.requestPaint();
  });
  card.addEventListener('pointermove', (e) => {
    pointerY = e.clientY - canvas.getBoundingClientRect().top;
  });
  card.addEventListener('pointerleave', () => {
    target = 0;
    drawable.requestPaint();
  });

  canvas.addEventListener('paint', () => {
    const { width, height } = canvas;
    const scale = width / canvas.clientWidth;
    ctx.reset();
    strength += (target - strength) * 0.12;
    if (strength < 0.01 && target === 0) {
      strength = 0;
      ctx.drawElementImage(card, 0, 0, width, height);
      return;
    }
    const time = performance.now();
    const cssWidth = canvas.clientWidth;
    const sliceCss = SLICE / scale;
    for (let y = 0; y < height; y += SLICE) {
      const cssY = y / scale;
      const distance = Math.abs(cssY - pointerY);
      const offset =
        Math.sin(distance * 0.07 - time * 0.009) *
        AMPLITUDE *
        Math.exp(-distance / 110) *
        strength *
        scale;
      // 当たり判定は素の位置のまま残す。歪みの量だけ判定を動かすとリンクの上でホバーが途切れる。
      ctx.drawElementImage(card, 0, cssY, cssWidth, sliceCss, offset, y, width, SLICE, {
        preserveElementGeometry: true,
      });
    }
    drawable.requestPaint();
  });
}

export function initCardRipple(root: ParentNode) {
  if (!matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return;
  root.querySelectorAll<HTMLElement>('[data-ripple-host]').forEach((host) => {
    const card = host.querySelector<HTMLElement>('[data-ripple-card]');
    if (card) enhance(host, card);
  });
}
