import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {Header1, PrimaryButton, Subheader} from '@pathize/mobile-ui';
import {HomeStackScreenParamList, useAuth} from '../../CoreNav';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';

const AppPreviewImage = () => {
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  useEffect(() => {
    Image.getSize(
      'https://jupiter-dx.github.io/assets/pathize_app_preview.png',
      (width, height) => {
        const sWidth = Dimensions.get('window').width;
        const scaleFactor = width / sWidth;
        const iHeight = height / scaleFactor;
        setImageHeight(iHeight - 100);
      },
    );
  }, []);

  if (!imageHeight)
    return (
      <ActivityIndicator
        size="large"
        style={tw`flex flex-col items-center justify-center w-[100%] h-80`}
      />
    );

  return (
    <View style={tw`flex flex-col items-center`}>
      <Image
        source={{
          uri: 'https://jupiter-dx.github.io/assets/pathize_app_store_preview.png',
          cache: 'force-cache',
        }}
        style={[tw``, {width: '100%', height: imageHeight}]}
        resizeMode="contain"
        alt="Pathize heart logo"
      />
    </View>
  );
};

type Props = StackScreenProps<HomeStackScreenParamList, 'WereOnTheAppStore'>;

const WereOnTheAppStore: React.FC<Props> = () => {
  const {state} = useAuth();
  const {interactionEvent} = useAnalytics();

  return (
    <MainAppLayout backgroundColor="bg-[#ACDAFF]">
      {/* LINEAR GRADIENT IS HELPFUL FOR AVOIDING THE ISSUE OF ONE COLOR ON TOP, DIFFERENT COLOR ON BOTTOM */}
      <LinearGradient
        colors={['#ACDAFF', '#ffffff']}
        locations={[0.5, 0.5]}
        style={tw`flex-1`}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppPreviewImage />
          <View style={tw`flex-1 bg-white`}>
            <AppBodyLayout
              avoidKeyboard={false}
              dismissKeyboardOnTouch={false}
              padding={true}>
              <View style={tw`flex flex-col items-center justify-center`}>
                <Header1
                  padding={true}
                  text={"We're live on the App Store!"}
                  style={[
                    tw`text-center text-3xl font-bold tracking-tight ${
                      state.subscriptionStatus !== 'expired' ? '' : 'mb-3'
                    }`,
                    getCircular('Bold'),
                  ]}
                />
              </View>
              {/* CONFIRMATION BUTTON */}
              <PrimaryButton
                padding={true}
                text={'Download on the App Store'}
                onPress={() => {
                  interactionEvent('Button', 'Pressed', {
                    $screen_name: 'WereOnTheAppStore',
                    value: 'Download on the App Store',
                  });
                  Linking.openURL('https://apps.apple.com/app/id1665320917');
                }}
                textStyle={[tw``, getCircular('Book')]}
              />
              {/* NOTICE OF PAYMENT */}
              <Subheader
                text={
                  "The newest version of Pathize will only be available in the App Store and support Apple Health exclusively. You'll be able to log into your account as usual, but you'll need to start a subscription. If you are using a different wearable and would like Pathize to continue supporting it, please let us know."
                }
                padding={true}
                style={[tw``, getCircular('Book')]}
              />
            </AppBodyLayout>
          </View>
        </ScrollView>
      </LinearGradient>
    </MainAppLayout>
  );
};

export default WereOnTheAppStore;
