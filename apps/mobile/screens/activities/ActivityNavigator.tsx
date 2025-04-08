import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {ActivityRecord, UserActivity} from '@pathize/db';
import AddNewActivityRecord from './AddNewActivityRecord';
import ConfirmNewActivityRecord from './ConfirmNewActivityRecord';
import NewActivityRecordTimeRange from './NewActivityRecordTimeRange';
import EditActivityRecord from './EditActivityRecord';
import EditActivityRecordTimeRange from './EditActivityRecordTimeRange';
import NewUserActivitySearch from './NewUserActivitySearch';
import NewUserActivityPriority from './NewUserActivityPriority';
import NewUserActivityConfirm from './NewUserActivityConfirm';
import NewUserActivityIcon from './NewUserActivityIcon';
import NewUserActivityName from './NewUserActivityName';
import EditUserActivity from './EditUserActivity';
import EditUserActivityIcon from './EditUserActivityIcon';
import NewActivityRecordAppleWatch from './NewActivityRecordAppleWatch';

export type ActivityNavigatorParamList = {
  // NEW USER ACTIVITY
  NewUserActivitySearch: undefined;
  // non-custom
  NewUserActivityPriority: {
    activity: Pick<UserActivity, 'activityName' | 'activityIcon'> & {
      activityId?: UserActivity['activityId']; // activityId is optional
    };
  };
  NewUserActivityConfirm: {
    activity: Pick<UserActivity, 'activityName' | 'activityIcon'> & {
      activityPriority?: UserActivity['activityPriority']; // activityPriority is optional
      activityId?: UserActivity['activityId']; // activityId is optional
    };
  };
  // custom
  NewUserActivityIcon: undefined;
  NewUserActivityName: {
    activity: Pick<UserActivity, 'activityIcon'>;
  };
  // EDIT USER ACTIVITY
  EditUserActivity: {
    activity: UserActivity;
  };
  EditUserActivityIcon: {
    activity: UserActivity;
  };
  // NEW ACTIVITY RECORD
  AddNewActivityRecord: {
    activity: UserActivity;
  };
  ConfirmNewActivityRecord: {
    activity: UserActivity & {
      activityTotalTime?: number;
    };
  };
  NewActivityRecordTimeRange: {
    activity: UserActivity & {
      activityTotalTime?: number;
    };
  };
  // SHEET THAT WILL LAUNCH THE APPLE WATCH APP
  NewActivityRecordAppleWatch: {
    activity: UserActivity;
  };
  // EDIT NEW ACTIVITY RECORD
  EditActivityRecord: {
    activity: ActivityRecord;
  };
  EditActivityRecordTimeRange: {
    activity: ActivityRecord;
  };
};

const ActivityNavigator = createStackNavigator<ActivityNavigatorParamList>();

const ActivitiesNavigator: React.FC = () => {
  return (
    <ActivityNavigator.Navigator screenOptions={{headerShown: false}}>
      {/* NEW USER ACTIVITY */}
      <ActivityNavigator.Screen
        name="NewUserActivitySearch"
        component={NewUserActivitySearch}
      />
      <ActivityNavigator.Screen
        name="NewUserActivityPriority"
        component={NewUserActivityPriority}
      />
      <ActivityNavigator.Screen
        name="NewUserActivityConfirm"
        component={NewUserActivityConfirm}
      />
      {/* CUSTOM */}
      <ActivityNavigator.Screen
        name="NewUserActivityIcon"
        component={NewUserActivityIcon}
      />
      <ActivityNavigator.Screen
        name="NewUserActivityName"
        component={NewUserActivityName}
      />
      {/* EDIT USER ACTIVITY */}
      <ActivityNavigator.Screen
        name="EditUserActivity"
        component={EditUserActivity}
      />
      <ActivityNavigator.Screen
        name="EditUserActivityIcon"
        component={EditUserActivityIcon}
      />

      {/* ADD ACTIVITY RECORDS */}
      <ActivityNavigator.Screen
        name="AddNewActivityRecord"
        component={AddNewActivityRecord}
      />
      <ActivityNavigator.Screen
        name="NewActivityRecordAppleWatch"
        component={NewActivityRecordAppleWatch}
      />
      <ActivityNavigator.Screen
        name="ConfirmNewActivityRecord"
        component={ConfirmNewActivityRecord}
      />
      <ActivityNavigator.Screen
        name="NewActivityRecordTimeRange"
        component={NewActivityRecordTimeRange}
      />
      {/* EDIT ACTIVITY RECORDS */}
      <ActivityNavigator.Screen
        name="EditActivityRecord"
        component={EditActivityRecord}
      />
      <ActivityNavigator.Screen
        name="EditActivityRecordTimeRange"
        component={EditActivityRecordTimeRange}
      />
    </ActivityNavigator.Navigator>
  );
};

export default ActivitiesNavigator;
