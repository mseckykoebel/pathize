import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {Line, Svg} from 'react-native-svg';
import {scaleLinear} from 'd3-scale';
import {curveCatmullRom} from 'd3-shape';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {FadeIn} from '@pathize/mobile-ui';
import {ActivityRecord} from '@pathize/db';
import {processHeartRateData} from '@pathize/lib';
import {useLimitContext, usePathizeSelectedDayContext} from '../../../contexts';
import {formatHeartRateDataSamples} from '../../../components';
import {getCircular, timeConvert} from '../../../utils';
import {LineChart} from '../../../components';

type Props = {
  activity: ActivityRecord;
};

export const ActivityStatsHeartRateChart: React.FC<Props> = ({activity}) => {
  const {
    state: {metadata},
  } = usePathizeSelectedDayContext();
  const {limit} = useLimitContext();
  const [chartWidth, setChartWidth] = useState(0);

  if (!metadata || !metadata.heartRateSamples || !activity.activityTotalTime) {
    return null;
  }

  const activityStartTime = dayjs(activity.time);
  const activityEndTime = activityStartTime.add(
    activity.activityTotalTime,
    'minute',
  );

  const relevantHeartRateDataSamples = metadata.heartRateSamples.filter(
    (sample: HeartRateDataSample) => {
      const sampleTime = dayjs(sample.timestamp);
      return (
        sampleTime.isAfter(activityStartTime) &&
        sampleTime.isBefore(activityEndTime)
      );
    },
  );

  if (relevantHeartRateDataSamples.length === 0) return null;

  const processedSamples = processHeartRateData(relevantHeartRateDataSamples);

  const minHr = 40;
  const maxHr = Math.max(
    processedSamples.length > 0
      ? Math.max(...processedSamples.map(item => item.bpm)) + 6
      : 85 + 6,
    85 + 6,
  );

  const start = activityStartTime.diff(
    activityStartTime.startOf('day'),
    'minute',
  );
  const end = activityEndTime.diff(activityStartTime.startOf('day'), 'minute');
  const chartHeight = 150;
  const scaleY = scaleLinear().domain([minHr, maxHr]).range([0, chartHeight]);

  const startMinutes = 0;
  const endMinutes = activity.activityTotalTime;
  const oneQuarterBetweenStartAndEnd = (endMinutes - startMinutes) / 4;
  const twoQuartersBetweenStartAndEnd = oneQuarterBetweenStartAndEnd * 2;
  const threeQuartersBetweenStartAndEnd = oneQuarterBetweenStartAndEnd * 3;

  return (
    <View style={[tw`flex-1 mt-6`]}>
      <LineChart.Provider
        data={formatHeartRateDataSamples(processedSamples)}
        mapPointsToFixedRange={true}
        xDomain={[start, end]}
        yRange={{
          min: minHr,
          max: maxHr,
        }}>
        <View
          onLayout={event => {
            const {width} = event.nativeEvent.layout;
            setChartWidth(width);
          }}
          style={[
            {
              height: chartHeight,
            },
          ]}>
          {/* LIMIT LINE */}
          {limit && maxHr > limit ? (
            <View style={{position: 'absolute', bottom: 0}}>
              {limit && (
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
              )}
            </View>
          ) : null}
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
                strokeWidth={1}
                x1="0"
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
              />
            </Svg>
          </View>
          {/* LINE 2/3RDS OF THE WAY FROM THE BOTTOM */}
          <View
            style={{
              position: 'absolute',
              bottom: (chartHeight * 2) / 3,
              left: 0,
              pointerEvents: 'none',
            }}>
            <Svg
              height={chartHeight}
              width={chartWidth}
              style={{alignSelf: 'center'}}>
              <Line
                stroke="#d4d4d8"
                strokeWidth={1}
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
              bottom: chartHeight,
              left: 0,
              pointerEvents: 'none',
            }}>
            <Svg
              height={chartHeight}
              width={chartWidth}
              style={{alignSelf: 'center'}}>
              <Line
                stroke="#d4d4d8"
                strokeWidth={1}
                x1="0"
                y1={chartHeight}
                x2={chartWidth}
                y2={chartHeight}
              />
            </Svg>
          </View>
          {/* MIN VALUE LABEL */}
          <View style={{position: 'absolute', left: 4, bottom: 0}}>
            <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
              {minHr}
            </Text>
          </View>
          {/* VALUE 1/3RD OF THE WAY UP */}
          <View
            style={{position: 'absolute', left: 4, bottom: chartHeight / 3}}>
            <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
              {Math.trunc(minHr + (maxHr - minHr) / 3)}
            </Text>
          </View>
          {/* VALUE 2/3RDS OF THE WAY UP */}
          <View
            style={{
              position: 'absolute',
              left: 4,
              bottom: (chartHeight * 2) / 3,
            }}>
            <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
              {Math.trunc(minHr + ((maxHr - minHr) * 2) / 3)}
            </Text>
          </View>
          {/* MAX VALUE ON THE TOP */}
          <View style={{position: 'absolute', left: 4, bottom: chartHeight}}>
            <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
              {maxHr}
            </Text>
          </View>
          {/* LIMIT LINE LABEL */}
          {limit && maxHr > limit ? (
            <View
              style={{
                position: 'absolute',
                right: 4,
                bottom: scaleY(limit) + 4,
              }}>
              <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
                Limit: {limit}
              </Text>
            </View>
          ) : null}
          {/* DATA ITSELF */}
          <FadeIn duration={250}>
            <LineChart
              shape={curveCatmullRom}
              width={chartWidth}
              height={chartHeight}
              nullCutoff={0}>
              <LineChart.Path
                animateOnMount={undefined}
                color="#08816E"
                width={2}
              />
            </LineChart>
          </FadeIn>
        </View>
        {/* BOTTOM LABEL AREA */}
        <View style={tw`flex-row justify-between mt-1.5 mr-1 ml-1`}>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {timeConvert(startMinutes * 60)}
          </Text>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {timeConvert(oneQuarterBetweenStartAndEnd * 60)}
          </Text>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {timeConvert(twoQuartersBetweenStartAndEnd * 60)}
          </Text>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {timeConvert(threeQuartersBetweenStartAndEnd * 60)}
          </Text>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            {timeConvert(endMinutes * 60)}
          </Text>
        </View>
      </LineChart.Provider>
    </View>
  );
};
