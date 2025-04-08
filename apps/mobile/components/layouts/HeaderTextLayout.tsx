import React from 'react';
import {StyleProp, Text, View, ViewStyle} from 'react-native';
import tw from 'twrnc';

type Props = {
  headerText: string;
  headerTextColor: string;
  subHeaderText: string;
  subHeaderTextColor: string;
  textPosition: 'start' | 'center';
  paddingBottom?: boolean;
  background?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const HeaderTextLayout: React.FC<Props> = ({
  headerText,
  headerTextColor,
  subHeaderText,
  subHeaderTextColor,
  textPosition,
  paddingBottom = true,
  background = true,
  style = {},
}): JSX.Element => {
  return (
    <View
      style={[
        tw`px-8 pt-8 ${paddingBottom ? 'pb-12' : ''} ${
          background ? 'bg-teal-100' : ''
        }`,
        style,
      ]}>
      <Text
        style={[
          tw`mt-6 text-${textPosition} text-3xl font-bold tracking-tight text-gray-900`,
          {fontFamily: 'Montserrat-SemiBold', color: headerTextColor},
        ]}>
        {headerText}
      </Text>
      <Text
        style={[
          tw`mt-2 text-${textPosition} text-sm font-medium`,
          {
            color: subHeaderTextColor,
          },
        ]}>
        {subHeaderText}
      </Text>
    </View>
  );
};
