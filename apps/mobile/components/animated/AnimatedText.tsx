import React, {useRef} from 'react';
import {
  Platform,
  TextProps as RNTextProps,
  TextInput,
  TextInputProps,
} from 'react-native';
import Animated, {
  AnimatedProps,
  SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
} from 'react-native-reanimated';
import tw from 'twrnc';

Animated.addWhitelistedNativeProps({text: true});

interface CustomTextInputProps extends TextInputProps {
  text?: string;
}

interface AnimatedTextInputProps extends AnimatedTextProps {
  formatFn?: (value: number) => string;
  lowerBound?: number;
}

type AnimatedTextProps = {
  text: SharedValue<string>;
  style?: AnimatedProps<RNTextProps>['style'];
};

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export const AnimatedText = ({
  text,
  style,
  formatFn,
  lowerBound,
}: AnimatedTextInputProps): JSX.Element => {
  const inputRef = useRef<TextInput>(null);

  if (Platform.OS === 'web') {
    // For some reason, the worklet reaction evaluates upfront regardless of any
    // conditionals within it, causing Android to crash upon the invokation of `setNativeProps`.
    // We are going to break the rules of hooks here so it doesn't invoke `useAnimatedReaction`
    // for platforms outside of the web.

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAnimatedReaction(
      () => {
        return text.value;
      },
      (data, prevData) => {
        if (data !== prevData && inputRef.current) {
          inputRef.current.setNativeProps({text: data});
        }
      },
      [text],
    );
  }
  const animatedProps = useAnimatedProps<CustomTextInputProps>(() => {
    // If the text value is less than 30, display 'unknown', otherwise, display the original value
    if ((lowerBound && parseFloat(text.value) < lowerBound) || !text.value) {
      return {
        text: '-',
      };
    }
    const displayText = formatFn ? formatFn(Number(text.value)) : text.value;
    return {
      text: displayText,
    };
  });
  return (
    <AnimatedTextInput
      underlineColorAndroid="transparent"
      editable={false}
      ref={Platform.select({web: inputRef})}
      value={text.value}
      style={[tw`text-black`, style]}
      animatedProps={animatedProps}
    />
  );
};
