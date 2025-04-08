import React from 'react';
import {Text} from 'react-native';
import tw from 'twrnc';

type Props = {
  text: string;
  centered?: boolean;
};

export const H2Text: React.FC<Props> = ({text, centered}): JSX.Element => {
  return (
    <Text
      style={[
        tw`mt-1 text-xl font-bold tracking-tight text-gray-700 ${
          centered ? 'text-center' : ''
        }`,
        {
          fontFamily: 'Montserrat-SemiBold',
        },
      ]}>
      {text}
    </Text>
  );
};
