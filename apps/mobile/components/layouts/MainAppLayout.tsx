import React, {ReactNode} from 'react';
import {StatusBar, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import tw from 'twrnc';

type Props = {
  applyTopInsets?: boolean;
  backgroundColor?:
    | 'bg-white'
    | 'bg-gray-100'
    | 'bg-sky-200'
    | 'bg-sky-950'
    | 'bg-[#ACDAFF]'
    | 'bg-transparent';
  statusBarStyle?: 'light-content' | 'dark-content';
  children?: ReactNode;
};

/**
 * @param applyTopInsets applies top padding to compensate for a lack of a navigation header bar
 */
export const MainAppLayout: React.FC<Props> = ({
  children,
  applyTopInsets = false,
  backgroundColor = 'bg-white',
  statusBarStyle = 'dark-content',
}) => {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        tw`flex-1 ${backgroundColor}`,
        {
          ...(applyTopInsets && {paddingTop: insets.top}),
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <StatusBar barStyle={statusBarStyle} showHideTransition={'fade'} />
      <View style={[tw`flex-1`]}>{children}</View>
    </View>
  );
};
