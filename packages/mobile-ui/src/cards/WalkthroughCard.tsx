import React, { ReactNode } from "react";
import { Text, View, StyleProp, ViewStyle } from "react-native";
import { tw } from "../../lib";

const AlertChildString: React.FC<{ number: string }> = ({ number }) => {
  return (
    <Text style={tw`text-center text-zinc-900 text-xs font-medium`}>
      {number}
    </Text>
  );
};

const TextChildString: React.FC<{ text: string }> = ({ text }) => {
  return <Text style={tw`text-black text-sm`}>{text}</Text>;
};

type Props = {
  headerText: string;
  alertChild: ReactNode | string;
  textChild: ReactNode | string;
  bottomChild: ReactNode;
  padding?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const WalkthroughCard: React.FC<Props> = ({
  headerText,
  alertChild,
  textChild,
  bottomChild,
  padding = true,
  style = {},
}) => {
  return (
    <View
      style={[
        style,
        tw`p-6 bg-gray-100 rounded-lg flex-col justify-start items-start gap-4 ${
          padding ? "my-3" : ""
        }`,
      ]}
    >
      <View style={tw`flex flex-col justify-start items-start gap-2`}>
        {/* TOP SECTION */}
        <View style={tw`flex-row justify-center items-center gap-2`}>
          <View
            style={tw`px-2 py-0.9 bg-green-300 rounded-full justify-center items-center`}
          >
            {/* THIS WILL RENDER THE ALERT CHILD PLACE HOLDER IF GIVEN A REACT NODE CHILD */}
            {typeof alertChild === "string" ? (
              <AlertChildString number={alertChild} />
            ) : (
              alertChild
            )}
          </View>
          <Text style={[tw`text-black text-base font-bold`, { flexShrink: 1 }]}>
            {headerText}
          </Text>
        </View>
        {/* MIDDLE SECTION */}
        <View>
          {typeof textChild === "string" ? (
            <TextChildString text={textChild} />
          ) : (
            textChild
          )}
        </View>
      </View>
      {/* BOTTOM CHILD/BUTTON */}
      {bottomChild && <View style={tw`w-full`}>{bottomChild}</View>}
    </View>
  );
};
