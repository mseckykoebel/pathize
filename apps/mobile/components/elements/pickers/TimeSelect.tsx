import React from 'react';
import {View, Text, ViewStyle, StyleProp, TouchableOpacity} from 'react-native';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import tw from 'twrnc';

type Props = {
  time: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const TimeSelect: React.FC<Props> = ({time, onPress, style = {}}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          tw`flex-row flex justify-between rounded-md border border-transparent border-gray-300 py-3 px-4`,
          style,
        ]}>
        {/* ON THE LEFT, SHOW TIME */}
        <View style={tw`mt-auto mb-auto`}>
          <Text style={tw`font-medium text-gray-700`}>{time}</Text>
        </View>
        {/* ON THE RIGHT, SHOW AN FA CHEVRON */}
        <FontAwesomeIcon size={24} icon={faChevronRight} color={'#d1d5db'} />
      </View>
    </TouchableOpacity>
  );
};
