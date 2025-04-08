import React, {memo, useMemo, useState} from 'react';
import {View, Text} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import tw from 'twrnc';

import {
  FadeIn,
  FadeInFadeOut,
  HeartRateCard,
  TextButton,
} from '@pathize/mobile-ui';
import {processHeartRateData} from '@pathize/lib';
import {getCircular} from '../../../utils';
import {useOverlayContext, useLimitContext} from '../../../contexts';
import {HeartRateChart} from '../../heartRateChart';
// CHART IMPORTS
import {LineChart, LineChartYValueText} from '../../../components/chart';
import {
  formatHeartRateDataSamples,
  formatHeartRateDataSamplesKeepTimestamps,
} from '../../../components/charts';
import {formatDailyHr} from '../../../components/chart/utils';
import {LineChartAdjustedDatetimeText} from '../../../components/chart/DateTextFromAdjustedIndex';
import {usePathizeSelectedDayContext} from '../../../contexts/PathizeSelectedDayContext';

dayjs.extend(utc);
dayjs.extend(timezone);

export const Pacing: React.FC = memo(() => {
  const {
    state: {loading, metadata, lastUpdated},
  } = usePathizeSelectedDayContext();
  const {limit} = useLimitContext();
  const {setChartOverlayVisible} = useOverlayContext();

  const [chartWidth, setChartWidth] = useState(0);
  const [isBeingDragged, setIsBeingDragged] = useState(false);

  const minHr = 40;
  const heartRateSamples = useMemo(() => {
    return metadata?.heartRateSamples
      ? processHeartRateData(metadata.heartRateSamples)
      : null;
  }, [metadata?.heartRateSamples]);
  const maxHr = useMemo(() => {
    return Math.max(
      heartRateSamples && heartRateSamples.length > 0
        ? Math.max(...heartRateSamples.map(item => item.bpm)) + 6
        : 85 + 6,
      limit ?? 85 + 6,
    );
  }, [heartRateSamples, limit]);

  const IS_SELECTED_DAY_TODAY =
    heartRateSamples &&
    heartRateSamples.length > 0 &&
    dayjs(heartRateSamples[0].timestamp).isSame(dayjs(), 'day');

  return (
    <LineChart.Provider
      data={
        heartRateSamples
          ? formatHeartRateDataSamples(heartRateSamples)
          : [{x: 0, y: 0}]
      }
      mapPointsToFixedRange={true}
      xDomain={[0, 1440]}
      yRange={{
        min: minHr,
        max: maxHr,
      }}>
      {/* CHART */}
      {limit && (
        <View style={tw`mb-4 mt-3`}>
          {/* TOP HEART RATE CARD UI */}
          <HeartRateCard
            currentHeartRate={
              heartRateSamples && heartRateSamples.length > 0
                ? heartRateSamples[heartRateSamples.length - 1].bpm
                : null
            }
            currentHeartRateText={
              heartRateSamples && isBeingDragged ? (
                <FadeInFadeOut
                  duration={200}
                  watchValue={
                    heartRateSamples && isBeingDragged ? true : false
                  }>
                  <LineChartYValueText
                    formatFn={formatDailyHr}
                    style={[
                      tw`text-3xl font-bold text-cyan-950`,
                      getCircular('Bold'),
                    ]}
                  />
                </FadeInFadeOut>
              ) : heartRateSamples &&
                heartRateSamples.length > 0 &&
                !isBeingDragged &&
                IS_SELECTED_DAY_TODAY === true ? (
                <FadeIn duration={200}>
                  <Text
                    style={[
                      tw`text-3xl font-bold text-cyan-950`,
                      getCircular('Bold'),
                    ]}>
                    {Math.trunc(
                      heartRateSamples[heartRateSamples.length - 1].bpm,
                    )}{' '}
                    bpm
                  </Text>
                </FadeIn>
              ) : (
                <FadeIn duration={200}>
                  <Text
                    style={[
                      tw`text-3xl font-bold text-cyan-950`,
                      getCircular('Bold'),
                    ]}>
                    {'-'}
                  </Text>
                </FadeIn>
              )
            }
            currentTimeText={
              heartRateSamples ? (
                <LineChartAdjustedDatetimeText
                  format={({value}) => {
                    'worklet';
                    const timePart = value.split('T')[1];
                    let [hours, minutes] = timePart.split(':');
                    const period = Number(hours) >= 12 ? 'PM' : 'AM';
                    hours = (((Number(hours) + 11) % 12) + 1).toString();
                    return `at ${hours}:${minutes} ${period}`;
                  }}
                  adjustedData={formatHeartRateDataSamplesKeepTimestamps(
                    heartRateSamples!,
                  )}
                  style={[
                    tw`text-lg font-normal text-cyan-950 -mt-3`,
                    getCircular('Book'),
                  ]}
                />
              ) : null
            }
            isBeingDragged={isBeingDragged}
            today={IS_SELECTED_DAY_TODAY ? true : false}
            headerTextStyle={[
              tw`text-lg font-normal text-cyan-950`,
              getCircular('Bold'),
            ]}
            rightTextStyle={[tw``, getCircular('Book')]}
            style={[tw`my-2`]}
            limit={limit}
          />
          {/* HEART RATE CHART ITSELF */}
          <FadeIn duration={200} style={tw`mt-6`}>
            <View
              onLayout={event => {
                const {width} = event.nativeEvent.layout;
                setChartWidth(width);
              }}
              style={tw`mt-4`}>
              <FadeIn duration={200}>
                <HeartRateChart
                  limit={limit}
                  chartHeight={250}
                  maxHr={maxHr}
                  chartWidth={chartWidth}
                  pointsToday={heartRateSamples ?? null}
                  lastUpdated={lastUpdated ?? null}
                  loading={loading}
                  setIsBeingDragged={setIsBeingDragged}
                />
              </FadeIn>
            </View>
          </FadeIn>
        </View>
      )}
      {/* AREA TO FILER WHAT THE CHART SHOWS */}
      <View style={tw`flex flex-row justify-center mt-3`}>
        <TextButton
          textColor={'text-zinc-400'}
          text="Filter chart overlays"
          onPress={() => {
            trigger('impactLight');
            setChartOverlayVisible(true);
          }}
          textStyle={[tw``, getCircular('Book')]}
        />
      </View>
    </LineChart.Provider>
  );
});

Pacing.displayName = 'Pacing';
