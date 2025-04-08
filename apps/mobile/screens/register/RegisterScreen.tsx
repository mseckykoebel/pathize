import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {View, TouchableOpacity, Image, Linking} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {useNavigation} from '@react-navigation/native';
import tw from 'twrnc';

import {
  OnboardingAndPaymentsStackScreenParamList,
  useAuthSignedOut,
} from '../../CoreNav';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {
  InteractionEventProps,
  InterfaceElement,
  InterfaceOperation,
  useAnalytics,
  useRegister,
} from '../../hooks';
import {
  Header1,
  InputField,
  PrimaryButton,
  SubheaderPressable,
} from '@pathize/mobile-ui';
import {getCircular, getCooper} from '../../utils';
import {oneButtonAlert} from '../../lib';

const Logo = () => {
  return (
    <View style={tw`flex flex-col items-start my-3`}>
      <Image
        source={{
          uri: 'https://jupiter-dx.github.io/assets/pathize_logo.png',
          cache: 'force-cache',
        }}
        style={tw`w-18 h-14`}
        resizeMode="cover"
        alt="Pathize heart logo"
      />
    </View>
  );
};

const PasswordVisibleIcon: React.FC<{
  passwordVisible: boolean;
  setPasswordVisible: Dispatch<SetStateAction<boolean>>;
  interactionEvent: (
    element: InterfaceElement,
    operation: InterfaceOperation,
    props: InteractionEventProps,
  ) => void;
}> = ({passwordVisible, setPasswordVisible, interactionEvent}) => {
  return (
    <TouchableOpacity
      style={tw`w-6 h-6 justify-center items-center`}
      onPress={() => {
        setPasswordVisible(!passwordVisible);
        interactionEvent('Button', 'Toggled', {
          $screen_name: 'Register',
          value: passwordVisible,
        });
      }}>
      <Image
        source={{
          uri: passwordVisible
            ? 'https://jupiter-dx.github.io/assets/input_visible.png'
            : 'https://jupiter-dx.github.io/assets/input_invisible.png',
          cache: 'force-cache',
        }}
        style={tw`w-6 h-6`}
        resizeMode="cover"
        alt="Eye icon used for toggling the password as visible or invisible"
      />
    </TouchableOpacity>
  );
};

type FormGroupProps = {
  emailText: string;
  onEmailTextChange: Dispatch<SetStateAction<string>>;
  passwordText: string;
  onPasswordTextChange: Dispatch<SetStateAction<string>>;
  passwordVisible: boolean;
  setPasswordVisible: Dispatch<SetStateAction<boolean>>;
  passwordConfirmText: string;
  onPasswordConfirmTextChange: Dispatch<SetStateAction<string>>;
  onSubmit: () => void;
  interactionEvent: (
    element: InterfaceElement,
    operation: InterfaceOperation,
    props: InteractionEventProps,
  ) => void;
  disabled: boolean;
  loading: boolean;
};

const FormGroup: React.FC<FormGroupProps> = ({
  emailText,
  onEmailTextChange,
  passwordText,
  onPasswordTextChange,
  passwordVisible,
  setPasswordVisible,
  passwordConfirmText,
  onPasswordConfirmTextChange,
  onSubmit,
  interactionEvent,
  disabled,
  loading,
}) => {
  return (
    <View style={tw`w-full`}>
      <View style={tw`flex flex-col`}>
        <InputField
          placeholderText="Email"
          value={emailText}
          onChangeText={onEmailTextChange}
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Register',
              value: emailText,
            });
          }}
        />
        <InputField
          placeholderText="Create password"
          value={passwordText}
          onChangeText={onPasswordTextChange}
          secureTextEntry={!passwordVisible}
          textContentType="password"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Register',
              value: 'N/A (Password value redacted)',
            });
          }}
          rightComponent={
            <PasswordVisibleIcon
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
              interactionEvent={interactionEvent}
            />
          }
        />
        <InputField
          placeholderText="Confirm password"
          value={passwordConfirmText}
          onChangeText={onPasswordConfirmTextChange}
          secureTextEntry={!passwordVisible}
          textContentType="password"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Register',
              value: 'N/A (Password value redacted)',
            });
          }}
          rightComponent={
            <PasswordVisibleIcon
              passwordVisible={passwordVisible}
              setPasswordVisible={setPasswordVisible}
              interactionEvent={interactionEvent}
            />
          }
          paddingBottom={true}
        />
        <PrimaryButton
          textStyle={[getCircular('Bold'), tw``]}
          disabled={disabled}
          text="Create Account"
          padding={true}
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Register',
              value: 'Create account',
            });
            onSubmit();
          }}
          loading={loading}
        />
      </View>
    </View>
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'Register'
>;

