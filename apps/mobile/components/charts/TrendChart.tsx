import React, {memo} from 'react';
import {View, Text, Platform} from 'react-native';
import Svg, {Circle, Line, Rect} from 'react-native-svg';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {trigger} from 'react-native-haptic-feedback';
import {scaleLinear} from 'd3-scale';
import {curveCatmullRom} from 'd3-shape';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {Crash} from '@pathize/db';
import {LineChartProvider, LineChart} from '../chart';
import {useTodayDataContext, useTrendsContext} from '../../contexts';
import {
  getCircular,
  getHeartRateOverlayColorByScore,
  getIcon,
} from '../../utils';
import {InputText} from '../elements';
import {FadeInView} from '../layouts';
import SvgLine from './SvgLine';
import Label from './Label';

type Point = {
  x: number;
  y: number;
};

interface TrendsChartProps {
  chartName: string;
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  minValue: number;
  dataPoints: Point[];
  crashDataPoints: Crash[] | null;
  nullCutoff: number;
  type: 'trend' | 'symptom';
  yAxisModifier?: (n: number) => string;
  yAxisModifierNoUnit?: (n: number) => string;
  finishX: number;
}

export const TrendChart: React.FC<TrendsChartProps> = memo(
  ({
    chartName,
    maxValue,
    minValue,
    chartWidth,
    chartHeight,
    dataPoints,
    crashDataPoints,
    nullCutoff,
    type,
    yAxisModifier,
    yAxisModifierNoUnit,
    finishX,
  }) => {
    const {actuallyToday} = useTodayDataContext();
    const {selectedFilterItems} = useTrendsContext();
    const FINISH_X_OVERLAY = 24 * 60 * finishX;

    const scaleX = scaleLinear().domain([0, finishX]).range([0, chartWidth]);
    const scaleY = scaleLinear()
      .domain([minValue ?? 0, maxValue])
      .range([chartHeight - 4, 4]);
    const scaleXOverlay = scaleLinear()
      .domain([0, FINISH_X_OVERLAY])
      .range([0, chartWidth]);

    // Note: to maintain UI consistency, crashes that take place on actuallyToday (the current date) are not shown
    const crashesWithTotalTime: Crash[] =
      crashDataPoints?.filter(
        crash => crash.crashTotalTime && crash.crashTotalTime > 0,
      ) ?? [];
    const crashesWithoutTotalTime: Crash[] =
      crashDataPoints?.filter(
        crash => !crash.crashTotalTime || crash.crashTotalTime === 0,
      ) ?? [];

    const setAndInvokeHapticFeedback = () => {
      trigger('impactLight');
    };

    return (
      <LineChartProvider
        data={dataPoints}
        yRange={{
          min: minValue,
          max: maxValue,
        }}>
        <View style={tw`flex flex-col`}>
          {/* TOP AREA IS THE CHART NAME */}
          <View style={tw`flex flex-row justify-between items-center mb-4`}>
            <InputText text={chartName} style={[tw``, getCircular('Book')]} />
            {/* POSITION YVALUE TEXT */}
            <View style={tw`flex flex-col items-end`}>
              <LineChart.YValueText
                lowerBound={minValue}
                formatFn={yAxisModifier}
                style={[
                  tw`text-sm font-medium text-slate-900 ${
                    Platform.OS === 'android' ? '-mb-7' : ''
                  }`,
                  getCircular('Book'),
                ]}
              />
              <LineChart.DatetimeText
                style={[
                  tw`text-xs font-medium text-neutral-500`,
                  getCircular('Book'),
                ]}
                locale="en-US"
                options={{
                  dateStyle: 'long',
                }}
              />
            </View>
          </View>
          {/* CHART */}
          <View>
            {/* LINE ON THE BOTTOM */}
            <View style={{position: 'absolute', bottom: 0, left: 0}}>
              <Svg
                height={chartHeight}
                width={chartWidth}
                style={{alignSelf: 'center'}}>
                {/* PUT LINE ON BOTTOM */}
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
            {type === 'trend' ? (
              <>
                {/* LINE 1/3 OF THE WAY FROM THE BOTTOM */}
                <SvgLine
                  bottom={chartHeight / 3}
                  chartHeight={chartHeight}
                  chartWidth={chartWidth}
                />
                {/* LINE 2/3 OF THE WAY FROM THE BOTTOM */}
                <SvgLine
                  bottom={(chartHeight / 3) * 2}
                  chartHeight={chartHeight}
                  chartWidth={chartWidth}
                />

                {/* LABEL FOR 1/3 OF THE WAY UP */}
                <Label
                  bottom={chartHeight / 3}
                  width={500}
                  text={
                    yAxisModifierNoUnit
                      ? yAxisModifierNoUnit(
                          minValue + (maxValue - minValue) * 0.333,
                        )
                      : minValue + (maxValue - minValue) * 0.333
                  }
                />
                {/* LABEL FOR 2/3rds OF THE WAY UP */}
                <Label
                  bottom={(chartHeight / 3) * 2}
                  width={500}
                  text={
                    yAxisModifierNoUnit
                      ? yAxisModifierNoUnit(
                          minValue + (maxValue - minValue) * 0.666,
                        )
                      : minValue + (maxValue - minValue) * 0.666
                  }
                />
              </>
            ) : (
              <>
                {/* LINE 1/5TH FROM THE BOTTOM */}
                <SvgLine
                  bottom={chartHeight / 5}
                  chartHeight={chartHeight}
                  chartWidth={chartWidth}
                />
                {/* LINE 2/5TH FROM THE BOTTOM */}
                <SvgLine
                  bottom={(chartHeight / 5) * 2}
                  chartHeight={chartHeight}
                  chartWidth={chartWidth}
                />
                {/* LINE 3/5TH FROM THE BOTTOM */}
                <SvgLine
                  bottom={(chartHeight / 5) * 3}
                  chartHeight={chartHeight}
                  chartWidth={chartWidth}
                />
                {/* LINE 4/5TH FROM THE BOTTOM */}
                <SvgLine
                  bottom={(chartHeight / 5) * 4}
                  chartHeight={chartHeight}
                  chartWidth={chartWidth}
                />

                {/* LABEL FOR 1/5TH OF THE WAY UP */}
                <Label
                  bottom={chartHeight / 5}
                  width={500}
                  text={
                    yAxisModifierNoUnit
                      ? yAxisModifierNoUnit(
                          minValue + (maxValue - minValue) * 0.2,
                        )
                      : minValue + (maxValue - minValue) * 0.2
                  }
                />
                {/* LABEL FOR 2/5TH OF THE WAY UP */}
                <Label
                  bottom={(chartHeight / 5) * 2}
                  width={500}
                  text={
                    yAxisModifierNoUnit
                      ? yAxisModifierNoUnit(
                          minValue + (maxValue - minValue) * 0.4,
                        )
                      : minValue + (maxValue - minValue) * 0.4
                  }
                />
                {/* LABEL FOR 3/5TH OF THE WAY UP */}
                <Label
                  bottom={(chartHeight / 5) * 3}
                  width={500}
                  text={
                    yAxisModifierNoUnit
                      ? yAxisModifierNoUnit(
                          minValue + (maxValue - minValue) * 0.6,
                        )
                      : minValue + (maxValue - minValue) * 0.6
                  }
                />
                {/* LABEL FOR 4/5TH OF THE WAY UP */}
                <Label
                  bottom={(chartHeight / 5) * 4}
                  width={500}
                  text={
                    yAxisModifierNoUnit
                      ? yAxisModifierNoUnit(
                          minValue + (maxValue - minValue) * 0.8,
                        )
                      : minValue + (maxValue - minValue) * 0.8
                  }
                />
              </>
            )}
            {/* LINE ON THE TOP */}
            <View style={{position: 'absolute', top: 0, left: 0}}>
              <Svg
                height={chartHeight}
                width={chartWidth}
                style={{alignSelf: 'center'}}>
                {/* PUT LINE ON BOTTOM */}
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
            <Label
              bottom={0}
              width={140}
              text={
                yAxisModifierNoUnit ? yAxisModifierNoUnit(minValue) : minValue
              }
            />
            {/* MAX VALUE LABEL */}
            <Label
              bottom={chartHeight}
              width={140}
              text={
                yAxisModifierNoUnit ? yAxisModifierNoUnit(maxValue) : maxValue
              }
              top={-18}
            />
            {/* CRASH LINE OVERLAY */}
            <View
              style={{
                transform: [
                  {
                    scaleX: -1,
                  },
                  {
                    scaleY: -1,
                  },
                  // align on bottom of the graph
                  {
                    translateY: -chartHeight,
                  },
                ],
              }}>
              {selectedFilterItems.some(item => item.name === 'Crashes/PEM') ? (
                <>
                  {/* CRASHES WITHOUT TOTAL TIME SPECIFIED */}
                  <FadeInView duration={200}>
                    {crashesWithoutTotalTime.map(
                      (crash: Crash, index: number) => {
                        const totalMinutesFromStart =
                          dayjs(actuallyToday).diff(
                            dayjs(crash.time),
                            'minute',
                          ) - 70;
                        return (
                          <View
                            key={index}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: scaleXOverlay(totalMinutesFromStart),
                              transform: [{rotateX: '-180deg'}],
                            }}>
                            {/* CAR */}
                            <View
                              style={{
                                position: 'absolute',
                                bottom: chartHeight - 15,
                                left: -5,
                              }}>
                              <FontAwesomeIcon
                                icon={getIcon('Crash')}
                                size={12}
                                color={getHeartRateOverlayColorByScore(
                                  crash.severity ?? 0,
                                  1,
                                )}
                                style={{alignSelf: 'center'}}
                              />
                            </View>
                            {/* LINE */}
                            <Svg
                              height={chartHeight - 20}
                              width={chartWidth}
                              style={{alignSelf: 'center'}}>
                              <Line
                                stroke={getHeartRateOverlayColorByScore(
                                  crash.severity ?? 0,
                                  0.5,
                                )}
                                strokeWidth={2}
                                x1={0}
                                y1="0"
                                x2={0}
                                y2={chartHeight}
                              />
                            </Svg>
                          </View>
                        );
                      },
                    )}
                  </FadeInView>
                  <FadeInView duration={200}>
                    {crashesWithTotalTime.map((crash: Crash, index: number) => {
                      const totalMinutesFromStart =
                        dayjs(actuallyToday).diff(dayjs(crash.time), 'minute') -
                        (crash.crashTotalTime! > 70 ? 70 : 0);
                      const totalMinutesFromStartPlusTotalTime =
                        totalMinutesFromStart + crash.crashTotalTime!;
                      const totalMinutesFromStartPlusTotalTimeMulligan =
                        totalMinutesFromStart - crash.crashTotalTime!;
                      const midPoint =
                        (scaleXOverlay(totalMinutesFromStartPlusTotalTime) -
                          scaleXOverlay(totalMinutesFromStart)) /
                        2;

                      return (
                        <View
                          key={index}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: scaleXOverlay(
                              totalMinutesFromStartPlusTotalTimeMulligan,
                            ),
                            transform: [{rotateX: '-180deg'}],
                          }}>
                          {/* CAR */}
                          <View
                            style={{
                              position: 'absolute',
                              bottom: chartHeight - 15,
                              left: midPoint - 5,
                            }}>
                            <FontAwesomeIcon
                              icon={getIcon('Crash')}
                              size={12}
                              color={getHeartRateOverlayColorByScore(
                                crash.severity ?? 0,
                                1,
                              )}
                              style={{alignSelf: 'center'}}
                            />
                          </View>
                          {/* RECTANGLE */}
                          <Svg
                            height={chartHeight - 20}
                            width={
                              scaleXOverlay(
                                totalMinutesFromStartPlusTotalTime,
                              ) - scaleXOverlay(totalMinutesFromStart)
                            }
                            style={{alignSelf: 'center'}}>
                            <Rect
                              x="0"
                              y="0"
                              width={scaleXOverlay(
                                totalMinutesFromStartPlusTotalTime,
                              )}
                              height={chartHeight}
                              fill={getHeartRateOverlayColorByScore(
                                crash.severity ?? 0,
                                0.1,
                              )}
                            />
                          </Svg>
                        </View>
                      );
                    })}
                  </FadeInView>
                  {/* CRASHES WITH TOTAL TIME SPECIFIED */}
                </>
              ) : null}
            </View>
            <LineChart
              yGutter={4}
              shape={curveCatmullRom}
              width={chartWidth}
              height={chartHeight}
              nullCutoff={nullCutoff}>
              <LineChart.Path
                color={type === 'trend' ? '#08816E' : '#95DAB2'}
                width={2}
              />
              {/* LOOP THROUGH ALL OF THE DATA POINTS, AND DRAW DOTS AS CIRCLES WITH RN SVGAT SCALEX, SCALEY */}
              <FadeInView duration={500}>
                {dataPoints.map((point, index) => {
                  if (point.y <= nullCutoff) return;
                  const cx = scaleX(point.x);
                  const cy = scaleY(point.y);
                  return (
                    <View
                      key={index}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        // hide the point if it is the first or last element of the array
                        opacity:
                          index === 0 || index === dataPoints.length - 1
                            ? 0
                            : 100,
                      }}>
                      <Svg height={chartHeight} width={chartWidth}>
                        <Circle
                          cx={cx}
                          cy={cy}
                          r={3}
                          stroke={type === 'trend' ? '#08816E' : '#95DAB2'}
                          strokeWidth={1}
                          fill={type === 'trend' ? '#08816E' : '#95DAB2'}
                        />
                      </Svg>
                    </View>
                  );
                })}
              </FadeInView>
              <LineChart.CursorLine
                color="#08816E"
                onActivated={() => setAndInvokeHapticFeedback()}
                onEnded={() => setAndInvokeHapticFeedback()}
              />
            </LineChart>
          </View>
          <View style={tw`${finishX < 20 ? 'ml-1' : ''} mt-1.5`}>
            {/* STARTING FROM 14 DAYS AGO, LOAD THE PAST MANY DAYS OF THE WEEK AS GRAPH SUB-HEADERS */}
            {/* Lots of hacks here to get positioning of the x-axis labels right */}
            {Array.from(Array(finishX + 1).keys()).map((index, _, array) => {
              // Skip rendering for the first and last index
              if (index === 0 || index === array.length - 1) return null;

              const sliceVar = finishX < 20 ? 2 : 1;
              const dayOfWeek = dayjs(actuallyToday)
                .subtract(finishX - index, 'days')
                .format('dd')
                .slice(0, sliceVar);
              const adjustment =
                (dayOfWeek === 'T' || dayOfWeek === 'F') && finishX > 20
                  ? 3
                  : 5;
              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    left: scaleX(index) - dayOfWeek.length * adjustment,
                  }}>
                  <Text
                    style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
                    {dayOfWeek}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </LineChartProvider>
    );
  },
);

TrendChart.displayName = 'TrendChart';
