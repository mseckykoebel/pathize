import React from 'react';
import {Image, Text, TouchableOpacity, View, Dimensions} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {HeaderBackground} from '@react-navigation/elements';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

import {useOverlayContext} from '../../contexts';
import {ChevronDown, Loading} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';

export const HeaderLogotype: React.FC = () => {
  return (
    <HeaderBackground
      style={tw`bg-sky-950 flex flex-col items-center justify-end pb-1`}>
      <Image
        source={{
          uri: 'https://jupiter-dx.github.io/assets/pathize_logotype_white.png',
          cache: 'force-cache',
        }}
        style={tw`w-40 h-12 flex`}
        resizeMode="center"
        alt="Checkbox input with black background if checked, and white background if unchecked"
      />
    </HeaderBackground>
  );
};

export const HeaderDarkBackground: React.FC = () => {
  return <HeaderBackground style={tw`bg-sky-950 flex flex-col items-center`} />;
};

interface HeaderTitleProps {
  screenName: string;
  textColor?: string;
}

/**
 * @param textColor must be a tailwind text color
 */
export const HeaderTitle: React.FC<HeaderTitleProps> = ({
  screenName,
  textColor,
}) => {
  return (
    <Text
      style={[
        tw`text-center ${
          textColor ? textColor : 'text-sky-950'
        } text-xl font-medium leading-normal`,
        {
          fontFamily: 'CircularStd-Book',
        },
      ]}>
      {screenName}
    </Text>
  );
};

interface HeaderBackProps {
  color?: 'white' | 'black';
}

/**
 * @description this is the back button for the header navbar
 */
export const HeaderBack: React.FC<HeaderBackProps> = ({color = 'black'}) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={tw`ml-5 justify-center items-center`}
      onPress={() => {
        trigger('impactLight');
        navigation.goBack();
      }}>
      <Image
        source={{
          uri: `https://jupiter-dx.github.io/assets/back_arrow_${color}.png`,
          cache: 'force-cache',
        }}
        style={tw`w-6 h-6`}
        resizeMode="cover"
        alt="Back button for navigating back in Pathize's app"
      />
    </TouchableOpacity>
  );
};

/**
 * @description This triggers the chart sort overlay
 */

type HeaderSortProps = {
  pickerSource: string;
};

export const HeaderSort: React.FC<HeaderSortProps> = ({pickerSource}) => {
  const {pickerVisible, setPickerSource, setPickerVisible} =
    useOverlayContext();

  return (
    <TouchableOpacity
      style={tw`flex-row justify-center items-center px-3 py-2 mr-1`}
      onPress={() => {
        trigger('impactLight');
        setPickerSource(pickerSource);
        setPickerVisible(!pickerVisible);
      }}>
      <Text
        style={[
          tw` text-white text-base font-medium mr-2`,
          getCircular('Book'),
        ]}>
        Sort
      </Text>
      <ChevronDown size={16} />
    </TouchableOpacity>
  );
};

interface HeaderTrendsDataLoadingProps {
  loading: boolean;
  loadingText: string;
}

/**
 * @description This shows a loading indicator in the header
 */
export const HeaderTrendsDataLoading: React.FC<
  HeaderTrendsDataLoadingProps
> = ({loading, loadingText}) => {
  return (
    <View style={tw`flex-row justify-center items-center px-3 py-2 mr-1`}>
      {/* TEXT ON LEFT */}
      <Text
        style={[
          tw` text-white text-base font-medium mr-2`,
          getCircular('Book'),
        ]}>
        {loadingText}
      </Text>
      {/* LOADING INDICATOR ON RIGHT */}
      <Loading loading={loading} size="small" />
    </View>
  );
};

/**
 * @description Progress bar component for the header
 */
export const HeaderProgressBar: React.FC<{progressWidth: string}> = ({
  progressWidth,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const progressBarWidth = screenWidth * 0.65;

  return (
    <View
      style={[
        tw`flex-row justify-start items-center h-2 mx-auto`,
        {width: progressBarWidth},
      ]}>
      <View style={tw`absolute w-full h-2 bg-zinc-100 rounded-lg`} />
      <View
        style={tw`absolute w-${progressWidth} h-2 bg-green-300 rounded-lg`}
      />
    </View>
  );
};
