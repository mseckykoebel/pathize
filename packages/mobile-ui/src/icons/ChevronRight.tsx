import React, { memo } from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from "@fortawesome/react-native-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { tw } from "../../lib";

/**
 * @param color - needs to be in hex
 */
type Props = {
  size: number;
  color?: string;
  style?: FontAwesomeIconStyle;
}

export const ChevronRight: React.FC<Props> = memo(
  ({ size, color = "#7A7A7A", style }) => {
    return (
      <FontAwesomeIcon
        icon={faChevronRight}
        size={size}
        color={color}
        style={[tw``, style]}
      />
    );
  }
);

ChevronRight.displayName = "ChevronRight";
