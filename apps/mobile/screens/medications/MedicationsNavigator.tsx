import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {MedicationRecord, UserMedication} from '@pathize/db';
import AddNewMedicationRecord from '../../features/medications/components/AddNewMedicationRecord';
import ConfirmNewMedicationRecord from '../../features/medications/components/ConfirmNewMedicationRecord';
import EditMedicationRecord from '../../features/medications/components/EditMedicationRecord';
import NewUserMedicationSearch from '../../features/medications/components/NewUserMedicationSearch';
import NewUserMedicationType from '../../features/medications/components/NewUserMedicationType';
import NewUserMedicationStrength from '../../features/medications/components/NewUserMedicationStrength';
import NewUserMedicationConfirm from '../../features/medications/components/NewUserMedicationConfirm';
import EditUserMedication from '../../features/medications/components/EditUserMedication';
import NewUserMedicationName from '../../features/medications/components/NewUserMedicationName';

const MedicationStack = createStackNavigator<MedicationNavigatorParamList>();

export type MedicationNavigatorParamList = {
  // NEW USER MEDICATION
  NewUserMedicationSearch: undefined;
  NewUserMedicationType: {
    medication: Pick<UserMedication, 'medicationName'> & {
      medicationId?: UserMedication['medicationId'];
    }; // medicationId is optional
  };
  NewUserMedicationStrength: {
    medication: Pick<UserMedication, 'medicationName' | 'type'> & {
      medicationId?: UserMedication['medicationId'];
    }; // medicationId is optional;
  };
  NewUserMedicationConfirm: {
    medication: Pick<
      UserMedication,
      'medicationName' | 'type' | 'unit' | 'strength'
    > & {
      medicationId?: UserMedication['medicationId'];
    }; // medicationId is optional;
  };
  ////
  // CUSTOM USER MEDICATION
  ////
  NewUserMedicationName: undefined;
  // EDIT USER MEDICATION
  EditUserMedication: {
    medication: UserMedication;
  };
  ////
  // NEW MEDICATION RECORD
  ////
  AddNewMedicationRecord: undefined;
  ConfirmNewMedicationRecord: {
    medications: UserMedication | UserMedication[];
  };
  ////
  // EDIT MEDICATION RECORD
  ////
  EditMedicationRecord: {
    medication: MedicationRecord;
  };
};

const MedicationsNavigator: React.FC = () => {
  return (
    <MedicationStack.Navigator screenOptions={{headerShown: false}}>
      {/* NEW USER MEDICATION */}
      <MedicationStack.Screen
        name="NewUserMedicationSearch"
        component={NewUserMedicationSearch}
      />
      <MedicationStack.Screen
        name="NewUserMedicationType"
        component={NewUserMedicationType}
      />
      <MedicationStack.Screen
        name="NewUserMedicationStrength"
        component={NewUserMedicationStrength}
      />
      <MedicationStack.Screen
        name="NewUserMedicationConfirm"
        component={NewUserMedicationConfirm}
      />
      {/* CUSTOM USER MEDICATION */}
      <MedicationStack.Screen
        name="NewUserMedicationName"
        component={NewUserMedicationName}
      />
      {/* EDIT USER MEDICATION */}
      <MedicationStack.Screen
        name="EditUserMedication"
        component={EditUserMedication}
      />
      {/* NEW MEDICATION RECORD */}
      <MedicationStack.Screen
        name="AddNewMedicationRecord"
        component={AddNewMedicationRecord}
      />
      <MedicationStack.Screen
        name="ConfirmNewMedicationRecord"
        component={ConfirmNewMedicationRecord}
      />
      {/* EDIT MEDICATION RECORD */}
      <MedicationStack.Screen
        name="EditMedicationRecord"
        component={EditMedicationRecord}
      />
    </MedicationStack.Navigator>
  );
};

export default MedicationsNavigator;
