import React from 'react';
import {FlatList} from 'react-native';
import {HeartRateDataSample} from 'terra-api/lib/cjs/models/samples/HeartRateDataSample';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {ActivityRecord} from '@pathize/db';
import {getTimeAboveLimit} from '@pathize/lib';
import {FadeIn, StatListItem} from '@pathize/mobile-ui';
import {useLimitContext, usePathizeSelectedDayContext} from '../../../contexts';
import {getCircular, timeConvert} from '../../../utils';

type ActivityStatsProps = {
  id: string;
  name: string;
  value: number | string;
};

const devData: ActivityStatsProps[] = [
  {
    id: '0',
    name: 'Max HR',
    value: 180,
  },
  {
    id: '1',
    name: 'Min HR',
    value: 60,
  },
  {
    id: '2',
    name: 'Avg HR',
    value: 120,
  },
  {
    id: '3',
    name: 'Time above limit',
    value: '1h 3m',
  },
];

type ActivityStatsListProps = {
  stats: ActivityStatsProps[];
};

const ActivityStatsList: React.FC<ActivityStatsListProps> = ({stats}) => {
  const renderItem = ({
    item,
    index,
  }: {
    item: ActivityStatsProps;
    index: number;
  }) => {
    const evenItemStyle = index % 2 === 0 ? tw`mr-3` : null;

    return (
      <StatListItem
        title={item.name}
        titleStyle={[tw`text-cyan-950`, getCircular('Book')]}
        stat={
          typeof item.value === 'string'
            ? item.value
            : String(Math.trunc(item.value))
        }
        statStyle={[tw`text-2xl text-slate-950`, getCircular('Book')]}
        padding={true}
        percentStat={''}
        subtext={''}
        style={[tw`flex-1 mb-0 p-3 bg-gray-100`, evenItemStyle]}
      />
    );
  };

  return (
    <FlatList
      style={[tw`mb-1`]}
      scrollEnabled={false}
      numColumns={2}
      data={stats}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

type Props = {
  activity: ActivityRecord;
};

export const ActivityStatsMetadata: React.FC<Props> = ({activity}) => {
  const {
    state: {metadata},
  } = usePathizeSelectedDayContext();
  const {limit} = useLimitContext();
  const isDev = process.env.NODE_ENV === 'development';

  if (!metadata || !metadata.heartRateSamples || !activity.activityTotalTime) {
    return null;
  }

  const activityStartTime = dayjs(activity.time);
  const activityEndTime = activityStartTime.add(
    activity.activityTotalTime,
    'minute',
  );

  const relevantHeartRateDataSamples = metadata.heartRateSamples.filter(
    (sample: HeartRateDataSample) => {
      const sampleTime = dayjs(sample.timestamp);
      return (
        sampleTime.isAfter(activityStartTime) &&
        sampleTime.isBefore(activityEndTime)
      );
    },
  );

  if (relevantHeartRateDataSamples.length === 0) {
    return null;
  }

  const minHr = Math.min(...relevantHeartRateDataSamples.map(item => item.bpm));
  const maxHr = Math.max(...relevantHeartRateDataSamples.map(item => item.bpm));
  const avgHr =
    relevantHeartRateDataSamples.reduce((sum, item) => sum + item.bpm, 0) /
    relevantHeartRateDataSamples.length;
  const timeSpentAboveLimit = limit
    ? getTimeAboveLimit(relevantHeartRateDataSamples, limit)
    : 0;

  const activityStatsArray: ActivityStatsProps[] = [
    {
      id: '0',
      name: 'Max HR',
      value: maxHr,
    },
    {
      id: '1',
      name: 'Min HR',
      value: minHr,
    },
    {
      id: '2',
      name: 'Avg HR',
      value: avgHr,
    },
    {
      id: '3',
      name: 'Time above limit',
      value: timeConvert(timeSpentAboveLimit),
    },
  ];

  return (
    <FadeIn duration={250} style={[tw`mt-3 flex flex-col`]}>
      <ActivityStatsList stats={isDev ? devData : activityStatsArray} />
    </FadeIn>
  );
};
