import React, { ReactNode } from "react";
import { Text, View, StyleProp, ViewStyle } from "react-native";
import { tw } from "../../lib";

const AlertChildString: React.FC<{ text: string }> = ({ text }) => {
  return (
    <Text style={tw`text-center text-zinc-900 text-xs font-medium`}>
      {text}
    </Text>
  );
};

type Props = {
  headerText: string;
  alertChild: ReactNode | string;
  textChild: ReactNode;
  bottomChild?: ReactNode | null;
  style?: StyleProp<ViewStyle>;
}

/**
 * @description alert child is the component tha shows in top right
 */
export const Alert: React.FC<Props> = ({
  headerText,
  alertChild,
  textChild,
  bottomChild,
  style = {},
}) => {
  return (
    <View
      style={[
        style,
        tw`p-6 bg-gray-100 rounded-lg flex-col justify-start items-start gap-4`,
      ]}
    >
      <View style={tw`flex flex-col justify-start items-start gap-2`}>
        {/* TOP SECTION */}
        <View style={tw`flex-row justify-center items-center gap-2`}>
          <View
            style={tw`px-2 py-0.5 bg-green-300 rounded-[21px] justify-center items-center`}
          >
            {/* THIS WILL RENDER THE ALERT CHILD PLACE HOLDER IF GIVEN A REACT NODE CHILD */}
            {typeof alertChild === "string" ? (
              <AlertChildString text={alertChild} />
            ) : (
              alertChild
            )}
          </View>
          <Text style={tw`text-black text-base font-bold`}>{headerText}</Text>
        </View>
        {/* MIDDLE SECTION */}
        <View>{textChild}</View>
      </View>
      {/* BOTTOM CHILD */}
      {bottomChild && <View style={tw`w-full`}>{bottomChild}</View>}
    </View>
  );
};
