import React, {useCallback, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {EnergyBudgetCard, FadeIn, SecondaryButton} from '@pathize/mobile-ui';
import {removeDuplicateCrashes} from '@pathize/lib';
import {
  useCrashesContext,
  usePathizeDataContext,
  useTodayDataContext,
  usePathizeSelectedDayContext,
} from '../../../contexts';
import {getCircular} from '../../../utils';

export const EnergyBudget: React.FC = () => {
  const {
    state: {
      data,
      loading: exertionGuidanceLoading,
      energyBudgetData: exertionGuidanceData,
    },
  } = usePathizeDataContext();
  const {
    state: {metadata, lastUpdated},
  } = usePathizeSelectedDayContext();
  const {allCrashes} = useCrashesContext();
  const {today, actuallyToday} = useTodayDataContext();
  const homeNavigation = useNavigation<any>();

  const isSelectedDayWithinThePastThirtyDays = dayjs(today).isAfter(
    dayjs().subtract(30, 'day'),
  );

  /**
   * @description get the percentage of exertion guidance time above limit
   */
  const percentOfExertionGuidanceTimeAboveLimit = useMemo(() => {
    if (
      exertionGuidanceData?.exertionGuidanceTimeAboveLimit === undefined ||
      metadata?.timeAboveLimit === undefined
    ) {
      return 0;
    }

    // prevent divide by zero
    if (exertionGuidanceData?.exertionGuidanceTimeAboveLimit === 0) {
      return 0;
    }

    return Math.round(
      (metadata?.timeAboveLimit /
        exertionGuidanceData?.exertionGuidanceTimeAboveLimit) *
        100,
    );
  }, [
    exertionGuidanceData?.exertionGuidanceTimeAboveLimit,
    metadata?.timeAboveLimit,
  ]);

  /**
   * @description construct the subheader text itself
   */
  const getExertionGuidanceSubheaderText = useCallback(() => {
    const lastUpdatedFormatted = lastUpdated
      ? dayjs(lastUpdated).format('h:mm A')
      : undefined;

    const presentTense = dayjs(today).isSame(dayjs(actuallyToday));

    // if there is no percent TOL current day TOL or we are loading the data for the current day, abstract away subheader
    if (
      percentOfExertionGuidanceTimeAboveLimit === undefined ||
      metadata?.timeAboveLimit === undefined
    ) {
      return undefined;
    }

    const warningText = percentOfExertionGuidanceTimeAboveLimit
      ? percentOfExertionGuidanceTimeAboveLimit < 20
        ? presentTense
          ? 'Slow and steady'
          : 'Kept a slow and steady pace'
        : percentOfExertionGuidanceTimeAboveLimit < 40
          ? presentTense
            ? 'So far, so good'
            : 'Maintained a good balance'
          : percentOfExertionGuidanceTimeAboveLimit < 60
            ? presentTense
              ? 'On your feet'
              : 'On feet'
            : percentOfExertionGuidanceTimeAboveLimit < 80
              ? presentTense
                ? 'Using energy'
                : 'Used some energy'
              : percentOfExertionGuidanceTimeAboveLimit < 100
                ? presentTense
                  ? 'Approaching energy budget'
                  : 'Approached energy budget'
                : presentTense
                  ? 'Budget exceeded for today'
                  : 'Exceeded budget on this day'
      : undefined;

    const asOfText = `${
      warningText === undefined
        ? presentTense
          ? "You've used"
          : 'You used'
        : presentTense
          ? "you've used"
          : 'you used'
    } ${percentOfExertionGuidanceTimeAboveLimit}% of your recommended energy budget${
      presentTense && lastUpdatedFormatted
        ? ` as of ${lastUpdatedFormatted}`
        : ''
    }`;

    const lastSentence = percentOfExertionGuidanceTimeAboveLimit
      ? percentOfExertionGuidanceTimeAboveLimit < 20
        ? presentTense
          ? 'Keep pace to prioritize rest and recovery for today'
          : 'Kept pace to prioritize rest and recovery'
        : percentOfExertionGuidanceTimeAboveLimit < 40
          ? presentTense
            ? 'Maintain pace to comfortably stay within budget'
            : 'Maintained pace to stay within budget comfortably'
          : percentOfExertionGuidanceTimeAboveLimit < 60
            ? presentTense
              ? 'Be sure to mix exertion with adequate rest'
              : 'Mixed exertion with adequate rest'
            : percentOfExertionGuidanceTimeAboveLimit < 80
              ? presentTense
                ? 'Prioritize rest for the rest of the day to stay within budget'
                : 'Prioritized rest to stay within budget for the rest of the day'
              : percentOfExertionGuidanceTimeAboveLimit < 100
                ? presentTense
                  ? "You're close to exceeding your energy budget. Monitor your exertion carefully"
                  : 'Came close to exceeding the energy budget'
                : presentTense
                  ? 'This is more than usual, so be mindful of rest and recovery'
                  : ''
      : undefined;

    return `${warningText ? warningText + ': ' : ''}${asOfText}. ${
      lastSentence ? lastSentence + '.' : ''
    }`;
  }, [
    actuallyToday,
    lastUpdated,
    metadata?.timeAboveLimit,
    percentOfExertionGuidanceTimeAboveLimit,
    today,
  ]);

  /**
   * @description handle the exertion guidance label
   */
  const energyBudgetLabel = useMemo(() => {
    // if no crashes, return disabled
    if (!allCrashes) {
      return {
        enabled: false,
        headerText: 'Energy budget disabled',
        subheaderText:
          'Energy budget is available when you record crashes inside of Pathize. Record three crashes over three different days to unlock your suggested energy budget.',
      };
    }

    // if selected day is not within the past thirty days, return disabled
    if (!isSelectedDayWithinThePastThirtyDays) {
      return {
        enabled: false,
        headerText: 'Energy budget disabled',
        subheaderText:
          'Energy budget only available within the last thirty days.',
      };
    }

    const crashesInLastThirtyDays = allCrashes?.filter(crash =>
      dayjs(crash.createdDay).isAfter(dayjs().subtract(30, 'day')),
    );
    let crashesInLastThirtyDaysCount = 0;
    if (crashesInLastThirtyDays) {
      crashesInLastThirtyDaysCount = removeDuplicateCrashes(
        crashesInLastThirtyDays,
      ).length;
    }

    // if we have more than two crashes present
    if (crashesInLastThirtyDaysCount > 2) {
      return {
        enabled: true,
        headerText: 'Energy budget',
        subheaderText: getExertionGuidanceSubheaderText(),
      };
    } else {
      // in other cases, return enabled false, with the subheader text explaining that the user must record at least x more crashes, where that is diff between three and number of crashes recorded in the past thirty days
      return {
        enabled: false,
        headerText: 'Energy budget disabled',
        subheaderText: `Energy budget only available after recording ${
          3 - crashesInLastThirtyDaysCount
        } more crash${
          3 - crashesInLastThirtyDaysCount === 2 ? 'es' : ''
        } within the last thirty days.`,
      };
    }
  }, [
    allCrashes,
    getExertionGuidanceSubheaderText,
    isSelectedDayWithinThePastThirtyDays,
  ]);

  /**
   * @description when more details is pressed
   */
  const onMoreDetailsPress = useCallback(() => {
    homeNavigation.navigate('ExertionGuidanceMoreDetails', {
      data: data,
      exertionGuidanceData: exertionGuidanceData,
      metadata: metadata,
    });
  }, [data, exertionGuidanceData, homeNavigation, metadata]);

  /**
   * @description when help is pressed
   */
  const onHelpPress = useCallback(() => {
    homeNavigation.navigate('ExertionGuidanceHelp');
  }, [homeNavigation]);

  return (
    <FadeIn duration={250} style={tw`mt-6`}>
      <EnergyBudgetCard
        loading={exertionGuidanceLoading}
        error={false}
        enabled={energyBudgetLabel.enabled}
        titleText={energyBudgetLabel.headerText}
        titleTextStyle={[
          tw`text-lg font-normal text-cyan-950`,
          getCircular('Bold'),
        ]}
        tolCurrent={metadata?.timeAboveLimit}
        tolCurrentStyle={[
          tw`mb-2 text-4xl font-bold text-cyan-950`,
          getCircular('Bold'),
        ]}
        subheaderText={
          today === actuallyToday
            ? 'current time above limit'
            : 'time above limit'
        }
        subheaderTextStyle={[
          tw`text-sm font-normal text-cyan-950 mb-3 -mt-3`,
          getCircular('Book'),
        ]}
        onHelpPress={onHelpPress}
        tolMax={exertionGuidanceData?.exertionGuidanceTimeAboveLimit}
        bodyText={
          !exertionGuidanceLoading ? energyBudgetLabel.subheaderText : undefined
        }
        bodyTextStyle={[tw`text-sm font-normal mb-3`, getCircular('Book')]}
        bottomChild={
          <SecondaryButton
            padding={true}
            text="More details"
            rounded="small"
            onPress={onMoreDetailsPress}
            style={[tw`mb-1 border border-sky-200`]}
            textStyle={[tw``, getCircular('Book')]}
          />
        }
      />
    </FadeIn>
  );
};
