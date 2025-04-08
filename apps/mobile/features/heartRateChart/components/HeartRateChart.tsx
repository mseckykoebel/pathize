import React, {Dispatch, SetStateAction, useEffect, useState} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {Line, Rect} from 'react-native-svg';
import {scaleLinear} from 'd3-scale';
import {curveCatmullRom} from 'd3-shape';
import {trigger} from 'react-native-haptic-feedback';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {FadeInFadeOut} from '@pathize/mobile-ui';
import {ActivityRecord, Crash, SymptomRecord} from '@pathize/db';
import {
  useCrashesContext,
  useSymptomsContext,
  useOverlayContext,
  useActivitiesContext,
} from '../../../contexts';
import {
  getCircular,
  getHeartRateOverlayColorByScore,
  getIcon,
} from '../../../utils';
import {
  LineChart,
  bpmToMilliseconds,
  formatHeartRateDataSamples,
} from '../../../components';

const START_X = 0;
const FINISH_X = 24 * 60;

interface HeartRateChartProps {
  chartWidth: number;
  chartHeight: number;
  pointsToday: HeartRateDataSample[] | null;
  lastUpdated: string | null;
  maxHr: number;
  limit: number;
  loading: boolean;
  setIsBeingDragged: Dispatch<SetStateAction<boolean>>;
}