const RegisterScreen: React.FC<Props> = ({route}) => {
  const [emailText, onEmailTextChange] = useState('');
  const [passwordText, onPasswordTextChange] = useState('');
  const [passwordConfirmText, onPasswordConfirmTextChange] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {dispatch} = useAuthSignedOut();
  const {register, loading} = useRegister('Register');
  const {interfaceEvent, interactionEvent} = useAnalytics();
  const navigation = useNavigation<any>(); //TODO: Fix this any type

  const tryRegister = async () => {
    const registerStatus = await register(
      route.params.user,
      emailText,
      passwordText,
      passwordConfirmText,
    );
    console.log(registerStatus);
    if (registerStatus.success) {
      // register status sets relevant credentials in state
      // bot does not set 'isSignedIn' until further
      // onboarding steps are completed

      // dispatch mounts HowItWorks navigator, fades in to Loading Screen
      dispatch({
        type: 'REGISTERED_NO_SUBSCRIPTION',
        userId: registerStatus.credentials.userId,
        accessToken: registerStatus.credentials.accessToken,
        refreshToken: registerStatus.credentials.refreshToken,
      });
    } else {
      oneButtonAlert('Account creation failed', registerStatus.message);
    }
  };

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'Register'});
  }, [interfaceEvent]);

  return (
    <MainAppLayout backgroundColor="bg-gray-100">
      <AppBodyLayout
        avoidKeyboard={true}
        dismissKeyboardOnTouch={true}
        scrollable={true}>
        <Logo />
        <View style={tw`flex flex-col items-start my-3 mb-6`}>
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1
              text="Finish setting up your"
              padding={false}
              style={[getCooper()]}
            />
          </View>
          {/* LINE TWO */}
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1
              text="Pathize "
              padding={false}
              style={[getCircular('Medium'), tw`-mt-[2.5px] font-medium`]}
            />
            <Header1 text="account" padding={false} style={[getCooper()]} />
          </View>
        </View>
        <FormGroup
          emailText={emailText}
          onEmailTextChange={onEmailTextChange}
          passwordText={passwordText}
          onPasswordTextChange={onPasswordTextChange}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
          passwordConfirmText={passwordConfirmText}
          onPasswordConfirmTextChange={onPasswordConfirmTextChange}
          onSubmit={tryRegister}
          interactionEvent={interactionEvent}
          disabled={
            emailText.length === 0 ||
            passwordText.length === 0 ||
            passwordConfirmText.length === 0
          }
          loading={loading}
        />
        <SubheaderPressable
          buttonStyle={[tw`flex flex-col items-center`]}
          textStyle={[getCircular('Medium')]}
          text="Already have an account? Log in here"
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Register',
              value: 'Already have an account? Log in here',
            });
            navigation.navigate('Login');
          }}
        />
        <SubheaderPressable
          buttonStyle={[tw`flex flex-col items-center`]}
          textStyle={[tw``, getCircular('Medium')]}
          text="Run into an issue getting registered? Press here to email us"
          onPress={() => {
            Linking.openURL(
              'mailto:info@pathizehealth.com?subject=Help%20with%20Pathize%20Account%20Creation',
            );
          }}
          padding={false}
        />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default RegisterScreen;
