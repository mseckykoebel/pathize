import React from 'react';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {Body1, Header2, StatListItem, Subheader} from '@pathize/mobile-ui';
import {PathizeMetadata} from '../../../contexts';
import {getCircular, timeConvert} from '../../../utils';
import {SheetNavbar} from '../../../components/sheets';
import {AppBodyLayout} from '../../../components/layouts';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {EnergyGuidanceDetailsStatsListProps} from '../types';
import {EnergyBudgetBarChart} from './EnergyBudgetBarChart';
import {EnergyBudgetStatsList} from './EnergyBudgetStatsList';

const TimeAboveLimitStatItem = ({
  metadata,
  percentageOfHistorical,
}: {
  metadata: PathizeMetadata | undefined;
  percentageOfHistorical: number | undefined;
}) => {
  return (
    <StatListItem
      title="Time above limit"
      titleStyle={[tw`text-cyan-950`, getCircular('Book')]}
      stat={metadata !== undefined ? timeConvert(metadata.timeAboveLimit) : ''}
      statStyle={[tw`text-2xl text-slate-950 my-1`, getCircular('Book')]}
      up={
        percentageOfHistorical !== undefined
          ? percentageOfHistorical > 0
            ? true
            : false
          : undefined
      }
      padding={false}
      percentStat={
        percentageOfHistorical !== undefined ? `${percentageOfHistorical}%` : ''
      }
      percentStatStyle={[tw`text-neutral-500`, getCircular('Book')]}
      subtext={percentageOfHistorical !== undefined ? 'vs. PEM days' : ''}
      subtextStyle={[tw`text-neutral-500`, getCircular('Book')]}
      bottomChild={
        percentageOfHistorical !== undefined ? (
          <Body1
            text={
              percentageOfHistorical > 0
                ? `${percentageOfHistorical}% above your typical average. While sometimes it's necessary to exert more on certain days, be sure to be mindful of triggering or worsening PEM. Be sure to seek the guidance of a medical professional before any substantial changes to your care plan.`
                : percentageOfHistorical < 0
                  ? `${Math.abs(
                      percentageOfHistorical,
                    )}% below your typical when you've experienced PEM.`
                  : 'Right on your average for when you experience PEM.'
            }
            textStyle={[tw`flex-shrink text-neutral-500`, getCircular('Book')]}
          />
        ) : undefined
      }
      style={[tw`bg-sky-100 p-4 mt-3`]}
    />
  );
};

type Props = StackScreenProps<
  HomeStackScreenParamList,
  'ExertionGuidanceMoreDetails'
>;

