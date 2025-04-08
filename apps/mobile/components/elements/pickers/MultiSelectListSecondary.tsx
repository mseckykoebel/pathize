import React, {Dispatch, SetStateAction, memo} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';

import {InputFieldCheckboxSecondary} from '@pathize/mobile-ui';
import {FadeInView} from '../../layouts/FadeInView';
import {getCircular} from '../../../utils';
import {AllScreenParams, useAnalytics} from '../../../hooks';
import {MultiSelectListItem} from '../../../types';

type Props = {
  screenName: string; // name of the screen for posthog
  items: MultiSelectListItem[]; // the original items list
  selectedItems: MultiSelectListItem[]; // the selected items state
  setItems: Dispatch<SetStateAction<MultiSelectListItem[]>>; // the setter
  style?: StyleProp<ViewStyle>;
};

export const MultiSelectListSecondary: React.FC<Props> = memo(
  ({screenName, items, selectedItems, setItems, style = {}}) => {
    const {interactionEvent} = useAnalytics();

    // if the item length is zero, return null
    if (items.length === 0) return null;

    return (
      <FadeInView duration={200} style={[tw``, style]}>
        {items.map(item => {
          return (
            <InputFieldCheckboxSecondary
              key={item.id}
              padding={true}
              itemText={item.name}
              selected={selectedItems?.some(
                selectedItem => selectedItem.id === item.id,
              )}
              onValueChange={() => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: screenName as AllScreenParams,
                  value: item.name,
                });

                setItems(prevSelectedItems => {
                  if (
                    prevSelectedItems.some(
                      selectedItem => selectedItem.id === item.id,
                    )
                  ) {
                    return prevSelectedItems.filter(i => i.id !== item.id);
                  } else {
                    return Array.from(new Set([...prevSelectedItems, item]));
                  }
                });
              }}
              style={[tw``]}
              textStyle={[tw``, getCircular('Book')]}
            />
          );
        })}
      </FadeInView>
    );
  },
);

MultiSelectListSecondary.displayName = 'MultiSelectListSecondary';
