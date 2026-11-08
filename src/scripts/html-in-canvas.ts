// lib.dom に未収録の HTML-in-Canvas API の型。使う範囲だけ宣言する。
export type DrawableCanvas = HTMLCanvasElement & {
  content: string;
  requestPaint(): void;
  updateElementGeometry(element: Element, options: { canvasTransform: DOMMatrix }): void;
};

export type ElementImageContext2D = CanvasRenderingContext2D & {
  drawElementImage(
    element: Element,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number,
    options?: { preserveElementGeometry?: boolean },
  ): void;
  drawElementImage(element: Element, dx: number, dy: number, dw: number, dh: number): void;
};

export type ElementImageGL = WebGL2RenderingContext & {
  texElementSubImage2D(
    target: number,
    level: number,
    x: number,
    y: number,
    element: Element,
    config?: { width: number; height: number },
  ): void;
};

export function makeDrawable(canvas: HTMLCanvasElement): DrawableCanvas | null {
  canvas.setAttribute('content', 'drawable');
  const c = canvas as DrawableCanvas;
  return c.content === 'drawable' && 'requestPaint' in c ? c : null;
}
