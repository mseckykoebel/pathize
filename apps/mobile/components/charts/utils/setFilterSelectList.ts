import {SymptomTrendsResponse} from '@pathize/api';
import {Category} from '../../../contexts';
import {fromCamelCase} from '../../../utils';
import {ChartConfig} from '../../../types';

type FilterItems = {id: string; name: string};

const crashFilterItems: FilterItems[] = [
  {
    id: '100',
    name: 'Crashes/PEM',
  },
];

export function setFilterSelectList(
  chartConfigs: ChartConfig[] | null,
  symptomData: SymptomTrendsResponse[] | null,
  selectedFilterCategory: Category,
): FilterItems[] {
  if (!chartConfigs) return [];
  const heartKeysFromChartConfigs = chartConfigs
    .filter(chart => chart.category === 'Heart')
    .map(chart => chart.id);
  const activityKeysFromChartConfigs = chartConfigs
    .filter(chart => chart.category === 'Activity')
    .map(chart => chart.id);
  const sleepKeysFromChartConfigs = chartConfigs
    .filter(chart => chart.category === 'Sleep')
    .map(chart => chart.id);
  const symptomKeysFromChartConfigs = chartConfigs
    .filter(chart => chart.category === 'Symptom')
    .map(chart => chart.id);

  switch (selectedFilterCategory.category) {
    case 'Crashes':
      return crashFilterItems;
    case 'Heart':
      // map through all of the heart keys and return an array of objects with id and name
      return heartKeysFromChartConfigs.map(name => ({
        id: name,
        name:
          fromCamelCase(name).charAt(0).toUpperCase() +
          fromCamelCase(name).slice(1),
      }));
    case 'Activity':
      return activityKeysFromChartConfigs.map(name => ({
        id: name,
        name:
          fromCamelCase(name).charAt(0).toUpperCase() +
          fromCamelCase(name).slice(1),
      }));
    case 'Sleep':
      return sleepKeysFromChartConfigs.map(name => ({
        id: name,
        name:
          fromCamelCase(name).charAt(0).toUpperCase() +
          fromCamelCase(name).slice(1),
      }));
    case 'Symptom':
      if (!symptomData) return [];
      return symptomKeysFromChartConfigs.map(name => ({
        id: name,
        name:
          fromCamelCase(name).charAt(0).toUpperCase() +
          fromCamelCase(name).slice(1),
      }));
    default:
      return [];
  }
}
