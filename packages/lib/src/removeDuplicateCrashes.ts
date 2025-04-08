export function removeDuplicateCrashes(
  crashes: {
    createdDay: string;
    severity: number | null;
  }[]
) {
  return Array.from(
    crashes
      .reduce((map, obj) => {
        if (!map.has(obj.createdDay)) {
          map.set(obj.createdDay, obj);
        }
        return map;
      }, new Map())
      .values()
  ).sort((a, b) => {
    return new Date(a.createdDay).getTime() - new Date(b.createdDay).getTime();
  });
}
