import React, {useState} from 'react';
import {ScrollView, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../components/layouts';
import {getCircular} from '../../utils';
import {SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {
  Header1,
  PrimaryButton,
  Subheader,
  ZeroFiveScaleSlider,
} from '@pathize/mobile-ui';
import {useAnalytics} from '../../hooks';

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'NewUserActivityPriority'
>;

const NewUserActivityPriority: React.FC<Props> = ({route}) => {
  const {activity} = route.params;
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserActivities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<ActivityNavigatorParamList, 'NewUserActivityPriority'>
    >();
  const [sliderValue, setSliderValue] = useState(0);
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
        dismissKeyboardOnTouch={false}
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
            text="Select this activities priority"
            style={[
              tw`text-slate-900 text-2xl font-bold `,
              getCircular('Bold'),
            ]}
          />
          {/* PREVIEW OF ITEM
          <ListItem
            title={activity.activityName}
            itemIcon={<PathizeIcon icon={getIcon(activity.activityIcon)} />}
            titleStyle={[getCircular('Book')]}
            onPress={() => {}}
            hapticFeedback={false}
          />
          */}
          {/* AMOUNT INPUT */}
          <ScrollView scrollEnabled={false}>
            <ZeroFiveScaleSlider
              headerText="Priority"
              sliderStartText="Lowest priority"
              sliderEndText="Highest priority"
              setValue={setSliderValue}
              style={tw`flex-1`}
              padding={true}
              headerTextStyle={[getCircular('Book'), tw``]}
              sliderTextStyle={[getCircular('Book'), tw``]}
            />
          </ScrollView>
          {/* EXPLANATION */}
          <Subheader
            text="A priority is how important an activity or routine is in your day. In the future, our goal is to to correlate exertion with activity priority."
            style={[getCircular('Book'), tw``]}
          />

          {/* BOTTOM TEXT */}
        </View>
        {/* CONTINUE AREA */}
        <View style={tw`flex-1 justify-end`}>
          <PrimaryButton
            text="Continue"
            padding={false}
            rounded={'small'}
            width={'half'}
            disabled={activity.activityName.length === 0 ? true : false}
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'NewUserActivityPriority',
                value: 'Continue',
              });
              activityNavigation.navigate('NewUserActivityConfirm', {
                activity: {
                  ...activity,
                  activityPriority: sliderValue,
                },
              });
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        </View>
      </AppBodyLayout>
    </>
  );
};

export default NewUserActivityPriority;
