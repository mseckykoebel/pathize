import React, {useEffect, useState} from 'react';
import {View, Text} from 'react-native';
import Svg, {Line, G} from 'react-native-svg';
import {scaleLinear} from 'd3-scale';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import tw from 'twrnc';

import {formatHeartRateDataSamples} from '../../../components/charts';
import {getCircular} from '../../../utils';
import {getBarColor} from '../utils';

const START_X = 0;
const FINISH_X = 24 * 60;

export const PacingBarChart = ({
  chartWidth,
  chartHeight,
  pointsToday,
  minHr,
  maxHr,
  limit,
}: {
  chartWidth: number;
  chartHeight: number;
  pointsToday: HeartRateDataSample[] | null;
  lastUpdated: string | null;
  minHr: number;
  maxHr: number;
  limit: number;
}) => {
  const [todayData, setTodayData] = useState<{x: number; y: number}[]>([]);

  const scaleX = scaleLinear()
    .domain([START_X, FINISH_X])
    .range([0, chartWidth]);
  const scaleY = scaleLinear().domain([minHr, maxHr]).range([0, chartHeight]);

  useEffect(() => {
    if (!pointsToday) {
      setTodayData([]);
      return;
    }
    const formattedSamples = formatHeartRateDataSamples(pointsToday);
    setTodayData(formattedSamples);
  }, [pointsToday, limit]);

  if (chartWidth === 0) return null;

  return (
    <>
      <View
        style={{
          height: chartHeight,
        }}>
        {/* LIMIT GRADIENT */}
        <View style={{position: 'absolute', bottom: 0}}>
          {/* LIMIT LINE */}
          <Svg
            height={1}
            width={chartWidth}
            style={{position: 'absolute', bottom: scaleY(limit)}}>
            <Line
              stroke="gray"
              strokeDasharray="3, 3"
              strokeWidth={1}
              x1="0"
              y1="0"
              x2={chartWidth}
              y2="0"
            />
          </Svg>
        </View>
        {/* LINE ON THE BOTTOM */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={chartHeight}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
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
        {/* LINE 1/3RD OF THE WAY FROM THE BOTTOM */}
        <View
          style={{
            position: 'absolute',
            bottom: chartHeight / 3,
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={chartHeight}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
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
        {/* LINE 2/3RDS OF THE WAY TO THE BOTTOM */}
        <View
          style={{
            position: 'absolute',
            bottom: (chartHeight / 3) * 2,
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={chartHeight}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
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
        {/* LINE ON THE TOP */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={chartHeight}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
            <Line
              stroke="#d4d4d8"
              strokeWidth={2}
              x1="0"
              y1="0"
              x2={chartWidth}
              y2="0"
            />
          </Svg>
        </View>
        {/* MIN VALUE LABEL */}
        <View style={{position: 'absolute', left: -24, bottom: 0}}>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {minHr}
          </Text>
        </View>
        {/* VALUE 1/3RD OF THE WAY UP */}
        <View
          style={{position: 'absolute', left: -24, bottom: chartHeight / 3}}>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {Math.trunc(minHr + (maxHr - minHr) / 3)}
          </Text>
        </View>
        {/* VALUE 2/3RDS OF THE WAY UP */}
        <View
          style={{
            position: 'absolute',
            left: -24,
            bottom: (chartHeight * 2) / 3,
          }}>
          <Text style={tw`text-xs text-neutral-500`}>
            {Math.trunc(minHr + ((maxHr - minHr) * 2) / 3)}
          </Text>
        </View>
        {/* MAX VALUE ON THE TOP */}
        <View style={{position: 'absolute', left: -24, bottom: chartHeight}}>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {maxHr}
          </Text>
        </View>
        {/* LIMIT LINE LABEl */}
        <View
          style={{
            position: 'absolute',
            bottom: scaleY(limit),
          }}>
          <View style={{position: 'absolute', right: 4, bottom: 4}}>
            <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
              Limit: {limit}
            </Text>
          </View>
          <Svg height={1} width={chartWidth} style={{alignSelf: 'center'}}>
            <Line
              stroke="gray"
              strokeDasharray="3, 3"
              strokeWidth={1}
              x1="0"
              y1="0"
              x2={chartWidth}
              y2={1}
            />
          </Svg>
        </View>
        {/* THE ACTUAL GRAPH */}
        <Svg
          style={{
            alignSelf: 'center',
            transform: [{scaleY: -1}],
          }}
          width={chartWidth}
          height={chartHeight}
          viewBox={`${0} ${2} ${chartWidth} ${chartHeight}`}>
          {todayData && (
            <G>
              {todayData.map((item, index) => {
                if (item.y !== undefined) {
                  return (
                    <Line
                      key={index}
                      x1={scaleX(item.x)}
                      y1={scaleY(item.y)}
                      x2={scaleX(item.x)}
                      y2={scaleY(minHr)}
                      stroke={getBarColor(item.y, limit)}
                      strokeWidth={1}
                    />
                  );
                }
              })}
            </G>
          )}
        </Svg>
      </View>
      <View style={tw`flex-row justify-between mt-1.5 mr-1 ml-1`}>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-16px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            12am
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-16px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            4am
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-16px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            8am
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-18px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            12pm
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-14px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            4pm
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-12px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            8pm
          </Text>
          <Text
            style={[
              tw`text-xs absolute right-[-16px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            12am
          </Text>
        </View>
      </View>
      {/* KEY FOR CHART */}
      <View style={[tw`flex flex-row items-center justify-center mt-6`]}>
        <View style={[tw`flex flex-row items-center`]}>
          <View
            style={[tw`w-3 h-3 rounded-sm ml-1`, {backgroundColor: '#08816E'}]}
          />

          <View
            style={[tw`w-3 h-3 rounded-sm ml-1`, {backgroundColor: '#DC2626'}]}
          />
          <Text
            style={[
              tw`text-xs text-gray-500 ml-2`,
              getCircular('Book'),
              {transform: [{translateY: -1}]},
            ]}>
            Below Limit, Above Limit
          </Text>
        </View>
      </View>
    </>
  );
};
