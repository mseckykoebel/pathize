import React from 'react';
import type {TextProps as RNTextProps} from 'react-native';
import {AnimatedProps, useDerivedValue} from 'react-native-reanimated';

import {AnimatedText} from '../animated/AnimatedText';
import {useYValue} from './useYValue';
import {FormatterFn} from './types';

type LineChartAdjustedDatetimeProps = {
  adjustedData: {timestamp: string; value: number}[];
  format?: FormatterFn<string>;
  style?: AnimatedProps<RNTextProps>['style'];
};

export function LineChartAdjustedDatetimeText({
  adjustedData,
  format,
  style,
}: LineChartAdjustedDatetimeProps) {
  const {valueIndex, value} = useYValue();
  const adjustedDatetime = useDerivedValue(() => {
    if (valueIndex.value < 0 || value.value.value === '') return '';
    return adjustedData[valueIndex.value].timestamp;
  }, [adjustedData, valueIndex]);

  const formattedDatetime = useDerivedValue(() => {
    if (adjustedDatetime.value) {
      return format
        ? format({value: adjustedDatetime.value, formatted: ''})
        : adjustedDatetime.value;
    }
    return '';
  }, [adjustedDatetime]);

  return <AnimatedText text={formattedDatetime} style={style} />;
}
