import React, {useState, useCallback, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout} from '../../components/layouts';
import {getCircular, getIcon} from '../../utils';
import {SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {Header1, SquareButtonGroup} from '@pathize/mobile-ui';
import {useAnalytics} from '../../hooks';

const iconNames = [
  'Hygiene',
  'Physical health and wellness',
  'Mental and emotional wellness',
  'Pet care',
  'Health management',
  'Meal preparation and consumption',
  'Household chores',
  'Leisure and entertainment',
  'Transportation',
  'Work related activities',
  'Shopping',
  'Social activities',
  'Educational activities',
  'Resting',
  'Digital media use',
];

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'EditUserActivityIcon'
>;

const EditUserActivityIcon: React.FC<Props> = ({route}) => {
  const {activity: userActivity} = route.params;
  const profileNavigation =
    useNavigation<
      StackNavigationProp<ProfileScreenParamList, 'UserActivities'>
    >();
  const activityNavigation =
    useNavigation<
      StackNavigationProp<ActivityNavigatorParamList, 'EditUserActivity'>
    >();
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const iconExtractor = useCallback((item: string) => getIcon(item), []);

  const navigateBack = useCallback(
    (item: string) => {
      interactionEvent('Button', 'Pressed', {
        $screen_name: 'UserActivities',
        value: item,
      });

      activityNavigation.navigate('EditUserActivity', {
        activity: {...userActivity!, activityIcon: item},
      });
    },
    [activityNavigation, interactionEvent, userActivity],
  );

  useEffect(() => {
    if (selectedItem) {
      navigateBack(selectedItem);
    }
  }, [selectedItem, navigateBack]);

  return (
    <>
      <SheetNavbar
        onClose={() => profileNavigation.navigate('UserActivities')}
        posthog={posthog}
        screenName="UserActivities"
        navigation={activityNavigation}
      />
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={false}
        dismissKeyboardOnTouch={true}
        swipeToDismiss={true}
        padding={false}
        paddingSides={true}
        navigator={activityNavigation}
        route="UserActivities"
        backgroundColor="bg-white">
        {/* HEADER */}
        <Header1
          text="Select the icon you for an activity"
          style={[tw`text-slate-900 text-2xl font-bold `, getCircular('Bold')]}
        />
        {/* BUTTON INPUT GROUP AREA */}
        <SquareButtonGroup
          iconNames={iconNames}
          iconExtractor={iconExtractor}
          setSelectedItem={setSelectedItem}
          iconSize={40}
          iconBackgroundColor="bg-white"
        />
      </AppBodyLayout>
    </>
  );
};

export default EditUserActivityIcon;
