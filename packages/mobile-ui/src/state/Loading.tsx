import { ActivityIndicator, StyleProp, View, ViewStyle } from "react-native";
import { tw } from "../../lib";

type Props = {
  loading: boolean;
  padding?: boolean;
  size?: "small" | "large";
  style?: StyleProp<ViewStyle>;
}

export const Loading: React.FC<Props> = ({
  loading,
  padding = true,
  size = "small",
  style = {},
}) => {
  return (
    <View
      style={[
        tw`justify-center items-center ${padding ? "my-3" : ""}`,
        style,
      ]}
    >
      <ActivityIndicator size={size} animating={loading} />
    </View>
  );
};
