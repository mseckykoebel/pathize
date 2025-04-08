import React, {useState} from 'react';
import {Text} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {HomeStackScreenParamList} from '../../../CoreNav';
import {getCircular} from '../../../utils';
import {AppBodyLayout} from '../../../components/layouts';
import {useMedicationsContext} from '../../../contexts';
import {twoButtonAlert} from '../../../lib';
import {SheetNavbar} from '../../../components/sheets/SheetNavbar';
import {MedicationNavigatorParamList} from '../../../screens/medications/MedicationsNavigator';
import {useAnalytics, useHandleLoadingError} from '../../../hooks';
import {
  DangerButton,
  Header1,
  ListBox,
  PrimaryButton,
} from '@pathize/mobile-ui';

const MedicationTimeChild: React.FC<{time: string}> = ({time}) => {
  return (
    <Text
      style={[
        getCircular('Book'),
        tw`h-6 text-black text-opacity-80 text-base leading-tight`,
      ]}>
      {time}
    </Text>
  );
};

type Props = StackScreenProps<
  MedicationNavigatorParamList,
  'EditMedicationRecord'
>;

const EditMedicationRecord: React.FC<Props> = ({route}) => {
  const {id, time} = route.params.medication;
  const {
    updateMedicationRecord,
    updateMedicationRecordLoading,
    updateMedicationRecordError,
    deleteMedicationRecord,
    deleteMedicationRecordLoading,
    deleteMedicationRecordError,
  } = useMedicationsContext();
  const homeNavigation =
    useNavigation<
      StackNavigationProp<HomeStackScreenParamList, 'Medications'>
    >();
  const posthog = usePostHog();
  const {interactionEvent} = useAnalytics();

  const [date, setDate] = useState(dayjs(time).toDate());

  const handleClosePress = () => homeNavigation.navigate('Home');
  useHandleLoadingError(
    updateMedicationRecordError,
    updateMedicationRecordLoading,
    handleClosePress,
  );
  useHandleLoadingError(
    deleteMedicationRecordError,
    deleteMedicationRecordLoading,
    handleClosePress,
  );

  return (
    <>
      <SheetNavbar
        onClose={() => homeNavigation.navigate('Home')}
        posthog={posthog}
        screenName="Home"
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
          <>
            <PrimaryButton
              text="Save"
              rounded="small"
              width="half"
              loading={updateMedicationRecordLoading}
              padding={false}
              onPress={() => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'EditMedicationRecord',
                  value: 'Save',
                });
                updateMedicationRecord(id, date);
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete this medication"
              rounded="small"
              width="half"
              padding={true}
              loading={deleteMedicationRecordLoading}
              onPress={() => {
                twoButtonAlert(
                  'Delete medication record',
                  'Are you sure you want to delete this medication record? This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  async () => await deleteMedicationRecord(id),
                  posthog,
                );
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          text={'Editing medication record'}
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* EDITING THE TIME */}
        <ListBox
          style={tw`mb-3`}
          paddingSides={true}
          padding={true}
          border={true}
          textChild={<MedicationTimeChild time={'Start time'} />}
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

export default EditMedicationRecord;
