import React from 'react';
import {StyleProp, Text, ViewStyle} from 'react-native';
import tw from 'twrnc';

type Props = {
  text: string;
  centered?: boolean;
  size?: 'text-xs' | 'text-sm';
  style?: StyleProp<ViewStyle>;
};

export const LightExplainerText: React.FC<Props> = ({
  text,
  centered,
  size,
  style = {},
}) => {
  return (
    <Text
      style={[
        tw`mt-1 text-neutral-500 ${centered ? 'text-center' : ''} ${
          size ? size : 'text-sm'
        }`,
        style,
      ]}>
      {text}
    </Text>
  );
};
