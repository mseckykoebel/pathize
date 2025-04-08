import React, { useEffect, useRef, ReactNode } from "react";
import { ViewStyle, StyleProp, Animated } from "react-native";

type Props = {
  watchValue: boolean;
  duration?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/**
 *
 * @param watchValue - wrapper component that fades in and fades out children
 * based on the value of watchValue. if false, fades out
 */
export const FadeInFadeOut: React.FC<Props> = ({
  watchValue,
  duration = 200,
  children,
  style = {},
}) => {
  const fadeAnim = useRef(new Animated.Value(!watchValue ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: watchValue ? 1 : 0,
      duration: duration ?? 200,
      useNativeDriver: true,
    }).start();

    return () => {
      fadeAnim.stopAnimation();
    };
  }, [watchValue, fadeAnim, duration]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
};
