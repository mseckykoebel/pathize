/* eslint-disable indent */
import React, {
  ReactNode,
  useRef,
  useState,
  Ref,
  useCallback,
  useEffect,
} from "react";
import {
  Animated,
  View,
  Text,
  StyleProp,
  TextInput,
  TextStyle,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { tw } from "../../lib";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedView = Animated.createAnimatedComponent(View);

type Props = {
  value: string;
  ref?: Ref<TextInput>;
  onFocus?: () => void;
  borderAlways?: boolean;
  padding?: boolean;
  paddingBottom?: boolean;
  inputBackgroundColor?: "bg-white" | "bg-gray-100";
  rightComponent?: ReactNode; // image on right side of input (optional)
  headerText?: string; // text above input (optional)
  placeholderText?: string; // placeholder text
  secureTextEntry?: boolean; // if password
  inputMode?: "text" | "numeric" | "email" | "tel";
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  textContentType?:
    | "none"
    | "URL"
    | "addressCity"
    | "addressCityAndState"
    | "addressState"
    | "countryName"
    | "creditCardNumber"
    | "emailAddress"
    | "familyName"
    | "fullStreetAddress"
    | "givenName"
    | "jobTitle"
    | "location"
    | "middleName"
    | "name"
    | "namePrefix"
    | "nameSuffix"
    | "nickname"
    | "organizationName"
    | "postalCode"
    | "streetAddressLine1"
    | "streetAddressLine2"
    | "sublocality"
    | "telephoneNumber"
    | "username"
    | "password"
    | "newPassword"
    | "oneTimeCode";
  style?: StyleProp<TextStyle>;
};

export const InputFieldReadOnly: React.FC<Props> = ({
  value,
  ref = null,
  onFocus = () => undefined,
  borderAlways = false,
  padding = false,
  paddingBottom = true,
  inputBackgroundColor = "bg-gray-100", //gray-100 as default background color for this
  rightComponent,
  headerText,
  placeholderText,
  autoCapitalize = "none",
  secureTextEntry = false,
  inputMode = "text",
  keyboardType = "default",
  textContentType = "none",
  style = {},
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current; // 2 for filled, 0 for empty if no initial value
  const [textValue, setTextValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      inputBackgroundColor === "bg-white" ? "#f4f4f5" : "#a1a1aa", // zinc-400
      "transparent",
    ],
  });

  const inputPadding = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 2],
  });

  const bgColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      inputBackgroundColor === "bg-white" ? "#FFFFFF" : "#F3F4F6",
      "#FFFFFF",
    ],
  });

  const animatedStyle = {
    ...(!borderAlways && borderColor),
    backgroundColor: bgColor,
    borderWidth: 1,
    padding: inputPadding,
  };

  const animatedStyleRightComponent = {
    backgroundColor: bgColor,
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // TODO: issue where entire screen is read-only inputs and toValue becomes 0, will not go back
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (textValue.length > 0) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [animatedValue, textValue]);

  const handleFinalState = useCallback(() => {
    if (isFocused) return;
    if (textValue.length > 0) {
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [animatedValue, textValue, isFocused]);

  useEffect(() => {
    setTextValue(value);
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidChangeFrame",
      handleFinalState
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [value, handleFinalState]);

  if (rightComponent) {
    return (
      <>
        {headerText && (
          <Text
            style={[
              tw`text-neutral-500 text-base font-medium mb-1 ${
                padding ? "mt-3" : ""
              }`,
              style,
            ]}
          >
            {headerText}
          </Text>
        )}
        <AnimatedView
          style={[
            tw`pl-2 h-12 rounded-lg flex-row items-center ${
              padding ? "mb-3" : ""
            } ${paddingBottom ? "mb-3" : ""} ${
              borderAlways
                ? `border ${
                    inputBackgroundColor === "bg-white"
                      ? "border-zinc-300"
                      : "border-zinc-400"
                  }`
                : ""
            }`,
            animatedStyle,
          ]}
        >
          <TextInput
            ref={ref}
            value={textValue}
            editable={false}
            placeholder={placeholderText}
            secureTextEntry={secureTextEntry}
            inputMode={inputMode}
            keyboardType={keyboardType}
            textContentType={textContentType}
            autoCapitalize={autoCapitalize}
            style={[
              tw`h-14 text-slate-900 text-opacity-80 text-base leading-tight flex-1`,
              style,
              { lineHeight: 22 },
            ]}
            pointerEvents="none"
          />
          <AnimatedView style={[tw`pr-2 pl-2`, animatedStyleRightComponent]}>
            {rightComponent}
          </AnimatedView>
          {/* COVER THE ENTIRE PARENT */}
          <TouchableOpacity
            style={tw`absolute inset-0 bg-transparent`}
            onPress={handleFocus}
            onBlur={handleBlur}
            activeOpacity={1}
          />
        </AnimatedView>
      </>
    );
  } else {
    return (
      <>
        {headerText && (
          <Text
            style={[
              tw`text-neutral-500 text-base font-medium mb-1 ${
                padding ? "mt-3" : ""
              }`,
              style,
            ]}
          >
            {headerText}
          </Text>
        )}
        <AnimatedTextInput
          ref={ref}
          value={textValue}
          editable={false}
          placeholder={placeholderText}
          secureTextEntry={secureTextEntry}
          inputMode={inputMode}
          keyboardType={keyboardType}
          textContentType={textContentType}
          autoCapitalize={autoCapitalize}
          style={[
            tw`text-slate-900 text-opacity-80 leading-tight flex-1 h-14 pl-2 rounded-lg text-base ${
              padding ? "mb-3" : ""
            } ${paddingBottom ? "mb-3" : ""} ${
              borderAlways
                ? `border ${
                    inputBackgroundColor === "bg-white"
                      ? "border-zinc-300"
                      : "border-zinc-400"
                  }`
                : ""
            }`,
            animatedStyle,
            style,
            { lineHeight: 22 },
          ]}
        />
        {/* COVER THE ENTIRE PARENT WITH TOUCHABLE AREA */}
        <TouchableOpacity
          style={tw`absolute inset-0 bg-transparent`}
          onPress={handleFocus}
          onBlur={handleBlur}
          activeOpacity={1}
        />
      </>
    );
  }
};
