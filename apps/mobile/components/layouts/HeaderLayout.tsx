import React from 'react';
import {View, Text, StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';

type Props = {
  headerText: string;
  subheaderText?: string | null;
  background: boolean;
  style?: StyleProp<ViewStyle>;
};

export const HeaderLayout: React.FC<Props> = ({
  headerText,
  subheaderText,
  background,
  style = {},
}) => {
  return (
    <View
      style={[
        tw`flex flex-row justify-between items-center px-4 py-5 ${
          background ? 'opacity-100' : ''
        }`,
        style,
      ]}>
      <View>
        <Text
          style={[
            tw`text-[7] font-bold tracking-tight text-gray-700`,
            {
              fontFamily: 'Montserrat-SemiBold',
            },
          ]}>
          {headerText}
        </Text>
        {subheaderText ? (
          <View style={tw`mt-1`}>
            <View style={tw`flex flex-row items-center`}>
              <Text style={tw`text-emerald-800`}>{subheaderText}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
};
