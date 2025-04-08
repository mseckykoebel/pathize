import React, {memo} from 'react';
import {TouchableOpacity, View, FlatList} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

import {Body1, PathizeIcon} from '@pathize/mobile-ui';
import {getCircular, getIcon} from '../../../utils';
import {config} from '../../../config';
import {useAnalytics} from '../../../hooks';

type Category = 'Crash' | 'Symptom' | 'Medication' | 'Activity' | 'Test';

type Records =
  | 'Crash/PEM'
  | 'Symptom'
  | 'Medication'
  | 'Activity'
  | 'Developer Options 🔨';

type ThingToRecord = {id: string; name: Records; category: Category};

const thingsToRecord: ThingToRecord[] = [
  {id: '0', name: 'Crash/PEM', category: 'Crash'},
  {id: '1', name: 'Symptom', category: 'Symptom'},
  {id: '2', name: 'Medication', category: 'Medication'},
  {id: '3', name: 'Activity', category: 'Activity'},
];

const getNavigationParams = (category: Category) => {
  let screen = '';
  let options = {};

  switch (category) {
    case 'Crash':
      screen = 'Crashes';
      options = {screen: 'NewCrashRecord', params: {crashTotalTime: null}};
      break;
    case 'Symptom':
      screen = 'Symptoms';
      options = {screen: 'AddNewSymptomRecord'};
      break;
    case 'Activity':
      screen = 'Activities';
      options = {screen: 'AddNewActivityRecord'};
      break;
    case 'Medication':
      screen = 'Medications';
      options = {screen: 'AddNewMedicationRecord'};
      break;
    case 'Test':
      screen = 'TestAppleWatch';
      options = {screen: 'TestAppleWatch'};
      break;
    default:
      screen = 'Crashes';
      options = {screen: 'NewCrashRecord', params: {crashTotalTime: null}};
  }

  return {screen, options};
};

if (config.api.environment !== 'production') {
  thingsToRecord.push({
    id: '4',
    name: 'Developer Options 🔨',
    category: 'Test',
  });
}

const Item = ({item, onPress}: any) => (
  <TouchableOpacity onPress={onPress} style={tw`m-1 flex-1`}>
    <View
      style={tw`flex flex-row items-center justify-start p-5 bg-gray-100 rounded-md`}>
      <View style={tw`rounded-full  items-center justify-center`}>
        <PathizeIcon icon={getIcon(item.category)} size={26} />
      </View>
      <Body1
        text={item.name}
        textStyle={[tw`ml-2 text-base`, getCircular('Book')]}
      />
    </View>
  </TouchableOpacity>
);

const AddNewRecordList: React.FC = () => {
  const navigation = useNavigation<any>();
  const {interactionEvent} = useAnalytics();
  const renderItem = ({item}: any) => (
    <Item
      item={item}
      onPress={() => {
        const {screen, options} = getNavigationParams(item.category);
        trigger('impactLight');
        interactionEvent('Button', 'Pressed', {
          $screen_name: 'Home',
          value: item.name,
        });

        navigation.navigate(screen, options);
      }}
    />
  );

  return (
    <FlatList
      scrollEnabled={false}
      numColumns={2}
      data={thingsToRecord}
      renderItem={renderItem}
      keyExtractor={item => item.id}
    />
  );
};

export default memo(AddNewRecordList);
