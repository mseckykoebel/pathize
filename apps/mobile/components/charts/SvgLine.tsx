import React, {FC} from 'react';
import {View} from 'react-native';
import Svg, {Line} from 'react-native-svg';

type Props = {
  bottom: number;
  chartHeight: number;
  chartWidth: number;
  position?: 'absolute' | 'relative' | undefined;
};

const SvgLine: FC<Props> = ({
  bottom,
  chartHeight,
  chartWidth,
  position = 'absolute',
}) => (
  <View style={{position: position, bottom: bottom, left: 0}}>
    <Svg height={chartHeight} width={chartWidth} style={{alignSelf: 'center'}}>
      <Line
        stroke="#d4d4d8"
        strokeWidth={2}
        x1="0"
        y1={chartHeight}
        x2={chartWidth}
        y2={chartHeight}
      />
    </Svg>
  </View>
);

export default SvgLine;
