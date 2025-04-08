import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {useAnalytics} from '../../hooks';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {Header1, PrimaryButton, Subheader} from '@pathize/mobile-ui';
import {getCircular, getCooper} from '../../utils';

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'NiceToMeetYou'
>;

const NiceToMeetYouScreen: React.FC<Props> = ({route, navigation}) => {
  const {firstName} = route.params.user;
  const {interfaceEvent, interactionEvent} = useAnalytics();

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'NiceToMeetYou'});
  }, [interfaceEvent]);

  return (
    <MainAppLayout backgroundColor="bg-gray-100">
      <AppBodyLayout
        avoidKeyboard={false}
        dismissKeyboardOnTouch={false}
        scrollable={false}
        absoluteBottomChild={
          <PrimaryButton
            style={tw`mx-10 mb-10 mt-3 w-auto`}
            text="Continue"
            padding={false}
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'NiceToMeetYou',
                value: 'Continue',
              });

              navigation.navigate('Intake', {
                user: {
                  ...route.params.user,
                },
              });
            }}
          />
        }>
        <View>
          {/* TOP TEXT */}
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1
              text="Nice to meet you, "
              padding={false}
              style={[getCooper()]}
            />
            <Header1
              text={firstName + '!'}
              padding={false}
              style={[
                getCircular('Medium'),
                tw`-mt-[2.5px] -ml-[2.5px] font-medium`,
              ]}
            />
          </View>
          {/* SUBHEADER */}
          <Subheader
            style={[getCircular('Book'), tw``]}
            textColor="black"
            padding={true}
            text="Next, we need to ask you a few questions about your health. This will help us tailor insights and features unique to you."
          />
          {/* SUBHEADER */}
          <Subheader
            style={[getCircular('Book'), tw``]}
            padding={true}
            text="This should only take 1 minute."
          />
          {/* FORM AREA */}
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default NiceToMeetYouScreen;
