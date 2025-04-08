import React, {useState} from 'react';
import {View} from 'react-native';
import {usePostHog} from 'posthog-react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {Header2, Subheader} from '@pathize/mobile-ui';
import {HomeStackScreenParamList} from '../../CoreNav';
import {SheetNavbar} from '../../components/sheets';
import {AppBodyLayout} from '../../components/layouts';
import {getCircular} from '../../utils';
import {PacingBarChart} from '../../features/pacingDetails/components/PacingBarChart';
import {PacingDetailsStatsList} from '../../features/pacingDetails/components/PacingDetailsStatsList';
import {PacingBarChartWithResting} from '../../features/pacingDetails/components/PacingBarChartWithResting';

type Props = StackScreenProps<HomeStackScreenParamList, 'PacingDetails'>;

export const PacingDetails: React.FC<Props> = ({route}) => {
  const {
    dataArray,
    limit,
    maxHr,
    minHr,
    lastUpdated,
    processedSamples,
    currentSelectedDay,
  } = route.params;
  const posthog = usePostHog();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'PacingDetails'>
    >();

  const [chartWidth, setChartWidth] = useState(0);
  const selectedDayHeartRateData = processedSamples;

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="PacingDetails"
        posthogEventName="Pacing details sheet closed closed"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={false}
        dismissKeyboardOnTouch={false}
        padding={false}
        swipeToDismiss={true}
        navigator={homeNavigation}
        route={'Home'}
        backgroundColor="bg-white"
        paddingSides={false}>
        <View style={tw`px-4 pb-20`}>
          {/* BREAKDOWN */}
          <>
            {/* TOP CHART */}
            <Header2
              paddingTop={false}
              text="Breakdown"
              textStyle={[
                tw`font-semibold text-slate-950`,
                getCircular('Book'),
              ]}
            />
            <Subheader
              padding={false}
              text={
                "Here's a better look at when exactly you strayed over your limit."
              }
              style={[tw`mb-8`, getCircular('Book')]}
            />
            <View
              onLayout={event => {
                const {width} = event.nativeEvent.layout;
                setChartWidth(width);
              }}
              style={tw`mx-4 mb-6`}>
              <PacingBarChart
                limit={limit}
                chartHeight={185}
                chartWidth={chartWidth}
                minHr={minHr}
                maxHr={maxHr}
                pointsToday={selectedDayHeartRateData}
                lastUpdated={lastUpdated}
              />
            </View>
            {/* SECOND CHART */}
            <Header2
              paddingTop={false}
              text="Specific breakdown"
              textStyle={[
                tw`font-semibold text-slate-950`,
                getCircular('Book'),
              ]}
            />
            <Subheader
              padding={false}
              text={
                'Orange and red represents areas of exertion and high exertion, respectively.'
              }
              style={[tw`mb-8`, getCircular('Book')]}
            />
            <View
              onLayout={event => {
                const {width} = event.nativeEvent.layout;
                setChartWidth(width);
              }}
              style={tw`mx-4 mb-6`}>
              <PacingBarChartWithResting
                limit={limit}
                chartHeight={185}
                chartWidth={chartWidth}
                minHr={minHr}
                maxHr={maxHr}
                pointsToday={selectedDayHeartRateData}
                lastUpdated={lastUpdated}
              />
            </View>
          </>
          {/* MAKE A GRID USING FLEXBOX SHOWING FOUR AREAS. ROUNDED LARGE */}
          <View style={tw`mx-1`}>
            <Header2
              text="Key signals"
              textStyle={[
                tw`font-semibold text-slate-950`,
                getCircular('Book'),
              ]}
            />
            <Subheader
              text={
                'Key body signals and stats for stats for ' +
                dayjs(currentSelectedDay).format('dddd, MMMM D') +
                '. Stats, if available, are compared to your 30-day average.'
              }
              style={[tw`mt-1`, getCircular('Book')]}
            />
            <PacingDetailsStatsList statsList={dataArray} />
          </View>
          {/* STATS AREA */}
        </View>
      </AppBodyLayout>
    </>
  );
};
