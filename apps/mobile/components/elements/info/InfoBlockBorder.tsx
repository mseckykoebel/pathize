import React from 'react';
import {View, Text, StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';

type Props = {
  leftText: string;
  rightText: string;
  marginTop?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const InfoBlockBorder: React.FC<Props> = ({
  leftText,
  rightText,
  marginTop,
  style = {},
}) => {
  return (
    <View
      style={[
        tw`rounded-md flex flex-row justify-between items-center shadow-md shadow-emerald-800 p-4 ${
          marginTop ? 'mt-2' : ''
        }`,
        style,
      ]}>
      <Text
        style={[
          tw`text-base font-bold tracking-tight text-gray-700`,
          {
            fontFamily: 'Montserrat-SemiBold',
          },
        ]}>
        {leftText}
      </Text>
      <Text
        style={[
          tw`text-[7] font-bold tracking-tight text-emerald-800`,
          {
            fontFamily: 'Montserrat-SemiBold',
          },
        ]}>
        {rightText}
      </Text>
    </View>
  );
};
