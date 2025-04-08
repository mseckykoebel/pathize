export function processTodayData(todayData: {x: number; y: number}[]) {
  const processedTodayData: {x: number; y: number}[] = [];
  const todayDataMap: Map<number, number> = new Map();

  let max_x_value = 0;

  todayData.forEach(({x, y}) => {
    todayDataMap.set(x, y);
    max_x_value = Math.max(max_x_value, x);
  });

  let passedMaxX = false;

  for (let i = 0; i <= 1440; i++) {
    if (todayDataMap.has(i)) {
      processedTodayData.push({x: i, y: todayDataMap.get(i)!});
      if (i === max_x_value) {
        passedMaxX = true;
      }
    } else if (passedMaxX) {
      processedTodayData.push({x: i, y: 0});
    } else if (processedTodayData.length > 0) {
      processedTodayData.push({
        x: i,
        y: processedTodayData[processedTodayData.length - 1].y,
      });
    } else {
      processedTodayData.push({x: i, y: 0});
    }
  }

  return processedTodayData;
}
