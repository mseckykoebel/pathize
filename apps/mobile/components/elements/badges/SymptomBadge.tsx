import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import tw from 'twrnc';

type Props = {
  name: string;
  image: IconDefinition;
  onPress: () => void;
};

export const SymptomBadge: React.FC<Props> = ({name, image, onPress}) => {
  return (
    <TouchableOpacity onPress={onPress} style={tw`mr-2`}>
      <View
        style={tw`flex flex-row items-center border border-gray-300 p-2 bg-gray-50 rounded-3xl mt-4 w-auto`}>
        <View
          style={tw`rounded-full border-2 border-emerald-600 bg-emerald-50 items-center justify-center h-6 w-6`}>
          <FontAwesomeIcon icon={image} color={'#059669'} size={12} />
        </View>
        <Text style={tw`text-xs font-bold text-neutral-500 ml-2`}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};
