import React, { useRef, useEffect, PropsWithChildren } from "react";
import { Animated, StyleProp, ViewStyle } from "react-native";

type Props = PropsWithChildren<{
  duration: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}>;

export const FadeIn: React.FC<Props> = ({ duration, style, children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: true,
    }).start();

    return () => {
      fadeAnim.stopAnimation();
    };
  }, [fadeAnim, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
