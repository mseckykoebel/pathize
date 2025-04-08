import React, { ReactNode } from "react";
import { View, StyleProp, TextStyle, ViewStyle } from "react-native";
import { faArrowUp, faArrowDown } from "@fortawesome/free-solid-svg-icons";
import { tw } from "../../lib";

import { Body1 } from "../text/Body1";
import { Header2 } from "../text/Header2";
import { PathizeIcon } from "../icons/PathizeIcon";

type Props = {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  titlePadding?: boolean;
  stat: string;
  statStyle?: StyleProp<TextStyle>;
  up?: boolean;
  percentStat: string;
  percentStatStyle?: StyleProp<TextStyle>;
  subtext: string;
  subtextStyle?: StyleProp<TextStyle>;
  padding?: boolean;
  border?: boolean;
  bottomChild?: ReactNode;
  rightChild?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * @description title can be either a custom component, or a string to use the default text component
 */
export const StatListItem: React.FC<Props> = ({
  title,
  titleStyle,
  titlePadding = false,
  stat,
  statStyle = {},
  up,
  percentStat,
  percentStatStyle = {},
  subtext,
  subtextStyle = {},
  border = false,
  padding = false,
  bottomChild,
  rightChild,
  style = {},
}) => {
  return (
    <View
      style={[
        tw`rounded-lg p-3`,
        padding && tw`my-3`,
        border ? tw`border border-zinc-300` : tw`border-2 border-transparent`,
        style,
      ]}
    >
      <View style={tw`flex flex-col justify-center -py-1`}>
        <Body1
          text={title}
          textStyle={[tw`text-base`, titleStyle]}
          padding={titlePadding}
        />
        <View style={tw`flex flex-row justify-between items-center`}>
          {/* TOP AREA */}
          <View style={tw`w-3/5`}>
            {/* STAT AREA */}
            {/* ITEM ON THE LEFT */}
            <View style={tw`flex flex-row items-center`}>
              {/* LEFT HEADER AREA*/}
              <Header2
                text={stat}
                textStyle={[tw`font-semibold mr-2`, statStyle]}
              />
              {/* RIGHT FLEX COL */}
              <View style={tw`flex-shrink`}>
                {/* This will allow the container to shrink and wrap the content */}
                {/* ICON AND */}
                <View
                  style={tw`flex flex-row justify-start items-center -mb-0.5`}
                >
                  {up !== undefined ? (
                    <PathizeIcon
                      icon={up ? faArrowUp : faArrowDown}
                      size={11}
                      iconColor="#737373"
                      style={tw`mr-0.4`}
                    />
                  ) : null}
                  <Body1
                    text={percentStat}
                    textStyle={[tw`text-[.8rem]`, percentStatStyle]}
                  />
                </View>
                <Body1 text={subtext} textStyle={[tw`text-[.8rem]`, subtextStyle]} />
              </View>
            </View>
          </View>
          {/* RIGHT AREA */}
          {rightChild && <View style={tw`w-2/5`}>{rightChild}</View>}
        </View>
        {/* BOTTOM AREA */}
        {bottomChild && bottomChild}
      </View>
    </View>
  );
};
