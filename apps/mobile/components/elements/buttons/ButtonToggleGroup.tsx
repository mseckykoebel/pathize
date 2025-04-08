import React, {useEffect, useState, useRef, Fragment} from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import tw from 'twrnc';

import {getCircular} from '../../../utils';

interface ButtonToggleGroupProps<T> {
  values: T[];
  value: T;
  onSelect: (value: T) => void;
  textStyle?: object;
  style?: StyleProp<ViewStyle>;
}

export const ButtonToggleGroup = <T,>({
  values,
  value,
  onSelect,
  textStyle = {},
  style = {},
}: ButtonToggleGroupProps<T>) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedPanelLeft = useRef(new Animated.Value(0));

  const widthSize = 100 / values.length;

  const interpolatedValuesInput = values.map((_, i: number) => {
    return widthSize * i;
  });

  const interpolatedValuesOutput = values.map((_, i: number) => {
    return `${widthSize * i}%`;
  });

  useEffect(() => {
    const currentSelectedPanelLeft = selectedPanelLeft.current;

    const left = widthSize * selectedIndex;

    Animated.timing(currentSelectedPanelLeft, {
      toValue: left,
      duration: 0, // making duration 0, but can be made to animate if needed
      useNativeDriver: false,
    }).start();

    return () => {
      currentSelectedPanelLeft.stopAnimation();
    };
  }, [widthSize, selectedIndex]);

  useEffect(() => {
    const newIndex = values.findIndex((v: T) => v === value);
    setSelectedIndex(newIndex);
  }, [values, value, selectedIndex]);

  return (
    <View
      style={[tw`h-12 relative flex-row m-4 rounded-md bg-gray-100`, style]}>
      <Animated.View
        style={[
          tw`absolute h-full rounded-md bg-white border-zinc-300 shadow-md`,
          {
            width: `${widthSize * 0.95}%`,
            height: '80%',
            top: '10%',
            // handle padding from the left dynamically
            left: selectedPanelLeft.current.interpolate({
              inputRange: interpolatedValuesInput,
              outputRange: interpolatedValuesOutput.map(val => {
                const percentage = parseFloat(val.replace('%', ''));
                const adjustment = widthSize * 0.025;
                return `${percentage + adjustment}%`;
              }),
            }),
          },
        ]}
      />
      {values.map((val, i) => (
        <Fragment key={i}>
          <TouchableOpacity
            onPress={() => {
              trigger('impactLight');
              setSelectedIndex(i);
              onSelect(values[i]);
            }}
            style={tw`flex-1`}>
            <View style={tw`h-full flex-1 items-center justify-center`}>
              <Text
                style={[tw`text-slate-900`, textStyle, getCircular('Book')]}>
                {String(val)}
              </Text>
            </View>
          </TouchableOpacity>
          {/* Add divider if not the last item */}
          {i !== values.length - 1 ? (
            <View style={tw`border-r border-zinc-400 h-6 my-3 self-center`} />
          ) : null}
        </Fragment>
      ))}
    </View>
  );
};
