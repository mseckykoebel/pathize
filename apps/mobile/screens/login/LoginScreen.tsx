import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
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
  useLogin,
  useNotificationsStatus,
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
          $screen_name: 'Login',
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
              $screen_name: 'Login',
              value: emailText,
            });
          }}
        />
        <InputField
          placeholderText="Password"
          value={passwordText}
          onChangeText={onPasswordTextChange}
          secureTextEntry={!passwordVisible}
          textContentType="password"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Login',
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
          text="Log in"
          padding={true}
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Login',
              value: 'Log in',
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
  'Login'
>;

const LoginScreen: React.FC<Props> = () => {
  const [emailText, onEmailTextChange] = useState('');
  const [passwordText, onPasswordTextChange] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const {dispatch} = useAuthSignedOut();
  const {login, loading} = useLogin('Login');
  const {requestPermission} = useNotificationsStatus();
  const {interfaceEvent, interactionEvent} = useAnalytics();
  const navigation = useNavigation<any>(); //TODO: Fix this any type

  const tryLogin = async () => {
    const loginStatus = await login(emailText, passwordText);
    if (loginStatus.success) {
      // ask to enable notifications and set new state
      await requestPermission();
      dispatch({
        type: 'REGISTERED_WITH_SUBSCRIPTION',
        userId: loginStatus.credentials.userId,
        accessToken: loginStatus.credentials.accessToken,
        refreshToken: loginStatus.credentials.refreshToken,
      });
    } else {
      oneButtonAlert('Login failed', loginStatus.message);
    }
  };

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'Login'});
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
              text="Welcome back! "
              padding={false}
              style={[getCooper()]}
            />
          </View>
          {/* LINE TWO */}
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1
              text="Log back in below"
              padding={false}
              style={[getCircular('Medium'), tw`-mt-[2.5px] font-medium`]}
            />
          </View>
        </View>
        <FormGroup
          emailText={emailText}
          onEmailTextChange={onEmailTextChange}
          passwordText={passwordText}
          onPasswordTextChange={onPasswordTextChange}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
          onSubmit={tryLogin}
          interactionEvent={interactionEvent}
          disabled={emailText.length === 0 || passwordText.length === 0}
          loading={loading}
        />
        <SubheaderPressable
          buttonStyle={[tw`flex flex-col items-center`]}
          textStyle={[getCircular('Medium')]}
          text="Forgot password?"
          onPress={() => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'Login',
              value: 'Forgot password?',
            });
            navigation.navigate('ResetPassword');
          }}
        />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default LoginScreen;
