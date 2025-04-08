import {SharedValue} from 'react-native-reanimated';

export type LineChartPoint = {
  x: number;
  y: number;
};

export type LineChartData = Array<LineChartPoint>;

export type LineChartDataProp =
  | LineChartData
  | {
      [key: string]: LineChartData;
    };

export type LineChartDomain = [number, number];
export type LineChartContextType = {
  currentX: SharedValue<number>;
  currentIndex: SharedValue<number>;
  currentAdjustedIndex: SharedValue<number>;
  mapPointsToFixedRange?: boolean | undefined;
  isActive: SharedValue<boolean>;
  domain: LineChartDomain;
  yDomain: YDomain;
  xLength: number;
  xDomain?: [number, number] | undefined;
};

export type YRangeProp = {
  min?: number;
  max?: number;
};

export type YDomain = {
  min: number;
  max: number;
};

export type FormatterFn<T> = ({
  value,
  formatted,
}: {
  value: T;
  formatted: string;
}) => string;
