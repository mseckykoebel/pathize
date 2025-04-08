import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheck, faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {Gender} from '@pathize/db';
import {
  AppBodyLayout,
  HeaderLayout,
  MainAppLayout,
} from '../../components/layouts';
import {InputText, DarkButton} from '../../components/elements';
import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';

const genderOptions: {id: number; gender: Gender; displayName: string}[] = [
  {
    id: 0,
    gender: 'Man',
    displayName: 'Man',
  },
  {
    id: 1,
    gender: 'Woman',
    displayName: 'Woman',
  },
  {
    id: 2,
    gender: 'Non-binary',
    displayName: 'Non-binary',
  },
  {
    id: 3,
    gender: 'Prefer not to say',
    displayName: 'Prefer not to say',
  },
];

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'Gender'
>;

const GenderScreen: React.FC<Props> = ({route, navigation}) => {
  const posthog = usePostHog();
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);

  useEffect(() => {
    posthog?.capture('GenderScreen component loaded', {
      $screen_name: 'Gender',
    });
  }, [posthog]);

  return (
    <MainAppLayout>
      <AppBodyLayout dismissKeyboardOnTouch={true}>
        <ImageBackground
          source={{
            uri: 'https://uploads-ssl.webflow.com/6384c947952881b6aa77755a/6477c5d31d686537bf9a4fdb_Screenshot%202023-05-31%20at%205.09.39%20PM.png',
          }}
          imageStyle={[
            tw`opacity-70`,
            {
              resizeMode: 'cover',
              top: 0,
            },
          ]}
          style={tw`flex-1`}>
          <ScrollView
            style={tw`flex-1 h-full`}
            contentInsetAdjustmentBehavior="automatic">
            <View style={tw`flex-1`}>
              <View style={tw`py-5`}>
                {/* TOP BAR, TOP-LEFT CORNER SHOULD BE A NAVIGATE BACK CHEVRON */}
                <View style={tw`flex-row justify-between items-center`}>
                  <TouchableOpacity
                    onPress={() => {
                      RNReactNativeHapticFeedback.trigger('impactLight');
                      posthog?.capture('Navigate back button pressed', {
                        $screen_name: 'Devices',
                        component: 'TouchableOpacity',
                        buttonComponent: 'faChevronLeft',
                      });
                      navigation.goBack();
                    }}
                    style={tw`rounded-full`}>
                    <View
                      style={tw`rounded-full items-center justify-center h-12 w-12`}>
                      <FontAwesomeIcon
                        icon={faChevronLeft}
                        color={'#95DAB2'}
                        size={24}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
                {/* HEADER */}
                <HeaderLayout
                  headerText="What's your gender?"
                  subheaderText="The details you enter before you're in the app can be edited later in your profile in a later update."
                  background={true}
                />
              </View>

              <View style={tw`flex-1 bg-gray-50 rounded-t-xl`}>
                <View style={tw`px-4 py-5`}>
                  <InputText text="Select your gender" />
                  {/* MAP THROUGH ALL GENDERS, AND SHOW THEM IN A NICE VERTICAL LIST. ADD A CHECKBOX TO THE FAR RIGHT WITH faIcon */}
                  {genderOptions.map(gender => {
                    return (
                      <TouchableOpacity
                        key={gender.id}
                        onPress={() => {
                          posthog?.capture('Gender selected', {
                            $screen_name: 'Gender',
                            component: 'TouchableOpacity',
                            value: gender.gender,
                          });

                          if (selectedGender === gender.displayName) {
                            setSelectedGender(null);
                          } else {
                            setSelectedGender(gender.gender);
                          }
                        }}>
                        <View
                          style={tw`flex flex-row justify-between items-center p-4 my-2 rounded-md shadow-md shadow-emerald-800 bg-white ${
                            selectedGender?.includes(gender.displayName)
                              ? ''
                              : ''
                          }`}>
                          <Text style={tw`text-sm text-gray-700 font-medium`}>
                            {gender.displayName}
                          </Text>
                          <FontAwesomeIcon
                            icon={faCheck}
                            size={20}
                            color="#065f46"
                            style={tw`${
                              selectedGender?.includes(gender.displayName)
                                ? 'opacity-100'
                                : 'opacity-40'
                            }`}
                          />
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  <View style={tw`mb-24`}>
                    <View style={tw`pt-5 w-50 mx-auto`}>
                      <DarkButton
                        text="Continue"
                        onPress={() => {
                          posthog?.capture('Continue button pressed', {
                            $screen_name: 'Gender',
                            buttonText: 'Continue',
                            component: 'DarkButton',
                          });

                          navigation.navigate('Illnesses', {
                            user: {
                              ...route.params.user,
                              gender: selectedGender as Gender,
                            },
                          });
                        }}
                        opacity={!selectedGender ? 50 : 100}
                      />
                    </View>
                  </View>
                </View>
              </View>
            </View>
            <View
              style={tw`absolute bottom-[-600] left-0 right-0 bg-gray-50 h-600`}
            />
          </ScrollView>
        </ImageBackground>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default GenderScreen;
