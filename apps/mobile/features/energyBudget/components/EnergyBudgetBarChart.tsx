import React, {useEffect, useRef, useState} from 'react';
import {ScrollView, View, Text, Dimensions} from 'react-native';
import Svg, {Line, G, Text as SVGText, Rect, Circle} from 'react-native-svg';
import {scaleLinear} from 'd3-scale';
import tw from 'twrnc';

import {PathizeDataMap, useTodayDataContext} from '../../../contexts';
import {getCircular, timeConvert} from '../../../utils';
import dayjs from 'dayjs';

const CHART_HEIGHT = Dimensions.get('window').height / 5;
const FINISH_X = 8; // 30 points with a space between

type ExertionDay = {
  id: string;
  day: string;
  minutes: number;
};

/**
 * @description convert Pathize data into data usable by the chart, where maxMinutes is the largest value of the last 30 days
 */
function convertToExertionDay(data: PathizeDataMap): {
  exertionDays: ExertionDay[];
  maxMinutes: number; // used for the height of the chart
} {
  const exertionDays: ExertionDay[] = [];
  let id = 0;
  let maxMinutes = 0;
  for (const [key, value] of Object.entries(data)) {
    if (value && value.metadata) {
      exertionDays.push({
        id: String(id),
        day: key,
        minutes: value.metadata.timeAboveLimit / 60,
      });

      if (value.metadata.timeAboveLimit / 60 > maxMinutes) {
        maxMinutes = value.metadata.timeAboveLimit / 60;
      }
    }

    id++;
  }

  // sort exertion days from oldest to newest
  exertionDays.sort((a, b) => {
    return dayjs(a.day).isAfter(dayjs(b.day)) ? -1 : 1;
  });

  return {
    exertionDays,
    maxMinutes,
  };
}

/**
 * @description get the color of the bar based on the minutes
 */
function getBarColor(minutes: number, guidanceMax: number): string {
  const progressWidth = (minutes / guidanceMax) * 100;

  if (progressWidth < 20) {
    return '#86efac';
  } else if (progressWidth < 40) {
    return '#22c55e';
  } else if (progressWidth < 60) {
    return '#a3e635';
  } else if (progressWidth < 80) {
    return '#eab308';
  } else {
    return '#f87171';
  }
}

type Props = {
  data: PathizeDataMap;
  historicalTimeAboveLimit: number;
};