export const HeartRateChart: React.FC<HeartRateChartProps> = ({
  chartWidth,
  chartHeight,
  pointsToday,
  lastUpdated,
  maxHr,
  limit,
  loading,
  setIsBeingDragged,
}) => {
  const {crashes} = useCrashesContext();
  const {symptomRecords} = useSymptomsContext();
  const {visibleChartOverlays} = useOverlayContext();
  const {activityRecords} = useActivitiesContext();
  const [todayData, setTodayData] = useState<{x: number; y: number}[] | null>(
    null,
  );
  const minHr = 40;
  const scaleX = scaleLinear()
    .domain([START_X, FINISH_X])
    .range([0, chartWidth]);
  const scaleY = scaleLinear().domain([minHr, maxHr]).range([0, chartHeight]);

  // Parse out crashes and activities with total time, and without total time
  const activitiesWithTotalTime: ActivityRecord[] =
    activityRecords?.filter(
      activity => activity.activityTotalTime && activity.activityTotalTime > 0,
    ) ?? [];
  const activitiesWithoutTotalTime: ActivityRecord[] =
    activityRecords?.filter(
      activity =>
        !activity.activityTotalTime || activity.activityTotalTime === 0,
    ) ?? [];
  const crashesWithTotalTime: Crash[] =
    crashes?.filter(
      crash => crash.crashTotalTime && crash.crashTotalTime > 0,
    ) ?? [];
  const crashesWithoutTotalTime: Crash[] =
    crashes?.filter(
      crash => !crash.crashTotalTime || crash.crashTotalTime === 0,
    ) ?? [];

  useEffect(() => {
    if (!pointsToday || pointsToday.length === 0) {
      setTodayData(null);
      return;
    }
    const formattedSamples = formatHeartRateDataSamples(pointsToday);
    setTodayData(formattedSamples);
  }, [pointsToday, limit]);

  const setAndInvokeHapticFeedback = (setVal: boolean) => {
    trigger('impactLight');
    setIsBeingDragged(setVal);
  };

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
        <View style={{position: 'absolute', left: 4, bottom: chartHeight / 3}}>
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
        <View
          style={{position: 'absolute', right: 4, bottom: scaleY(limit) + 4}}>
          <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
            Limit: {limit}
          </Text>
        </View>
        {/* CRASHES JUST THE LINE */}
        <FadeInFadeOut
          duration={200}
          watchValue={visibleChartOverlays.some(
            item => item.name === 'Crashes/PEM',
          )}>
          {crashesWithoutTotalTime.map((crash, index) => {
            const crashTime = dayjs(crash.time);
            const minutes =
              crashTime.get('hour') * 60 + crashTime.get('minute');
            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: scaleX(minutes),
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
                  height={chartHeight}
                  width={chartWidth}
                  style={{alignSelf: 'center', bottom: -20}}>
                  <Line
                    stroke={getHeartRateOverlayColorByScore(
                      crash.severity ?? 0,
                      0.5,
                    )}
                    strokeWidth={2}
                    x1={0}
                    y1="0"
                    x2={0}
                    y2={chartHeight - 20}
                  />
                </Svg>
              </View>
            );
          })}
          {crashesWithTotalTime.map((crash, index) => {
            const crashTime = dayjs(crash.time);
            const minutes =
              crashTime.get('hour') * 60 + crashTime.get('minute');
            const crashEndMinutes = minutes + crash.crashTotalTime!;
            const midPoint = (scaleX(crashEndMinutes) - scaleX(minutes)) / 2;

            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: scaleX(minutes),
                  width: scaleX(crashEndMinutes) - scaleX(minutes),
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
                  height={chartHeight}
                  width={scaleX(crashEndMinutes) - scaleX(minutes)}
                  style={{alignSelf: 'center', bottom: -20}}>
                  <Rect
                    x="0"
                    y="0"
                    width={scaleX(crashEndMinutes) - scaleX(minutes)}
                    height={chartHeight - 20}
                    fill={getHeartRateOverlayColorByScore(
                      crash.severity ?? 0,
                      0.1,
                    )}
                  />
                </Svg>
              </View>
            );
          })}
        </FadeInFadeOut>
        <FadeInFadeOut
          duration={200}
          watchValue={visibleChartOverlays.some(
            item => item.name === 'Activities',
          )}>
          {activitiesWithoutTotalTime.map((activity, index) => {
            const activityTime = dayjs(activity.time);
            const minutes =
              activityTime.get('hour') * 60 + activityTime.get('minute');
            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: scaleX(minutes),
                }}>
                <View
                  style={{
                    position: 'absolute',
                    bottom: chartHeight - 15,
                    left: -5,
                  }}>
                  <FontAwesomeIcon
                    icon={getIcon(activity.activityIcon)}
                    size={12}
                    color={getHeartRateOverlayColorByScore(0, 1)}
                    style={{alignSelf: 'center'}}
                  />
                </View>
                <Svg
                  height={chartHeight}
                  width={chartWidth}
                  style={{alignSelf: 'center', bottom: -20}}>
                  <Line
                    stroke={getHeartRateOverlayColorByScore(0, 0.5)}
                    strokeWidth={2}
                    x1={0}
                    y1="0"
                    x2={0}
                    y2={chartHeight - 20}
                  />
                </Svg>
              </View>
            );
          })}
          {activitiesWithTotalTime.map((activity, index) => {
            const activityTime = dayjs(activity.time);
            const minutes =
              activityTime.get('hour') * 60 + activityTime.get('minute');
            const activityEndMinutes = minutes + activity.activityTotalTime!;
            const midPoint = (scaleX(activityEndMinutes) - scaleX(minutes)) / 2;
            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: scaleX(minutes),
                  width: scaleX(activityEndMinutes) - scaleX(minutes),
                }}>
                {/* ACTIVITY ICON AT MIDPOINT */}
                <View
                  style={{
                    position: 'absolute',
                    bottom: chartHeight - 15,
                    left: midPoint - 5,
                  }}>
                  <FontAwesomeIcon
                    icon={getIcon(activity.activityIcon)}
                    size={12}
                    color={getHeartRateOverlayColorByScore(0, 1)}
                    style={{alignSelf: 'center'}}
                  />
                </View>
                <Svg
                  height={chartHeight}
                  width={scaleX(activityEndMinutes) - scaleX(minutes)}
                  style={{alignSelf: 'center', bottom: -20}}>
                  <Rect
                    x="0"
                    y="0"
                    width={scaleX(activityEndMinutes) - scaleX(minutes)}
                    height={chartHeight - 20}
                    fill={getHeartRateOverlayColorByScore(0, 0.1)}
                  />
                </Svg>
              </View>
            );
          })}
        </FadeInFadeOut>
        {/* DO THE SAME FOR SYMPTOMS */}
        <FadeInFadeOut
          duration={200}
          watchValue={
            symptomRecords &&
            visibleChartOverlays.some(item => item.name === 'Symptoms') &&
            symptomRecords?.length
              ? true
              : false
          }>
          {symptomRecords &&
            visibleChartOverlays.some(item => item.name === 'Symptoms') &&
            symptomRecords?.length &&
            symptomRecords.map((symptom: SymptomRecord, index: number) => {
              const symptomTime = dayjs(symptom.time);
              const minutes =
                symptomTime.get('hour') * 60 + symptomTime.get('minute');
              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: scaleX(minutes),
                  }}>
                  <View
                    style={{
                      position: 'absolute',
                      bottom: chartHeight - 15,
                      left: -5,
                    }}>
                    <FontAwesomeIcon
                      icon={getIcon(symptom.category)}
                      size={12}
                      color={getHeartRateOverlayColorByScore(
                        symptom.severity ?? 0,
                        1,
                      )}
                      style={{alignSelf: 'center'}}
                    />
                  </View>
                  <Svg
                    height={chartHeight}
                    width={chartWidth}
                    style={{alignSelf: 'center', bottom: -20}}>
                    <Line
                      stroke={getHeartRateOverlayColorByScore(
                        symptom.severity ?? 0,
                        0.5,
                      )}
                      strokeWidth={2}
                      x1={0}
                      y1="0"
                      x2={0}
                      y2={chartHeight - 20}
                    />
                  </Svg>
                </View>
              );
            })}
        </FadeInFadeOut>
        {/* SIMPLY RENDERING THE DATA IN THE LINE CHART PROVIDER  */}
        {todayData && (
          <FadeInFadeOut
            duration={200}
            watchValue={
              !loading && todayData && todayData?.length ? true : false
            }>
            <LineChart
              shape={curveCatmullRom}
              height={chartHeight}
              nullCutoff={0}>
              <LineChart.Path color="#08816E" width={2} />
              <LineChart.CursorLine
                color="#08816E"
                onActivated={() => setAndInvokeHapticFeedback(true)}
                onEnded={() => setAndInvokeHapticFeedback(false)}
              />
            </LineChart>
          </FadeInFadeOut>
        )}
        {/* PULSE */}
        {todayData &&
        lastUpdated &&
        !loading &&
        dayjs(lastUpdated).isAfter(dayjs().subtract(30, 'minutes')) ? (
          <View
            style={{
              transform: [{scaleY: -1}],
            }}>
            <Cursor
              point={todayData[todayData.length - 1]}
              scaleX={scaleX}
              scaleY={scaleY}
              color={'#08816E'}
              pulseDurationMs={bpmToMilliseconds(
                todayData[todayData.length - 1].y,
              )}
            />
          </View>
        ) : null}
        {loading && (
          <ActivityIndicator
            size="small"
            color="#059669"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          />
        )}
      </View>
      <View style={tw`flex-row justify-between mt-1.5 mr-1 ml-1`}>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-16px] text-neutral-500`,
              getCircular('Book'),
            ]}
          />
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
              tw`text-xs absolute left-[-14px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            12pm
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-11px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            4pm
          </Text>
        </View>
        <View style={tw`flex-1`}>
          <Text
            style={[
              tw`text-xs absolute left-[-10px] text-neutral-500`,
              getCircular('Book'),
            ]}>
            8pm
          </Text>
          <Text
            style={[
              tw`text-xs absolute right-[-10px] text-neutral-500`,
              getCircular('Book'),
            ]}
          />
        </View>
      </View>
    </>
  );
};

