import {useDerivedValue} from 'react-native-reanimated';
import {useLineChart} from './useLineChart';

export function useYValue({index}: {index?: number} = {}) {
  const {currentIndex, currentAdjustedIndex, data, mapPointsToFixedRange} =
    useLineChart();

  const floatAndIndex = useDerivedValue(() => {
    let adjustedIndex: number;
    let value = 0;
    let dataIndex = -1; // default index when no value is found

    if (mapPointsToFixedRange) {
      if (
        (typeof currentAdjustedIndex.value === 'undefined' ||
          currentAdjustedIndex.value === -1) &&
        index == null
      )
        return {value: '', index: dataIndex};

      const maxX = Math.max(...data.map(d => d.x));

      if (currentAdjustedIndex.value > maxX)
        return {value: '', index: dataIndex};

      adjustedIndex = index ?? currentAdjustedIndex.value;

      const dataPoint = [...data].reverse().find((d, i) => {
        if (d.x <= adjustedIndex) {
          dataIndex = data.length - 1 - i;
          return true;
        }
        return false;
      });

      if (!dataPoint || dataPoint.y === 0) {
        return {value: '', index: dataIndex};
      } else {
        value = dataPoint.y;
      }
    } else {
      if (
        (typeof currentIndex.value === 'undefined' ||
          currentIndex.value === -1) &&
        index == null
      )
        return {value: '', index: dataIndex};

      dataIndex = Math.min(index ?? currentIndex.value, data.length - 1);
      value = data[dataIndex !== -1 ? dataIndex : 0].y;
    }

    return {value: value.toString(), index: dataIndex};
  }, [currentIndex, currentAdjustedIndex, data]);

  const valueIndex = useDerivedValue(() => {
    return floatAndIndex.value.index;
  }, [floatAndIndex]);

  const formatted = useDerivedValue(() => {
    let value = floatAndIndex.value.value || '';
    const formattedPrice = value ? value : '';
    return formattedPrice;
  }, [floatAndIndex]);

  return {value: floatAndIndex, formatted, valueIndex};
}
