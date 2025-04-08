import React from 'react';
import type {TextProps as RNTextProps} from 'react-native';

import {useLineChartDatetime} from './useDatetime';
import type {FormatterFn} from './types';
import {AnimatedText} from '../animated/AnimatedText';
import {AnimatedProps} from 'react-native-reanimated';

type LineChartDatetimeProps = {
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  format?: FormatterFn<number>;
  variant?: 'formatted' | 'value';
  style?: AnimatedProps<RNTextProps>['style'];
};

LineChartDatetimeText.displayName = 'LineChartDatetimeText';

export function LineChartDatetimeText({
  locale,
  options,
  format,
  variant = 'formatted',
  style,
}: LineChartDatetimeProps) {
  const datetime = useLineChartDatetime({format, locale, options});

  return <AnimatedText text={datetime[variant]} style={style} />;
}
