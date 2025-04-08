export function formatMetersToFeet(n: number): string {
  'worklet';
  var feet = n * 3.28084;
  var rFeet = Math.round(feet);
  return `${rFeet} ft`;
}

export function formatMetersToFeetNoUnit(n: number): string {
  'worklet';
  var feet = n * 3.28084;
  var rFeet = Math.round(feet);
  return `${rFeet}`;
}
