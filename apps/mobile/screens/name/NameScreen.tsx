import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {Alert, Keyboard, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {parsePhoneNumber} from 'libphonenumber-js';
import {trigger} from 'react-native-haptic-feedback';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {
  ChevronDown,
  Header1,
  InputField,
  InputFieldReadOnly,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {getCircular, getCooper} from '../../utils';
import {useAnalytics} from '../../hooks';
import {
  DatePickerOverlaySheet,
  PickerOverlaySheet,
} from '../../components/sheets';
import {useOverlayContext} from '../../contexts';
import {CountryCode, countryData, countryNames} from '../../data';
import {oneButtonAlert} from '../../lib';

type FormGroupProps = {
  nameText: string;
  onNameTextChange: Dispatch<SetStateAction<string>>;
  dateOfBirth: Date;
  setDateOfBirth: Dispatch<SetStateAction<Date>>;
  phoneNumber: string;
  setPhoneNumber: Dispatch<SetStateAction<string>>;
  countryCode: {id: string; name: string} | null;
  setCountryCode: Dispatch<SetStateAction<{id: string; name: string} | null>>;
};

const FormGroup: React.FC<FormGroupProps> = ({
  nameText,
  onNameTextChange,
  dateOfBirth,
  setDateOfBirth,
  phoneNumber,
  setPhoneNumber,
  countryCode,
  setCountryCode,
}) => {
  const {pickerVisible, setPickerVisible} = useOverlayContext();
  const {interactionEvent} = useAnalytics();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [countryCodePickerVisible, setCountryCodePickerVisible] =
    useState(false);

  useEffect(() => {
    if (!pickerVisible) {
      setDatePickerVisible(false);
      setCountryCodePickerVisible(false);
    }
  }, [pickerVisible]);

  return (
    <View style={tw`w-full`}>
      <View style={tw`flex flex-col`}>
        {/* NAME */}
        <InputField
          headerText="What should we call you?"
          placeholderText="Your first name"
          value={nameText}
          onChangeText={onNameTextChange}
          textContentType="name"
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Name',
              value: nameText,
            });
          }}
        />
        {/* DOB (read-only input) */}
        <InputFieldReadOnly
          onFocus={() => {
            interactionEvent('Picker', 'Focused', {
              $screen_name: 'Name',
              value: dateOfBirth.toISOString(),
            });

            // dismiss keyboard in case it is present due to overlay
            if (Keyboard.isVisible()) {
              Keyboard.dismiss();
            }

            trigger('impactLight');
            setPickerVisible(true);
            setDatePickerVisible(true);
          }}
          headerText="When is your birthday?"
          placeholderText="Select birthday"
          value={dateOfBirth.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
          borderAlways={true}
          rightComponent={<ChevronDown size={16} color="#61646B" />}
        />
        {/* PHONE NUMBER */}
        <Subheader
          style={[
            tw`text-neutral-500 text-base font-medium mb-1`,
            getCircular('Book'),
          ]}
          text="What's your phone number (optional)"
        />
        <View style={tw`flex flex-row w-full`}>
          {/* LEFT SIDE - COUNTRY CODE DROPDOWN */}
          <View style={tw`w-1/4 pr-1`}>
            <InputFieldReadOnly
              borderAlways={true}
              inputBackgroundColor="bg-gray-100"
              padding={true}
              placeholderText="Country"
              value={
                countryData.find(country => country.name === countryCode!.name)!
                  .dial_code
              }
              onFocus={() => {
                interactionEvent('Input', 'Focused', {
                  $screen_name: 'Name',
                  value: countryCode!.name,
                });
                trigger('impactLight');
                setCountryCodePickerVisible(true);
                setPickerVisible(true);
              }}
              rightComponent={<ChevronDown size={16} color="#61646B" />}
            />
          </View>
          <View style={tw`w-3/4 pl-1`}>
            {/* RIGHT SIDE - PHONE NUMBER */}
            <InputField
              placeholderText="Phone number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              textContentType="telephoneNumber"
              keyboardType="numeric"
              onFocus={() => {
                interactionEvent('Input', 'Focused', {
                  $screen_name: 'Name',
                  value: nameText,
                });
              }}
            />
          </View>
          {/* YEAR PICKER OVERLAY */}
          {pickerVisible && datePickerVisible && (
            <DatePickerOverlaySheet
              selectedDate={dateOfBirth}
              setSelectedDate={setDateOfBirth}
            />
          )}
          {/* COUNTRY CODE PICKER OVERLAY  */}
          {pickerVisible && countryCodePickerVisible && (
            <PickerOverlaySheet
              items={countryNames}
              selectedItem={countryCode}
              setSelectedItem={setCountryCode}
              labelKey={'name'}
            />
          )}
        </View>
      </View>
    </View>
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'Name'
>;

const NameScreen: React.FC<Props> = ({route, navigation}) => {
  const {interfaceEvent, interactionEvent} = useAnalytics();
  const [nameText, onNameTextChange] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState<{
    id: string;
    name: string;
  } | null>({id: '227', name: 'United States'});
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'Name'});
  }, [interfaceEvent]);

  return (
    <MainAppLayout backgroundColor="bg-gray-100">
      <AppBodyLayout
        avoidKeyboard={true}
        dismissKeyboardOnTouch={true}
        scrollable={true}
        absoluteBottomChild={
          <PrimaryButton
            text="Continue"
            style={tw`mx-10 mb-10 mt-3 w-auto`}
            padding={true}
            disabled={nameText.length === 0 ? true : false}
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Name',
                value: 'Continue',
              });

              // if date of birth is strictly less than 13 years old, return
              if (dayjs().diff(dayjs(dateOfBirth), 'year') < 13) {
                oneButtonAlert(
                  'Invalid date of birth',
                  'You must be at least 13 years of age to register for Pathize (and if under 18, permission from a parent or guardian).',
                );
                return;
              }

              // if phone number is empty, skip validation
              if (phoneNumber.length === 0) {
                navigation.navigate('NiceToMeetYou', {
                  user: {
                    ...route.params.user,
                    firstName: nameText,
                    dateOfBirth: dateOfBirth.toISOString(),
                    phoneNumber: null,
                  },
                });
              } else {
                // validate the phone number, and if it is wrong, show an alert with the error
                try {
                  parsePhoneNumber(
                    phoneNumber,
                    countryData.find(
                      country => country.name === countryCode!.name,
                    )!.code as CountryCode,
                  );
                } catch (err) {
                  Alert.alert(
                    'Invalid phone number',
                    'Please enter a complete phone number.',
                  );
                  return;
                }
                navigation.navigate('NiceToMeetYou', {
                  user: {
                    ...route.params.user,
                    firstName: nameText,
                    dateOfBirth: dateOfBirth.toISOString(),
                    phoneNumber:
                      countryData.find(
                        country => country.name === countryCode!.name,
                      )!.dial_code + phoneNumber,
                  },
                });
              }
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        }>
        {/* TOP AREA */}

        <View>
          {/* TOP TEXT */}
          <View style={tw`flex flex-row flex-wrap`}>
            <Header1
              text="Tell us more "
              padding={false}
              style={[tw``, getCooper()]}
            />
            <Header1
              text="about you"
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
            text="We're so excited to have you on this journey with us. Help us get to know you better."
          />
          {/* FORM AREA */}
          <FormGroup
            nameText={nameText}
            onNameTextChange={onNameTextChange}
            dateOfBirth={dateOfBirth}
            setDateOfBirth={setDateOfBirth}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
          />
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default NameScreen;
