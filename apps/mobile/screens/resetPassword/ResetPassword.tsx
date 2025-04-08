import React, {useState, Dispatch, SetStateAction} from 'react';
import {Alert, Image, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {
  Header1,
  InputField,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {getCircular, getCooper} from '../../utils';
import {useAnalytics, useResetPassword} from '../../hooks';

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

type EmailFormProps = {
  emailText: string;
  onEmailTextChange: Dispatch<SetStateAction<string>>;
  setSuccess: Dispatch<SetStateAction<boolean | null>>;
  disabled: boolean;
};

const EmailForm: React.FC<EmailFormProps> = ({
  emailText,
  onEmailTextChange,
  setSuccess,
  disabled,
}) => {
  const {sendPasswordResetEmail, loading} = useResetPassword();
  const {interactionEvent} = useAnalytics();

  return (
    <View style={tw`w-full`}>
      <View style={tw`flex flex-col`}>
        <InputField
          placeholderText="Email"
          value={emailText}
          onChangeText={onEmailTextChange}
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'ResetPassword',
              value: emailText,
            });
          }}
        />
        <PrimaryButton
          textStyle={[tw``, getCircular('Book')]}
          disabled={disabled}
          loading={loading}
          text="Reset password"
          padding={true}
          onPress={async () => {
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'ResetPassword',
              value: 'Reset password',
            });
            const sendEmail = await sendPasswordResetEmail(emailText);
            if (sendEmail.success) {
              setSuccess(true);
            } else {
              const wasNetworkError =
                sendEmail.message.includes('Email not found');
              Alert.alert(
                'There was an issue',
                wasNetworkError
                  ? "That email was not found in our system. If you think this is a mistake, please reach out to us and we'd be happy to assist you."
                  : 'We ran into an issue sending your recovery email. Please try again some time later.',
              );
              setSuccess(false);
            }
          }}
        />
      </View>
    </View>
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'ResetPassword'
>;

const ResetPasswordScreen: React.FC<Props> = () => {
  const [emailText, setEmailText] = useState('');
  const [success, setSuccess] = useState<boolean | null>(false);

  return (
    <MainAppLayout backgroundColor="bg-gray-100">
      <AppBodyLayout
        avoidKeyboard={true}
        dismissKeyboardOnTouch={true}
        scrollable={true}>
        <Logo />
        <View style={tw`flex flex-col items-start my-3 mb-6`}>
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1 text="Reset your" padding={false} style={[getCooper()]} />
          </View>
          {/* LINE TWO */}
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1
              text="Password"
              padding={false}
              style={[
                getCircular('Medium'),
                tw`-mt-[2.5px] -ml-[0px] font-medium`,
              ]}
            />
          </View>
        </View>
        <EmailForm
          setSuccess={setSuccess}
          emailText={emailText}
          onEmailTextChange={setEmailText}
          disabled={emailText.length === 0}
        />
        {success === true && (
          <Subheader
            padding={true}
            style={[tw`text-center`, getCircular('Medium')]}
            text="Recovery email sent! Check your inbox, trash, or spam for further instructions."
          />
        )}
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default ResetPasswordScreen;
