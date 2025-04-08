import React, {useEffect} from 'react';
import {Image, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {useAnalytics} from '../../hooks';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {FadeIn, Subheader} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {
  OnboardingAndPaymentsStackScreenParamList,
  useAuth,
} from '../../CoreNav';

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'Loading'
>;

const LoadingScreen: React.FC<Props> = ({route}) => {
  const {dispatch, state} = useAuth();
  const {interfaceEvent} = useAnalytics();
  const navigation = useNavigation<any>(); //TODO: Fix this any type

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'Loading'});
  }, [interfaceEvent]);

  useEffect(() => {
    console.log('this is the route params: ', route.params);
    console.log('this is the state: ', state);
    // navigate to Home after five seconds
    setTimeout(() => {
      if (
        route.params &&
        route.params.message &&
        (route.params.message.includes('Initiating') ||
          route.params.message.includes('Updating'))
      ) {
        console.log('this is the route params: ', route.params);
        dispatch({type: 'REGISTERED_WITH_SUBSCRIPTION'});
        return;
      }

      // go to how it works
      navigation.navigate('HowItWorks');
    }, 5000);

    // disabling check, only want this to fire once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainAppLayout backgroundColor="bg-[#ACDAFF]">
      <AppBodyLayout avoidKeyboard={false} dismissKeyboardOnTouch={false}>
        <View style={tw`flex-1`}>
          <View style={tw`flex-1`} />
          <View style={tw`flex-1`}>
            {/* LINE ONE */}
            <FadeIn
              duration={1100}
              style={tw`flex flex-col items-center justify-center`}>
              <Image
                source={{
                  uri: 'https://jupiter-dx.github.io/assets/pathize_logo.png',
                  cache: 'force-cache',
                }}
                style={tw`w-16 h-16`}
                resizeMode="cover"
                alt="Pathize logo type"
              />
              <Subheader
                text={
                  (route.params && route.params.message) ??
                  'Creating your account...'
                }
                textColor="black"
                style={[tw``, getCircular('Medium')]}
              />
            </FadeIn>
          </View>

          <View style={tw`flex-1`} />
          <View style={tw`flex-1`} />
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default LoadingScreen;
