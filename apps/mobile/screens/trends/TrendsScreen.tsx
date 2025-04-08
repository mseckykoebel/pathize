import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {View, Text} from 'react-native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import {NestableScrollContainer} from 'react-native-draggable-flatlist';
import tw from 'twrnc';

import {SymptomTrendsResponse, TrendsResponse} from '@pathize/api';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {MultiSelectListSecondary} from '../../components/elements';
import {
  useTrendsContext,
  TrendsTimeFrame,
  useSymptomRecordsTimeFrame,
  useTrendsData,
  useTerraContext,
} from '../../contexts';
import {ButtonToggleGroup} from '../../components/elements';
import TrendsFilterList from '../../features/trends/components/TrendsFilterList';
import {
  getYAxisModifier,
  getYAxisModifierNoUnits,
  toCamelCase,
  trendCanBeZero,
} from '../../lib';
import {DraggableChartList, setFilterSelectList} from '../../components/charts';
import {TabbedNavigatorParamList} from '../home/HomeNavigator';
import {
  Alert,
  Body1,
  FadeInFadeOut,
  Loading,
  PressableCard,
  Subheader,
} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {ChartConfig} from '../../types';

// GENERATES AN ARRAY OF TREND CHARTS TO DISPLAY
const generateChartConfigs = (
  trendsData: TrendsResponse[] | null,
  symptomData: SymptomTrendsResponse[] | null,
): ChartConfig[] => {
  // from the array of trendsData, set initialKeys to be every key that is not 'date.'
  const chartConfigs: ChartConfig[] = [];

  if (trendsData && trendsData.length > 0) {
    const allPresentTrendKeys = Object.keys(trendsData[0])
      .filter(key => key !== 'date')
      .map(
        key =>
          key.charAt(0).toUpperCase() +
          key
            .slice(1)
            .replace(/([A-Z])/g, ' $1')
            .trim(),
      );

    const trendChartConfigs = allPresentTrendKeys.map(k => {
      const camelCaseKey = toCamelCase(k);
      const maxValue = Math.max(
        ...trendsData.map(item => item[camelCaseKey]?.value ?? 0),
      );
      const minValue = Math.min(
        ...trendsData.map(item => item[camelCaseKey]?.value ?? 0),
      );
      return {
        id: camelCaseKey,
        type: 'trend',
        category: trendsData[0][camelCaseKey]?.category,
        name: k,
        getY: (point: TrendsResponse) => point[camelCaseKey]?.value ?? 0,
        getX: (point: TrendsResponse) => point.date,
        maxValue: maxValue * 1.1,
        minValue: minValue * 0.7,
        yAxisModifier: getYAxisModifier(camelCaseKey),
        yAxisModifierNoUnit: getYAxisModifierNoUnits(camelCaseKey),
        nullCutoff: trendCanBeZero(camelCaseKey) === true ? -1 : 0,
      };
    });

    chartConfigs.push(...(trendChartConfigs as ChartConfig[]));
  }

  // if symptom data is present, add them to chartConfigs
  if (symptomData && symptomData.length > 0) {
    // from the array of symptomData, set allPresentSymptomKeys to be every key that is not 'date.' run fromCamelCase on each key
    const allPresentSymptomKeys = Object.keys(symptomData[0])
      .filter(key => key !== 'date')
      .map(
        key =>
          key.charAt(0).toUpperCase() +
          key
            .slice(1)
            .replace(/([A-Z])/g, ' $1')
            .trim(),
      );

    // for all of the present symptom keys, generate a brand new chartConfig for each one, making sure that the largestId is iterated by 1 for each iteration
    const symptomChartConfigs = allPresentSymptomKeys.map(k => {
      const camelCaseKey = toCamelCase(k);
      return {
        id: camelCaseKey,
        type: 'symptom',
        category: 'Symptom',
        name: k,
        getY: (point: SymptomTrendsResponse) => point[camelCaseKey] ?? 0,
        getX: (point: SymptomTrendsResponse) => point.date,
        maxValue: 5,
        minValue: 0,
        yAxisModifier: getYAxisModifier('symptom'),
        yAxisModifierNoUnit: getYAxisModifier('symptom'),
        nullCutoff: 0,
      } as ChartConfig;
    });

    chartConfigs.push(...(symptomChartConfigs as ChartConfig[]));
  }

  if (chartConfigs.length === 0) return [];

  // post-process hack - if minValue and maxValue are 0 for any chart, remove them
  const namesToRemove = chartConfigs
    .filter(config => config.minValue === 0 && config.maxValue === 0)
    .map(config => config.name);

  // return the chart configs, minus the ones that are all 0
  return chartConfigs.filter(config => !namesToRemove.includes(config.name));
};

