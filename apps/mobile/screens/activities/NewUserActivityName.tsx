import React, {useState} from 'react';
import {View} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../components/layouts';
import {getCircular} from '../../utils';
import {SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {Header1, InputField, PrimaryButton} from '@pathize/mobile-ui';
import {useAnalytics} from '../../hooks';

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'NewUserActivityName'
>;

const NewUserActivityName: React.FC<Props> = ({route}) => {
  const [activityName, setActivityName] = useState('');
  const {activityIcon} = route.params.activity;
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserActivities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<ActivityNavigatorParamList, 'NewUserActivitySearch'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

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
        avoidKeyboard={true}
        paddingSides={true}
        navigator={activityNavigation}
        swipeToDismiss={true}
        route="UserActivities"
        backgroundColor="bg-white">
        {/* HEADER */}
        <Header1
          text="Next, give this activity a name you'll recognize"
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        <InputField
          padding={true}
          headerText="Activity name"
          inputBackgroundColor="bg-white"
          value={activityName}
          onChangeText={setActivityName}
          placeholderText="Activity name"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Name',
              value: activityName,
            });
          }}
          style={[tw``, getCircular('Book')]}
        />
        <View style={tw`flex-1 justify-end`}>
          <PrimaryButton
            padding={false}
            width="half"
            rounded="small"
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Name',
                value: 'Continue',
              });

              activityNavigation.navigate('NewUserActivityPriority', {
                activity: {
                  activityIcon,
                  activityName,
                },
              });
            }}
            text="Continue"
            disabled={activityName.length === 0 ? true : false}
            textStyle={[tw``, getCircular('Bold')]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserActivityName;
