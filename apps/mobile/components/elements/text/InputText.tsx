import React from 'react';
import {StyleProp, Text, TextStyle} from 'react-native';
import tw from 'twrnc';

type Props = {
  text: string;
  style?: StyleProp<TextStyle>;
};

export const InputText: React.FC<Props> = ({text, style = {}}) => {
  return (
    <Text style={[tw`my-1 text-sm font-medium text-gray-700`, style]}>
      {text}
    </Text>
  );
};
