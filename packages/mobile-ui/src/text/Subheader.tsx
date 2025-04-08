/* eslint-disable indent */
import React, { memo } from "react";
import { Animated, StyleProp, Text, TextStyle } from "react-native";
import { tw } from "../../lib";

const AnimatedText = Animated.createAnimatedComponent(Text);

const getTextColor = (textColor: Props["textColor"]) => {
  switch (textColor) {
    case "neutral":
      return "text-neutral-500";
    case "black":
      return "text-black";
    case "zinc":
      return "text-zinc-900";
    default:
      return "text-neutral-500";
  }
};

type Props = {
  text: string;
  textType?: "base" | "medium";
  breakWords?: boolean;
  textColor?: "neutral" | "black" | "zinc";
  padding?: boolean;
  paddingBottom?: boolean;
  style?:
    | StyleProp<TextStyle>
    | Animated.WithAnimatedValue<StyleProp<TextStyle>>;
};

export const Subheader: React.FC<Props> = memo(
  ({
    text,
    textType = "base",
    breakWords = false,
    padding = false,
    paddingBottom = false,
    textColor = "neutral",
    style = {},
  }) => {
    return (
      <AnimatedText
        style={[
          tw`${getTextColor(textColor)} text-base leading-normal ${
            padding ? "my-3" : ""
          } ${paddingBottom ? "mb-3" : ""}`,
          style,
          breakWords && {
            flex: 1,
            flexWrap: "wrap",
          },
          textType === "medium" && {
            fontWeight: "500",
          },
        ]}
      >
        {text}
      </AnimatedText>
    );
  }
);

Subheader.displayName = "Subheader";
