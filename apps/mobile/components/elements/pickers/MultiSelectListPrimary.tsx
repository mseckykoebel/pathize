import React, {Dispatch, SetStateAction, memo} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';

import {InputFieldCheckboxPrimary} from '@pathize/mobile-ui';
import {FadeInView} from '../../layouts/FadeInView';
import {getCircular} from '../../../utils';
import {AllScreenParams, useAnalytics} from '../../../hooks';
import {MultiSelectListItem} from '../../../types';

type Props = {
  screenName: string; // name of the screen for posthog
  items: MultiSelectListItem[]; // the original items list
  selectedItems: MultiSelectListItem[]; // the selected items state
  setItems?: Dispatch<SetStateAction<MultiSelectListItem[]>>; // the setter
  onItemPress?: (item: MultiSelectListItem) => void; // the callback when an item is pressed
  disableIfSelected?: boolean; // if true, disable the item if it's already selected
  changeStyleIfSelected?: boolean; // if true, change the style of the item if it's already selected
  style?: StyleProp<ViewStyle>;
};

/**
 * @description A multi-select list component
 * @param {boolean} disableIfSelected - items will not be pressable if they are disabled
 * @param {boolean} changeStyleIfSelected - when an item  is selected, the visual style will remain the same
 */
export const MultiSelectListPrimary: React.FC<Props> = memo(
  ({
    screenName,
    items,
    selectedItems,
    setItems = undefined,
    onItemPress = () => {},
    disableIfSelected = false,
    changeStyleIfSelected = true,
    style = {},
  }) => {
    const {interactionEvent} = useAnalytics();

    // if the item length is zero, return null
    if (items.length === 0) return null;

    return (
      <FadeInView duration={200} style={[tw``, style]}>
        {items.map(item => {
          return (
            <InputFieldCheckboxPrimary
              key={item.id}
              padding={true}
              disabled={
                disableIfSelected &&
                selectedItems?.some(selectedItem => selectedItem.id === item.id)
              }
              changeStyleIfSelected={changeStyleIfSelected}
              itemHeaderText={item.name}
              selected={selectedItems?.some(
                selectedItem => selectedItem.id === item.id,
              )}
              onValueChange={() => {
                interactionEvent('Button', 'Pressed', {
                  $screen_name: screenName as AllScreenParams,
                  value: item.name,
                });

                // if a setter was provided
                setItems &&
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

                // if a callback was provided
                onItemPress && onItemPress(item);
              }}
              style={[tw``]}
              headerTextStyle={[tw``, getCircular('Book')]}
            />
          );
        })}
      </FadeInView>
    );
  },
);

MultiSelectListPrimary.displayName = 'MultiSelectListPrimary';
