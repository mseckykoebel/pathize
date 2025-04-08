import React, { memo } from "react";
import {
  FontAwesomeIcon,
  FontAwesomeIconStyle,
} from "@fortawesome/react-native-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { tw } from "../../lib";

type Props = {
  icon: IconDefinition;
  iconColor?: string;
  size?: number;
  style?: FontAwesomeIconStyle;
}

/**
 *
 * @param iconColor must be in hex
 */
export const PathizeIcon: React.FC<Props> = memo(
  ({ icon, iconColor = "#002648", size = 24, style = {} }) => {
    return (
      <FontAwesomeIcon
        style={[tw``, style]}
        icon={icon}
        color={iconColor}
        size={size}
      />
    );
  }
);

PathizeIcon.displayName = "PathizeIcon";
