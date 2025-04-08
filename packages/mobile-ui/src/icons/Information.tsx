import React from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from "@fortawesome/react-native-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { tw } from "../../lib";

/**
 * @param color - needs to be in hex
 */
type Props = {
  size: number;
  color?: string;
  style?: FontAwesomeIconStyle;
}

export const Information: React.FC<Props> = ({
  size,
  color = "#61646B",
  style,
}) => {
  return (
    <FontAwesomeIcon
      icon={faInfoCircle}
      size={size}
      color={color}
      style={[tw``, style]}
    />
  );
};
