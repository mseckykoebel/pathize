import React from 'react';
import {View, Text, FlatList} from 'react-native';
import tw from 'twrnc';

import {Header2, StatListItem, Subheader} from '@pathize/mobile-ui';
import {getCircular, timeConvert} from '../../../utils';
import {EnergyGuidanceDetailsStatsListProps} from '../types';

/**
 * @description render the chart on the right for each stat
 */
const RightChild: React.FC<{
  statsList: EnergyGuidanceDetailsStatsListProps;
}> = ({statsList}) => {
  // if one of minValue, maxValue, and stat are undefined, return null

  if (statsList.maxValue === undefined || statsList.stat === undefined) {
    return null;
  }

  const effectiveMinValue = statsList.useZeroAsMin
    ? 0
    : statsList.minValue || 0;
  const effectiveMaxValue = statsList.maxValue || 0;

  // Determine the clamped position based on stat value
  let clampedPosition;
  if (statsList.stat > effectiveMaxValue) {
    clampedPosition = 99; // 99 because slightly off for some reason from right
  } else if (statsList.stat < effectiveMinValue) {
    clampedPosition = 0;
  } else if (effectiveMinValue !== effectiveMaxValue) {
    // Avoid division by zero
    clampedPosition =
      ((statsList.stat - effectiveMinValue) /
        (effectiveMaxValue - effectiveMinValue)) *
      98;
  } else {
    clampedPosition = 0; // If min and max are equal, position is 0
  }

  // Clamp the position between 0 and 100 just in case
  const finalClampedPosition = Math.min(100, Math.max(0, clampedPosition));

  return (
    <View style={tw`relative`}>
      <View style={tw`flex flex-row items-center`}>
        <View style={tw`absolute w-full h-0.3 bg-zinc-300`} />
        <View
          style={[
            tw`absolute w-2 h-2 rounded-full`,
            finalClampedPosition === 0 || finalClampedPosition === 99
              ? tw`bg-slate-950`
              : tw`bg-neutral-500`,
            {left: `${finalClampedPosition}%`},
            {marginTop: -6, marginLeft: -6},
          ]}
        />
      </View>
      <View style={tw`flex flex-row justify-between mt-2`}>
        <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
          {statsList.convertMinutes
            ? timeConvert(effectiveMinValue / 60)
            : effectiveMinValue}
        </Text>
        <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
          {statsList.convertMinutes
            ? timeConvert(effectiveMaxValue / 60)
            : effectiveMaxValue}
        </Text>
      </View>
    </View>
  );
};

export const EnergyBudgetStatsList: React.FC<{
  statsList: EnergyGuidanceDetailsStatsListProps[];
}> = ({statsList}) => {
  const renderItem = ({item}: {item: EnergyGuidanceDetailsStatsListProps}) => {
    return (
      <>
        {item.statHeader && (
          <Header2
            padding={false}
            text={item.statHeader}
            textStyle={[
              tw`mt-3 mb-1 font-semibold text-slate-950`,
              getCircular('Book'),
            ]}
          />
        )}
        {item.statSubheader && (
          <Subheader
            padding={false}
            style={[tw``, getCircular('Book')]}
            text={item.statSubheader}
          />
        )}
        <StatListItem
          title={item.name}
          titleStyle={[tw`text-cyan-950`, getCircular('Book')]}
          stat={
            item.stat !== undefined
              ? item.convertMinutes
                ? timeConvert(item.stat / 60)
                : String(Math.trunc(item.stat))
              : ''
          }
          statStyle={[tw`text-2xl text-slate-950`, getCircular('Book')]}
          up={
            item.percentage !== undefined
              ? item.percentage > 0
                ? true
                : false
              : undefined
          }
          padding={false}
          percentStat={
            item.percentage !== undefined ? `${item.percentage}%` : ''
          }
          percentStatStyle={[tw`text-neutral-500`, getCircular('Book')]}
          subtext={item.percentage !== undefined ? 'vs. PEM days' : ''}
          subtextStyle={[tw`text-neutral-500`, getCircular('Book')]}
          rightChild={<RightChild statsList={item} />}
          style={[tw`p-3 my-1 bg-gray-100 flex-grow`]}
        />
      </>
    );
  };

  return (
    <FlatList
      style={[tw`pb-10`]}
      scrollEnabled={false}
      numColumns={1}
      data={statsList}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};
