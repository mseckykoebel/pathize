import React, {
  useState,
  useEffect,
  Dispatch,
  SetStateAction,
  ReactNode,
} from 'react';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {
  CheckBox,
  Header1,
  PrimaryButton,
  Subheader,
  SubheaderPressable,
} from '@pathize/mobile-ui';
import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {getCircular, getCooper, viewWebPage} from '../../utils';
import {useAnalytics} from '../../hooks';

const ToggleArea: React.FC<{
  checked: boolean;
  setChecked: Dispatch<SetStateAction<boolean>>;
  rightChild: ReactNode;
}> = ({checked, setChecked, rightChild}) => {
  const {interactionEvent} = useAnalytics();
  return (
    <View style={tw`flex flex-row items-center my-3`}>
      <CheckBox
        style={tw`mr-3`}
        padding={false}
        checked={checked}
        onValueChange={() => {
          interactionEvent('Button', 'Toggled', {
            $screen_name: 'Agreements',
            value: checked,
          });
          setChecked(!checked);
        }}
      />
      {rightChild}
    </View>
  );
};

const AgreementsTermsPrivacyPolicy: React.FC = () => {
  const {interactionEvent} = useAnalytics();
  return (
    <View style={tw`flex flex-row flex-wrap`}>
      <Subheader
        text="I agree to the "
        textColor="zinc"
        textType="medium"
        style={[getCircular('Medium'), tw``]}
      />
      <SubheaderPressable
        textColor="zinc"
        textType="medium"
        padding={false}
        text="Terms of Service"
        onPress={() => {
          interactionEvent('Link', 'Clicked', {
            value: 'Terms of Service',
            $screen_name: 'Agreements',
          });
          viewWebPage('https://pathizehealth.com', '/legal/terms-of-service');
        }}
        textStyle={[getCircular('Medium'), tw`underline`]}
      />
      <Subheader
        text=" and "
        textColor="zinc"
        textType="medium"
        style={[getCircular('Medium'), tw``]}
      />
      <SubheaderPressable
        textColor="zinc"
        textType="medium"
        padding={false}
        textStyle={[getCircular('Medium'), tw`underline`]}
        text="Privacy Policy"
        onPress={() => {
          interactionEvent('Link', 'Clicked', {
            value: 'Privacy Policy',
            $screen_name: 'Agreements',
          });
          viewWebPage('https://pathizehealth.com', '/legal/privacy-policy');
        }}
      />
    </View>
  );
};

const AgreementsCommunications: React.FC = () => {
  return (
    <Subheader
      style={[getCircular('Medium'), tw`flex flex-row flex-wrap`]}
      breakWords={true}
      textColor="zinc"
      textType="medium"
      text="I agree to receive occasional emails from Pathize about product and community updates (no spam, ever)"
    />
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'Agreements'
>;

const AgreementsScreen: React.FC<Props> = ({navigation}) => {
  const [agreementsCheckbox, toggleAgreementsCheckBox] = useState(false);
  const [emailListCheckbox, toggleEmailListCheckbox] = useState(true);
  const {interfaceEvent, interactionEvent} = useAnalytics();

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'Agreements'});
  }, [interfaceEvent]);

  return (
    <MainAppLayout backgroundColor="bg-gray-100">
      <AppBodyLayout
        padding={true}
        avoidKeyboard={false}
        dismissKeyboardOnTouch={false}
        scrollable={true}
        absoluteBottomChild={
          <PrimaryButton
            style={tw`mx-10 mb-10 mt-3 w-auto`}
            text={agreementsCheckbox ? 'Continue' : 'Please agree to continue'}
            disabled={!agreementsCheckbox}
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                value: agreementsCheckbox
                  ? 'Continue'
                  : 'Please agree to continue',
                $screen_name: 'Agreements',
              });
              navigation.navigate('Name', {
                user: {
                  emailNotifications: emailListCheckbox,
                  termsAndConditions: agreementsCheckbox,
                },
              });
            }}
            textStyle={[getCircular('Bold'), tw``]}
            padding={true}
          />
        }>
        {/* TOP AREA */}
        <View>
          {/* TOP TEXT */}
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1
              text="Let's get the "
              padding={false}
              style={[getCooper()]}
            />
            <Header1
              text="nitty-gritty "
              padding={false}
              style={[
                getCircular('Medium'),
                tw`-mt-[2.5px] -ml-[3.5px] font-medium`,
              ]}
            />
            <Header1
              text="out of the way... "
              padding={false}
              style={getCooper()}
            />
          </View>
          {/* SUBHEADER */}
          <Subheader
            style={[getCircular('Book'), tw``]}
            textColor="black"
            text="We're committed to protecting your privacy, and the security of your data."
          />
          {/* MIDDLE CHECKBOX AREA */}
          <View style={tw`flex flex-col my-3`}>
            <ToggleArea
              checked={agreementsCheckbox}
              setChecked={toggleAgreementsCheckBox}
              rightChild={<AgreementsTermsPrivacyPolicy />}
            />
            <ToggleArea
              checked={emailListCheckbox}
              setChecked={toggleEmailListCheckbox}
              rightChild={<AgreementsCommunications />}
            />
          </View>
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default AgreementsScreen;
