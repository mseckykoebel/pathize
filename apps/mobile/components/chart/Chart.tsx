import React, {useMemo, useContext, createContext, ReactNode} from 'react';
import {Dimensions, StyleSheet, View, ViewProps} from 'react-native';
import {Path, parse} from 'react-native-redash';
import * as d3Shape from 'd3-shape';

import {LineChartContext} from './Context';
import {LineChartIdProvider, useLineChartData} from './Data';
import {getPath, getArea} from './utils';

export const LineChartDimensionsContext = createContext({
  width: 0,
  height: 0,
  pointWidth: 0,
  parsedPath: {} as Path,
  path: '',
  area: '',
  shape: d3Shape.curveBumpX,
  nullCutoff: 0,
  gutter: 0,
  pathWidth: 0,
});

type LineChartProps = ViewProps & {
  children: ReactNode;
  yGutter?: number;
  width?: number;
  height?: number;
  shape?: undefined | d3Shape.CurveFactory;
  nullCutoff?: number;
  /**
   * If your `LineChart.Provider` uses a dictionary with multiple IDs for multiple paths, then this field is required.
   */
  id?: string;
  absolute?: boolean;
};

const {width: screenWidth} = Dimensions.get('window');

LineChart.displayName = 'LineChart';

export function LineChart({
  children,
  yGutter = 16,
  width = screenWidth,
  height = screenWidth,
  id,
  shape = d3Shape.curveBumpX,
  nullCutoff = -1,
  absolute,
  ...props
}: LineChartProps) {
  const {yDomain, xLength, xDomain} = useContext(LineChartContext);
  const {data} = useLineChartData({
    id,
  });

  const pathWidth = useMemo(() => {
    let allowedWidth = width;
    if (xLength > data.length) {
      allowedWidth = (width * data.length) / xLength;
    }
    return allowedWidth;
  }, [data.length, width, xLength]);

  const path = useMemo(() => {
    if (data && data.length > 0) {
      return getPath({
        data,
        width: pathWidth,
        height,
        gutter: yGutter,
        shape,
        nullCutoff,
        yDomain,
        xDomain,
      });
    }
    return '';
  }, [data, pathWidth, height, yGutter, shape, yDomain, xDomain, nullCutoff]);

  const area = useMemo(() => {
    if (data && data.length > 0) {
      return getArea({
        data,
        width: pathWidth,
        height,
        gutter: yGutter,
        shape,
        yDomain,
      });
    }
    return '';
  }, [data, pathWidth, height, yGutter, shape, yDomain]);

  const dataLength = data.length;
  const parsedPath = useMemo(() => parse(path), [path]);
  const pointWidth = useMemo(
    () => width / (dataLength - 1),
    [dataLength, width],
  );

  const contextValue = useMemo(
    () => ({
      gutter: yGutter,
      parsedPath,
      pointWidth,
      area,
      path,
      width,
      height,
      pathWidth,
      shape,
      nullCutoff,
    }),
    [
      yGutter,
      parsedPath,
      pointWidth,
      area,
      path,
      width,
      height,
      pathWidth,
      shape,
      nullCutoff,
    ],
  );

  return (
    <LineChartIdProvider id={id}>
      <LineChartDimensionsContext.Provider value={contextValue}>
        <View {...props} style={[absolute && styles.absolute, props.style]}>
          {children}
        </View>
      </LineChartDimensionsContext.Provider>
    </LineChartIdProvider>
  );
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
  },
});
