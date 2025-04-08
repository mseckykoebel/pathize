import {useDerivedValue} from 'react-native-reanimated';

import {formatDatetime} from './utils';
import type {FormatterFn} from './types';
import {useLineChart} from './useLineChart';

export function useLineChartDatetime({
  format,
  locale,
  options,
}: {
  format?: FormatterFn<number>;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
} = {}) {
  const {currentIndex, data} = useLineChart();

  const xValue = useDerivedValue(() => {
    if (typeof currentIndex.value === 'undefined' || currentIndex.value === -1)
      return '';
    return data[currentIndex.value].x;
  }, [currentIndex, data]);

  const xValueString = useDerivedValue(() => {
    if (xValue.value === '') return '';
    return xValue.value.toString();
  }, [xValue]);

  const formatted = useDerivedValue(() => {
    const formattedDatetime =
      xValue.value || xValue.value === 0
        ? formatDatetime({
            value: xValue.value,
            dataLength: data.length - 1,
            locale,
            options,
          })
        : '';
    return format
      ? format({value: xValue.value || -1, formatted: formattedDatetime})
      : formattedDatetime;
  }, [format, locale, options, xValue]);

  return {value: xValueString, formatted};
}
