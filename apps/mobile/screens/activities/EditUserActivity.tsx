import React, {useState} from 'react';
import {ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../components/layouts';
import {getCircular, getIcon} from '../../utils';
import {SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {
  DangerButton,
  Header1,
  InputField,
  InputFieldReadOnly,
  PathizeIcon,
  PrimaryButton,
  ZeroFiveScaleSlider,
} from '@pathize/mobile-ui';
import {useActivitiesContext} from '../../contexts';
import {twoButtonAlert} from '../../lib';
import {useAnalytics, useHandleLoadingError} from '../../hooks';

type Props = StackScreenProps<ActivityNavigatorParamList, 'EditUserActivity'>;

const EditUserActivity: React.FC<Props> = ({route}) => {
  const {activity} = route.params;
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserActivities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<ActivityNavigatorParamList, 'EditUserActivity'>
    >();
  const posthog = usePostHog();
  const {interactionEvent} = useAnalytics();

  const {
    updateUserActivity,
    updateUserActivityLoading,
    updateUserActivityError,
    deleteUserActivity,
    deleteUserActivityLoading,
    deleteUserActivityError,
  } = useActivitiesContext();
  // notes
  const [activityNotes, setActivityNotes] = useState(activity?.notes || '');
  const [activityName, setActivityName] = useState(
    activity?.activityName || '',
  );
  const [sliderValue, setSliderValue] = useState(
    activity?.activityPriority || 0,
  );

  // process upon successful update or delete
  const handleClosePress = () => profileNavigation.navigate('UserActivities');
  useHandleLoadingError(
    updateUserActivityError,
    updateUserActivityLoading,
    handleClosePress,
  );
  useHandleLoadingError(
    deleteUserActivityError,
    deleteUserActivityLoading,
    handleClosePress,
  );

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserActivities')}
        posthog={posthog}
        screenName="UserActivities"
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        padding={false}
        paddingSides={true}
        navigator={activityNavigation}
        swipeToDismiss={true}
        dismissKeyboardOnTouch={true}
        route="UserActivities"
        backgroundColor="bg-white"
        absoluteBottomChild={
          <>
            <PrimaryButton
              text="Save"
              rounded="small"
              width="half"
              loading={updateUserActivityLoading}
              padding={false}
              onPress={() => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: 'EditUserActivity',
                  value: 'Save',
                });

                updateUserActivity(
                  activity.id,
                  activity.activityId,
                  activity.activityIcon,
                  activityName,
                  sliderValue,
                  activityNotes,
                );
              }}
              disabled={activityName === '' ? true : false}
              textStyle={[getCircular('Bold'), tw``]}
            />
            <DangerButton
              text="Delete this activity"
              rounded="small"
              width="half"
              padding={true}
              loading={deleteUserActivityLoading}
              onPress={() => {
                twoButtonAlert(
                  'Delete activity',
                  'Are you sure you want to delete this activity from your list of activities? Previous records of you recording this activity will be kept. This action cannot be undone.',
                  'Cancel',
                  'Yes, delete',
                  () => deleteUserActivity(activity.id),
                  posthog,
                );
              }}
              textStyle={[getCircular('Bold'), tw``]}
            />
          </>
        }>
        {/* HEADER */}
        <Header1
          text={`Editing ${activityName.toLowerCase()}`}
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* EDITING NAME */}
        {!activity?.activityId && (
          <InputField
            padding={true}
            inputBackgroundColor="bg-white"
            value={activityName}
            onChangeText={setActivityName}
            headerText="Name of this activity"
            placeholderText="Enter name here..."
            style={[tw``, getCircular('Book')]}
          />
        )}
        {/* ICON (ONLY SHOW IF AN ID DOES NOT EXIST) */}
        {!activity?.activityId && (
          <InputFieldReadOnly
            headerText="Icon"
            borderAlways={true}
            value={'Change icon'}
            onFocus={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'EditUserActivity',
                value: 'Change icon',
              });
              activityNavigation.navigate('EditUserActivityIcon', {
                activity: activity,
              });
            }}
            rightComponent={
              <PathizeIcon icon={getIcon(activity.activityIcon)} />
            }
            style={[tw``, getCircular('Book')]}
          />
        )}
        {/* PRIORITY AREA */}
        <ScrollView scrollEnabled={false}>
          <ZeroFiveScaleSlider
            headerText="Priority"
            sliderStartText="Lowest priority"
            sliderEndText="Highest priority"
            setValue={setSliderValue}
            initialValue={activity?.activityPriority || 0}
            style={tw`flex-1`}
            padding={true}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
          />
        </ScrollView>
        {/* TEXT INPUT */}
        <InputField
          padding={true}
          inputBackgroundColor="bg-white"
          multiline={true}
          value={activityNotes}
          onChangeText={setActivityNotes}
          headerText="Notes on this activity (optional)"
          placeholderText="Enter notes here..."
          style={[tw``, getCircular('Book')]}
        />
      </AppBodyLayout>
    </>
  );
};

export default EditUserActivity;
