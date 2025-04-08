import React, {memo, useState, useEffect, useMemo} from 'react';
import {ActivityIndicator, TouchableOpacity, View} from 'react-native';
import {
  RenderItemParams,
  ScaleDecorator,
  ShadowDecorator,
  OpacityDecorator,
  NestableDraggableFlatList,
} from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {trigger} from 'react-native-haptic-feedback';
import tw from 'twrnc';

import {SymptomTrendsResponse, TrendsResponse} from '@pathize/api';
import {TrendChart} from './TrendChart';
import {useCrashesTimeFrame, useTerraContext} from '../../contexts';
import {FadeInView} from '../layouts';
import {ChartConfig} from '../../types';

interface DraggableChartListProps {
  currentlyVisibleCharts: ChartConfig[];
  trendsData: TrendsResponse[] | null;
  symptomsData: SymptomTrendsResponse[] | null;
  chartWidth: number;
  finishX: number;
}

export const DraggableChartList: React.FC<DraggableChartListProps> = memo(
  ({currentlyVisibleCharts, trendsData, symptomsData, chartWidth, finishX}) => {
    const {crashesTimeFrame: crashesLastMonth} = useCrashesTimeFrame(30);
    const {terraDevice} = useTerraContext();
    const [chartData, setChartData] = useState<ChartConfig[]>(
      currentlyVisibleCharts,
    );
    const [loading, setLoading] = useState(true);

    // Memoize crash data
    const memoizedCrashesLastMonth = useMemo(
      () => crashesLastMonth,
      [crashesLastMonth],
    );

    useEffect(() => {
      const fetchSavedOrder = async () => {
        if (!terraDevice) {
          await AsyncStorage.removeItem('trendsSortOrder');
          return;
        }
        const savedOrder = await getChartOrder();

        if (savedOrder) {
          const sortedCharts = [...currentlyVisibleCharts].sort((a, b) => {
            const aIndex = savedOrder.indexOf(a.name);
            const bIndex = savedOrder.indexOf(b.name);

            // Handle missing charts in saved order by placing them at the end
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;

            return aIndex - bIndex;
          });

          setChartData(sortedCharts);
        } else {
          // saved order not found, use default order
          setChartData(currentlyVisibleCharts);
        }

        setLoading(false);
      };

      fetchSavedOrder();
    }, [currentlyVisibleCharts, terraDevice]);

    const saveChartOrder = async (chartIds: string[]) => {
      try {
        await AsyncStorage.setItem('trendsSortOrder', JSON.stringify(chartIds));
      } catch (error) {
        console.error('Failed to save chart order', error);
      }
    };

    const getChartOrder = async () => {
      try {
        const storedOrder = await AsyncStorage.getItem('trendsSortOrder');
        if (storedOrder) return JSON.parse(storedOrder);

        return null;
      } catch (error) {
        console.error('Failed to get chart order', error);
        return null;
      }
    };

    const renderItem = ({item, drag}: RenderItemParams<ChartConfig>) => {
      return (
        <ScaleDecorator>
          <ShadowDecorator>
            <OpacityDecorator>
              <TouchableOpacity activeOpacity={1} onLongPress={drag}>
                <FadeInView duration={250}>
                  <View style={tw`mb-6`}>
                    {item.type === 'symptom' && symptomsData ? (
                      <TrendChart
                        finishX={finishX}
                        chartName={item.name}
                        chartHeight={120}
                        chartWidth={chartWidth}
                        maxValue={item.maxValue}
                        minValue={item.minValue}
                        dataPoints={symptomsData.map(
                          (symptomDataPoint, index) => {
                            return {
                              x: index,
                              y: item.getY(symptomDataPoint),
                            };
                          },
                        )}
                        yAxisModifier={item.yAxisModifier}
                        yAxisModifierNoUnit={item.yAxisModifierNoUnit}
                        nullCutoff={item.nullCutoff}
                        crashDataPoints={memoizedCrashesLastMonth}
                        type="symptom"
                      />
                    ) : null}
                    {item.type === 'trend' && trendsData ? (
                      <TrendChart
                        finishX={finishX}
                        chartName={item.name}
                        chartHeight={120}
                        chartWidth={chartWidth}
                        maxValue={item.maxValue}
                        minValue={item.minValue}
                        dataPoints={trendsData.map((trendDataPoint, index) => {
                          return {
                            x: index,
                            y: item.getY(trendDataPoint),
                          };
                        })}
                        yAxisModifier={item.yAxisModifier}
                        yAxisModifierNoUnit={item.yAxisModifierNoUnit}
                        nullCutoff={item.nullCutoff}
                        crashDataPoints={memoizedCrashesLastMonth}
                        type="trend"
                      />
                    ) : null}
                  </View>
                </FadeInView>
              </TouchableOpacity>
            </OpacityDecorator>
          </ShadowDecorator>
        </ScaleDecorator>
      );
    };

    if (loading)
      return (
        <ActivityIndicator
          style={{height: currentlyVisibleCharts.length * 202}}
        />
      );

    return (
      <NestableDraggableFlatList
        data={chartData}
        keyExtractor={item => item.name}
        renderItem={renderItem}
        onDragBegin={() => trigger('impactLight')}
        onDragEnd={({data}) => {
          trigger('impactLight');
          if (JSON.stringify(data) !== JSON.stringify(chartData)) {
            setChartData(data);
            saveChartOrder(data.map(chart => chart.name));
          }
        }}
      />
    );
  },
);
