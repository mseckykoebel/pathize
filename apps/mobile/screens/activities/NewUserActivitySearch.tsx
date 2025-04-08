import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import {faSearch} from '@fortawesome/free-solid-svg-icons';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {Activity} from '@pathize/api';
import {AppBodyLayout} from '../../components/layouts';
import {getCircular, getIcon} from '../../utils';
import {SheetNavbar} from '../../components/sheets';
import {ActivityNavigatorParamList} from './ActivityNavigator';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {
  CategoryList,
  FadeInFadeOut,
  Header1,
  InputField,
  Loading,
  PathizeIcon,
  PressableCard,
  Subheader,
} from '@pathize/mobile-ui';
import {useActivitiesContext} from '../../contexts';
import {useAnalytics, useHandleLoadingError} from '../../hooks';

const SearchIcon = () => {
  return <PathizeIcon icon={faSearch} size={16} iconColor={'#a3a3a3'} />;
};

const transformActivitiesToCategoryList = (
  activities: Activity[],
): {sectionTitle: string; data: string[]}[] => {
  const activitiesByIcon: {[icon: string]: string[]} = {};

  activities.forEach(activity => {
    if (activitiesByIcon[activity.icon]) {
      activitiesByIcon[activity.icon].push(activity.name);
    } else {
      activitiesByIcon[activity.icon] = [activity.name];
    }
  });

  return Object.entries(activitiesByIcon).map(([icon, names]) => ({
    sectionTitle: icon,
    data: names,
  }));
};

type Props = StackScreenProps<
  ActivityNavigatorParamList,
  'NewUserActivitySearch'
>;

const NewUserActivitySearch: React.FC<Props> = () => {
  const {
    searchAllActivities,
    activitiesFromSearch,
    activitySearchLoading: loading,
    activitySearchError: error,
  } = useActivitiesContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');

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

  const transformedData = useMemo(() => {
    return transformActivitiesToCategoryList(activitiesFromSearch ?? []);
  }, [activitiesFromSearch]);

  const getActivityByName = useCallback(
    (name: string) => {
      return activitiesFromSearch?.find(activity => activity.name === name);
    },
    [activitiesFromSearch],
  );

  const iconExtractor = useCallback(
    (item: string) => {
      const activity = activitiesFromSearch?.find(a => a.name === item);
      if (!activity) return faSearch;

      return getIcon(activity.icon);
    },
    [activitiesFromSearch],
  );

  useEffect(() => {
    setSelectedActivity('');
    searchAllActivities(searchQuery);
  }, [searchAllActivities, searchQuery]);

  useHandleLoadingError(error, loading, () => {});

  useEffect(() => {
    console.log('selectedActivity changed', selectedActivity);
    if (selectedActivity === '') return;
    // if an activity is selected, and it matches getActivityByName, navigate
    if (selectedActivity) {
      const activity = getActivityByName(selectedActivity);
      if (activity) {
        activityNavigation.navigate('NewUserActivityPriority', {
          activity: {
            activityName: activity.name,
            activityId: activity.id,
            activityIcon: activity.icon,
          },
        });
      }
    }
  }, [activityNavigation, getActivityByName, selectedActivity]);

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
        <View>
          {/* HEADER (MODIFIED) */}
          <Header1
            text="Search for an activity"
            style={[
              tw`text-slate-900 text-2xl font-bold `,
              getCircular('Bold'),
            ]}
          />
          {/* SEARCH INPUT */}
          <InputField
            inputBackgroundColor="bg-white"
            value={searchQuery}
            onChangeText={setSearchQuery}
            padding={true}
            rightComponent={<SearchIcon />}
            placeholderText="Filter activities..."
            style={[tw``, getCircular('Book')]}
          />
          {/* ADD NEW BUTTON */}
          <PressableCard
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Home',
                value: 'Add a custom activity',
              });

              activityNavigation.navigate('NewUserActivityIcon');
            }}
            headerText="Add a custom activity"
            alertChild={'+'}
            padding={true}
            headerTextStyle={[tw``, getCircular('Bold')]}
            bodyTextStyle={[tw``, getCircular('Book')]}
          />
          {/* LENGTH IS ZERO */}
          {transformedData.length === 0 && (
            <FadeInFadeOut watchValue={transformedData.length === 0}>
              <View style={tw`flex-1 justify-center items-center mt-3`}>
                <Subheader
                  text="No activities found! If you'd like to track something else, you can add a custom activity above."
                  style={[tw`text-center w-70`, getCircular('Book')]}
                />
              </View>
            </FadeInFadeOut>
          )}
        </View>
        {/* IF SEARCH QUERY IS PRESENT AND THERE ARE ACTIVITIES */}
        <FadeInFadeOut
          style={tw`flex-1`}
          watchValue={transformedData.length !== 0}>
          <CategoryList
            scrollEnabled={false}
            sectionsData={transformedData}
            setSelectedItem={setSelectedActivity}
            iconExtractor={iconExtractor}
            titleStyle={[tw``, getCircular('Bold')]}
          />
        </FadeInFadeOut>
        {/* LOADING */}
        <Loading loading={loading} />
      </AppBodyLayout>
    </>
  );
};

export default NewUserActivitySearch;
