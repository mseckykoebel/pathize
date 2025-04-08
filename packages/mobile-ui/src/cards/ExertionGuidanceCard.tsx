import React, { ReactNode } from "react";
import { View, StyleProp, TextStyle } from "react-native";

import { tw } from "../../lib";
import { Header2 } from "../text/Header2";
import { Body1 } from "../text/Body1";

function convertMinsToString(n: number) {
  const num = n;
  const hours = num / 60;
  const rhours = Math.floor(hours);
  const minutes = num % 60;
  const rminutes = Math.round(minutes);
  return rhours > 0 ? `${rhours}h ${rminutes}m` : `${rminutes}m`;
}

/**
 * @param enabled - whether the feature is available or not
 */
type Props = {
  enabled: boolean;
  titleText: string;
  titleTextStyle?: StyleProp<TextStyle>;
  subheaderText?: string;
  subheaderTextStyle?: StyleProp<TextStyle>;
  tolCurrent: number;
  tolCurrentStyle?: StyleProp<TextStyle>;
  tolAverage?: number;
  tolMax: number;
  bottomChild?: ReactNode;
  onPress?: () => void;
  onMoreDetailsPress?: () => void;
};

export const ExertionGuidanceCard: React.FC<Props> = ({
  enabled,
  titleText,
  titleTextStyle = {},
  subheaderText,
  subheaderTextStyle = {},
  tolCurrent,
  tolCurrentStyle = {},
  tolAverage,
  tolMax,
  bottomChild,
  onPress,
  onMoreDetailsPress,
}) => {
  const progressWidth = (tolCurrent / tolMax) * 100;
  const progressAverageWidth = tolAverage ? (tolAverage / tolMax) * 100 : null;

  const ProgressBar = () => {
    return (
      <View
        style={[
          tw`flex-row justify-start items-center h-2 mx-auto`,
          { width: "100%" },
        ]}
      >
        <View style={tw`absolute w-full h-2 bg-neutral-200 rounded-lg`} />
        <View
          style={[
            tw`absolute h-2 bg-green-300 rounded-lg`,
            { width: `${progressWidth}%` },
          ]}
        />
      </View>
    );
  };

  return (
    <>
      <View style={[tw`px-7 py-6 bg-gray-100 rounded-lg mx-4`]}>
        {/* LEFT SIDE */}
        <View style={[tw`flex flex-col items-start`]}>
          <View style={[tw`flex flex-row justify-center items-center`]}>
            <Header2 text={titleText} textStyle={[tw`mr-1`, titleTextStyle]} />
          </View>
          <Header2
            text={convertMinsToString(tolCurrent)}
            textStyle={[tw`mr-1`, tolCurrentStyle]}
          />
          {/* SUBHEADER */}
          {subheaderText ? (
            <Body1
              text={subheaderText}
              textStyle={[tw``, subheaderTextStyle]}
            />
          ) : null}
        </View>
        {/* PROGRESS BAR, ONLY IF ENABLED */}
        {enabled ? (
          <>
            <ProgressBar />
            {/* LABEL ON BOTTOM LEFT AND BOTTOM RIGHT */}
            <View style={[tw`flex flex-row justify-between items-center mt-2`]}>
              <Body1 text="0" textStyle={[tw`text-neutral-500`]} />
              <Body1
                text={convertMinsToString(tolMax)}
                textStyle={[tw`text-neutral-500`]}
              />
            </View>
          </>
        ) : null}
        {/* BUTTON CHILD */}
        {bottomChild ? bottomChild : null}
      </View>
    </>
  );
};
