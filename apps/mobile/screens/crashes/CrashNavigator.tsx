import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {Crash} from '@pathize/db';
import NewCrashRecord from '../../features/crashes/components/NewCrashRecord';
import NewCrashRecordTotalTime from '../../features/crashes/components/NewCrashRecordTotalTime';
import NewCrashRecordSeverity from '../../features/crashes/components/NewCrashRecordSeverity';
import EditCrashRecord from '../../features/crashes/components/EditCrashRecord';
import EditCrashRecordTotalTime from '../../features/crashes/components/EditCrashRecordTotalTime';
import EditCrashRecordSeverity from '../../features/crashes/components/EditCrashRecordSeverity';

const CrashStack = createStackNavigator<CrashNavigatorParamList>();

export type CrashNavigatorParamList = {
  NewCrashRecord: {
    crashTotalTime: number | null;
    severity: number | null;
  };
  NewCrashRecordTotalTime: {
    crashTotalTime: number | null;
    severity: number | null;
  };
  NewCrashRecordSeverity: {
    crashTotalTime: number | null;
    severity: number | null;
  };
  EditCrashRecord: {crash: Crash};
  EditCrashRecordTotalTime: {crash: Crash};
  EditCrashRecordSeverity: {crash: Crash};
};

const CrashNavigator: React.FC = () => {
  return (
    <CrashStack.Navigator screenOptions={{headerShown: false}}>
      <CrashStack.Screen name="NewCrashRecord" component={NewCrashRecord} />
      <CrashStack.Screen
        name="NewCrashRecordTotalTime"
        component={NewCrashRecordTotalTime}
      />
      <CrashStack.Screen
        name="NewCrashRecordSeverity"
        component={NewCrashRecordSeverity}
      />
      <CrashStack.Screen name="EditCrashRecord" component={EditCrashRecord} />
      <CrashStack.Screen
        name="EditCrashRecordTotalTime"
        component={EditCrashRecordTotalTime}
      />
      <CrashStack.Screen
        name="EditCrashRecordSeverity"
        component={EditCrashRecordSeverity}
      />
    </CrashStack.Navigator>
  );
};

export default CrashNavigator;
