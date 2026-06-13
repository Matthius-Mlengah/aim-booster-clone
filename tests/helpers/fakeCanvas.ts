export function createFakeContext(): CanvasRenderingContext2D {
  const noop = () => undefined;

  return {
    canvas: {} as HTMLCanvasElement,
    clearRect: noop,
    setTransform: noop,
    fillRect: noop,
    fill: noop,
    beginPath: noop,
    moveTo: noop,
    lineTo: noop,
    stroke: noop,
    drawImage: noop,
    fillText: noop,
    save: noop,
    restore: noop,
    clip: noop,
    closePath: noop,
    arc: noop,
    ellipse: noop,
    strokeRect: noop,
    measureText: () => ({ width: 0 }) as TextMetrics,
    createLinearGradient: () => ({ addColorStop: noop }) as CanvasGradient,
    createPattern: () => null,
    createRadialGradient: () => ({ addColorStop: noop }) as CanvasGradient,
    getLineDash: () => [],
    getTransform: () => new DOMMatrix(),
    isPointInPath: () => false,
    isPointInStroke: () => false,
    putImageData: noop,
    resetTransform: noop,
    rotate: noop,
    scale: noop,
    setLineDash: noop,
    translate: noop,
    transform: noop,
    fillStyle: "#000",
    strokeStyle: "#000",
    lineWidth: 1,
    textAlign: "left",
    textBaseline: "alphabetic",
    font: "10px sans-serif",
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "low",
    direction: "inherit",
  } as unknown as CanvasRenderingContext2D;
}

export function createFakeCanvas(ctx = createFakeContext()): HTMLCanvasElement {
  return {
    width: 0,
    height: 0,
    style: {},
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
}
