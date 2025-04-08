import React from 'react';
import {View, FlatList} from 'react-native';
import tw from 'twrnc';

import {CheckInComplete} from '@pathize/db';
import {AllScreenParams, useAnalytics} from '../../../hooks';
import {CheckInListItem} from './CheckInListItem';

const ItemSeparator = () => {
  return <View style={tw``} />;
};

type Props = {
  checkIns: CheckInComplete[];
  screenName: AllScreenParams;
  navigation: any; // TODO: Fix this type
  padding?: boolean;
};

export const CheckInsList: React.FC<Props> = ({
  checkIns,
  screenName,
  navigation,
  padding = false,
}) => {
  const {interactionEvent} = useAnalytics();

  // Navigation
  const handleNavigation = (itemPressed: CheckInComplete) => {
    interactionEvent('Item', 'Pressed', {
      $screen_name: screenName,
      value: itemPressed.name,
    });

    navigation.navigate(screenName, {
      screen: 'EditCheckIn',
      params: {checkIn: itemPressed},
    });
  };

  // Render item
  const renderItem = ({item}: {item: CheckInComplete}) => {
    return (
      <CheckInListItem
        item={item}
        onPress={() => handleNavigation(item)}
        disabled={false}
      />
    );
  };

  return (
    <FlatList
      scrollEnabled={false}
      style={[tw`${padding ? 'my-3' : ''}`]}
      data={checkIns}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};
