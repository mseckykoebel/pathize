import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import {SymptomRecord, UserSymptom} from '@pathize/db';
import ConfirmNewSymptomRecord from '../../features/symptoms/components/ConfirmNewSymptomRecord';
import AddNewSymptomRecord from '../../features/symptoms/components/AddNewSymptomRecord';
import EditSymptomRecord from '../../features/symptoms/components/EditSymptomRecord';
import EditUserSymptom from '../../features/symptoms/components/EditUserSymptom';
import NewUserSymptomSearch from '../../features/symptoms/components/NewUserSymptomSearch';
import NewUserSymptomConfirm from '../../features/symptoms/components/NewUserSymptomConfirm';
import NewUserSymptomName from '../../features/symptoms/components/NewUserSymptomName';
import NewUserSymptomIcon from '../../features/symptoms/components/NewUserSymptomIcon';
import EditUserSymptomIcon from '../../features/symptoms/components/EditUserSymptomIcon';

const SymptomStack = createStackNavigator<SymptomNavigatorParamList>();

export type SymptomNavigatorParamList = {
  // NEW USER SYMPTOM
  NewUserSymptomSearch: undefined;
  NewUserSymptomConfirm: {
    symptom: Pick<UserSymptom, 'category' | 'name'> & {
      symptomId?: UserSymptom['symptomId']; // symptomId is optional/not present if it is a custom symptom
      description?: UserSymptom['description']; // description is optional
    };
  };

  // custom
  NewUserSymptomIcon: undefined;
  NewUserSymptomName: {
    symptom: Pick<UserSymptom, 'category'>;
  };

  // EDIT USER SYMPTOM
  EditUserSymptom: {
    symptom: UserSymptom;
  };
  EditUserSymptomIcon: {
    symptom: UserSymptom;
  };
  // SYMPTOM RECORDS
  AddNewSymptomRecord: undefined;
  ConfirmNewSymptomRecord: {
    symptoms: UserSymptom | UserSymptom[];
  };
  // EDIT SYMPTOM RECORD
  EditSymptomRecord: {
    symptom: SymptomRecord;
  };
};

const SymptomsNavigator: React.FC = () => {
  return (
    <SymptomStack.Navigator screenOptions={{headerShown: false}}>
      {/* NEW USER SYMPTOM */}
      <SymptomStack.Screen
        name="NewUserSymptomSearch"
        component={NewUserSymptomSearch}
      />
      <SymptomStack.Screen
        name="NewUserSymptomConfirm"
        component={NewUserSymptomConfirm}
      />
      {/* CUSTOM */}
      <SymptomStack.Screen
        name="NewUserSymptomIcon"
        component={NewUserSymptomIcon}
      />
      <SymptomStack.Screen
        name="NewUserSymptomName"
        component={NewUserSymptomName}
      />
      {/* EDIT USER SYMPTOM */}
      <SymptomStack.Screen name="EditUserSymptom" component={EditUserSymptom} />
      <SymptomStack.Screen
        name="EditUserSymptomIcon"
        component={EditUserSymptomIcon}
      />

      {/* SYMPTOM RECORDS */}
      <SymptomStack.Screen
        name="AddNewSymptomRecord"
        component={AddNewSymptomRecord}
      />
      <SymptomStack.Screen
        name="ConfirmNewSymptomRecord"
        component={ConfirmNewSymptomRecord}
      />
      <SymptomStack.Screen
        name="EditSymptomRecord"
        component={EditSymptomRecord}
      />
    </SymptomStack.Navigator>
  );
};

export default SymptomsNavigator;
