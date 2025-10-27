// 缓动函数
export const easeInOutCubic = (t: number): number => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

export const easeOutQuad = (t: number): number => {
  return t * (2 - t);
};

export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

export function interpolate(start: number, end: number, t: number, easing = easeInOutCubic): number {
  return start + (end - start) * easing(t);
}

export function interpolateColor(
  color1: [number, number, number],
  color2: [number, number, number],
  t: number
): string {
  const r = Math.round(interpolate(color1[0], color2[0], t));
  const g = Math.round(interpolate(color1[1], color2[1], t));
  const b = Math.round(interpolate(color1[2], color2[2], t));
  return `rgb(${r}, ${g}, ${b})`;
}

