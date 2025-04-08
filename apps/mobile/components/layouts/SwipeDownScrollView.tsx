import React, {ReactNode} from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {NavigationProp} from '@react-navigation/native';

type Props = {
  navigator: NavigationProp<any>; //TODO: look into how to type this 💀
  route: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export const SwipeDownScrollView: React.FC<Props> = ({
  navigator,
  route,
  children,
  style = {},
}): JSX.Element => {
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    if (y <= -50) navigator.navigate(route);
  };

  return (
    <ScrollView
      onScroll={handleScroll}
      scrollEventThrottle={160}
      style={[style]}>
      {children}
    </ScrollView>
  );
};
