import React from "react";
import { Switch, StyleProp, ViewStyle } from "react-native";

type Props = {
  isEnabled: boolean;
  onValueChange: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ToggleSwitch: React.FC<Props> = ({
  isEnabled,
  onValueChange,
  style = {},
}) => {
  return (
    <Switch
      trackColor={{ false: "#767577", true: "#08816E" }}
      thumbColor={isEnabled ? "#F4F3F4" : "#F4F3F4"}
      ios_backgroundColor="#F0F0F0"
      onValueChange={() => {
        onValueChange();
      }}
      value={isEnabled}
      style={[style]}
    />
  );
};
