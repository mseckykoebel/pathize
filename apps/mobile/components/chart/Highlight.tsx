import React, {useMemo, useContext} from 'react';
import Animated, {AnimatedProps} from 'react-native-reanimated';
import {Path, PathProps} from 'react-native-svg';

import {LineChartDimensionsContext} from './Chart';
import {LineChartPathContext} from './LineChartPathContext';
import useAnimatedPath from './useAnimatedPath';
import {useLineChart} from './useLineChart';
import {getPath} from './utils';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export type LineChartColorProps = AnimatedProps<PathProps> & {
  color?: string;
  from: number;
  to: number;
  nullCutoff?: number;
  showInactiveColor?: boolean;
  inactiveColor?: string;
  width?: number;
};

LineChartHighlight.displayName = 'LineChartHighlight';

export function LineChartHighlight({
  color = 'black',
  inactiveColor,
  showInactiveColor = true,
  from,
  to,
  nullCutoff = 0,
  width: strokeWidth = 2,
  ...props
}: LineChartColorProps) {
  const {data, yDomain} = useLineChart();
  const {pathWidth, height, gutter} = useContext(LineChartDimensionsContext);
  const {isTransitionEnabled, isInactive: _isInactive} =
    useContext(LineChartPathContext);
  const isInactive = showInactiveColor && _isInactive;

  ////////////////////////////////////////////////

  const path = useMemo(() => {
    if (data && data.length > 0) {
      return getPath({
        data,
        from,
        to,
        width: pathWidth,
        nullCutoff,
        height,
        gutter,
        yDomain,
      });
    }
    return '';
  }, [data, from, to, pathWidth, height, gutter, yDomain, nullCutoff]);

  const {animatedProps} = useAnimatedPath({
    enabled: isTransitionEnabled,
    path,
  });

  ////////////////////////////////////////////////

  return (
    <>
      <AnimatedPath
        animatedProps={animatedProps}
        fill="transparent"
        stroke={isInactive ? inactiveColor || color : color}
        strokeWidth={strokeWidth}
        strokeOpacity={isInactive && !inactiveColor ? 0.5 : 1}
        {...props}
      />
    </>
  );
}
