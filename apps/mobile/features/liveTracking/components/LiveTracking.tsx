import React, {useEffect, useState} from 'react';
import {Image, StyleProp, View, ViewStyle} from 'react-native';
import tw from 'twrnc';

import {Body1, Header2, PrimaryButton} from '@pathize/mobile-ui';
import {getCircular} from '../../../utils';
import {useAnalytics} from '../../../hooks';
import {useAppleWatchContext} from '../../../contexts';
import {oneButtonAlert} from '../../../lib';

const watch = require('../../../assets/live_tracking.png');

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const LiveTracking: React.FC<Props> = ({style = {}}) => {
  const {interactionEvent} = useAnalytics();
  const {
    isInstalled,
    isPaired,
    isFullyAvailable: isReady,
    isAWRunningActivity: isRunning,
    sendAndStartActivityOnWatch,
  } = useAppleWatchContext();

  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);

  const startTracking = async () => {
    setLoading(true);
    interactionEvent('Button', 'Pressed', {
      $screen_name: 'Home',
      value: 'Launch watch app',
    });

    const result = await sendAndStartActivityOnWatch('presetActivity');
    if (!result.success) {
      oneButtonAlert(
        'There was an issue',
        'We ran into an issue with starting tracking on your watch. Either try it manually, or try again in a few moments. ',
      );
    }

    setLoading(false);
  };

  useEffect(() => {
    if (isPaired && isReady) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }

    if (isRunning) {
      setDisabled(true);
    }
  }, [isPaired, isReady, isRunning]);

  if (!isInstalled) return null;

  return (
    <View style={[tw`flex flex-col justify-center mx-4 mt-4`, style]}>
      <View style={tw`bg-gray-100 rounded-md px-5 pb-5`}>
        {/* WRAPPER FOR IMAGE AND TEXT */}
        <View style={tw`flex flex-row items-center justify-center my-4 `}>
          <View style={tw`flex flex-row items-center justify-center`}>
            <Image
              source={watch}
              style={tw`w-20 h-40 mr-4`}
              resizeMode="contain"
            />
          </View>
          <View style={tw`flex flex-col items-start justify-center flex-1`}>
            <View style={tw`flex m-auto`}>
              <Header2
                text="New: real-time tracking"
                textStyle={[
                  tw`mb-1 font-semibold text-slate-950 leading-6`,
                  getCircular('Book'),
                ]}
              />
              <Body1
                text="Our Apple Watch app monitors your heart rate, and vibrates when you exceed your limit."
                textStyle={[tw`text-neutral-500`, getCircular('Book')]}
              />
            </View>
          </View>
        </View>
        <PrimaryButton
          rounded={'small'}
          padding={false}
          loading={loading}
          disabled={disabled || isRunning}
          text={`${isRunning ? 'Tracking active' : 'Launch watch app'}`}
          onPress={async () => {
            await startTracking();
          }}
          style={[tw`mb-3`]}
          textStyle={[tw`text-base`, getCircular('Book')]}
        />
        {/* CONNECTED STATUS BELOW THE BUTTON */}
        <View style={tw`flex flex-row items-center justify-start`}>
          <View style={tw`flex flex-row items-center mr-3`}>
            <View
              style={tw`rounded-full ${
                isPaired ? 'bg-green-300' : 'bg-red-500'
              } h-3 w-3`}
            />
            <Body1
              text={'Connected'}
              textStyle={[tw`ml-1.5 text-base`, getCircular('Book')]}
            />
          </View>
          {/* READY STATUS */}
          <View style={tw`flex flex-row items-center justify-center`}>
            <View
              style={tw`rounded-full ${
                isReady ? 'bg-green-300' : 'bg-red-500'
              } h-3 w-3`}
            />
            <Body1
              text={'Watch app ready'}
              textStyle={[tw`ml-1.5 text-base`, getCircular('Book')]}
            />
          </View>
        </View>
      </View>
    </View>
  );
};
