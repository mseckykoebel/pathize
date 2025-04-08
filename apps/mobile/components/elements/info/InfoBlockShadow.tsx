import {Header3} from '@pathize/mobile-ui';
import React from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';
import {getCircular} from '../../../utils';

type Props = {
  leftText: string;
  rightText: string;
  marginTop?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const InfoBlockShadow: React.FC<Props> = ({
  leftText,
  rightText,
  marginTop,
  style = {},
}) => {
  return (
    <View
      style={[
        tw`rounded-lg flex flex-row justify-between items-center bg-gray-100 p-4 ${
          marginTop ? 'mt-2' : ''
        }`,
        style,
      ]}>
      <Header3 text={leftText} textStyle={[tw``, getCircular('Book')]} />
      <Header3
        text={rightText}
        textStyle={[tw`text-3xl text-slate-900`, getCircular('Book')]}
      />
    </View>
  );
};
