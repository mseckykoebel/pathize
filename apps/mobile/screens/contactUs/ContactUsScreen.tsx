import React, {useState} from 'react';
import {Alert, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {useAuth} from '../../CoreNav';
import {fetcher, getCircular} from '../../utils';
import {
  InputField,
  Loading,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {useAnalytics} from '../../hooks';

type Props = StackScreenProps<ProfileScreenParamList, 'ContactUs'>;

const ContactUsScreen: React.FC<Props> = () => {
  const {userId, accessToken} = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const {interactionEvent} = useAnalytics();

  const sendMessage = async () => {
    setLoading(true);
    try {
      const responseBody = JSON.stringify({
        userId: userId,
        message: message,
      });

      const response = await fetcher('api/v1/contactUs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: responseBody,
      });

      if (response.status !== 200) {
        Alert.alert(
          'There was an issue',
          'We ran into an issue with this request, please try again in a couple of minutes.',
        );
      } else {
        Alert.alert('Success', 'Your message was sent successfully!');
      }
    } catch (err) {
      Alert.alert(
        'There was an issue',
        'We ran into an issue with this request, please try again in a couple of minutes.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        avoidKeyboard={true}
        scrollable={false}
        dismissKeyboardOnTouch={true}>
        <View style={[tw``]}>
          {/* TOP SUBHEADER */}
          <Subheader
            paddingBottom={true}
            text="Get in touch with us. We'll reach out to your account's email address."
            style={[tw``, getCircular('Book')]}
          />
          {/* AREA TO ENTER NAME AND STUFF */}
          <InputField
            value={message}
            onChangeText={setMessage}
            headerText="Message"
            placeholderText="Report an error, request a feature, or just say hello!"
            inputBackgroundColor="bg-white"
            multiline={true}
            style={[tw``, getCircular('Book')]}
          />
        </View>
        <View style={tw`flex-1 items-center`}>
          {/* LOADING AREA */}
          <Loading loading={loading} padding={true} />
        </View>
        <View style={tw`flex-1 justify-end`}>
          <PrimaryButton
            textStyle={[tw``, getCircular('Book')]}
            text="Send message"
            onPress={async () => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'ContactUs',
                value: 'Send message',
              });

              return await sendMessage();
            }}
            width="half"
            rounded="small"
          />
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default ContactUsScreen;
