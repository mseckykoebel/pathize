import React, {createContext, ReactNode, useContext} from 'react';
import {StyleSheet} from 'react-native';
import {
  GestureEvent,
  LongPressGestureHandler,
  LongPressGestureHandlerEventPayload,
  LongPressGestureHandlerProps,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
} from 'react-native-reanimated';

import {LineChartDimensionsContext} from './Chart';
import {useLineChart} from './useLineChart';
import {scaleLinear} from 'd3-scale';
import {bisectCenter} from 'd3-array';
import type {Path} from 'react-native-redash';
import {mapTo1440} from './utils';

export type LineChartCursorProps = LongPressGestureHandlerProps & {
  children: ReactNode;
  type: 'line' | 'crosshair';
  snapToPoint?: boolean;
  nullCutoff?: number;
};

export const CursorContext = createContext({type: ''});

LineChartCursor.displayName = 'LineChartCursor';

const linearScalePositionAndIndex = ({
  timestamps,
  width,
  xToUpdate,
  currentIndex,
  xPosition,
  path,
  xDomain,
}: {
  timestamps: number[];
  width: number;
  xToUpdate: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  xPosition: number;
  path: Path | undefined;
  xDomain: [number, number] | undefined;
}) => {
  if (!path) {
    return;
  }

  const domainArray = xDomain ?? [0, timestamps.length];

  // Same scale as in /src/charts/line/utils/getPath.ts
  const scaleX = scaleLinear().domain(domainArray).range([0, width]);

  // Calculate a scaled timestamp for the current touch position
  const xRelative = scaleX.invert(xPosition);

  const closestIndex = bisectCenter(timestamps, xRelative);
  const pathDataDelta = Math.abs(path.curves.length - timestamps.length); // sometimes there is a difference between data length and number of path curves.
  const closestPathCurve = Math.max(
    Math.min(bisectCenter(timestamps, xRelative), path.curves.length + 1) -
      pathDataDelta,
    0,
  );

  const p0 = (closestIndex > 0 ? path.curves[closestPathCurve].to : path.move)
    .x;
  // Update values
  currentIndex.value = closestIndex;
  xToUpdate.value = p0;
};

export function LineChartCursor({
  children,
  snapToPoint,
  nullCutoff,
  type,
  ...props
}: LineChartCursorProps) {
  const {pathWidth: width, parsedPath} = useContext(LineChartDimensionsContext);
  const {
    currentX,
    currentIndex,
    currentAdjustedIndex,
    isActive,
    data,
    xDomain,
    yDomain,
  } = useLineChart();

  const onGestureEvent = useAnimatedGestureHandler<
    GestureEvent<LongPressGestureHandlerEventPayload>
  >({
    onActive: ({x}) => {
      if (parsedPath) {
        // x is somewhere along the width, and width is the width of the chart
        const boundedX = Math.max(0, x <= width ? x : width);
        const adjustedIndex = mapTo1440(x, width);
        isActive.value = true;
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const xValues = data.map(({x}, i) => (xDomain ? x : i)); // THESE ARE BIGGER THAN WIDTH
        const yValues = data.map(({y}, i) => (yDomain ? y : i));

        // on Web, we could drag the cursor to be negative, breaking it
        // so we clamp the index at 0 to fix it
        const minIndex = 0;
        const boundedIndex = Math.max(
          minIndex,
          Math.round(boundedX / width / (1 / (data.length - 1))),
        );

        // If the timestamp of the nearest point is less than 30, deactivate cursor and return
        if (nullCutoff && yValues[boundedIndex] <= nullCutoff) {
          console.log('yValue', yValues[boundedIndex]);
          console.log('nullCutoff', nullCutoff);
          isActive.value = false;
          return;
        }

        if (snapToPoint) {
          // We have to run this on the JS thread unfortunately as the scaleLinear functions won't work on UI thread
          runOnJS(linearScalePositionAndIndex)({
            timestamps: xValues,
            width,
            xToUpdate: currentX,
            currentIndex,
            xPosition: boundedX,
            path: parsedPath,
            xDomain,
          });
        } else if (!snapToPoint) {
          currentX.value = boundedX;
          currentIndex.value = boundedIndex;
          currentAdjustedIndex.value = adjustedIndex;
        }
      }
    },
    onEnd: () => {
      isActive.value = false;
      currentIndex.value = -1;
      currentAdjustedIndex.value = -1;
    },
  });

  return (
    <CursorContext.Provider value={{type}}>
      <LongPressGestureHandler
        minDurationMs={250}
        maxDist={999999}
        onGestureEvent={onGestureEvent}
        shouldCancelWhenOutside={false}
        {...props}>
        <Animated.View style={StyleSheet.absoluteFill}>
          {children}
        </Animated.View>
      </LongPressGestureHandler>
    </CursorContext.Provider>
  );
}
