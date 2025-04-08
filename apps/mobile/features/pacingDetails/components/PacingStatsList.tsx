import React from 'react';
import {FlatList} from 'react-native';
import tw from 'twrnc';

import {getCircular, timeConvert} from '../../../utils';
import {StatListItem} from '@pathize/mobile-ui';
import {PacingStatsListProps} from '../types';

export const PacingStatsList: React.FC<{statsList: PacingStatsListProps[]}> = ({
  statsList,
}) => {
  const renderItem = ({item}: {item: PacingStatsListProps}) => {
    return (
      <StatListItem
        title={item.name}
        titleStyle={[tw`text-cyan-950`, getCircular('Book')]}
        stat={
          item.stat !== undefined
            ? item.convertMinutes
              ? timeConvert(item.stat)
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
        percentStat={item.percentage !== undefined ? `${item.percentage}%` : ''}
        percentStatStyle={[tw`text-neutral-500`, getCircular('Book')]}
        subtext={item.percentage !== undefined ? 'vs. 30-day avg.' : ''}
        subtextStyle={[tw`text-neutral-500`, getCircular('Book')]}
        style={[tw`p-3 mb-2 bg-gray-100 flex-grow`]}
      />
    );
  };

  return (
    <FlatList
      style={[tw`mb-1`]}
      scrollEnabled={false}
      numColumns={1}
      data={statsList}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};
