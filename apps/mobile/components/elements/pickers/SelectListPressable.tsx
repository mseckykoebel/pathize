import React, {useCallback} from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import Intercom, {Space} from '@intercom/intercom-react-native';
import tw from 'twrnc';

import {FadeIn, ListItem, PathizeIcon} from '@pathize/mobile-ui';
import {getCircular, getIcon} from '../../../utils';
import {AllScreenParams, useAnalytics} from '../../../hooks';
import {MultiSelectListItem} from '../../../types';

async function launchIntercom() {
  return await Intercom.presentSpace(Space.home);
}

type Props = {
  items: MultiSelectListItem[]; // the original items list
  navigation?: any;
  style?: StyleProp<ViewStyle>;
};

export const SelectListPressable: React.FC<Props> = ({
  items,
  navigation,
  style = {},
}) => {
  const {interactionEvent} = useAnalytics();

  const onListItemPress = useCallback(
    (item: MultiSelectListItem) => {
      interactionEvent('Item', 'Selected', {
        $screen_name: item.name as AllScreenParams,
        value: item.name,
      });

      if (item.name.includes('ContactUs')) {
        launchIntercom();
      } else if (navigation) {
        navigation.navigate(item.name);
      }
    },
    [interactionEvent, navigation],
  );

  return (
    <FadeIn duration={200}>
      <View style={[tw``, style]}>
        {items.map(item => {
          return (
            <ListItem
              key={item.id}
              title={item.displayName}
              buttonStyle={tw`my-1 -mx-3`}
              itemIcon={<PathizeIcon icon={getIcon(item.name)} size={24} />}
              titleStyle={getCircular('Medium')}
              badgeChild={<></>}
              onPress={() => onListItemPress(item)}
            />
          );
        })}
      </View>
    </FadeIn>
  );
};
