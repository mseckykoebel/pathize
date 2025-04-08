import React, { ReactNode } from "react";
import { View, StyleProp, ViewStyle, TextStyle } from "react-native";
import { faArrowDown, faArrowUp } from "@fortawesome/free-solid-svg-icons";

import { tw } from "../../lib";
import { Badge } from "../badges/Badge";
import { PathizeIcon } from "../icons/PathizeIcon";
import { Header2 } from "../text/Header2";
import { FadeInFadeOut } from "../layout/FadeInFadeOut";

type Props = {
  currentHeartRate: number | null;
  currentHeartRateText: ReactNode | null;
  currentTimeText: ReactNode | null;
  isBeingDragged: boolean;
  today: boolean;
  limit: number;
  headerTextStyle?: StyleProp<TextStyle>;
  rightTextStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
};

export const HeartRateCard: React.FC<Props> = ({
  currentHeartRate,
  currentHeartRateText,
  currentTimeText,
  isBeingDragged,
  today,
  limit,
  headerTextStyle = {},
  rightTextStyle = {},
  style = {},
}) => {
  return (
    <View
      style={[
        tw`px-7 py-6 bg-green-200 rounded-lg flex flex-row justify-between items-center mx-4`,
        style,
      ]}
    >
      {/* LEFT SIDE */}
      <View style={[tw`flex flex-col items-start`]}>
        <View style={[tw`flex flex-row justify-center items-center`]}>
          <Header2
            text={`Heart Rate`}
            textStyle={[tw`mr-1`, headerTextStyle]}
          />
          {currentTimeText}
        </View>
        {currentHeartRateText}
      </View>

      {/* RIGHT SIDE */}
      {currentHeartRate && today && (
        <FadeInFadeOut
          watchValue={
            currentHeartRate && today && !isBeingDragged ? true : false
          }
        >
          <Badge
            iconChild={
              <PathizeIcon
                icon={currentHeartRate <= limit ? faArrowDown : faArrowUp}
                size={12}
              />
            }
            badgeBackgroundColor="bg-lime-100"
            textColor="text-lime-900"
            text={
              currentHeartRate <= limit
                ? `${limit - currentHeartRate} bpm below limit`
                : `${currentHeartRate - limit} bpm above limit`
            }
            style={[tw``, rightTextStyle]}
          />
        </FadeInFadeOut>
      )}
    </View>
  );
};
