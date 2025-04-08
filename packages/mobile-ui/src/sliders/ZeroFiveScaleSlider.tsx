/* eslint-disable indent */
import React, { useState, useRef, useEffect } from "react";
import {
  Text,
  View,
  StyleProp,
  ViewStyle,
  Dimensions,
  TextStyle,
} from "react-native";
import Slider from "@react-native-community/slider";
import { tw } from "../../lib";
import { FadeIn } from "../layout/FadeIn";

const getPadding = (value: number) => {
  switch (value) {
    case 0:
      return 0;
    case 1:
      return 18;
    case 2:
      return 0;
    case 3:
      return 55;
    case 4:
      return 35;
    case 5:
      return 35;
    default:
      return 0;
  }
};

type Props = {
  headerText: string;
  sliderStartText: string;
  sliderEndText: string;
  setValue: (value: number) => void;
  initialValue?: number;
  padding?: boolean;
  style?: StyleProp<ViewStyle>;
  headerTextStyle?: StyleProp<TextStyle>;
  sliderTextStyle?: StyleProp<TextStyle>;
};

export const ZeroFiveScaleSlider: React.FC<Props> = ({
  headerText,
  sliderStartText,
  sliderEndText,
  setValue,
  initialValue,
  padding = true,
  style = {},
  headerTextStyle = {},
  sliderTextStyle = {},
}) => {
  const [sliderValue, setSliderValue] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const [sliderWidth, setSliderWidth] = useState(
    Dimensions.get("window").width - 60
  );
  const tooltipWidth = 20;
  const sliderRef = useRef(null);

  const handleSliding = (value: number) => {
    const padding = getPadding(value);
    const effectiveSliderWidth = sliderWidth - 2 * padding;
    const xOffset =
      (value / 5) * effectiveSliderWidth + padding - tooltipWidth / 2;
    setTooltipStyle({ left: xOffset });
    setSliderValue(value);
    setValue(value);
  };

  const handleLayout = (event: {
    nativeEvent: { layout: { width: number } };
  }) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  useEffect(() => {
    if (initialValue !== undefined && sliderWidth) {
      handleSliding(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, sliderWidth]);

  return (
    <View
      style={[style, tw`p-6 bg-gray-100 rounded-lg ${padding ? "my-3" : ""}`]}
    >
      <View style={tw`flex-1`}>
        {/* TOP SECTION */}
        <Text
          style={[
            tw`text-black text-base font-medium leading-tight`,
            headerTextStyle,
          ]}
        >
          {headerText}
        </Text>
        {/* SLIDER AREA */}
        <View style={tw`flex-1`} ref={sliderRef} onLayout={handleLayout}>
          {sliderValue > 0 && (
            <FadeIn duration={200}>
              <View
                style={[
                  tw`absolute w-8 h-8 bg-slate-900 rounded-full mt-3 items-center justify-center`,
                  tooltipStyle,
                ]}
              >
                <Text
                  style={[tw`text-white text-base font-bold`, sliderTextStyle]}
                >
                  {sliderValue}
                </Text>
              </View>
            </FadeIn>
          )}
          <View style={tw`mt-12`}>
            <Slider
              value={initialValue}
              onValueChange={handleSliding}
              onSlidingComplete={setValue}
              step={1}
              minimumValue={0}
              maximumValue={5}
              maximumTrackTintColor="#d1d5db"
              minimumTrackTintColor="#95DAB2"
              style={tw`flex-1 mx-3`}
            />
          </View>
        </View>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text
            style={[tw`text-neutral-500 text-sm leading-none`, sliderTextStyle]}
          >
            {sliderStartText}
          </Text>
          <Text
            style={[tw`text-neutral-500 text-sm leading-none`, sliderTextStyle]}
          >
            {sliderEndText}
          </Text>
        </View>
      </View>
    </View>
  );
};
