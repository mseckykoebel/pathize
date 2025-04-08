export function bpmToMilliseconds(bpm: number): number {
  const minutes: number = 1 / bpm;
  const seconds: number = minutes * 60;
  const milliseconds: number = seconds * 1000;
  return milliseconds;
}
