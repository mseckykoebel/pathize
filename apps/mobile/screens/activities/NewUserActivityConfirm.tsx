import React, {useState} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {Header1, InputField, PrimaryButton} from '@pathize/mobile-ui';
import {AppBodyLayout} from '../../components/layouts';
import {getCircular} from '../../utils';
import {SheetNavbar} from '../../components/sheets';
import {useAnalytics, useHandleLoadingError} from '../../hooks';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {useActivitiesContext} from '../../contexts';

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'NewUserActivityConfirm'
>;

const NewUserActivityConfirm: React.FC<Props> = ({route}) => {
  const {activityIcon, activityName, activityPriority, activityId} =
    route.params.activity;
  const {
    createUserActivity,
    createUserActivityLoading: loading,
    createUserActivityError: error,
  } = useActivitiesContext();
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserActivities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<ActivityNavigatorParamList, 'NewUserActivityConfirm'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [activityNotes, setActivityNotes] = useState('');

  const handleClosePress = () => profileNavigation.navigate('UserActivities');
  useHandleLoadingError(error, loading, handleClosePress);

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserActivities')}
        posthog={posthog}
        screenName="UserActivities"
        navigation={activityNavigation}
      />
      <AppBodyLayout
        dismissKeyboardOnTouch={true}
        scrollable={false}
        avoidKeyboard={false}
        padding={false}
        paddingSides={true}
        navigator={activityNavigation}
        swipeToDismiss={true}
        route="UserActivities"
        backgroundColor="bg-white">
        <View>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Make sure everything looks good!"
            style={[
              tw`text-slate-900 text-2xl font-bold leading-8`,
              getCircular('Bold'),
            ]}
          />
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
        </View>
        {/* CONTINUE AREA */}
        <View style={tw`flex-1 justify-end`}>
          <PrimaryButton
            text="Save"
            padding={false}
            rounded={'small'}
            width={'half'}
            loading={loading}
            onPress={async () => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'UserActivities',
                value: 'Save',
              });

              return await createUserActivity(
                activityId,
                activityName,
                activityPriority,
                activityIcon,
                activityNotes,
              );
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserActivityConfirm;
