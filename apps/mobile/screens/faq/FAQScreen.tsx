import React, {useEffect} from 'react';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {Header1, PrimaryButton, Subheader} from '@pathize/mobile-ui';
import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {getCircular, viewWebPage} from '../../utils';
import {useAnalytics} from '../../hooks';

type Props = StackScreenProps<ProfileScreenParamList, 'FAQ'>;

const FAQScreen: React.FC<Props> = () => {
  const {interactionEvent, interfaceEvent} = useAnalytics();

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'FAQ',
    });
  }, [interfaceEvent]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        scrollable={true}
        avoidKeyboard={true}
        dismissKeyboardOnTouch={true}>
        <View>
          {/* HEADER (MODIFIED) */}
          <Header1
            text={'Request a new feature!'}
            style={[
              tw`text-slate-900 text-2xl font-bold leading-snug`,
              getCircular('Bold'),
            ]}
          />
          <Subheader
            text="Want us to add something specific to Pathize? Request a new feature, vote for features you'd want, and follow our progress below."
            padding={true}
            style={[tw``, getCircular('Book')]}
          />
          {/* SEND INVITE BUTTON */}
          <PrimaryButton
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'PersonalDetails',
                value: 'Delete account',
              });

              viewWebPage('https://pathize.canny.io');
            }}
            text={'Request new feature'}
            rounded={'small'}
            style={[tw``]}
            textStyle={[tw``, getCircular('Book')]}
          />
          {/* DIVIDER
          <Divider padding={true} />
           */}
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default FAQScreen;
