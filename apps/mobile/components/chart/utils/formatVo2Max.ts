export function formatVo2Max(n: number): string {
  'worklet';
  return `${Math.trunc(n)} ml/min/kg`;
}

export function formatVo2MaxNoUnit(n: number): string {
  'worklet';
  return `${Math.trunc(n)}`;
}