type CursorProps = {
  point: {x: number; y: number};
  scaleX: (value: number) => number;
  scaleY: (value: number) => number;
  color?: string;
  pulseDurationMs?: number;
};

const Cursor = ({
  point,
  scaleX,
  scaleY,
  color = '#08816E',
  pulseDurationMs = 1000,
}: CursorProps) => {
  const {x, y} = point;

  const CURSOR_SIZE = 12 * 0.7;

  const left = scaleX(x) - CURSOR_SIZE / 2;
  const top = scaleY(y) - CURSOR_SIZE / 2;

  const scale = useDerivedValue(() => {
    const easing = Easing.out(Easing.sin);
    return withRepeat(
      withSequence(
        withTiming(1),
        withTiming(2, {
          duration: pulseDurationMs,
          easing,
        }),
      ),
      -1,
      true,
    );
  }, []);

  const opacity = useDerivedValue(() => {
    const easing = Easing.out(Easing.sin);
    return withRepeat(
      withSequence(
        withTiming(1),
        withTiming(0.5, {
          duration: pulseDurationMs,
          easing,
        }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        {
          left,
          top,
          width: CURSOR_SIZE,
          height: CURSOR_SIZE,
          backgroundColor: color,
          borderColor: color,
        },
        tw`absolute rounded-full border-2`,
        animatedStyle,
      ]}
    />
  );
};
