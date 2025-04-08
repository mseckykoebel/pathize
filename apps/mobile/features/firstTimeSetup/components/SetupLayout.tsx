import React, {ReactNode, memo} from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import tw from 'twrnc';

type Props = {
  children: ReactNode | ReactNode[];
  padding?: boolean;
  style?: StyleProp<ViewStyle>;
};

export const SetupLayout: React.FC<Props> = memo(({children, style = {}}) => {
  return <View style={[tw`flex-1`, style]}>{children}</View>;
});

SetupLayout.displayName = 'SetupLayout';
