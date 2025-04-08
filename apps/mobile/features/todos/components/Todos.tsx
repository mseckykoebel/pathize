import React, {useState, useCallback, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import tw from 'twrnc';

import {FadeIn, Header2} from '@pathize/mobile-ui';
import {CheckInComplete, UserMedication, UserSymptom} from '@pathize/db';
import {
  getUserMedicationsById,
  getUserSymptomsById,
} from '../../../features/checkIns';
import {getCircular} from '../../../utils';
import {getCheckInsRecordedOnDay as getCheckInsRecordedOnDayFromDb} from '../../checkIns/services';
import {MultiSelectListPrimary} from '../../../components/elements/pickers/MultiSelectListPrimary';
import {HomeStackScreenParamList, useAuth} from '../../../CoreNav';
import {
  useCheckInsContext,
  useMedicationsContext,
  useSymptomsContext,
  useTodayDataContext,
} from '../../../contexts';
import {oneButtonAlert} from '../../../lib';
import {MultiSelectListItem} from '../../../types';

const DEV_MODE = false;
const DUMMY_DATA: MultiSelectListItem[] = Array.from({length: 3}, (_, i) => ({
  id: i.toString(),
  name: `Record item ${i}`,
}));

function convertCheckInToList(
  checkIn: CheckInComplete[],
): MultiSelectListItem[] {
  return checkIn.map(c => ({id: c.id, name: c.name}));
}

export const Todos: React.FC = () => {
  const {userId, accessToken} = useAuth();
  const {today} = useTodayDataContext();
  const {checkIns} = useCheckInsContext();
  const {medicationRecords} = useMedicationsContext();
  const {symptomRecords} = useSymptomsContext();

  const [completedCheckIns, setCompletedCheckIns] = useState<
    MultiSelectListItem[]
  >([]);

  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'RecordCheckIn'>
    >();

  /**
   * @description when an item is pressed, gather data for the check-in and navigate to the record check-in screen
   * TODO: loading state
   */
  const onCheckInPress = useCallback(
    async (item: MultiSelectListItem) => {
      const checkIn = checkIns.find(c => c.id === item.id);
      if (!checkIn) return;

      // setLoading(true);
      try {
        const medicationIds = checkIn.medications.map(m => m.userMedicationId);
        const symptomIds = checkIn.symptoms.map(s => s.userSymptomId);
        const medicationsFromDb = await getUserMedicationsById(
          medicationIds,
          accessToken,
        );
        const symptomsFromDb = await getUserSymptomsById(
          symptomIds,
          accessToken,
        );

        // if either one failed, show error and return
        if (!medicationsFromDb.success || !symptomsFromDb.success) {
          oneButtonAlert(
            'Issue loading check-in',
            'We ran into an issue loading your check-in.',
          );
          return;
        }

        // setLoading(false);
        homeNavigation.navigate('RecordCheckIn', {
          checkIn: checkIn,
          medications: medicationsFromDb.data as UserMedication[],
          symptoms: symptomsFromDb.data as UserSymptom[],
        });
      } catch (err) {
        oneButtonAlert(
          'Issue loading check-in',
          'We ran into an issue loading your check-in.',
        );
      } finally {
        // setLoading(false);
      }
    },
    [checkIns, accessToken, homeNavigation],
  );

  /**
   * @description get the check-ins that have been completed for this day already
   */
  const getCheckInsCheckList = useCallback(async () => {
    try {
      const checkInsCompleted = await getCheckInsRecordedOnDayFromDb(
        userId,
        accessToken,
        today,
      );

      if (!checkInsCompleted.success) {
        setCompletedCheckIns([]);
        return;
      }

      setCompletedCheckIns(
        convertCheckInToList(checkInsCompleted.data as CheckInComplete[]),
      );
    } catch (err) {
      setCompletedCheckIns([]);
    }
  }, [userId, accessToken, today]);

  /**
   * @description update the list of completed checkIns when these items change
   */
  useEffect(() => {
    getCheckInsCheckList();
  }, [
    medicationRecords,
    symptomRecords,
    checkIns,
    today,
    userId,
    accessToken,
    getCheckInsCheckList,
  ]);

  if (!checkIns) return <></>;

  return (
    <FadeIn duration={200} style={[tw`mx-3`]}>
      {/* HEADER */}
      <Header2
        text="Check-ins"
        textStyle={[tw`font-semibold text-slate-950`, getCircular('Bold')]}
        paddingTop={true}
      />
      {/* TODOS AREA */}
      <MultiSelectListPrimary
        style={[tw`mt-0`]}
        items={DEV_MODE ? DUMMY_DATA : checkIns}
        selectedItems={completedCheckIns}
        onItemPress={onCheckInPress}
        disableIfSelected={true}
        changeStyleIfSelected={false}
        screenName="Todos"
      />
    </FadeIn>
  );
};
