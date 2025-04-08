import React from 'react';
import {View, Text, Pressable, StyleProp, ViewStyle} from 'react-native';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import tw from 'twrnc';

type Props = {
  onPress: () => void;
  text: string;
  style?: StyleProp<ViewStyle>;
};

export const LightButtonArrowRight: React.FC<Props> = ({
  onPress,
  text,
  style = {},
}): JSX.Element => {
  return (
    <Pressable
      onPress={() => {
        RNReactNativeHapticFeedback.trigger('impactLight');
        onPress();
      }}
      style={[
        tw`flex w-full justify-center rounded-md border border-transparent py-2 px-4 bg-white border-emerald-600`,
        style,
      ]}>
      <View style={tw`flex-row justify-between`}>
        <Text style={tw`text-sm font-medium text-emerald-600 text-center`}>
          {text}
        </Text>
        {/* PUT A SMALL FA ICON ARROW POINTING RIGHT. MAKE IT WHITE */}
        <View style={tw`items-center justify-center ml-2`}>
          <FontAwesomeIcon icon={faChevronRight} color={'#059669'} size={14} />
        </View>
      </View>
    </Pressable>
  );
};
