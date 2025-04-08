import React from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from "@fortawesome/react-native-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { tw } from "../../lib";

/**
 * @param color - needs to be in hex
 */
type Props = {
  size: number;
  color?: string;
  style?: FontAwesomeIconStyle;
}

export const ChevronDown: React.FC<Props> = ({
  size,
  color = "#FFFFFF",
  style,
}) => {
  return (
    <FontAwesomeIcon
      icon={faChevronDown}
      size={size}
      color={color}
      style={[tw``, style]}
    />
  );
};
