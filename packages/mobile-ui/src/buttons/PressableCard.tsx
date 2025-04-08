import React, { ReactNode } from "react";
import {
  Text,
  View,
  StyleProp,
  ViewStyle,
  TouchableOpacity,
  TextStyle,
} from "react-native";
import { trigger } from "react-native-haptic-feedback";
import { tw } from "../../lib";
import { Header3 } from "../text/Header3";
import { Body1 } from "../text/Body1";

const AlertChildString: React.FC<{ text: string }> = ({ text }) => {
  return (
    <Text style={tw`text-center text-black text-xs font-medium`}>{text}</Text>
  );
};

type Props = {
  onPress: () => void;
  headerText: string;
  alertChild?: ReactNode | string;
  alertStyle?: StyleProp<ViewStyle>;
  textChild?: ReactNode | string;
  padding?: boolean;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  headerTextStyle?: StyleProp<TextStyle>;
  bodyTextStyle?: StyleProp<TextStyle>;
  hapticFeedback?: boolean;
};

/**
 * @description alert child is the component the shows in top right
 */
export const PressableCard: React.FC<Props> = ({
  onPress,
  headerText,
  alertChild,
  alertStyle = {},
  textChild,
  padding = true,
  style = {},
  headerTextStyle = {},
  bodyTextStyle = {},
  backgroundColor = "bg-gray-100",
  hapticFeedback = true,
}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        hapticFeedback && trigger("impactLight");
        onPress();
      }}
      style={[
        style,
        tw`p-6 ${backgroundColor} rounded-lg flex-col justify-start items-start gap-4 ${
          padding ? "my-3" : ""
        }`,
      ]}
    >
      <View style={tw`flex flex-col justify-start items-start gap-2`}>
        {/* TOP SECTION */}
        <View style={[tw`flex-row justify-center items-center gap-2`]}>
          <View
            style={[
              tw`px-2 py-0.9 bg-green-300 rounded-full justify-center items-center mr-2`,
              alertStyle,
            ]}
          >
            {/* THIS WILL RENDER THE ALERT CHILD PLACE HOLDER IF GIVEN A REACT NODE CHILD */}
            {typeof alertChild === "string" ? (
              <AlertChildString text={alertChild} />
            ) : (
              alertChild
            )}
          </View>
          <Header3
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
    </TouchableOpacity>
  );
};
