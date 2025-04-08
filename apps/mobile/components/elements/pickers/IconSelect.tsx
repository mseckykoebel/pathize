import React from 'react';
import {View, ViewStyle, StyleProp, TouchableOpacity} from 'react-native';
import {faChevronRight} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import tw from 'twrnc';

import {getIcon} from '../../../utils';

type Props = {
  icon: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export const IconSelect: React.FC<Props> = ({icon, onPress, style = {}}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View
        style={[
          tw`flex-row flex justify-between rounded-md border border-transparent border-gray-300 py-3 px-4`,
          style,
        ]}>
        {/* ON THE LEFT, SHOW THE ICON */}
        <View style={tw`mt-auto mb-auto`}>
          {/* SHOW THE CHOSEN ICON HERE AS AN FAVICON */}
          <View style={tw`flex-row`}>
            <FontAwesomeIcon
              icon={getIcon(icon)}
              size={24}
              style={tw`text-emerald-800`}
            />
          </View>
        </View>
        {/* ON THE RIGHT, SHOW AN FA CHEVRON */}
        <FontAwesomeIcon size={24} icon={faChevronRight} color={'#d1d5db'} />
      </View>
    </TouchableOpacity>
  );
};
