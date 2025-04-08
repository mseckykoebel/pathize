import React from 'react';
import {StyleProp, Text, TouchableOpacity, View, ViewStyle} from 'react-native';
import {faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import tw from 'twrnc';

type Props = {
  header: string;
  subheader: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const TextPlusButton: React.FC<Props> = ({
  header,
  subheader,
  onPress,
  style = {},
}) => {
  return (
    <TouchableOpacity style={style} onPress={onPress}>
      <View style={tw`flex flex-row justify-start items-center p-3`}>
        <FontAwesomeIcon icon={faPlusCircle} size={20} color="#065f46" />
        <View style={tw`flex flex-col ml-2`}>
          <Text
            style={[
              tw`text-base font-semibold text-gray-700 leading-5 ml-2 mr-4`,
              {
                fontFamily: 'Montserrat-SemiBold',
              },
            ]}>
            {header}
          </Text>
          <Text style={tw`text-xs font-normal text-gray-700 ml-2 mr-4 mt-1`}>
            {subheader}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
