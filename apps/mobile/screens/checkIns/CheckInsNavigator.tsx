import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {CheckInComplete, UserMedication, UserSymptom} from '@pathize/db';
import NewCheckInNameAndTime from './NewCheckInNameAndTime';
import NewCheckInMedications from './NewCheckInMedications';
import NewCheckInSymptoms from './NewCheckInSymptoms';
import NewCheckInConfirm from './NewCheckInConfirm';
import EditCheckIn from './EditCheckIn';
import EditCheckInMedications from './EditCheckInMedications';
import EditCheckInSymptoms from './EditCheckInSymptoms';

export type CheckInNavigatorParamList = {
  /**
   * CREATE A NEW CHECK-IN
   */
  NewCheckInNameAndTime: undefined;
  NewCheckInMedications: {
    checkIn: Pick<CheckInComplete, 'name' | 'time'>;
  };
  NewCheckInSymptoms: {
    checkIn: Pick<CheckInComplete, 'name' | 'time'> & {
      medications: UserMedication[] | [];
    };
  };
  NewCheckInConfirm: {
    checkIn: Pick<CheckInComplete, 'name' | 'time'> & {
      medications: UserMedication[] | [];
      symptoms: UserSymptom[] | [];
    };
  };
  /**
   * EDIT A CHECK IN
   */
  EditCheckIn: {
    checkIn: CheckInComplete;
    medications?: UserMedication[]; // if present, we can skip the API call (these came from the previous screen)
    symptoms?: UserSymptom[]; // if present, we can skip the API call (these came from the previous screen)
  };
  EditCheckInMedications: {
    checkIn: CheckInComplete;
    medications?: UserMedication[];
  };
  EditCheckInSymptoms: {
    checkIn: CheckInComplete;
    symptoms?: UserSymptom[];
  };
  /**
   * RECORD A CHECK IN
   */
  RecordCheckIn: {
    checkIn: CheckInComplete;
    medications: UserMedication[];
    symptoms: UserSymptom[];
  };
};

const CheckInStack = createStackNavigator<CheckInNavigatorParamList>();

const CheckInNavigator: React.FC = () => {
  return (
    <CheckInStack.Navigator screenOptions={{headerShown: false}}>
      {/* NAME AND TIME */}
      <CheckInStack.Screen
        name="NewCheckInNameAndTime"
        component={NewCheckInNameAndTime}
      />
      {/* MEDICATIONS */}
      <CheckInStack.Screen
        name="NewCheckInMedications"
        component={NewCheckInMedications}
      />
      {/* SYMPTOMS */}
      <CheckInStack.Screen
        name="NewCheckInSymptoms"
        component={NewCheckInSymptoms}
      />
      {/* CONFIRM */}
      <CheckInStack.Screen
        name="NewCheckInConfirm"
        component={NewCheckInConfirm}
      />
      {/* EDIT CHECK IN */}
      <CheckInStack.Screen name="EditCheckIn" component={EditCheckIn} />
      {/* EDIT CHECK IN MEDICATIONS */}
      <CheckInStack.Screen
        name="EditCheckInMedications"
        component={EditCheckInMedications}
      />
      {/* EDIT CHECK IN SYMPTOMS */}
      <CheckInStack.Screen
        name="EditCheckInSymptoms"
        component={EditCheckInSymptoms}
      />
    </CheckInStack.Navigator>
  );
};

export default CheckInNavigator;
