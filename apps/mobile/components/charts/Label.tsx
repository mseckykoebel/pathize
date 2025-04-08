import React, {FC} from 'react';
import {View, Text} from 'react-native';
import tw from 'twrnc';
import {getCircular} from '../../utils';

type Props = {
  bottom: number;
  width: number;
  text: string | number;
  position?: 'absolute' | 'relative' | undefined;
  top?: number;
};

const Label: FC<Props> = ({
  position = 'absolute',
  bottom,
  width,
  text,
  top = undefined,
}) => (
  <View
    style={{position: position, top: top ?? undefined, left: 4, bottom, width}}>
    <Text style={[tw`text-xs text-neutral-500`, getCircular('Book')]}>
      {text}
    </Text>
  </View>
);

export default Label;
