import React, {memo} from 'react';
import {Text, View, TouchableOpacity, FlatList} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import tw from 'twrnc';

import type {Category} from '../../../contexts';
import {useTrendsContext} from '../../../contexts';
import {getCircular, getIcon} from '../../../utils';
import {PathizeIcon} from '@pathize/mobile-ui';
import {useAnalytics} from '../../../hooks';

const categories: Category[] = [
  {
    id: '0',
    category: 'Crashes',
  },
  {
    id: '1',
    category: 'Symptom',
  },
  {
    id: '2',
    category: 'Activity',
  },
  {
    id: '3',
    category: 'Heart',
  },
  {
    id: '4',
    category: 'Sleep',
  },
];

const Item = memo(({onPress, backgroundColor, category, borderColor}: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={tw`m-1 flex-1`}>
      <View
        style={tw`flex flex-row items-center rounded-3xl justify-start p-3 border-2 ${backgroundColor} ${borderColor}`}>
        <View style={tw`flex flex-row justify-center items-center`}>
          <PathizeIcon icon={getIcon(category)} size={14} style={[tw`mr-1`]} />
          <Text
            style={[
              tw`text-xs font-medium text-slate-900`,
              getCircular('Book'),
            ]}>
            {category}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

type RenderItemProps = {
  item: Category;
  index: number;
};

const TrendsFilterList: React.FC = () => {
  const {selectedFilterCategory, setSelectedFilterCategory} =
    useTrendsContext();
  const {interactionEvent} = useAnalytics();

  const renderItem = ({item}: RenderItemProps) => {
    const backgroundColor =
      item.id === selectedFilterCategory.id ? 'bg-white' : 'bg-white';
    const borderColor =
      item.id === selectedFilterCategory.id
        ? 'border-slate-900'
        : 'border-zinc-300';

    return (
      <Item
        onPress={() => {
          interactionEvent('Item', 'Selected', {
            $screen_name: 'TrendsScreen',
            value: item.category,
          });

          trigger('impactLight');
          setSelectedFilterCategory(item);
        }}
        category={item.category}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
      />
    );
  };

  return (
    <View style={tw`mb-1 -mt-2`}>
      <FlatList
        scrollEnabled={true}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        numColumns={1}
        data={categories}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        extraData={selectedFilterCategory}
      />
    </View>
  );
};

export default TrendsFilterList;
