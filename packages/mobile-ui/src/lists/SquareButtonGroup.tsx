import React, { Dispatch, SetStateAction, memo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { SquareButtonWithIcon } from "../buttons/SquareButtonWithIcon";
import { tw } from "../../lib";

type Props = {
  iconNames: string[];
  iconExtractor: (item: string) => IconDefinition;
  setSelectedItem: Dispatch<SetStateAction<string | null>>;
  iconBackgroundColor?: string;
  iconSize?: number;
  onPress?: () => void;
  padding?: boolean;
  hapticFeedback?: boolean;
  buttonStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
}

export const SquareButtonGroup: React.FC<Props> = memo(
  ({
    iconNames,
    setSelectedItem,
    iconExtractor,
    onPress,
    padding = true,
    ...props
  }) => {
    return (
      <View
        style={[
          {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
          },
          tw`${padding ? "my-3" : ""} -ml-2 -mr-2`,
        ]}
      >
        {iconNames.map((iconName) => {
          return (
            <SquareButtonWithIcon
              key={iconName}
              onPress={() => {
                setSelectedItem(iconName);
                onPress && onPress();
              }}
              icon={iconExtractor(iconName)}
              {...props}
            />
          );
        })}
      </View>
    );
  }
);

SquareButtonGroup.displayName = "SquareButtonGroup";
