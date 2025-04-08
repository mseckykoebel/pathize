import React, {useEffect} from 'react';
import {View, Image} from 'react-native';
import {StackNavigationProp, StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {
  FadeIn,
  Header1,
  PrimaryButton,
  SecondaryButton,
} from '@pathize/mobile-ui';
import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {getCircular, getCooper} from '../../utils';
import {
  InteractionEventProps,
  InterfaceElement,
  InterfaceOperation,
  useAnalytics,
} from '../../hooks';

const ButtonGroup: React.FC<{
  navigation: StackNavigationProp<
    OnboardingAndPaymentsStackScreenParamList,
    'GetStarted'
  >;
  interactionEvent: (
    element: InterfaceElement,
    operation: InterfaceOperation,
    props: InteractionEventProps,
  ) => void;
}> = ({navigation, interactionEvent}) => {
  return (
    <View style={tw`w-full`}>
      <View style={tw`flex flex-row flex-wrap`}>
        <PrimaryButton
          text="Get started"
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              value: 'Get started',
              $screen_name: 'GetStarted',
            });
            navigation.navigate('Agreements');
          }}
          padding={true}
          textStyle={[getCircular('Bold'), tw``]}
        />
        <SecondaryButton
          text="I already have an account"
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              value: 'Login',
              $screen_name: 'GetStarted',
            });
            navigation.navigate('Login');
          }}
          padding={false}
          textStyle={[getCircular('Bold'), tw``]}
        />
      </View>
    </View>
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'GetStarted'
>;

const GetStartedScreen: React.FC<Props> = ({navigation}) => {
  const {interfaceEvent, interactionEvent} = useAnalytics();

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'GetStarted'});
  }, [interfaceEvent]);

  return (
    <MainAppLayout backgroundColor="bg-[#ACDAFF]" applyTopInsets={true}>
      <AppBodyLayout avoidKeyboard={false} dismissKeyboardOnTouch={false}>
        {/* TOP AREA */}
        <View style={tw`flex-1 items-center`}>
          <FadeIn duration={1000}>
            <Image
              source={{
                uri: 'https://jupiter-dx.github.io/assets/pathize_logotype.png',
                cache: 'force-cache',
              }}
              style={tw`w-56 h-12`}
              resizeMode="cover"
              alt="Pathize logo type"
            />
          </FadeIn>
        </View>

        {/* MIDDLE AREA */}
        <View style={tw`flex-1 justify-center`}>
          {/* LINE ONE */}
          <FadeIn duration={1100} style={tw`flex flex-col items-center`}>
            <View style={tw`flex flex-row flex-wrap`}>
              <Header1 text="The " padding={false} style={[getCooper()]} />
              <Header1
                text="co-pilot "
                padding={false}
                style={[
                  getCircular('Medium'),
                  tw`-mt-[2.5px] -ml-1 font-medium`,
                ]}
              />
            </View>
            <View style={tw`flex flex-row flex-wrap`}>
              <Header1 text="for your " padding={false} style={getCooper()} />
            </View>
            {/* LINE TWO */}
            <View style={tw`flex flex-row flex-wrap`}>
              <Header1
                text="energy-limiting"
                padding={false}
                style={[getCircular('Medium'), tw`-mt-[2.5px] font-medium`]}
              />
            </View>
            {/* LINE THREE */}
            <Header1 text="condition" padding={false} style={getCooper()} />
          </FadeIn>
        </View>

        {/* FORM AREA */}
        <View style={tw`flex-1 justify-end`}>
          {/* GET STARTED BUTTON */}
          <FadeIn duration={1200}>
            <ButtonGroup
              navigation={navigation}
              interactionEvent={interactionEvent}
            />
          </FadeIn>
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default GetStartedScreen;
