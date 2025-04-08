import React from 'react';
import {Text, View, TouchableOpacity, StyleProp, ViewStyle} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import tw from 'twrnc';

import {useInfoContext} from '../../../contexts';
import {useAnalytics} from '../../../hooks';

type Props = {
  title: string;
  style?: StyleProp<ViewStyle>;
};

export const InfoSheetTrigger: React.FC<Props> = ({title, style = {}}) => {
  const {interactionEvent} = useAnalytics();
  const {showInfoSheet, setShowInfoSheet} = useInfoContext();

  return (
    <View
      style={[
        tw`border-l-4 border-gray-400 rounded-md bg-gray-50 p-4 shadow-md`,
        style,
      ]}>
      <View style={tw`flex flex-row`}>
        {/* CHEVRON */}
        <View style={tw`flex-shrink-0 -ml-1 my-auto`}>
          <TouchableOpacity
            onPress={() => {
              trigger('impactLight');
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Home',
                value: String(faChevronRight.iconName),
              });
              setShowInfoSheet(!showInfoSheet);
            }}>
            <FontAwesomeIcon
              icon={faChevronRight}
              style={tw`h-5 w-5 text-gray-800`}
            />
          </TouchableOpacity>
        </View>
        {/* TEXT */}
        <View style={tw`ml-6`}>
          <TouchableOpacity
            onPress={() => {
              trigger('impactLight');
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Home',
                value: String(faChevronRight.iconName),
              });
              setShowInfoSheet(!showInfoSheet);
            }}>
            <Text
              style={[
                tw`text-lg leading-6 text-gray-800`,
                {
                  fontFamily: 'Montserrat-SemiBold',
                },
              ]}>
              {title}
            </Text>
          </TouchableOpacity>
          {/* {showInfoSheet && (
            <View>
              <View style={tw`mt-2 text-sm text-gray-700`}>
                <Text>
                  Your limit is your estimated anaerobic threshold. Staying
                  below your limit has been shown to help avoid triggering
                  crashes.
                </Text>
              </View>
              <View style={tw`mt-2 text-sm text-gray-700`}>
                <Text>
                  If you'd like, you can edit this value in the 'Limits' section
                  in the menu.
                </Text>
              </View>
            </View>
          )} */}
        </View>
      </View>
    </View>
  );
};
