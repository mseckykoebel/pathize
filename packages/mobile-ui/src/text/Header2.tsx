import React, { memo } from "react";
import { Animated, StyleProp, Text, TextStyle } from "react-native";
import { tw } from "../../lib";

const AnimatedText = Animated.createAnimatedComponent(Text);

type Props = {
  text: string;
  padding?: boolean;
  paddingTop?: boolean;
  textStyle?:
    | StyleProp<TextStyle>
    | Animated.WithAnimatedValue<StyleProp<TextStyle>>;
};

export const Header2: React.FC<Props> = memo(
  ({ text, padding = false, paddingTop = false, textStyle = {} }) => {
    return (
      <AnimatedText
        style={[
          tw`text-black text-xl font-bold leading-snug ${
            padding ? "my-3" : ""
          } ${paddingTop ? "mt-3" : ""}`,
          textStyle,
        ]}
      >
        {text}
      </AnimatedText>
    );
  }
);

Header2.displayName = "Header2";
