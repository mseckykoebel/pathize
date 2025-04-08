import React from 'react';
import {Text, View} from 'react-native';
import tw from 'twrnc';

type Props = {
  headerText: string;
  headerTextColor: string;
  textPosition: 'start' | 'center';
  paddingBottom?: boolean;
  paddingTop?: boolean;
};

const SmallHeaderTextLayout: React.FC<Props> = ({
  headerText,
  headerTextColor,
  textPosition,
  paddingBottom = true,
  paddingTop = true,
}): JSX.Element => {
  return (
    <View
      style={tw`${paddingTop ? 'pt-6' : ''} ${paddingBottom ? 'pb-6' : ''}`}>
      <Text
        style={[
          tw`mt-6 text-${textPosition} text-xl font-bold tracking-tight text-gray-700`,
          {fontFamily: 'Montserrat-SemiBold', color: headerTextColor},
        ]}>
        {headerText}
      </Text>
    </View>
  );
};

export default SmallHeaderTextLayout;
