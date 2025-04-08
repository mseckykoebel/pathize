import React, {useState, useEffect, ReactNode} from 'react';
import {Platform, View, ViewProps} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  runOnJS,
  AnimatedProps,
} from 'react-native-reanimated';

import {LineChartCursor, LineChartCursorProps} from './Cursor';
import {useLineChart} from './useLineChart';

type LineChartCursorCrosshairProps = Omit<
  LineChartCursorProps,
  'children' | 'type'
> & {
  children?: ReactNode;
  color?: string;
  size?: number;
  outerSize?: number;
  crosshairWrapperProps?: AnimatedProps<ViewProps>;
  crosshairProps?: ViewProps;
  crosshairOuterProps?: ViewProps;
};

LineChartCursorCrosshair.displayName = 'LineChartCursorCrosshair';

// define a helper function outside the component
const logValue = (x: number, y: number) => {
  console.log('currentX:', x, 'currentY:', y);
};

export function LineChartCursorCrosshair({
  children,
  color = 'black',
  size = 8,
  outerSize = 32,
  crosshairWrapperProps = {},
  crosshairProps = {},
  crosshairOuterProps = {},
  ...props
}: LineChartCursorCrosshairProps) {
  const {currentX, currentY, isActive} = useLineChart();

  // It seems that enabling spring animation on initial render on Android causes a crash.
  const [enableSpringAnimation, setEnableSpringAnimation] = useState(
    Platform.OS === 'ios',
  );
  useEffect(() => {
    setTimeout(() => {
      setEnableSpringAnimation(true);
    }, 100);
  }, []);

  const animatedCursorStyle = useAnimatedStyle(() => {
    // log values using runOnJS
    runOnJS(logValue)(currentX.value, currentY.value);

    return {
      transform: [
        {translateX: currentX.value - outerSize / 2},
        {translateY: currentY.value - outerSize / 2},
        {
          scale: enableSpringAnimation
            ? withSpring(isActive.value ? 1 : 0, {
                damping: 10,
              })
            : 0,
        },
      ],
    };
  }, [currentX, currentY, enableSpringAnimation, isActive, outerSize]);

  return (
    <LineChartCursor type="crosshair" minDurationMs={250} {...props}>
      <Animated.View
        {...crosshairWrapperProps}
        style={[
          {
            width: outerSize,
            height: outerSize,
            alignItems: 'center',
            justifyContent: 'center',
          },
          animatedCursorStyle,
          crosshairWrapperProps.style,
        ]}>
        <View
          {...crosshairOuterProps}
          style={[
            {
              backgroundColor: color,
              width: outerSize,
              height: outerSize,
              borderRadius: outerSize,
              opacity: 0.1,
              position: 'absolute',
            },
            crosshairOuterProps.style,
          ]}
        />
        <View
          {...crosshairProps}
          style={[
            {
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: size,
            },
            crosshairProps.style,
          ]}
        />
      </Animated.View>
      {children}
    </LineChartCursor>
  );
}