export const EnergyBudgetBarChart: React.FC<Props> = ({
  data,
  historicalTimeAboveLimit,
}) => {
  const {today} = useTodayDataContext();
  const [chartWidth, setChartWidth] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // note - we ensure data is defined when we render this component from the parent
  const {exertionDays, maxMinutes} = convertToExertionDay(data);
  const paddedMaxMinutes = maxMinutes + maxMinutes * 0.2; // add buffer to the top of the max

  const spaceWidth = 15; // spacer between bars
  const barWidth = chartWidth / FINISH_X;
  const barPlusSpaceWidth = barWidth + spaceWidth;
  let totalWidth = barPlusSpaceWidth * exertionDays.length;
  totalWidth = Math.max(totalWidth, chartWidth); // ensure the total width is at least as wide as the ScrollView

  const scaleY = scaleLinear()
    .domain([0, Math.max(paddedMaxMinutes, historicalTimeAboveLimit! / 60)])
    .range([0, CHART_HEIGHT]);

  // scroll to the end on mount
  useEffect(() => {
    if (scrollViewRef.current && exertionDays.length > 0) {
      const todayIndex = exertionDays.findIndex(day =>
        dayjs(day.day).isSame(dayjs(today), 'day'),
      );
      const position =
        todayIndex >= 0
          ? (exertionDays.length - todayIndex - 1) * barPlusSpaceWidth
          : 0;
      const offset = 250;
      scrollViewRef.current.scrollTo({x: position - offset, animated: false});
    }
  }, [exertionDays, today, barPlusSpaceWidth]);

  return (
    <>
      <View style={[tw`ml-10`, {position: 'relative', height: CHART_HEIGHT}]}>
        {/* GUIDANCE LINE */}
        <Svg
          height={1}
          width={chartWidth}
          style={{
            position: 'absolute',
            bottom: scaleY(historicalTimeAboveLimit / 60),
            zIndex: 10,
          }}>
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
        {/* BOTTOM LINE */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={CHART_HEIGHT}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
            <Line
              stroke="#d4d4d8"
              strokeWidth={2}
              x1="0"
              y1={CHART_HEIGHT}
              x2={chartWidth}
              y2={CHART_HEIGHT}
            />
          </Svg>
        </View>
        {/* 1/3rd OF THE WAY FROM THE BOTTOM */}
        <View
          style={{
            position: 'absolute',
            bottom: scaleY(paddedMaxMinutes / 3),
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={CHART_HEIGHT}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
            <Line
              stroke="#d4d4d8"
              strokeWidth={2}
              x1="0"
              y1={CHART_HEIGHT}
              x2={chartWidth}
              y2={CHART_HEIGHT}
            />
          </Svg>
        </View>
        {/* 2/3rd OF THE WAY FROM THE BOTTOM */}
        <View
          style={{
            position: 'absolute',
            bottom: scaleY((paddedMaxMinutes / 3) * 2),
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={CHART_HEIGHT}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
            <Line
              stroke="#d4d4d8"
              strokeWidth={2}
              x1="0"
              y1={CHART_HEIGHT}
              x2={chartWidth}
              y2={CHART_HEIGHT}
            />
          </Svg>
        </View>
        {/* LINE ON TOP */}
        <View
          style={{
            position: 'absolute',
            bottom: scaleY(paddedMaxMinutes),
            left: 0,
            pointerEvents: 'none',
          }}>
          <Svg
            height={CHART_HEIGHT}
            width={chartWidth}
            style={{alignSelf: 'center'}}>
            <Line
              stroke="#d4d4d8"
              strokeWidth={2}
              x1="0"
              y1={CHART_HEIGHT}
              x2={chartWidth}
              y2={CHART_HEIGHT}
            />
          </Svg>
        </View>
        {/*  */}
        {/*  */}
        {/* LABELS */}
        {/*  */}
        {/*  */}
        {/* MIN VALUE LABEL */}
        <Text
          style={[
            tw`absolute bottom-0 -left-10 text-xs text-zinc-500`,
            {transform: [{translateY: scaleY(0)}]},
            getCircular('Book'),
          ]}>
          0m
        </Text>
        {/* VALUE 1/3RD OF THE WAY UP */}
        <Text
          style={[
            tw`absolute bottom-0 -left-10 text-xs text-zinc-500`,
            {transform: [{translateY: -scaleY(paddedMaxMinutes / 3)}]},
            getCircular('Book'),
          ]}>
          {timeConvert(Math.round(paddedMaxMinutes / 3) * 60)}
        </Text>
        {/* VALUE 2/3RD OF THE WAY UP */}
        <Text
          style={[
            tw`absolute bottom-0 -left-10 text-xs text-zinc-500`,
            {transform: [{translateY: -scaleY((paddedMaxMinutes / 3) * 2)}]},
            getCircular('Book'),
          ]}>
          {timeConvert(Math.round((paddedMaxMinutes / 3) * 2) * 60)}
        </Text>
        {/* VALUE ON THE TOP (MAX) */}
        <Text
          style={[
            tw`absolute bottom-0 -left-10 text-xs text-zinc-500`,
            {transform: [{translateY: -scaleY(paddedMaxMinutes)}]},
            getCircular('Book'),
          ]}>
          {timeConvert(Math.round(paddedMaxMinutes) * 60)}
        </Text>
        {/* CHART AREA */}
        <ScrollView
          onLayout={event => {
            setChartWidth(event.nativeEvent.layout.width);
          }}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          style={[tw`flex-1`]}
          contentContainerStyle={{width: totalWidth}}
          ref={scrollViewRef}>
          <Svg
            style={{
              alignSelf: 'center',
              transform: [{scaleY: -1}],
            }}
            width={totalWidth}
            height={CHART_HEIGHT}>
            {exertionDays.map((item, index) => {
              // Calculate the x position for the bar, starting with the first bar at the far right
              const xPosition =
                totalWidth - barPlusSpaceWidth * index - barWidth / 2;
              const xBarPosition = xPosition - (barWidth - spaceWidth) / 2;
              const labelYPosition = scaleY(item.minutes) + 10;
              const labelYOffset = 4;
              const currentDayOffset = -14;

              return (
                <G key={item.id}>
                  <Rect
                    x={xBarPosition}
                    y={0}
                    width={Math.abs(barWidth - spaceWidth)}
                    height={scaleY(item.minutes)}
                    fill={getBarColor(
                      item.minutes,
                      historicalTimeAboveLimit / 60,
                    )}
                    rx="3"
                    ry="3"
                  />
                  {/* position another rectangle if item.minutes is not 0 on the bottom to make non-rounded, and use the same color (hack) */}
                  {item.minutes > 0 ? (
                    <Rect
                      x={xPosition - (barWidth - spaceWidth) / 2}
                      y={0}
                      width={barWidth - spaceWidth}
                      height={3}
                      fill={getBarColor(
                        item.minutes,
                        historicalTimeAboveLimit / 60,
                      )}
                    />
                  ) : null}
                  {/* CIRCLE IF CURRENT DAY */}
                  {dayjs(item.day).isSame(dayjs(today), 'day') ? (
                    <Circle
                      cx={xPosition}
                      cy={-labelYPosition + currentDayOffset}
                      r={3}
                      fill="#6b7280"
                      transform={'scale(1, -1)'}
                    />
                  ) : null}
                  {/* LABEL */}
                  <SVGText
                    x={xPosition}
                    y={-labelYPosition + labelYOffset}
                    fill="#6b7280"
                    fontSize="12"
                    fontFamily="CircularStd-Book"
                    textAnchor="middle"
                    transform={'scale(1, -1)'}>
                    {dayjs(item.day).format('MMM D')}
                  </SVGText>
                </G>
              );
            })}
          </Svg>
        </ScrollView>
      </View>
      {/* KEY FOR CHART */}
      <View style={[tw`flex flex-row items-center justify-center mt-3`]}>
        {/* DOTTED LINE AND LABEL TO RIGHT */}
        <View style={[tw`flex flex-row items-center`]}>
          <Svg height={1} width={20}>
            <Line
              stroke="gray"
              strokeDasharray="3, 3"
              strokeWidth={1}
              x1="0"
              y1="0"
              x2="20"
              y2="0"
            />
          </Svg>
          <Text
            style={[
              tw`text-xs text-gray-500 ml-2`,
              getCircular('Book'),
              {transform: [{translateY: -1}]},
            ]}>
            Energy budget
          </Text>
        </View>
        {/* RENDER FIVE SMALL SQUARES, AND THEN A LABEL SAYING EXERTION AMOUNT (smallest to greatest) */}
        <View style={[tw`flex flex-row items-center ml-6`]}>
          <View
            style={[tw`w-3 h-3 rounded-sm ml-1`, {backgroundColor: '#86efac'}]}
          />
          <View
            style={[tw`w-3 h-3 rounded-sm ml-1`, {backgroundColor: '#22c55e'}]}
          />
          <View
            style={[tw`w-3 h-3 rounded-sm ml-1`, {backgroundColor: '#a3e635'}]}
          />
          <View
            style={[tw`w-3 h-3 rounded-sm ml-1`, {backgroundColor: '#eab308'}]}
          />
          <View
            style={[tw`w-3 h-3 rounded-sm ml-1`, {backgroundColor: '#f87171'}]}
          />
          <Text
            style={[
              tw`text-xs text-gray-500 ml-2`,
              getCircular('Book'),
              {transform: [{translateY: -1}]},
            ]}>
            Energy used
          </Text>
        </View>
      </View>
    </>
  );
};
