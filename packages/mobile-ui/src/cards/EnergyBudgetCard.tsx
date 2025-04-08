/* eslint-disable indent */
import React, { ReactNode, useCallback } from "react";
import { View, StyleProp, TextStyle } from "react-native";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";

import { tw } from "../../lib";
import { Header2 } from "../text/Header2";
import { Body1 } from "../text/Body1";
import { Loading } from "../state/Loading";
import { FadeIn } from "../layout/FadeIn";
import { RoundedButtonWithIcon } from "../buttons/RoundedButtonWithIcon";
import { Badge } from "../badges/Badge";

/**
 * @description convert minutes to hours and minutes
 */
function convertMinsToString(n: number) {
  if (n === 0) return "0m";
  const num = n;
  const hours = num / 60 / 60;
  const rhours = Math.floor(hours);
  const minutes = (hours - rhours) * 60;
  const rminutes = Math.round(minutes);
  return rhours > 0 ? `${rhours}h ${rminutes}m` : `${rminutes}m`;
}

/**
 * @description Progress bar component
 */
const ProgressBar = ({ progressWidth }: { progressWidth: number }) => {
  return (
    <View
      style={[
        tw`flex-row justify-start items-center h-2 mx-auto`,
        { width: "100%" },
      ]}
    >
      <View style={tw`absolute w-full h-2 bg-white rounded-lg`} />
      <View
        style={[
          tw`absolute h-2 rounded-lg`,
          { width: `${progressWidth <= 100 ? progressWidth : 100}%` },
          progressWidth < 20
            ? tw`bg-green-300`
            : progressWidth < 40
              ? tw`bg-green-500`
              : progressWidth < 60
                ? tw`bg-lime-400`
                : progressWidth < 80
                  ? tw`bg-yellow-500`
                  : tw`bg-red-400`,
        ]}
      />
    </View>
  );
};

/**
 * @param enabled - whether the feature is available or not
 */
type Props = {
  enabled: boolean;
  loading: boolean;
  error: boolean;
  titleText: string;
  titleTextStyle?: StyleProp<TextStyle>;
  subheaderText?: string | ReactNode;
  subheaderTextStyle?: StyleProp<TextStyle>;
  tolCurrent?: number;
  tolCurrentStyle?: StyleProp<TextStyle>;
  tolAverage?: number;
  tolMax?: number;
  bodyText?: string;
  bodyTextStyle?: StyleProp<TextStyle>;
  bottomChild?: ReactNode;
  onPress?: () => void;
  onHelpPress?: () => void;
  onMoreDetailsPress?: () => void;
};

export const EnergyBudgetCard: React.FC<Props> = ({
  enabled,
  loading = false,
  titleText,
  titleTextStyle = {},
  subheaderText,
  subheaderTextStyle = {},
  tolCurrent,
  tolCurrentStyle = {},
  tolMax,
  bodyText,
  bodyTextStyle = {},
  bottomChild,
  // BUTTONS
  onHelpPress,
}) => {
  const getProgressWidth = (tCurrent: number, tMax: number): number => {
    return (tCurrent / tMax) * 100;
  };
  // const getProgressAverageWidth = (
  //   tolAverage: number,
  //   tolMax: number
  // ): number | null => {
  //   return tolAverage ? (tolAverage / tolMax) * 100 : null;
  // };

  const onIconPress = useCallback(() => {
    console.log("onIconPress");
    if (onHelpPress) onHelpPress();
  }, [onHelpPress]);

  return (
    <>
      <View style={[tw`px-7 py-6 bg-sky-100 rounded-lg mx-4`]}>
        {/* LEFT SIDE */}
        <View style={[tw`flex flex-col`]}>
          <View style={[tw`flex flex-row justify-between items-center`]}>
            {/* HEADER + BADGE ON THE LEFT */}
            <View style={[tw`flex flex-row justify-start items-center`]}>
              <Header2
                text={titleText}
                textStyle={[tw`mr-1`, titleTextStyle]}
              />
              <Badge
                text="Beta"
                textSize="xs"
                textColor="text-sky-900"
                badgeBackgroundColor="bg-sky-200"
                rounded="large"
                style={tw`ml-1`}
              />
              <Loading loading={loading} style={[tw`ml-2`]} />
            </View>
            {/* QUESTION MARK BUTTON ON THE RIGHT */}
            <RoundedButtonWithIcon
              icon={faQuestion}
              hapticFeedback={true}
              iconSize={18}
              iconColor="#0c4a6e"
              iconBackgroundColor="bg-sky-200"
              style={tw``}
              onPress={onIconPress}
            />
          </View>
          {/* CURRENT TIME ABOVE LIMIT FOR THIS DAY */}
          <Header2
            text={
              tolCurrent !== undefined ? convertMinsToString(tolCurrent) : "-"
            }
            textStyle={[tw`mr-1`, tolCurrentStyle]}
          />
          {/* SUBHEADER */}
          {typeof subheaderText === "string" ? (
            <Body1
              text={subheaderText}
              textStyle={[tw``, subheaderTextStyle]}
            />
          ) : (
            subheaderText
          )}
          {/* BODY */}
          {bodyText ? (
            <Body1
              text={bodyText}
              textStyle={[tw`text-neutral-500`, bodyTextStyle]}
            />
          ) : null}
        </View>
        {/* PROGRESS BAR, ONLY IF ENABLED */}
        {enabled &&
        !loading &&
        tolCurrent !== undefined &&
        tolMax !== undefined ? (
          <FadeIn duration={250}>
            <ProgressBar progressWidth={getProgressWidth(tolCurrent, tolMax)} />
            {/* LABEL ON BOTTOM LEFT AND BOTTOM RIGHT */}
            <View style={[tw`flex flex-row justify-between items-center mt-2`]}>
              <Body1 text="0m" textStyle={[tw`text-neutral-500`]} />
              <Body1
                text={convertMinsToString(tolMax)}
                textStyle={[tw`text-neutral-500`]}
              />
            </View>
          </FadeIn>
        ) : null}
        {/* BOTTOM CHILD */}
        {enabled &&
        tolCurrent !== undefined &&
        tolMax !== undefined &&
        bottomChild
          ? bottomChild
          : null}
      </View>
    </>
  );
};
