import React, {createContext, useMemo, ReactNode} from 'react';
import {
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import type {LineChartDataProp} from './types';
import {LineChartDataProvider} from './Data';

import type {LineChartContextType, YRangeProp} from './types';
import {getDomain, lineChartDataPropToArray} from './utils';

export const LineChartContext = createContext<LineChartContextType>({
  currentX: {value: -1} as SharedValue<number>,
  currentIndex: {value: -1} as SharedValue<number>,
  currentAdjustedIndex: {value: -1} as SharedValue<number>,
  mapPointsToFixedRange: false,
  domain: [0, 0],
  isActive: {value: false} as SharedValue<boolean>,
  yDomain: {
    min: 0,
    max: 0,
  },
  xDomain: undefined,
  xLength: 0,
});

type LineChartProviderProps = {
  children: ReactNode;
  data: LineChartDataProp;
  yRange?: YRangeProp;
  onCurrentIndexChange?: (x: number) => void;
  mapPointsToFixedRange?: boolean;
  xLength?: number;
  xDomain?: [number, number];
};

LineChartProvider.displayName = 'LineChartProvider';

export function LineChartProvider({
  children,
  data = [],
  yRange,
  mapPointsToFixedRange = false,
  onCurrentIndexChange,
  xLength,
  xDomain,
}: LineChartProviderProps) {
  const currentX = useSharedValue(-1);
  const currentIndex = useSharedValue(-1);
  const currentAdjustedIndex = useSharedValue(-1);
  const isActive = useSharedValue(false);

  const domain = useMemo(
    () => getDomain(Array.isArray(data) ? data : Object.values(data)[0]),
    [data],
  );

  const contextValue = useMemo<LineChartContextType>(() => {
    const values = lineChartDataPropToArray(data).map(({y}) => y);

    return {
      currentX,
      currentIndex,
      currentAdjustedIndex,
      mapPointsToFixedRange,
      isActive,
      domain,
      yDomain: {
        min: yRange?.min ?? Math.min(...values),
        max: yRange?.max ?? Math.max(...values),
      },
      xDomain,
      xLength:
        xLength ?? (Array.isArray(data) ? data : Object.values(data)[0]).length,
    };
  }, [
    currentIndex,
    currentX,
    currentAdjustedIndex,
    mapPointsToFixedRange,
    data,
    domain,
    isActive,
    yRange?.max,
    yRange?.min,
    xLength,
    xDomain,
  ]);

  useAnimatedReaction(
    () => currentIndex.value,
    (x, prevX) => {
      if (x !== -1 && x !== prevX && onCurrentIndexChange) {
        runOnJS(onCurrentIndexChange)(x);
      }
    },
    [currentIndex, onCurrentIndexChange],
  );

  return (
    <LineChartDataProvider data={data}>
      <LineChartContext.Provider value={contextValue}>
        {children}
      </LineChartContext.Provider>
    </LineChartDataProvider>
  );
}
