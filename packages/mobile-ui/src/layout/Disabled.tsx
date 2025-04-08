import React, { useEffect, useRef, ReactNode } from "react";
import { ViewStyle, StyleProp, Animated } from "react-native";
import { tw } from "../../lib";

type Props = {
  disabled: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const Disabled: React.FC<Props> = ({
  disabled,
  children,
  style = {},
}) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!disabled) {
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      fadeAnim.stopAnimation();
    };
  }, [disabled, fadeAnim]);

  return (
    <Animated.View
      style={[tw`flex-1`, style, { opacity: fadeAnim }]}
      pointerEvents={!disabled ? "none" : "auto"}
    >
      {children}
    </Animated.View>
  );
};

