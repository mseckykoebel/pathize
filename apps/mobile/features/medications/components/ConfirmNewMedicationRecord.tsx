import React, {useState} from 'react';
import {Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {usePostHog} from 'posthog-react-native';
import advancedformat from 'dayjs/plugin/advancedFormat';
import dayjs from 'dayjs';
import tw from 'twrnc';

dayjs.extend(advancedformat);

import {Header1, ListBox, PrimaryButton, Subheader} from '@pathize/mobile-ui';
import {AppBodyLayout} from '../../../components/layouts';
import {HomeStackScreenParamList} from '../../../CoreNav';
import {useTodayDataContext, useMedicationsContext} from '../../../contexts';
import {SheetNavbar} from '../../../components/sheets';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {getCircular} from '../../../utils';

const MedicationTimeChild: React.FC<{time: string}> = ({time}) => {
  return (
    <Text
      style={[
        getCircular('Book'),
        tw`h-5 text-black text-opacity-80 text-base leading-tight`,
      ]}>
      {time}
    </Text>
  );
};

type Props = StackScreenProps<
  MedicationNavigatorParamList,
  'ConfirmNewMedicationRecord'
>;

const ConfirmNewMedicationRecord: React.FC<Props> = ({route}) => {
  const {medications} = route.params;
  const isArrayOfMedications = Array.isArray(medications);
  const {today} = useTodayDataContext();
  const [date, setDate] = useState(new Date());
  const {
    createMedicationRecord,
    getMedicationRecords,
    createMedicationRecordLoading,
    createMedicationRecordError,
  } = useMedicationsContext();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Medications'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(
    createMedicationRecordError,
    createMedicationRecordLoading,
    handleClosePress,
  );

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
        navigation={homeNavigation}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={false}
        scrollable={true}
        padding={false}
        paddingSides={true}
        navigator={homeNavigation}
        swipeToDismiss={true}
        route="Home"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <PrimaryButton
            text="Save"
            rounded="small"
            width="half"
            loading={createMedicationRecordLoading}
            padding={false}
            onPress={async () => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'ConfirmNewMedicationRecord',
                value: 'Save',
              });

              if (isArrayOfMedications) {
                await Promise.all(
                  medications.map(med =>
                    createMedicationRecord(
                      date,
                      today,
                      med.medicationId, // medication ID, if it is present
                      med.id, // user medication ID, referencing the user_medication record
                      med.medicationName!,
                      med.type,
                      med.unit!,
                      med.strength!,
                      false,
                    ),
                  ),
                );

                await getMedicationRecords();
              } else {
                await createMedicationRecord(
                  date,
                  today,
                  medications.medicationId,
                  medications.id,
                  medications.medicationName!,
                  medications.type,
                  medications.unit!,
                  medications.strength!,
                  true,
                );
              }
            }}
            textStyle={[getCircular('Bold'), tw``]}
            style={[tw`mt-3`]}
          />
        }>
        {/* HEADER */}
        <Header1
          text={
            isArrayOfMedications
              ? `Confirm recording time for your ${
                  medications.length
                } medication${medications.length > 1 ? 's' : ''}`
              : 'Confirm recording time'
          }
          paddingBottom={true}
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* SUBHEADER */}
        <Subheader
          paddingBottom={false}
          text={`Recording for ${dayjs(today).format('MMMM Do')}.`}
          style={[tw``, getCircular('Book')]}
        />
        {/* CHOOSING THE TIME */}
        <ListBox
          style={tw`mb-3`}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<MedicationTimeChild time={'Recording time'} />}
          rightChild={
            <DateTimePicker
              onChange={(e, d) => {
                if (!d) return;
                setDate(d);
              }}
              mode="time"
              value={date}
            />
          }
        />
      </AppBodyLayout>
    </>
  );
};

export default ConfirmNewMedicationRecord;