type Props = BottomTabScreenProps<TabbedNavigatorParamList, 'TrendsScreen'>;

export const TrendsScreen: React.FC<Props> = () => {
  const {selectedFilterCategory, selectedFilterItems, setSelectedFilterItems} =
    useTrendsContext();
  const {terraDevice: device} = useTerraContext();
  const {selectedTimeFrame, setSelectedTimeFrame} = useTrendsContext();
  const {symptomRecordsTimeFrame: symptomsData} =
    useSymptomRecordsTimeFrame(30);
  const {
    trendsData: trendsData,
    loading: dataLoading,
    shouldUpdate: shouldUpdateCharts,
    error: dataError,
  } = useTrendsData(30);
  const navigation = useNavigation<any>(); // TODO: fix any type

  const [chartWidth, setChartWidth] = useState<number>(0);
  const [chartConfigsTwoWeeks, setChartConfigsTwoWeeks] = useState<
    ChartConfig[] | null
  >(null);
  const [chartConfigsOneMonth, setChartConfigsOneMonth] = useState<
    ChartConfig[] | null
  >(null);
  const [currentlyVisibleChartsTwoWeeks, setCurrentlyVisibleChartsTwoWeeks] =
    useState<ChartConfig[] | null>(null);
  const [currentlyVisibleChartsOneMonth, setCurrentlyVisibleChartsOneMonth] =
    useState<ChartConfig[] | null>(null);

  useEffect(() => {
    const getTrendsDataAndSetUpChartConfigs = () => {
      setChartConfigsOneMonth(generateChartConfigs(trendsData, symptomsData));
      setChartConfigsTwoWeeks(
        generateChartConfigs(
          trendsData ? trendsData.slice(-14) : null,
          symptomsData ? symptomsData.slice(-14) : null,
        ),
      );
    };

    getTrendsDataAndSetUpChartConfigs();
  }, [trendsData, symptomsData, shouldUpdateCharts]);

  // this useEffect handles changing the charts shown on the screen itself
  // based on the selected filter items in the filter area
  useEffect(() => {
    const updateVisibleCharts = (
      chartConfigs: ChartConfig[] | null,
      setter: Dispatch<SetStateAction<ChartConfig[] | null>>,
    ) => {
      if (!chartConfigs) return;

      const chartConfigMap = new Map(
        chartConfigs.map(chart => [chart.id, chart]),
      );
      const selectedFilterItemsMap = new Map(
        selectedFilterItems.map(item => [item.id, item]),
      );

      // keep charts that are in selectedFilterItems
      const newShownCharts = chartConfigs.filter(chart =>
        selectedFilterItemsMap.has(chart.id),
      );

      // add charts from selectedFilterItems that are not in shownCharts
      selectedFilterItems.forEach(item => {
        const chart = chartConfigMap.get(item.id.toString());
        if (
          chart &&
          !newShownCharts.find(shownChart => shownChart.id === item.id)
        ) {
          newShownCharts.push(chart);
        }
      });

      setter(newShownCharts);
    };

    updateVisibleCharts(
      chartConfigsTwoWeeks,
      setCurrentlyVisibleChartsTwoWeeks,
    );
    updateVisibleCharts(
      chartConfigsOneMonth,
      setCurrentlyVisibleChartsOneMonth,
    );
  }, [chartConfigsTwoWeeks, chartConfigsOneMonth, selectedFilterItems]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <NestableScrollContainer
        style={tw`flex-1`}
        showsVerticalScrollIndicator={false}>
        <AppBodyLayout
          dismissKeyboardOnTouch={false}
          padding={false}
          paddingTop={false}
          avoidKeyboard={false}
          scrollable={false}>
          {device ? (
            <>
              {/* BUTTON TOGGLE GROUP */}
              <ButtonToggleGroup<TrendsTimeFrame>
                style={tw`z-10`}
                values={['2 Weeks', '1 Month']}
                value={selectedTimeFrame}
                onSelect={val => setSelectedTimeFrame(val)}
              />
              <View style={tw`px-4`}>
                <View style={tw`flex-1 flex-col`}>
                  <View
                    onLayout={event => {
                      const {width} = event.nativeEvent.layout;
                      setChartWidth(width);
                    }}>
                    {/* SHOWN CHARTS IS NULL */}
                    {!dataLoading &&
                    (!currentlyVisibleChartsTwoWeeks ||
                      currentlyVisibleChartsTwoWeeks?.length === 0) ? (
                      <FadeInFadeOut
                        watchValue={
                          !dataLoading &&
                          (!currentlyVisibleChartsTwoWeeks ||
                            currentlyVisibleChartsTwoWeeks?.length === 0)
                        }>
                        <>
                          <View
                            style={tw`flex justify-center h-30 items-center`}>
                            <Subheader
                              text="Select charts from the lists below to compare aspects of your condition"
                              textColor="neutral"
                              textType="base"
                              style={[
                                tw`text-center w-70`,
                                getCircular('Book'),
                              ]}
                            />
                          </View>
                        </>
                      </FadeInFadeOut>
                    ) : null}
                    {/* 2 WEEK CHART */}
                    {currentlyVisibleChartsTwoWeeks &&
                      selectedTimeFrame === '2 Weeks' && (
                        <DraggableChartList
                          currentlyVisibleCharts={
                            currentlyVisibleChartsTwoWeeks
                          }
                          symptomsData={
                            symptomsData ? symptomsData.slice(-14) : null
                          }
                          trendsData={trendsData ? trendsData.slice(-14) : null}
                          chartWidth={chartWidth}
                          finishX={13}
                        />
                      )}
                    {/* ONE MONTH CHART */}
                    {currentlyVisibleChartsOneMonth &&
                      selectedTimeFrame === '1 Month' && (
                        <DraggableChartList
                          currentlyVisibleCharts={
                            currentlyVisibleChartsOneMonth
                          }
                          symptomsData={symptomsData ?? null}
                          trendsData={trendsData ?? null}
                          chartWidth={chartWidth}
                          finishX={29}
                        />
                      )}
                    {/* DATA LOADING */}
                    {dataLoading && !trendsData ? (
                      <View style={tw`flex justify-center h-30 items-center`}>
                        <Loading loading={dataLoading} />
                      </View>
                    ) : null}
                    {/* BOTTOM SECTION FOR FILTERING THINGS */}
                    <View style={tw`mb-12`}>
                      <Body1
                        text="Filter charts (scroll for more)"
                        padding={true}
                        textStyle={[
                          tw`text-sm font-medium text-slate-900`,
                          getCircular('Book'),
                        ]}
                      />
                      <TrendsFilterList />
                      <MultiSelectListSecondary
                        items={setFilterSelectList(
                          chartConfigsTwoWeeks,
                          symptomsData,
                          selectedFilterCategory,
                        )}
                        selectedItems={selectedFilterItems}
                        setItems={setSelectedFilterItems}
                        screenName="Trends"
                      />
                      <Subheader
                        text="Tip: touch and hold the title of a chart to re-position it in the current shown list"
                        padding={true}
                        textColor="neutral"
                        style={[tw`mx-1 text-sm mt-1`, getCircular('Book')]}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : null}
          {/* NO DEVICE AND NOT LOADING */}
          {!device && !dataLoading ? (
            <View style={[tw`mt-7`]}>
              <PressableCard
                onPress={() =>
                  navigation.navigate('ProfileScreen', {
                    screen: 'Devices',
                  })
                }
                headerText="Connect to Apple Health to view Trends"
                textChild="Connect to Apple Health to correlate records with your biometrics."
                alertChild={'+'}
                headerTextStyle={[tw``, getCircular('Bold')]}
                bodyTextStyle={[tw``, getCircular('Book')]}
                style={[tw`mx-10`]}
              />
            </View>
          ) : null}
          {/* ERROR */}
          {dataError ? (
            <Alert
              headerText="There was an issue getting your Trends"
              alertChild={
                <Text style={tw`text-center text-zinc-900 text-xs font-medium`}>
                  !
                </Text>
              }
              textChild={
                <Text style={tw`text-black text-sm`}>
                  There was an issue fetching your data. Please try again in a
                  few minutes..
                </Text>
              }
              style={[tw`mx-10 mt-10`]}
            />
          ) : null}
        </AppBodyLayout>
      </NestableScrollContainer>
    </MainAppLayout>
  );
};
