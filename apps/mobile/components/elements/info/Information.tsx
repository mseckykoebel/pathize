import React from 'react';
import {StyleProp, Text, View, ViewStyle} from 'react-native';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import tw from 'twrnc';

type Props = {
  title: string;
  text: string;
  style?: StyleProp<ViewStyle>;
};

export const Information: React.FC<Props> = ({title, text, style = {}}) => {
  return (
    <View
      style={[
        tw`border-l-4 mb-4 border-gray-400 rounded-md bg-gray-50 p-4 shadow-md`,
        style,
      ]}>
      <View style={tw`flex`}>
        <View style={tw`flex-shrink-0 -ml-1`}>
          <FontAwesomeIcon
            icon={faInfoCircle}
            color={'#9ca3af'}
            style={tw`h-5 w-5 text-gray-800`}
          />
        </View>
        <View style={tw`ml-6 -mt-5`}>
          <Text
            style={[
              tw`text-lg leading-6 text-gray-700`,
              {
                fontFamily: 'Montserrat-SemiBold',
              },
            ]}>
            {title}
          </Text>
          <View style={tw`mt-2`}>
            <Text style={tw`mt-1 mb-1 text-sm text-gray-600`}>{text}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
