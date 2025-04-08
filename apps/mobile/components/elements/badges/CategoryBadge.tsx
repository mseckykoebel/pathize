import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import tw from 'twrnc';

type Props = {
  title: string;
  onPress: () => void;
};

export const CategoryBadge: React.FC<Props> = ({title, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={tw`mr-2`}>
      <View
        style={tw`flex flex-row items-center border border-gray-300 p-2 bg-gray-50 rounded-md mt-4 w-auto`}>
        <Text style={tw`text-xs font-bold text-neutral-500`}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};
