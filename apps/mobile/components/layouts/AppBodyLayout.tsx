import React, {JSXElementConstructor, ReactElement, ReactNode} from 'react';
import {
  View,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  StyleProp,
  ViewStyle,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControlProps,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {NavigationProp} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import tw from 'twrnc';

type Props = {
  avoidKeyboard?: boolean;
  dismissKeyboardOnTouch: boolean;
  rounded?: boolean;
  padding?: boolean;
  paddingSides?: boolean; // useful when there is a component on the same level as app body layout
  paddingTop?: boolean;
  children?: ReactNode;
  scrollable?: boolean;
  backgroundColor?: string;
  swipeToDismiss?: boolean;
  navigator?: NavigationProp<any>; //TODO: look into how to type this 💀
  route?: string;
  absoluteBottomChild?: ReactNode;
  refreshControl?:
    | ReactElement<RefreshControlProps, string | JSXElementConstructor<any>>
    | undefined;
  style?: StyleProp<ViewStyle>;
};

/**
 *
 * @description flexible, extendable universal app layout
 * @param backgroundColor must be a tailwind bg-color, if present
 * @param route the route to navigate back to when swiping down
 * @param dismissKeyboardOnTouch will hide keyboard, and trigger animation of inputs. important to specify if desired on page
 * @param refreshControl if present, will perform an action on refresh
 */
export const AppBodyLayout: React.FC<Props> = ({
  children,
  avoidKeyboard = false,
  padding = true,
  paddingSides = false,
  paddingTop = false,
  rounded = false,
  dismissKeyboardOnTouch,
  backgroundColor,
  scrollable = false,
  swipeToDismiss = false,
  absoluteBottomChild,
  navigator,
  route,
  refreshControl = undefined,
  style = {},
}) => {
  const insets = useSafeAreaInsets();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!navigator || !route) return;

    if (swipeToDismiss && (!navigator || !route)) {
      throw new Error(
        'both navigator and route are required when swipeToDismiss is true',
      );
    }

    const y = event.nativeEvent.contentOffset.y;
    if (y <= -50) navigator.navigate(route); // error throws before this
  };

  const renderContent = () => (
    <View
      style={tw`flex-1 ${rounded ? 'rounded-t-xl' : ''} ${
        padding && !paddingSides ? 'p-10' : ''
      } ${paddingSides ? 'px-10 pb-10' : ''} ${paddingTop ? 'mt-10' : ''}`}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[
        tw`flex-1 ${backgroundColor ? backgroundColor : 'bg-transparent'}`,
        style,
      ]}
      behavior="padding"
      enabled={avoidKeyboard && !scrollable}>
      <>
        {dismissKeyboardOnTouch ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {avoidKeyboard && scrollable ? (
              <KeyboardAwareScrollView
                onScroll={swipeToDismiss ? handleScroll : undefined}
                scrollEventThrottle={swipeToDismiss ? 160 : undefined}
                showsVerticalScrollIndicator={false}>
                {renderContent()}
              </KeyboardAwareScrollView>
            ) : scrollable ? (
              <ScrollView
                refreshControl={refreshControl}
                onScroll={swipeToDismiss ? handleScroll : undefined}
                scrollEventThrottle={swipeToDismiss ? 160 : undefined}
                showsVerticalScrollIndicator={false}>
                {renderContent()}
              </ScrollView>
            ) : (
              renderContent()
            )}
          </TouchableWithoutFeedback>
        ) : avoidKeyboard && scrollable ? (
          <KeyboardAwareScrollView
            onScroll={swipeToDismiss ? handleScroll : undefined}
            scrollEventThrottle={swipeToDismiss ? 180 : undefined}
            showsVerticalScrollIndicator={false}>
            {renderContent()}
          </KeyboardAwareScrollView>
        ) : scrollable ? (
          <ScrollView
            refreshControl={refreshControl}
            onScroll={swipeToDismiss ? handleScroll : undefined}
            scrollEventThrottle={swipeToDismiss ? 180 : undefined}
            showsVerticalScrollIndicator={false}>
            {renderContent()}
          </ScrollView>
        ) : (
          renderContent()
        )}
        {/* FOR IF WE WANT TO FIX BUTTONS TO THE BOTTOM AND HAVE THEM NOT BE SCROLLABLE */}
        {absoluteBottomChild && (
          <View
            style={[
              tw`${backgroundColor ? backgroundColor : 'bg-transparent'}`,
              {paddingBottom: insets.bottom},
            ]}>
            {absoluteBottomChild}
          </View>
        )}
      </>
    </KeyboardAvoidingView>
  );
};
