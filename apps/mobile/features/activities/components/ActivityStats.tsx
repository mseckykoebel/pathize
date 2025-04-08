import React from 'react';

import {ActivityRecord} from '@pathize/db';
import {ActivityStatsMetadata} from './ActivityStatsMetadata';
import {ActivityStatsHeartRateChart} from './ActivityStatsHeartRateChart';

// TODO:
/**
 * 1. Max HR, Min HR, Avg HR
 * 2. Heart rate sub-chart
 * 3. Time in HR Zones
 */

export const ActivityStats: React.FC<{activity: ActivityRecord}> = ({
  activity,
}) => {
  return (
    <>
      <ActivityStatsHeartRateChart activity={activity} />
      <ActivityStatsMetadata activity={activity} />
    </>
  );
};
