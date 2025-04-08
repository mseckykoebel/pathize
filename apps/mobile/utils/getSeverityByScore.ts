export function getSymptomSeverityByScore(severity: number): string {
  if (severity === 0) {
    return '-';
  } else if (severity === 1) {
    return 'Minimal';
  } else if (severity === 2) {
    return 'Mild';
  } else if (severity === 3) {
    return 'Moderate';
  } else if (severity === 4) {
    return 'Severe';
  } else if (severity === 5) {
    return 'Most severe';
  } else {
    return 'Unknown severity';
  }
}

export function getCrashSeverityByScore(severity: number): string {
  if (severity === 0) {
    return '-';
  } else if (severity === 1) {
    return 'Minimal';
  } else if (severity === 2) {
    return 'Mild';
  } else if (severity === 3) {
    return 'Moderate';
  } else if (severity === 4) {
    return 'Severe';
  } else if (severity === 5) {
    return 'Most severe';
  } else {
    return 'Unknown severity';
  }
}
