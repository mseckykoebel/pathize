import React from 'react';
import {FlatList} from 'react-native';
import tw from 'twrnc';

import {Header2, StatListItem, Subheader} from '@pathize/mobile-ui';
import {getCircular, timeConvert} from '../../../utils';
import {PacingDetailsStatsListProps} from '../types';

export const PacingDetailsStatsList: React.FC<{
  statsList: PacingDetailsStatsListProps[];
}> = ({statsList}) => {
  const renderItem = ({item}: {item: PacingDetailsStatsListProps}) => {
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
            paddingBottom={true}
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
                ? item.name !== 'Time above limit'
                  ? timeConvert(item.stat / 60)
                  : timeConvert(item.stat)
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
          subtext={item.percentage !== undefined ? 'vs. 30-day avg.' : ''}
          subtextStyle={[tw`text-neutral-500`, getCircular('Book')]}
          style={[tw`p-3 my-1 bg-gray-100 flex-grow`]}
        />
      </>
    );
  };

  return (
    <FlatList
      style={[tw`mt-3`]}
      scrollEnabled={false}
      numColumns={1}
      data={statsList}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};
