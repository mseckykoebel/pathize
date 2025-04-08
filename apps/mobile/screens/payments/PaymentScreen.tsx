import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Text,
  Alert,
  Linking,
} from 'react-native';
import {PurchasesPackage} from 'react-native-purchases';
import {StackScreenProps} from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';

import {
  OnboardingAndPaymentsStackScreenParamList,
  useAuth,
} from '../../CoreNav';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {getCircular} from '../../utils';
import {usePurchasesContext} from '../../contexts';
import {
  Divider,
  Header1,
  Header3,
  PrimaryButton,
  Subheader,
  SubheaderPressable,
} from '@pathize/mobile-ui';
import {useAnalytics} from '../../hooks';
import {Faq, Testimonials} from '../../features/onboarding';
import {oneButtonAlert} from '../../lib';

const AppPreviewImage = () => {
  const [imageHeight, setImageHeight] = useState<number | null>(null);
  useEffect(() => {
    Image.getSize(
      'https://jupiter-dx.github.io/assets/woman_with_apple_watch.png',
      (width, height) => {
        const sWidth = Dimensions.get('window').width;
        const scaleFactor = width / sWidth;
        const iHeight = height / scaleFactor;
        setImageHeight(iHeight);
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
          uri: 'https://jupiter-dx.github.io/assets/woman_with_apple_watch.png',
          cache: 'force-cache',
        }}
        style={{width: '100%', height: imageHeight}}
        resizeMode="cover"
        alt="Pathize heart logo"
      />
    </View>
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'Payments'
>;

const PaymentsScreen: React.FC<Props> = ({navigation}) => {
  const {state} = useAuth();
  const {
    getOfferings,
    makePurchase,
    makePurchaseLoading: loading,
    isEligibleForTrial,
    checkSubscriptionStatus,
  } = usePurchasesContext();
  const {interactionEvent, interfaceEvent} = useAnalytics();
  const [offerings, setOfferings] = useState<PurchasesPackage[] | null>(null);
  const [eligibleForTrial, setEligibleForTrial] = useState<boolean>(false);

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'Payments',
      $set: {
        eligibleForTrial: eligibleForTrial,
      },
    });
  }, [eligibleForTrial, interfaceEvent]);

  useEffect(() => {
    const getAndSetOfferings = async () => {
      const offers = await getOfferings();
      const trial = await isEligibleForTrial();
      if (trial === true) {
        setEligibleForTrial(true);
      } else {
        setEligibleForTrial(false);
      }
      if (offers.success === true) {
        setOfferings(offers.packages);
      } else {
        oneButtonAlert(
          'Error getting product offerings',
          'Unless you live outside of the US, UK, or EU (where Pathize is currently unsupported), this is an unintended error. If this problem persists, please get in touch with us and we can help you out!',
        );
      }
    };

    getAndSetOfferings();
  }, [getOfferings, isEligibleForTrial]);

  return (
    <MainAppLayout backgroundColor="bg-white">
      {/* LINEAR GRADIENT IS HELPFUL FOR AVOIDING THE ISSUE OF ONE COLOR ON TOP, DIFFERENT COLOR ON BOTTOM */}
      <LinearGradient
        colors={['#dbeafe', '#ffffff']}
        locations={[0.5, 0.5]}
        style={tw`flex-1`}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <AppPreviewImage />
          <View style={tw`flex-1 bg-white`}>
            <AppBodyLayout
              avoidKeyboard={false}
              dismissKeyboardOnTouch={false}
              padding={false}>
              {/* TOP AREA */}
              <View style={tw`flex flex-col items-center justify-center`}>
                {/* UNLOCK THE POWER / MAIN TEXT AREA */}
                <Header1
                  padding={false}
                  text={
                    state.subscriptionStatus === 'not subscribed' ||
                    eligibleForTrial
                      ? 'Unlock the Power of Pathize'
                      : 'Pathize Requires a Subscription' // TODO: better 'subscription has expired' message?
                  }
                  style={[
                    tw`text-center text-3xl font-bold tracking-tight ${
                      state.subscriptionStatus !== 'expired' || eligibleForTrial
                        ? ''
                        : 'mb-3'
                    } px-10 pt-10`,
                    getCircular('Bold'),
                  ]}
                />
                {/* EXPLAIN THAT IT IS ONLY AVAILABLE FOR PAID SUBSCRIBERS */}
                {state.subscriptionStatus !== 'expired' || eligibleForTrial ? (
                  <View style={tw`flex flex-row flex-wrap my-3 px-10`}>
                    <Text>
                      <Subheader
                        style={[tw``, getCircular('Book')]}
                        text="Track symptoms, learn what makes you crash, and live your best life within your Limits. You can try Pathize "
                      />
                      <Subheader
                        style={[tw``, getCircular('Book')]}
                        text="free for 2 weeks "
                      />
                      <Subheader
                        style={[tw``, getCircular('Book')]}
                        text="& lock-in early bird pricing at just "
                      />
                      <Subheader
                        style={[tw``, getCircular('Book')]}
                        text="$14.99/month. "
                      />
                    </Text>
                  </View>
                ) : null}
              </View>
              {/* LIFE WITHIN YOUR LIMITS AREA */}
              {state.subscriptionStatus === 'expired' && (
                <Subheader
                  text={
                    'Track symptoms, learn what makes you crash, and live your best life within your Limits.'
                  }
                  padding={true}
                  style={[tw`px-10 -mt-2 text-center`, getCircular('Book')]}
                />
              )}
              {/* CONFIRMATION BUTTON */}
              <View style={[tw`px-10`]}>
                <PrimaryButton
                  padding={true}
                  text={
                    state.subscriptionStatus !== 'expired' || eligibleForTrial
                      ? 'Start 2-week free trial'
                      : 'Subscribe to Pathize'
                  }
                  loading={loading}
                  onPress={() => {
                    interactionEvent('Button', 'Pressed', {
                      $screen_name: 'Payments',
                      value: 'Subscribed to Pathize',
                    });

                    if (!offerings) {
                      Alert.alert(
                        "There was an issue fetching Pathize's subscription",
                        "This usually happens if you're outside of the US, UK, or EU. If this persists, please get in touch with us and we can help you out!",
                      );
                      return;
                    }

                    const handlePurchase = async () => {
                      const purchase = await makePurchase(offerings[0]);
                      console.log('purchase result: ', purchase);
                      if (purchase.success) {
                        console.log('Purchase was successful!');
                        interactionEvent('Item', 'Subscribed to', {
                          $screen_name: 'Payments',
                          value: `Product: ${offerings[0].product.title}`,
                        });
                        navigation.push('Loading', {
                          message:
                            state.subscriptionStatus !== 'expired'
                              ? 'Initiating Free Trial...'
                              : 'Updating subscription...',
                        });
                      } else {
                        Alert.alert(
                          'Purchase unsuccessful',
                          'We ran into an issue processing your purchase! If this continues, either confirm your payment details are correct, or reach out to us for help.',
                        );
                      }
                    };

                    handlePurchase();
                  }}
                  textStyle={[tw``, getCircular('Book')]}
                />
              </View>
              {/* SUBHEADER ASKING TO CHECK FOR ACTIVE SUBSCRIPTION */}
              {state.subscriptionStatus === 'expired' && (
                <SubheaderPressable
                  text="Already have a subscription? Refresh subscription status."
                  onPress={async () => {
                    interactionEvent('Button', 'Pressed', {
                      $screen_name: 'Payments',
                      value:
                        'Already have a subscription? Refresh subscription status.',
                    });

                    if (!offerings) {
                      Alert.alert(
                        "There was an issue fetching Pathize's subscription",
                        "This usually happens if you're outside of the US, UK, or EU. If this persists, please get in touch with us and we can help you out!",
                      );
                      return;
                    }

                    const checkStatus = async () => {
                      const status = await checkSubscriptionStatus();
                      if (
                        status.success === true &&
                        status.message === 'Subscribed'
                      ) {
                        Alert.alert(
                          'You are subscribed!',
                          "We confirmed your subscription. You'll be re-directed back to the home page",
                        );

                        navigation.push('Loading', {
                          message:
                            state.subscriptionStatus !== 'expired' ||
                            eligibleForTrial
                              ? 'Initiating Free Trial...'
                              : 'Updating subscription...',
                        });
                      } else if (
                        status.success === true &&
                        status.message === 'NotSubscribed'
                      ) {
                        Alert.alert(
                          'You are not subscribed',
                          'We were not able to confirm your subscription. If you think this is a mistake, please reach out to us for help!',
                        );
                      }
                    };

                    checkStatus();
                  }}
                  padding={true}
                  textStyle={[
                    tw`px-10 underline text-center`,
                    getCircular('Book'),
                  ]}
                />
              )}
              {/* TESTIMONIAL AREA */}
              <>
                <Header3
                  text="What our patients are saying"
                  textStyle={[
                    tw`px-10 pt-3 font-semibold`,
                    getCircular('Book'),
                  ]}
                />
                <Testimonials style={[tw`pl-10`]} />
              </>
              {/* FAQ AREA */}
              <>
                <Header3
                  text="Frequently asked questions"
                  textStyle={[
                    tw`px-10 pt-3 font-semibold`,
                    getCircular('Book'),
                  ]}
                />
                <Faq style={[tw`pl-10`]} />
              </>
              {/* REMINDER THAT WILL RENEW
              {state.subscriptionStatus !== 'expired' || eligibleForTrial ? (
                <>
                  <Divider padding={true} />
                  <ListBox
                    paddingSides={false}
                    border={false}
                    textChild={
                      <LeftTextChild text="Remind me when my trial ends" />
                    }
                    rightChild={
                      <ToggleSwitchChild
                        switcher={setToggleReminder}
                        value={toggleReminder}
                      />
                    }
                  />
                  <Divider padding={true} />
                </>
              ) : null}
              */}
              {/* DIVIDER FOR EXPIRY */}
              <View style={[tw`px-10 pt-3`]}>
                <Divider padding={true} />
              </View>
              {/* NOTICE OF PAYMENT */}
              <Subheader
                text={
                  state.subscriptionStatus !== 'expired' || eligibleForTrial
                    ? 'A payment of $14.99 will be charged to your account at the end of your free trial. Your subscription will automatically renew unless it is canceled before the end of the current period.'
                    : 'A payment of $14.99 will be charged to your account, and will automatically renew unless it is canceled before the end of the current period.'
                }
                padding={true}
                style={[tw`px-10`, getCircular('Book')]}
              />
              <SubheaderPressable
                text="If you run into any issues configuring your subscription, please reach out to us at info@pathizehealth.com."
                onPress={() => {
                  Linking.openURL(
                    'mailto:info@pathizehealth.com?subject=Help%20with%20Pathize%20Subscription',
                  );
                }}
                padding={true}
                textStyle={[tw`px-10 pb-10 underline`, getCircular('Book')]}
              />
            </AppBodyLayout>
          </View>
        </ScrollView>
      </LinearGradient>
    </MainAppLayout>
  );
};

export default PaymentsScreen;
