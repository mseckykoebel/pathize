export function getBarColor(bpm: number, limit: number) {
  if (bpm > limit) {
    return '#DC2626';
  } else {
    return '#08816E';
  }
}

export function getBarColorWithResting(
  restingBpm: number,
  bpm: number,
  limit: number,
  heavyExertionBpm: number,
) {
  if (bpm < restingBpm) {
    return '#7DD3FC';
  } else if (bpm < limit) {
    return '#08816E';
  } else if (bpm >= limit && bpm < heavyExertionBpm) {
    return '#EAB308';
  } else {
    return '#DC2626';
  }
}
