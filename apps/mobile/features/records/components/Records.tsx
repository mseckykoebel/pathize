import React, {memo, useCallback, useEffect} from 'react';
import {View} from 'react-native';
import tw from 'twrnc';

import {Header2, Header3} from '@pathize/mobile-ui';
import {RecordsSectionList} from './RecordsSectionList';
import {
  useCrashesContext,
  useMedicationsContext,
  useSymptomsContext,
  useActivitiesContext,
  useTodayDataContext,
} from '../../../contexts';
import AddNewRecordList from './AddNewRecordList';
import {getCircular} from '../../../utils';

export const Records = memo(() => {
  const {today} = useTodayDataContext();
  const {crashes, getCrashes} = useCrashesContext();
  const {symptomRecords, getSymptomRecords} = useSymptomsContext();
  const {medicationRecords, getMedicationRecords} = useMedicationsContext();
  const {activityRecords, getActivityRecords} = useActivitiesContext();

  const checkIfNoRecords = useCallback((): boolean => {
    if (
      (!crashes || crashes.length === 0) &&
      (!symptomRecords || symptomRecords.length === 0) &&
      (!medicationRecords || medicationRecords.length === 0) &&
      (!activityRecords || activityRecords.length === 0)
    ) {
      return true;
    }

    return false;
  }, [activityRecords, crashes, medicationRecords, symptomRecords]);

  const checkForExistingRecords = useCallback(async () => {
    await getCrashes();
    await getSymptomRecords();
    await getMedicationRecords();
    await getActivityRecords();
  }, [getActivityRecords, getCrashes, getMedicationRecords, getSymptomRecords]);

  useEffect(() => {
    const update = async () => {
      return await checkForExistingRecords();
    };

    update();
  }, [checkForExistingRecords, today]);

  return (
    <View style={tw`m-3`}>
      <Header2
        text="Records"
        textStyle={[tw`mb-1 font-semibold text-slate-950`, getCircular('Book')]}
      />
      {/* ADD NEW RECORDS BUTTONS */}
      <AddNewRecordList />
      {/* LIST OF RECORDS, OR NO RECORDS */}
      <>
        {checkIfNoRecords() ? (
          <Header3
            text="No records for this day"
            textStyle={[
              tw`text-center font-normal text-neutral-500 mt-8 mb-2`,
              getCircular('Book'),
            ]}
          />
        ) : (
          <RecordsSectionList
            crashes={crashes}
            symptoms={symptomRecords}
            medicationRecords={medicationRecords}
            activityRecords={activityRecords}
          />
        )}
      </>
    </View>
  );
});

Records.displayName = 'Records';
