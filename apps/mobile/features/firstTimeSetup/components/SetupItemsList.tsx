import React from 'react';
import {FlatList} from 'react-native';
import tw from 'twrnc';

import {PrimaryButtonCard} from '@pathize/mobile-ui';
import {SetupItem} from '../types';
import {useAsyncStorage} from '../../../hooks';
import {getCircular} from '../../../utils';
import {useNavigation} from '@react-navigation/native';

// array of items

export const SetupItemsList: React.FC = () => {
  const [completedSetupItems, setCompletedSetupItems] = useAsyncStorage(
    'completedSetupItems',
    [] as string[],
  );
  const navigation = useNavigation<any>();

  const SetupItems: SetupItem[] = [
    {
      id: '0',
      header: 'Your account',
      body: "It's probably most important you know how to tweak your current preferences, manage the things you track, and manage your account  details. All this and more can be found in the 'Account' section of Pathize.",
      buttonText: 'Go to my account',
      onPress: () => {
        navigation.navigate('ProfileScreen');
      },
    },
    {
      id: '1',
      header: 'Track symptoms',
      body: "In the 'Account' section, you can add new symptoms to track in the 'symptoms' sub-menu. Once added, symptoms can be logged in the 'Records' section below.",
      buttonText: 'Manage symptoms',
      onPress: () => {
        navigation.navigate('ProfileScreen', {
          screen: 'UserSymptoms',
        });
      },
    },
    {
      id: '2',
      header: 'Track medications+',
      body: "As with symptoms, you can add new medications and supplements to track in the 'medications+' sub-menu. Once added, medications and supplements can be logged in the 'Records' section below.",
      buttonText: 'Manage medications',
      onPress: () => {
        navigation.navigate('ProfileScreen', {
          screen: 'UserMedications',
        });
      },
    },
    {
      id: '3',
      header: 'Simplify recording things with check-ins',
      body: 'Check-ins are groupings of medications+ and symptoms that you can record all at once at a set time. Check-ins are the best say to stay on top of tracking.',
      buttonText: 'Manage check-ins',
      onPress: () => {
        navigation.navigate('ProfileScreen', {
          screen: 'UserCheckIns',
        });
      },
    },
    {
      id: '4',
      header: 'Add activities to track',
      body: "Finally, like symptoms and medications+, activities can be tracked in the same say: manage them in the 'activities' sub-menu, and tracked in the 'Records' section.",
      buttonText: 'Manage activities',
      onPress: () => {
        navigation.navigate('ProfileScreen', {
          screen: 'UserActivities',
        });
      },
    },
    {
      id: '5',
      header: 'Record a crash',
      body: 'Pathize lets you record when you experience post-exertional malaise (PEM). You can give your crashes a severity, and/or a time frame.',
      buttonText: 'Record a crash',
      onPress: () => {
        navigation.navigate('Crashes', {
          screen: 'AddCrash',
        });
      },
    },
    {
      id: '6',
      header: 'View trends',
      body: 'Pathize integrates with Apple Health and lets you compare symptoms against over 50 biometrics, including those more relevant for energy-limiting conditions: HRV, RHR, Max HR, Deep and REM Sleep, and more.',
      buttonText: 'View trends',
      onPress: () => {
        navigation.navigate('TrendsScreen');
      },
    },
    {
      id: '7',
      header: 'Update your limit - a core part of Pathize',
      body: "Your 'limit,' AKA your condition-adjusted anaerobic threshold, represents the threshold at which your physical exertion becomes anaerobic, which has been linked to PEM. We gave you a default value, but you can update it in the 'Limits' sub-menu.",
      buttonText: 'View my limit',
      onPress: () => {
        navigation.navigate('ProfileScreen', {
          screen: 'Limits',
        });
      },
    },
    {
      id: '8',
      header: 'Energy budget',
      body: "Once you've recorded some crashes, the energy budget feature becomes available. This is a helpful feature that helps you pace your energy usage throughout the day, with the help of visuals, charts, and notifications.",
      buttonText: 'Learn more',
      onPress: () => {
        navigation.navigate('ExertionGuidanceHelp');
      },
    },
    {
      id: '9',
      header: 'Track exertion with your Apple Watch',
      body: "We've built a real-time heart rate monitor into your Apple Watch that scans for when you go above your limit. You can also track activities live to get a better idea of per-activity exertion.",
      buttonText: 'Got it!',
      onPress: () => {},
    },
    {
      id: '10',
      header: 'Get help',
      body: "If you're having trouble, or just want to learn more about Pathize, you can always reach out to us in the 'Help' section of the app. There, you'll be able to chat with one of the co-founders, who will work with you to get things on track!",
      buttonText: 'Go to my account',
      onPress: () => {
        navigation.navigate('ProfileScreen', {
          screen: 'Profile',
        });
      },
    },
    // {
    //   id: '10',
    //   header: 'Know how to use Pathize',
    //   body: "As one last piece of help and guidance, we've put a small write-up in the back of the app that summarizes who we are, what Pathize's ultimate goals are, and how we plan to grow and improve Pathize.",
    //   buttonText: 'Read the memo',
    //   onPress: () => {
    //     navigation.navigate('ProfileScreen');
    //   },
    // },
  ];

  const updateCompletedSetupItems = async (id: string) => {
    try {
      const currentState = completedSetupItems;
      const newState = [...currentState, id];
      return await setCompletedSetupItems(newState);
    } catch (err) {
      console.log(err);
    }
  };

  const getCompletedSetupItems = () => {
    return completedSetupItems;
  };

  // for devs - uncomment and re-comment to clear from async storage and enable all items
  // const resetItems = async () => {
  //   return await resetItemsList();
  // };
  // resetItems();

  const renderItem = ({item}: {item: SetupItem}) => {
    return (
      <PrimaryButtonCard
        headerText={item.header}
        textChild={item.body}
        buttonText={item.buttonText}
        onPress={() => {
          updateCompletedSetupItems(item.id);
          item.onPress();
        }}
        backgroundColor="bg-white"
        style={[
          tw`bg-white mr-4`,
          getCompletedSetupItems().includes(item.id) ? {opacity: 0.5} : {},
        ]}
        headerTextStyle={[
          tw`text-xl font-semibold max-w-60`,
          getCircular('Book'),
        ]}
        bodyTextStyle={[
          tw`text-neutral-500 text-sm max-w-60`,
          getCircular('Book'),
        ]}
        buttonStyle={[tw`bg-white`, getCircular('Book')]}
      />
    );
  };

  const setupItems = SetupItems.filter(
    item => !getCompletedSetupItems().includes(item.id),
  );

  if (setupItems.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={SetupItems}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      showsVerticalScrollIndicator={false}
      style={[tw`-mr-8 -ml-4`]}
    />
  );
};
