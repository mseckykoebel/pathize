import React, {useState, useEffect, useCallback} from 'react';
import {View, Alert} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {ProfileScreenParamList} from '../profile/ProfileScreenNavigator';
import {MainAppLayout, AppBodyLayout} from '../../components/layouts';
import {getCircular, viewWebPage} from '../../utils';
import {useAnalytics, useHandleLoadingError, useLogout} from '../../hooks';
import {
  ChevronDown,
  DangerButton,
  FadeInFadeOut,
  InputFieldReadOnly,
  Subheader,
  TertiaryButton,
  Alert as PathizeAlert,
  Body1,
  Body1Pressable,
  Divider,
  Header3,
} from '@pathize/mobile-ui';
import {
  useUserContext,
  useOverlayContext,
  usePurchasesContext,
} from '../../contexts';
import {InputOverlaySheet} from '../../components/sheets';
import {MONTHLY_SUBSCRIPTION_IDENTIFIER} from '../../config';

type Props = StackScreenProps<ProfileScreenParamList, 'PersonalDetails'>;

const PersonalDetailsScreen: React.FC<Props> = () => {
  const {interactionEvent, interfaceEvent} = useAnalytics();
  const {customerInfo} = usePurchasesContext();
  const {logOut, loading: logoutLoading} = useLogout();
  const {
    user,
    updateUserEmail,
    updateUserFirstName,
    getUserLoading,
    getUserError,
    deleteAccount,
    deleteAccountLoading,
    deleteAccountError,
  } = useUserContext();
  const {pickerVisible, setPickerVisible} = useOverlayContext();

  const [fieldBeingEdited, setFieldBeingEdited] = useState<'name' | 'email'>(
    'name',
  );
  useHandleLoadingError(getUserError, getUserLoading, () => {});
  useHandleLoadingError(deleteAccountError, deleteAccountLoading, () => {});

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Delete account',
      "This will delete all of the data that you've recorded within Pathize. This action cannot be undone, and your data cannot be recovered after proceeding. You must unsubscribe from Pathize separately in your App Store subscription manager.",
      [
        {
          text: 'Cancel',
          onPress: () =>
            interactionEvent('Button', 'Pressed', {
              $screen_name: 'PersonalDetails',
              value: 'Cancel',
            }),
          style: 'cancel',
        },
        {
          text: 'Delete my account',
          onPress: () => {
            deleteAccount();
          },
        },
      ],
      {cancelable: false},
    );
  }, [deleteAccount, interactionEvent]);

  const createTwoButtonAlert = useCallback(
    () =>
      Alert.alert(
        'Confirm account deletion',
        'Are you sure you want to delete your account?',
        [
          {
            text: 'Cancel',
            onPress: () =>
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'PersonalDetails',
                value: 'Cancel',
              }),
            style: 'cancel',
          },
          {
            text: 'Yes, proceed',
            onPress: () => {
              confirmDelete();
            },
          },
        ],
        {cancelable: false},
      ),
    [confirmDelete, interactionEvent],
  );

  // TODO: handle errors with logging out
  const onLogOutPress = useCallback(async () => {
    interactionEvent('Button', 'Pressed', {
      $screen_name: 'PersonalDetails',
      value: 'Log out',
    });

    return await logOut(); //TODO: handle errors here
  }, [interactionEvent, logOut]);

  const onDeleteAccountPress = useCallback(() => {
    interactionEvent('Button', 'Pressed', {
      $screen_name: 'PersonalDetails',
      value: 'Delete account',
    });

    createTwoButtonAlert();
  }, [interactionEvent, createTwoButtonAlert]);

  const onTOSPress = useCallback(() => {
    interactionEvent('Link', 'Clicked', {
      value: 'Terms of Service',
      $screen_name: 'PersonalDetails',
    });

    viewWebPage('https://pathizehealth.com', '/legal/terms-of-service');
  }, [interactionEvent]);

  const onPrivacyPress = useCallback(() => {
    interactionEvent('Link', 'Clicked', {
      value: 'Privacy Policy',
      $screen_name: 'PersonalDetails',
    });

    viewWebPage('https://pathizehealth.com', '/legal/privacy-policy');
  }, [interactionEvent]);

  useEffect(() => {
    interfaceEvent('Loaded', {
      $screen_name: 'PersonalDetails',
    });
  }, [interfaceEvent]);

  return (
    <MainAppLayout statusBarStyle="light-content">
      <AppBodyLayout
        avoidKeyboard={false}
        scrollable={true}
        dismissKeyboardOnTouch={false}
        absoluteBottomChild={
          <>
            <FadeInFadeOut duration={200} watchValue={user !== null}>
              <TertiaryButton
                text="Log out"
                padding={false}
                onPress={onLogOutPress}
                textStyle={[getCircular('Bold'), tw``]}
                width="half"
                rounded="small"
                paddingTop={true}
                loading={logoutLoading}
              />
              {user ? (
                <DangerButton
                  text="Delete account"
                  padding={true}
                  onPress={onDeleteAccountPress}
                  textStyle={[getCircular('Bold'), tw``]}
                  width="half"
                  rounded="small"
                  loading={deleteAccountLoading}
                />
              ) : null}
            </FadeInFadeOut>
            <Body1
              textStyle={[
                tw`text-center text-neutral-500`,
                getCircular('Book'),
              ]}
              text="Version 1.92.1, Build 817 - March 15th, 2024"
            />
            <View style={tw`flex flex-row justify-center`}>
              <Body1Pressable
                textStyle={[
                  tw`text-center text-neutral-500`,
                  getCircular('Book'),
                ]}
                text="Terms of Service"
                onPress={onTOSPress}
              />
              <Body1
                textStyle={[
                  tw`text-center text-neutral-500`,
                  getCircular('Book'),
                ]}
                text=" - "
              />
              <Body1Pressable
                textStyle={[
                  tw`text-center text-neutral-500`,
                  getCircular('Book'),
                ]}
                text=" Privacy Policy"
                onPress={onPrivacyPress}
              />
            </View>
          </>
        }>
        <View>
          {/* TOP SUBHEADER */}
          <Subheader
            paddingBottom={true}
            text="View and edit your account details, and log out of Pathize."
            style={[tw``, {fontFamily: 'CircularStd-Book'}]}
          />
          {/* AREA FOR USER */}
          {user ? (
            <FadeInFadeOut duration={200} watchValue={user !== null}>
              {/* NAME */}
              <InputFieldReadOnly
                borderAlways={true}
                padding={false}
                inputBackgroundColor="bg-white"
                paddingBottom={true}
                onFocus={() => {
                  trigger('impactLight');
                  setFieldBeingEdited('name');
                  setPickerVisible(true);
                }}
                headerText="First name"
                placeholderText="Please enter your first name"
                value={user.firstName}
                style={[getCircular('Bold'), tw``]}
                rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
              />
              {/* EMAIL */}
              <InputFieldReadOnly
                borderAlways={true}
                inputBackgroundColor="bg-white"
                padding={false}
                onFocus={() => {
                  trigger('impactLight');
                  setFieldBeingEdited('email');
                  setPickerVisible(true);
                }}
                style={[getCircular('Bold'), tw``]}
                headerText="Email address"
                placeholderText="Please enter your email address"
                value={user.email}
                rightComponent={<ChevronDown size={16} color="#d4d4d8" />}
              />
              {/* PICKER FOR EDITING IS VISIBLE */}
              {pickerVisible && user ? (
                <InputOverlaySheet
                  inputHeader={
                    fieldBeingEdited === 'name'
                      ? 'Editing first name'
                      : 'Editing email'
                  }
                  initialValue={
                    fieldBeingEdited === 'name' ? user.firstName : user.email
                  }
                  loading={getUserLoading}
                  error={getUserError}
                  onUpdate={
                    fieldBeingEdited === 'name'
                      ? updateUserFirstName
                      : updateUserEmail
                  }
                  disabledWhenEmpty={true}
                  recordId={user.id} // AKA userID
                />
              ) : null}
              {/* DIVIDER */}
              <Divider padding={true} />
              {/* INFORMATION ON SUBSCRIPTION */}
              <View style={tw`flex flex-row justify-between items-center`}>
                {/* RIGHT NUMBER */}
                {/* REWARD STATUS */}
                <Header3
                  text="Subscription status"
                  padding={true}
                  textStyle={[tw``, getCircular('Book')]}
                />
                <Subheader
                  text={
                    customerInfo && customerInfo.activeSubscriptions.length > 0
                      ? 'Active'
                      : !customerInfo
                        ? 'Loading...'
                        : 'Inactive/Expired'
                  }
                  padding={true}
                  style={[tw``, getCircular('Book')]}
                />
              </View>
              {/* INFORMATION ON THE SUBSCRIPTION IF IT IS ACTIVE */}
              {customerInfo ? (
                <>
                  {/* DATE SUBSCRIBED */}
                  <View style={tw`flex flex-row justify-between items-center`}>
                    <Header3
                      text="Date subscribed"
                      padding={true}
                      textStyle={[tw``, getCircular('Book')]}
                    />
                    <Subheader
                      text={
                        customerInfo &&
                        customerInfo.allPurchaseDates[
                          MONTHLY_SUBSCRIPTION_IDENTIFIER
                        ]
                          ? new Date(
                              customerInfo.allPurchaseDates[
                                MONTHLY_SUBSCRIPTION_IDENTIFIER
                              ],
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'
                      }
                      padding={true}
                      style={[tw``, getCircular('Book')]}
                    />
                  </View>
                  {/* DATE EXPIRES */}
                  <View style={tw`flex flex-row justify-between items-center`}>
                    <Header3
                      text="Date period expires"
                      padding={true}
                      textStyle={[tw``, getCircular('Book')]}
                    />
                    <Subheader
                      text={
                        customerInfo &&
                        customerInfo.allExpirationDates[
                          MONTHLY_SUBSCRIPTION_IDENTIFIER
                        ]
                          ? new Date(
                              customerInfo.allExpirationDates[
                                MONTHLY_SUBSCRIPTION_IDENTIFIER
                              ],
                            ).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'
                      }
                      padding={true}
                      style={[tw``, getCircular('Book')]}
                    />
                  </View>
                </>
              ) : null}
            </FadeInFadeOut>
          ) : null}
          {/* AREA FOR ERROR */}
          {getUserError ? (
            <FadeInFadeOut duration={200} watchValue={getUserError !== null}>
              <PathizeAlert
                headerText="There was an issue fetching your details"
                textChild="We had an issue on our end getting your details. Please try again in a few minutes."
                alertChild={'!'}
              />
            </FadeInFadeOut>
          ) : null}
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default PersonalDetailsScreen;
