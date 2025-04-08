import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {Header1, PrimaryButton, Subheader} from '@pathize/mobile-ui';
import {CheckInNavigatorParamList} from './CheckInsNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {AppBodyLayout, SheetNavbar} from '../../components';
import {getCircular} from '../../utils';
import {useCheckInsContext} from '../../contexts';
import {CheckInListItem} from '../../features/checkIns/components/CheckInListItem';
import {CheckInComplete} from '@pathize/db';

type Props = StackScreenProps<CheckInNavigatorParamList, 'NewCheckInConfirm'>;

const SummaryText: React.FC<{
  name: string;
  time: Date;
}> = ({name, time}) => {
  const firstSentence = `The check in '${name}' will notify you each day at ${dayjs(
    time,
  ).format(
    'h:mm A',
  )}. Make sure everything looks good below before confirming.`;

  return (
    <Subheader
      padding={true}
      text={`${firstSentence} `}
      style={[tw``, getCircular('Book')]}
    />
  );
};

const NewCheckInConfirm: React.FC<Props> = ({route}) => {
  const {checkIn} = route.params;
  const {
    createCheckIn,
    createCheckInLoading: loading,
    createCheckInError: error,
  } = useCheckInsContext();
  // CHECK IN CONTEXT CREATE CHECK IN
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserCheckIns'>
    >();
  const checkInNavigation =
    useNavigation<
      StackNavigationProp<CheckInNavigatorParamList, 'NewCheckInConfirm'>
    >();
  const {interactionEvent} = useAnalytics();
  const handleClosePress = () => profileNavigation.navigate('UserCheckIns');
  useHandleLoadingError(error, loading, handleClosePress);
  const posthog = usePostHog();

  // default check-in to satisfy the type for the CheckInListItem (kinda lazy)
  const checkInItem: CheckInComplete = {
    ...checkIn,
    id: 'some-id',
    userId: 'user-id',
    createdAt: new Date(),
    updatedAt: null,
    notificationsEnabled: true,
    medications: new Array(checkIn.medications.length).fill({}),
    symptoms: new Array(checkIn.symptoms.length).fill({}),
  };

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserCheckIns')}
        posthog={posthog}
        screenName="UserCheckIns"
        navigation={checkInNavigation}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={true}
        avoidKeyboard={false}
        padding={false}
        paddingSides={true}
        navigator={checkInNavigation}
        swipeToDismiss={true}
        route="UserCheckIns"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <PrimaryButton
            text="Save"
            padding={false}
            rounded={'small'}
            width={'half'}
            loading={loading} // loading
            onPress={async () => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'NewCheckInConfirm',
                value: 'Save',
              });

              // extract just the IDs if they are present
              const extractedUserMedicationIds = checkIn.medications.map(
                medication => medication.id,
              );
              const extractedUserSymptomIds = checkIn.symptoms.map(
                symptom => symptom.id,
              );

              return await createCheckIn(
                checkIn.name,
                checkIn.time,
                true,
                extractedUserMedicationIds,
                extractedUserSymptomIds,
              );
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        }>
        {/* HEADER */}
        <Header1
          text="Confirm new check-in"
          style={[
            tw`text-slate-900 text-2xl font-bold leading-8`,
            getCircular('Bold'),
          ]}
        />
        {/* SHOW THE TIME */}
        <SummaryText name={checkIn.name} time={checkIn.time} />
        {/* PREVIEW ITEM */}
        <CheckInListItem
          item={checkInItem}
          onPress={() => {}}
          disabled={true}
        />
        {/* CHECK INS LIST */}
      </AppBodyLayout>
    </>
  );
};

export default NewCheckInConfirm;
