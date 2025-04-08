import React from 'react';
import {View, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {trigger} from 'react-native-haptic-feedback';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronLeft, faClose} from '@fortawesome/free-solid-svg-icons';
import type PostHog from 'posthog-react-native';
import tw from 'twrnc';
import {AllScreenParams, useAnalytics} from '../../hooks';

type Props = {
  onClose: () => void;
  screenName: AllScreenParams;
  navigation?: StackNavigationProp<any>;
  posthog?: PostHog;
  posthogEventName?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
};

export const SheetNavbar: React.FC<Props> = ({
  onClose,
  screenName,
  navigation,
  posthog,
  backgroundColor = 'bg-white',
  style = {},
}) => {
  const {interactionEvent} = useAnalytics();
  return (
    <View style={[tw`${backgroundColor} p-3 pt-4 z-1000`, style]}>
      <View
        style={tw`flex-row items-center ${
          navigation ? 'justify-between' : 'justify-end'
        }`}>
        {/* NAVIGATE BACK ON LEFT */}
        {navigation ? (
          <TouchableOpacity
            onPress={() => {
              trigger('impactLight');
              posthog &&
                interactionEvent('Button', 'Pressed', {
                  $screen_name: screenName,
                  value: String(faChevronLeft.iconName),
                });
              navigation.goBack();
            }}
            style={tw`rounded-full`}>
            <View
              style={tw`rounded-full items-center justify-center h-12 w-12 bg-transparent`}>
              <FontAwesomeIcon
                icon={faChevronLeft}
                color={'#065f46'}
                size={24}
              />
            </View>
          </TouchableOpacity>
        ) : null}
        {/* CLOSE BUTTON ON RIGHT */}
        <TouchableOpacity
          onPress={() => {
            trigger('impactLight');
            posthog &&
              interactionEvent('Button', 'Pressed', {
                $screen_name: screenName,
                value: String(faChevronLeft.iconName),
              });
            onClose();
          }}
          style={tw`rounded-full`}>
          <View
            style={tw`rounded-full items-center justify-center h-12 w-12 bg-transparent`}>
            <FontAwesomeIcon icon={faClose} color={'#7A7A7A'} size={24} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};
