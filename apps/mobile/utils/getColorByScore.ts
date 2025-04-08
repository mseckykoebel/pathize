export function getColorByScore(severity: number): string {
  if (severity === 1) {
    return 'bg-green-300';
  } else if (severity === 2) {
    return 'bg-lime-300';
  } else if (severity === 3) {
    return 'bg-yellow-300';
  } else if (severity === 4) {
    return 'bg-orange-300';
  } else if (severity === 5) {
    return 'bg-red-300';
  } else {
    return 'bg-gray-200';
  }
}

// equivalent of above, but -500 instead of -200
export function getHeartRateOverlayColorByScore(
  severity: number,
  alpha: number,
): string {
  if (severity === 1) {
    return `rgba(22, 163, 74, ${alpha})`;
  } else if (severity === 2) {
    return `rgba(101, 163, 13, ${alpha})`;
  } else if (severity === 3) {
    return `rgba(202, 138, 4, ${alpha})`;
  } else if (severity === 4) {
    return `rgba(234, 88, 12, ${alpha})`;
  } else if (severity === 5) {
    return `rgba(220, 38, 38, ${alpha})`;
  } else {
    return `rgba(5, 150, 105, ${alpha})`;
  }
}
