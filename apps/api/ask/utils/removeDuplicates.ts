export function removeDuplicates(
  arr: Array<{ date: string; [key: string]: string | number | unknown }>
) {
  return Array.from(
    arr
      .reduce((map, obj) => {
        if (!map.has(obj.date)) {
          map.set(obj.date, obj);
        }
        return map;
      }, new Map())
      .values()
  ).sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
}
