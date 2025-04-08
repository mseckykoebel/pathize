import React from 'react';
import {StyleProp, TextInput, View, ViewStyle} from 'react-native';
import tw from 'twrnc';

type Props = {
  onChangeText: (text: string) => void;
  onFocus: () => void;
  value: string;
  autocapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
  secureTextEntry?: boolean;
  editable?: boolean;
  maxLength?: number;
  style?: StyleProp<ViewStyle>;
};

export const FormInput: React.FC<Props> = ({
  value,
  onChangeText,
  autocapitalize = 'none',
  placeholder = '...',
  secureTextEntry = false,
  editable = true,
  maxLength = 1000,
  onFocus,
  style = {},
}): JSX.Element => {
  return (
    <View style={tw`my-1`}>
      <TextInput
        onFocus={onFocus}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autocapitalize}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        editable={editable}
        maxLength={maxLength}
        style={[tw`w-full rounded-md border border-gray-300 px-3 py-2`, style]}
      />
    </View>
  );
};
