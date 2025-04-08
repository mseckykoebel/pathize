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
  Text,
  StyleProp,
  TextInput,
  TextStyle,
  Keyboard,
  View,
} from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { tw } from "../../lib";

const AnimatedKeyboardAvoidingTextInput =
  Animated.createAnimatedComponent(BottomSheetTextInput);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * InputField
 * @param inputBackgroundColor - background color of input in hex format
 *
 */
type Props = {
  value: string;
  onChangeText: (message: string) => void;
  ref?: Ref<TextInput>;
  onFocus?: () => void;
  padding?: boolean;
  animations?: boolean;
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
  shouldHandleKeyboardEvents?: boolean;
  multiline?: boolean;
  style?: StyleProp<TextStyle>;
}

export const InputField: React.FC<Props> = ({
  value,
  onChangeText,
  animations = true,
  ref = null,
  padding = false,
  paddingBottom = true,
  onFocus = () => undefined,
  inputBackgroundColor = "#F3F4F6", //gray-100 as default background color for this
  rightComponent,
  headerText,
  placeholderText,
  autoCapitalize = "none",
  secureTextEntry = false,
  inputMode = "text",
  keyboardType = "default",
  textContentType = "none",
  multiline = false,
  shouldHandleKeyboardEvents = false,
  style = {},
}) => {
  const animatedValue = useRef(new Animated.Value(value ? 2 : 0)).current; // 2 for filled, 0 for empty if no initial value
  const [textValue, setTextValue] = useState(value || "");
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      inputBackgroundColor === "bg-white" ? "#f4f4f5" : "#939393", // zinc-400
      "#a3a3a3", // neutral-400
      "transparent",
    ],
  });

  const inputPadding = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [2, 2, 2],
  });

  const bgColor = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      inputBackgroundColor === "bg-white" ? "#FFFFFF" : "#F3F4F6",
      "#FFFFFF",
      "#FFFFFF",
    ],
  });

  const animatedStyle = {
    ...(animations
      ? {
        borderColor,
        backgroundColor: bgColor,
        borderWidth: 1,
        padding: inputPadding,
      }
      : {
        borderWidth: 1,
        borderColor: "#a1a1aa",
      }),
  };

  const animatedStyleRightComponent = {
    backgroundColor: bgColor,
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus();
    console.log("handle focus is running...");
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (textValue.length > 0) {
      Animated.timing(animatedValue, {
        toValue: 2,
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
        toValue: 2,
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
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidChangeFrame",
      handleFinalState
    );

    return () => {
      keyboardDidHideListener.remove();
    };
  }, [value, handleFinalState]);

  const handleTextChange = (text: string) => {
    onChangeText(text); // parent state
    setTextValue(text); // internal state for animations
    setTimeout(() => {
      if (text.length > 0) {
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
    }, 50); // 50ms delay
  };

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
            tw`pl-2 h-12 rounded-lg flex-col justify-center ${
              paddingBottom || padding ? "mb-3" : ""
            } ${!headerText && padding ? "mt-3" : ""} ${
              multiline ? "h-30 p-4" : ""
            }`,
            animatedStyle,
          ]}
        >
          <>
            {shouldHandleKeyboardEvents ? (
              <AnimatedKeyboardAvoidingTextInput
                value={textValue}
                onChangeText={handleTextChange}
                placeholder={placeholderText}
                secureTextEntry={secureTextEntry}
                inputMode={inputMode}
                keyboardType={keyboardType}
                textContentType={textContentType}
                autoCapitalize={autoCapitalize}
                multiline={multiline}
                numberOfLines={multiline ? 6 : undefined}
                maxLength={multiline ? 256 : undefined}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSelectionChange={handleBlur}
                style={[
                  tw`text-base font-medium text-slate-900`,
                  style,
                  { lineHeight: 22 },
                ]}
              />
            ) : (
              <TextInput
                ref={ref}
                value={textValue}
                onChangeText={handleTextChange}
                placeholder={placeholderText}
                secureTextEntry={secureTextEntry}
                inputMode={inputMode}
                keyboardType={keyboardType}
                textContentType={textContentType}
                autoCapitalize={autoCapitalize}
                multiline={multiline}
                numberOfLines={multiline ? 6 : undefined}
                maxLength={multiline ? 256 : undefined}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onSelectionChange={handleBlur}
                style={[
                  tw`text-base font-medium text-slate-900`,
                  style,
                  { lineHeight: 22 },
                ]}
              />
            )}
          </>

          <AnimatedView
            style={[
              tw`absolute right-0 pr-2 pl-2`,
              animatedStyleRightComponent,
            ]}
          >
            {rightComponent}
          </AnimatedView>
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
        {shouldHandleKeyboardEvents ? (
          <AnimatedKeyboardAvoidingTextInput
            value={textValue}
            onChangeText={handleTextChange}
            placeholder={placeholderText}
            secureTextEntry={secureTextEntry}
            inputMode={inputMode}
            keyboardType={keyboardType}
            textContentType={textContentType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            numberOfLines={multiline ? 6 : undefined}
            maxLength={multiline ? 256 : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelectionChange={handleBlur}
            style={[
              tw`h-12 pl-2 rounded-lg text-base font-medium text-slate-900 ${
                padding || paddingBottom ? "mb-3" : ""
              } ${multiline ? "h-30 p-4" : ""} ${
                !headerText && padding ? "mt-3" : ""
              }`,
              animatedStyle,
              style,
              { lineHeight: 22 },
            ]}
          />
        ) : (
          <AnimatedTextInput
            ref={ref}
            value={textValue}
            onChangeText={handleTextChange}
            placeholder={placeholderText}
            secureTextEntry={secureTextEntry}
            inputMode={inputMode}
            keyboardType={keyboardType}
            textContentType={textContentType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            numberOfLines={multiline ? 6 : undefined}
            maxLength={multiline ? 256 : undefined}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSelectionChange={handleBlur}
            style={[
              tw`h-12 pl-2 rounded-lg text-base font-medium text-slate-900 ${
                padding || paddingBottom ? "mb-3" : ""
              } ${multiline ? "h-30 p-4" : ""}`,
              animatedStyle,
              style,
              { lineHeight: 22 },
            ]}
          />
        )}
      </>
    );
  }
};
