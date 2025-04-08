import * as React from 'react';
import type {TextProps as RNTextProps} from 'react-native';

import {useYValue} from './useYValue';
import {AnimatedText} from '../animated/AnimatedText';
import {AnimatedProps} from 'react-native-reanimated';

export type LineChartYValueTextProps = {
  lowerBound?: number;
  formatFn?: (value: number) => string;
  variant?: 'formatted' | 'value';
  style?: AnimatedProps<RNTextProps>['style'];
  /**
   * By default, it will use the current active index from the chart.
   * If this is set it will use the index provided.
   */
  index?: number;
};

LineChartYValueText.displayName = 'LineChartYValueTextText';

export function LineChartYValueText({
  lowerBound,
  formatFn,
  variant = 'formatted',
  style,
  index,
}: LineChartYValueTextProps) {
  const value = useYValue({index});
  return (
    <AnimatedText
      text={value[variant]}
      style={style}
      formatFn={formatFn}
      lowerBound={lowerBound}
    />
  );
}