export const EnergyBudgetMoreDetailsSheet: React.FC<Props> = ({route}) => {
  const {data, exertionGuidanceData, metadata} = route.params;
  const posthog = usePostHog();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<
        HomeStackScreenParamList,
        'ExertionGuidanceMoreDetails'
      >
    >();

  /**
   * @description determine how similar the current day is compared to historical average
   */
  const percentageOfHistorical =
    metadata &&
    metadata.timeAboveLimit > 0 &&
    exertionGuidanceData?.exertionGuidanceTimeAboveLimit
      ? Math.trunc(
          ((metadata.timeAboveLimit -
            exertionGuidanceData.exertionGuidanceTimeAboveLimit) /
            exertionGuidanceData.exertionGuidanceTimeAboveLimit) *
            100,
        )
      : undefined;
  const percentageOfHrv =
    metadata && exertionGuidanceData?.hrvDuringPEM && metadata.hrv
      ? Math.trunc(
          ((metadata.hrv - exertionGuidanceData.hrvDuringPEM) /
            exertionGuidanceData.hrvDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfRhr =
    metadata && exertionGuidanceData?.restingHrDuringPEM && metadata.restingHr
      ? Math.trunc(
          ((metadata.restingHr - exertionGuidanceData.restingHrDuringPEM) /
            exertionGuidanceData.restingHrDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfMaxHr =
    metadata && exertionGuidanceData?.maxHrDuringPEM && metadata.maxHr
      ? Math.trunc(
          ((metadata.maxHr - exertionGuidanceData.maxHrDuringPEM) /
            exertionGuidanceData.maxHrDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfMinHr =
    metadata && exertionGuidanceData?.minHrDuringPEM && metadata.minHr
      ? Math.trunc(
          ((metadata.minHr - exertionGuidanceData.minHrDuringPEM) /
            exertionGuidanceData.minHrDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfTimeStanding =
    metadata &&
    exertionGuidanceData?.timeStandingDuringPEM &&
    metadata.timeStanding
      ? Math.trunc(
          ((metadata.timeStanding -
            exertionGuidanceData.timeStandingDuringPEM) /
            exertionGuidanceData.timeStandingDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfTimeInDeepSleep =
    metadata &&
    exertionGuidanceData?.timeInDeepSleepDuringPEM &&
    metadata.timeInDeepSleep
      ? Math.trunc(
          ((metadata.timeInDeepSleep -
            exertionGuidanceData.timeInDeepSleepDuringPEM) /
            exertionGuidanceData.timeInDeepSleepDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfTimeInREMSleep =
    metadata &&
    exertionGuidanceData?.timeInREMSleepDuringPEM &&
    metadata.timeInREMSleep
      ? Math.trunc(
          ((metadata.timeInREMSleep -
            exertionGuidanceData.timeInREMSleepDuringPEM) /
            exertionGuidanceData.timeInREMSleepDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfTimeInNighttimeHrv =
    metadata &&
    exertionGuidanceData?.nighttimeHrvDuringPEM &&
    metadata.nighttimeHrv
      ? Math.trunc(
          ((metadata.nighttimeHrv -
            exertionGuidanceData.nighttimeHrvDuringPEM) /
            exertionGuidanceData.nighttimeHrvDuringPEM) *
            100,
        )
      : undefined;
  const percentageOfSteps =
    metadata && exertionGuidanceData?.stepsDuringPEM && metadata.steps
      ? Math.trunc(
          ((metadata.steps - exertionGuidanceData.stepsDuringPEM) /
            exertionGuidanceData.stepsDuringPEM) *
            100,
        )
      : undefined;

  /**
   * @description create the data array for the stats list
   */
  const dataArray: EnergyGuidanceDetailsStatsListProps[] = [
    {
      id: '0',
      name: 'HRV (ms)',
      minValue: exertionGuidanceData?.hrvDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.hrvDuringPEMUpperBound,
      stat: metadata?.hrv,
      percentage: percentageOfHrv,
      // header and/or subheader
      statHeader: 'Heart',
    },
    {
      id: '1',
      name: 'Resting HR (bpm)',
      minValue: exertionGuidanceData?.restingHrDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.restingHrDuringPEMUpperBound,
      stat: metadata?.restingHr,
      percentage: percentageOfRhr,
    },
    {
      id: '2',
      name: 'Max HR (bpm)',
      minValue: exertionGuidanceData?.maxHrDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.maxHrDuringPEMUpperBound,
      stat: metadata?.maxHr,
      percentage: percentageOfMaxHr,
    },
    {
      id: '3',
      name: 'Min HR (bpm)',
      minValue: exertionGuidanceData?.minHrDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.minHrDuringPEMUpperBound,
      stat: metadata?.minHr,
      percentage: percentageOfMinHr,
    },
    {
      id: '4',
      name: 'Time standing',
      minValue: exertionGuidanceData?.timeStandingDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.timeStandingDuringPEMUpperBound,
      stat: metadata?.timeStanding,
      percentage: percentageOfTimeStanding,
      convertMinutes: true,
      useZeroAsMin: true,
      // header and/or subheader
      statHeader: 'Activity',
    },
    {
      id: '5',
      name: 'Steps',
      minValue: exertionGuidanceData?.stepsDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.stepsDuringPEMUpperBound,
      stat: metadata?.steps,
      percentage: percentageOfSteps,
      useZeroAsMin: true,
    },
    {
      id: '6',
      name: 'Nighttime HRV',
      minValue: exertionGuidanceData?.nighttimeHrvDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.nighttimeHrvDuringPEMUpperBound,
      stat: metadata?.nighttimeHrv,
      percentage: percentageOfTimeInNighttimeHrv,
      // header and/or subheader
      statHeader: 'Sleep',
    },
    {
      id: '7',
      name: 'Deep sleep',
      minValue: exertionGuidanceData?.timeInDeepSleepDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.timeInDeepSleepDuringPEMUpperBound,
      stat: metadata?.timeInDeepSleep,
      percentage: percentageOfTimeInDeepSleep,
      convertMinutes: true,
    },
    {
      id: '8',
      name: 'REM sleep',
      minValue: exertionGuidanceData?.timeInREMSleepDuringPEMLowerBound,
      maxValue: exertionGuidanceData?.timeInREMSleepDuringPEMUpperBound,
      stat: metadata?.timeInREMSleep,
      percentage: percentageOfTimeInREMSleep,
      convertMinutes: true,
    },
  ];

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        padding={false}
        paddingSides={false}
        paddingTop={false}
        navigator={homeNavigation}
        swipeToDismiss={true}
        dismissKeyboardOnTouch={true}
        route="Home"
        backgroundColor="bg-white"
        style={tw`px-5`}>
        {/* CHART AND HEADER */}
        {data &&
        exertionGuidanceData?.exertionGuidanceTimeAboveLimit !== undefined ? (
          <>
            <Header2
              padding={false}
              text="How you've exerted over time"
              textStyle={[
                tw`font-semibold text-slate-950`,
                getCircular('Book'),
              ]}
            />
            <Subheader
              padding={false}
              style={[tw`mb-8`, getCircular('Book')]}
              text="The chart below shows the amount of energy consumption per day as it relates to our suggested energy budget. It can be useful to see how additional energy usage compares to how you've felt over time."
            />
            <EnergyBudgetBarChart
              data={data}
              historicalTimeAboveLimit={
                exertionGuidanceData.exertionGuidanceTimeAboveLimit
              }
            />
          </>
        ) : null}
        {/* MAIN STAT LIST ITEM */}
        <TimeAboveLimitStatItem
          metadata={metadata}
          percentageOfHistorical={percentageOfHistorical}
        />
        {/* STATS SUMMARY */}
        <Header2
          paddingTop={true}
          text="Key signals"
          textStyle={[tw`font-semibold text-slate-950`, getCircular('Book')]}
        />
        <Subheader
          padding={false}
          text={
            "How your signals compare to the days you've recorded crashing/PEM. If available, we also show how each signal compares to its usual range. Some specific signals can be more useful than others in determining how you're feeling."
          }
          style={[tw``, getCircular('Book')]}
        />

        {/* BOTTOM AREA */}
        <EnergyBudgetStatsList statsList={dataArray} />
      </AppBodyLayout>
    </>
  );
};
