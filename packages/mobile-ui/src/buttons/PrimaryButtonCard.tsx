import React, { ReactNode } from "react";
import { StyleProp, TextStyle, View, ViewStyle } from "react-native";

import { tw } from "../../lib";
import { PrimaryButton } from "./PrimaryButton";
import { Body1 } from "../text/Body1";
import { Header2 } from "../text/Header2";

type Props = {
  onPress: () => void;
  headerText: string;
  textChild?: ReactNode | string;
  buttonText: string;
  padding?: boolean;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<TextStyle>;
  headerTextStyle?: StyleProp<TextStyle>;
  bodyTextStyle?: StyleProp<TextStyle>;
  buttonLoading?: boolean;
}

export const PrimaryButtonCard: React.FC<Props> = ({
  onPress,
  headerText,
  textChild,
  buttonText,
  padding = true,
  style = {},
  headerTextStyle = {},
  bodyTextStyle = {},
  buttonStyle = {},
  backgroundColor = "bg-gray-100",
  buttonLoading = false,
}) => {
  return (
    <View
      style={[
        style,
        tw`p-6 ${backgroundColor} rounded-lg flex-col justify-start items-start gap-4 ${
          padding ? "my-3" : ""
        }`,
      ]}
    >
      <View style={tw`flex flex-col justify-start items-start gap-2`}>
        {/* TOP SECTION */}
        <View style={tw`flex-row justify-center items-center gap-2`}>
          <Header2
            text={headerText}
            textStyle={[tw``, { flexShrink: 1 }, headerTextStyle]}
          />
        </View>
        {/* MIDDLE SECTION */}
        {textChild && (
          <View>
            {typeof textChild === "string" ? (
              <Body1 text={textChild} textStyle={[tw``, bodyTextStyle]} />
            ) : (
              textChild
            )}
          </View>
        )}
      </View>
      {/* BOTTOM BUTTON */}
      <PrimaryButton
        onPress={onPress}
        text={buttonText}
        paddingTop={false}
        style={[tw`w-full rounded-lg`, buttonStyle]}
        loading={buttonLoading}
      />
    </View>
  );
};
