import React, {memo, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import tw from 'twrnc';

import {FadeIn, Header2, PrimaryButton} from '@pathize/mobile-ui';
import {processHeartRateData} from '@pathize/lib';
import {
  useLimitContext,
  usePathizeDataContext,
  usePathizeSelectedDayContext,
} from '../../../contexts';
import {getCircular} from '../../../utils';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {usePacingDetails} from '../hooks';
import {PacingDetailsStatsListProps, PacingStatsListProps} from '../types';
import {PacingStatsList} from './PacingStatsList';

export const PacingHomeStatsArea: React.FC = memo(() => {
  const {
    state: {data},
  } = usePathizeDataContext();
  const {
    state: {metadata, date, lastUpdated},
  } = usePathizeSelectedDayContext();
  const {limit} = useLimitContext();
  const {
    percentageOfTimeAboveLimitPast30Days,
    percentageOfMaxHrPast30Days,
    percentageOfMinHrPast30Days,
    percentageOfHrvPast30Days,
    percentageOfRhrPast30Days,
    percentageOfTimeStandingPast30Days,
    percentageOfTimeDeepSleepPast30Days,
    percentageOfTimeRemSleepPast30Days,
    percentageOfNighttimeHrvPast30Days,
    percentageOfStepsPast30Days,
  } = usePacingDetails(data, limit, metadata);

  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'PacingDetails'>
    >();

  // min and max HR data
  const minHr = 40;
  const maxHr = useMemo(() => {
    return Math.max(
      metadata?.heartRateSamples
        ? Math.max(...metadata?.heartRateSamples.map(item => item.bpm)) + 6
        : 85 + 6,
      limit ?? 85 + 6,
    );
  }, [metadata?.heartRateSamples, limit]);
  const processedSamples = useMemo(
    () =>
      metadata?.heartRateSamples && metadata?.heartRateSamples.length > 0
        ? processHeartRateData(metadata?.heartRateSamples)
        : null,
    [metadata?.heartRateSamples],
  );

  /**
   * @description array of basic items on the home screen
   */
  const pacingStatAreaArray: PacingStatsListProps[] = [
    {
      id: '0',
      name: 'Time above limit',
      stat: metadata?.timeAboveLimit,
      percentage: percentageOfTimeAboveLimitPast30Days ?? undefined,
      convertMinutes: true,
    },
    {
      id: '1',
      name: 'Max HR (bpm)',
      stat: metadata?.maxHr,
      percentage: percentageOfMaxHrPast30Days ?? undefined,
    },
    {
      id: '2',
      name: 'HRV (ms)',
      stat: metadata?.hrv,
      percentage: percentageOfHrvPast30Days ?? undefined,
    },
  ];

  const pacingDetailsStatAreaArray: PacingDetailsStatsListProps[] = [
    {
      id: '0',
      name: 'Time above limit',
      stat: metadata?.timeAboveLimit,
      percentage: percentageOfTimeAboveLimitPast30Days ?? undefined,
      convertMinutes: true,
      statHeader: 'Time above limit',
      statSubheader: 'The time you spent above your anaerobic threshold.',
    },
    {
      id: '1',
      name: 'Max HR (bpm)',
      stat: metadata?.maxHr,
      percentage: percentageOfMaxHrPast30Days ?? undefined,
      statHeader: 'Heart',
      statSubheader:
        'Maximum, minimum, and resting heart rate are important metrics to keep tabs and and might serve useful as a proxy for exertion. HRV has been shown to be a good indicator of overall recovery. Usually, HRV is lower when you are stressed or fatigued.',
    },
    {
      id: '2',
      name: 'Min HR (bpm)',
      stat: metadata?.minHr,
      percentage: percentageOfMinHrPast30Days ?? undefined,
    },
    {
      id: '3',
      name: 'HRV (ms)',
      stat: metadata?.hrv,
      percentage: percentageOfHrvPast30Days ?? undefined,
    },
    {
      id: '4',
      name: 'Resting HR (bpm)',
      stat: metadata?.restingHr,
      percentage: percentageOfRhrPast30Days ?? undefined,
    },
    {
      id: '5',
      name: 'Steps',
      stat: metadata?.steps,
      percentage: percentageOfStepsPast30Days ?? undefined,
      // header and subheader
      statHeader: 'Activity',
      statSubheader:
        'Certain activity-based measures, such as steps and time above limit, can be used to proxy for exertion.',
    },
    {
      id: '6',
      name: 'Time standing',
      stat: metadata?.timeStanding,
      percentage: percentageOfTimeStandingPast30Days ?? undefined,
      convertMinutes: true,
    },
    {
      id: '7',
      name: 'Nighttime HRV',
      stat: metadata?.nighttimeHrv,
      percentage: percentageOfNighttimeHrvPast30Days ?? undefined,
      // header and subheader
      statHeader: 'Sleep',
      statSubheader:
        'More deep and REM sleep is usually important for recovery. HRV is usually highest at night; nighttime HRV might prove a better signal of overall recovery vs. daytime HRV.',
    },
    {
      id: '8',
      name: 'Deep sleep',
      stat: metadata?.timeInDeepSleep,
      percentage: percentageOfTimeDeepSleepPast30Days ?? undefined,
      convertMinutes: true,
    },
    {
      id: '9',
      name: 'REM sleep',
      stat: metadata?.timeInREMSleep,
      percentage: percentageOfTimeRemSleepPast30Days ?? undefined,
      convertMinutes: true,
    },
  ];

  if (!metadata || !limit) return null;

  return (
    <FadeIn duration={250} style={[tw`mx-3`]}>
      <Header2
        text="Key signals"
        textStyle={[tw`font-semibold text-slate-950`, getCircular('Bold')]}
        padding={true}
      />
      <PacingStatsList statsList={pacingStatAreaArray} />
      {/* BUTTON */}
      <PrimaryButton
        style={[tw`mt-1`]}
        padding={false}
        textStyle={[tw``, getCircular('Bold')]}
        text="View more stats"
        width="full"
        rounded="small"
        onPress={() =>
          homeNavigation.navigate('PacingDetails', {
            dataArray: pacingDetailsStatAreaArray,
            limit: limit,
            maxHr: maxHr,
            minHr: minHr,
            lastUpdated: lastUpdated ?? null,
            processedSamples: processedSamples,
            currentSelectedDay: date,
          })
        }
      />
    </FadeIn>
  );
});

PacingHomeStatsArea.displayName = 'PacingHomeStatsArea';
