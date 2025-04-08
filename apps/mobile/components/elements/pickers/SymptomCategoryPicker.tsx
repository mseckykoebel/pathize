import React, {useState, memo} from 'react';
import {View, FlatList} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import tw from 'twrnc';

import {CategoryBadge} from '..';

type Category = {
  id: number;
  title: string;
  description: string;
};

const recents: Category[] = [
  {
    id: 0,
    title: 'General',
    description: 'General symptoms',
  },
  {
    id: 1,
    title: 'Respiratory and Heart',
    description: 'Respiratory and Heart symptoms',
  },
  {
    id: 2,
    title: 'Neurological',
    description: 'Neurological symptoms',
  },
  {
    id: 3,
    title: 'Digestive',
    description: 'Digestive symptoms',
  },
  {
    id: 4,
    title: 'Other',
    description: 'Other symptoms',
  },
];

const Item = memo(({item, onPress}: any) => {
  return <CategoryBadge title={item.title} onPress={onPress} />;
});

export const SymptomCategoryPicker = () => {
  const [selectedId, setSelectedId] = useState('0');

  const renderItem = ({item}: any) => {
    return (
      <Item
        item={item}
        onPress={() => {
          trigger('impactLight');
          setSelectedId(item.id);
        }}
      />
    );
  };

  return (
    <View style={tw`flex-row justify-center -mt-4 -mb-3 py-2`}>
      <FlatList
        horizontal={true}
        data={recents}
        renderItem={
          renderItem as unknown as (info: {
            item: Category;
            index: number;
          }) => React.ReactElement
        }
        extraData={selectedId}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
