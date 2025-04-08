import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleProp,
  ViewStyle,
  ScrollView,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
import tw from 'twrnc';

import {FadeInView} from '../../layouts';

type Severity = {
  value: number;
  backgroundColor: string;
  backgroundColorHex: string;
};

const severityArray: Severity[] = [
  {
    value: 0,
    backgroundColor: 'bg-gray-660', // gray-200
    backgroundColorHex: '#4b5563',
  },
  {
    value: 1,
    backgroundColor: 'bg-green-600', // green-400
    backgroundColorHex: '#16a34a',
  },
  {
    value: 2,
    backgroundColor: 'bg-lime-600', // lime-200
    backgroundColorHex: '#65a30d',
  },
  {
    value: 3,
    backgroundColor: 'bg-yellow-600', // yellow-200
    backgroundColorHex: '#ca8a04',
  },
  {
    value: 4,
    backgroundColor: 'bg-orange-600', // orange-400
    backgroundColorHex: '#ea580c',
  },
  {
    value: 5,
    backgroundColor: 'bg-red-600', // red-400
    backgroundColorHex: '#dc2626',
  },
];

type Props = {
  severity: number;
  setSeverity: Dispatch<SetStateAction<number>>;
  lowerBoundText: string;
  upperBoundText: string;
  style?: StyleProp<ViewStyle>;
};

export const SeverityInput: React.FC<Props> = ({
  severity,
  setSeverity,
  lowerBoundText,
  upperBoundText,
  style = {},
}): JSX.Element => {
  const sliderRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(
    Dimensions.get('window').width - 60,
  );
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipWidth = 20; // Set this to the actual width of your tooltip

  const handleLayout = (event: {nativeEvent: {layout: {width: number}}}) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  const handleSliding = (value: number) => {
    const padding = value > 3 ? 30 : value === 3 ? 32 : 24;
    const effectiveSliderWidth = sliderWidth - 2 * padding;
    const xOffset =
      (value / 5) * effectiveSliderWidth + padding - tooltipWidth / 2;
    setTooltipStyle({
      left: xOffset,
    });
    setSeverity(value);
  };

  const positionTooltip = (value: number) => {
    const padding = value > 3 ? 30 : value === 3 ? 32 : 24;
    const effectiveSliderWidth = sliderWidth - 2 * padding;
    const xOffset =
      (value / 5) * effectiveSliderWidth + padding - tooltipWidth / 2;
    setTooltipStyle({left: xOffset});
  };

  useEffect(() => {
    // initially position the tooltip
    const timer = setTimeout(() => {
      positionTooltip(severity);
    }, 0);

    return () => clearTimeout(timer); // Cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severity, sliderWidth]);

  return (
    <ScrollView scrollEnabled={true}>
      <View
        style={[tw`mt-1 flex-1`, style]}
        ref={sliderRef}
        onLayout={handleLayout}>
        {severity > 0 && (
          <FadeInView duration={200}>
            <View
              style={[
                tw`absolute px-2 py-1 rounded mt-3 ${severityArray[severity].backgroundColor}`,
                tooltipStyle,
              ]}>
              <Text style={tw`text-white text-xs`}>{severity}</Text>
            </View>
          </FadeInView>
        )}
        <View style={tw`mt-12`}>
          <Slider
            onValueChange={handleSliding}
            onSlidingComplete={setSeverity}
            step={1}
            value={severity}
            minimumValue={0}
            maximumValue={5}
            maximumTrackTintColor="#d1d5db"
            minimumTrackTintColor={severityArray[severity].backgroundColorHex}
            style={tw`flex-1 mx-3`}
          />
        </View>
      </View>
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <Text style={tw`text-neutral-500 text-sm`}>{lowerBoundText}</Text>
        <Text style={tw`text-neutral-500 text-sm`}>{upperBoundText}</Text>
      </View>
    </ScrollView>
  );
};
