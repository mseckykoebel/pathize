import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Platform} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import DatePicker from 'react-native-date-picker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faMinusCircle,
  faPlusCircle,
} from '@fortawesome/free-solid-svg-icons';
import RNReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {AuthorizationStatus} from '@notifee/react-native';
import {usePostHog} from 'posthog-react-native';
import dayjs from 'dayjs';
import tw from 'twrnc';

import {AppBodyLayout} from '../../layouts/AppBodyLayout';
import {NewMedicationScreenParamList} from '../../sheets/CreateMedicationSheet';
import {ScrollView} from 'react-native-gesture-handler';
import {SmallHeaderTextLayout} from '../../layouts';
import {getIcon} from '../../../utils';
import {InputText, DarkButton, LightButton} from '../../elements';

type Props = StackScreenProps<
  NewMedicationScreenParamList,
  'NewMedicationTimes'
>;

const NewMedicationTimes: React.FC<Props> = ({navigation, route}) => {
  const [error] = useState<string>('');
  const [openDatePicker, setOpenDatePicker] = useState<boolean>(false);
  const [selectedTimes, setSelectedTimes] = useState<Date[]>([
    dayjs().toDate(),
  ]);
  const [timeBeingEdited, setTimeBeingEdited] = useState<number>(0);
  const {medication, type, unit, strength, frequency, intervals, selectedDays} =
    route.params;
  const posthog = usePostHog();

  return (
    <AppBodyLayout rounded={false}>
      <View style={tw`absolute -top-2 left-0 ml-2 z-1`}>
        <TouchableOpacity
          onPress={() => {
            RNReactNativeHapticFeedback.trigger('impactLight');
            posthog?.capture('Navigate back button pressed', {
              $screen_name: 'Home',
              component: 'TouchableOpacity',
              buttonComponent: 'faChevronLeft',
            });
            navigation.goBack();
          }}
          style={tw`rounded-full`}>
          <View
            style={tw`rounded-full items-center justify-center h-12 w-12 bg-white`}>
            <FontAwesomeIcon icon={faChevronLeft} color={'#065f46'} size={24} />
          </View>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={tw`px-6 py-6 mt-4`}>
          <SmallHeaderTextLayout
            headerText="Configure how you'd like to be reminded"
            headerTextColor="#065f46"
            textPosition="center"
            paddingTop={false}
          />
          {/* MEDICATION PREVIEW */}
          <View
            style={tw`flex flex-row justify-start items-center p-4 my-2 rounded-md border border-gray-300`}>
            <FontAwesomeIcon
              icon={getIcon('Medication')}
              size={30}
              color="#065f46"
            />
            <View style={tw`flex flex-col`}>
              <Text
                style={tw`text-base font-bold text-gray-700 ml-4 mr-12 leading-5`}>
                {medication.name}
              </Text>
              <Text style={tw`text-xs font-normal text-gray-700 ml-4`}>
                Type: {type.toLowerCase()}
              </Text>
              {strength && unit && (
                <Text style={tw`text-xs font-normal text-gray-700 ml-4`}>
                  Strength: {strength}
                  {unit}
                </Text>
              )}
              <Text style={tw`text-xs font-normal text-gray-700 ml-4`}>
                Frequency:{' '}
                {frequency === 'asNeeded'
                  ? 'as needed'
                  : frequency === 'regular'
                    ? 'regular intervals'
                    : 'custom interval'}
              </Text>
              {selectedDays && selectedDays.length > 0 && (
                <Text style={tw`text-xs font-normal text-gray-700 ml-4`}>
                  Days: {selectedDays.join(', ')}
                </Text>
              )}
            </View>
          </View>
          {/* SECTION ON CHOOSING TIMES */}
          <View style={tw`mt-1`}>
            <InputText text="Choose when you'd like to be reminded to record this medication" />
            <View
              style={tw`mt-1 rounded-md border border-gray-300 h-auto bg-white`}>
              {/* LOOP THROUGH SELECTED TIMES */}
              {selectedTimes
                .sort((a, b) => dayjs(a).unix() - dayjs(b).unix())
                .map((time, index) => (
                  <View
                    style={tw`flex flex-row justify-start items-center p-4 border-gray-300 border-b`}
                    key={index}>
                    <TouchableOpacity
                      onPress={() => {
                        RNReactNativeHapticFeedback.trigger('impactLight');
                        console.log('pressed');
                        posthog?.capture('Remove a time button pressed', {
                          $screen_name: 'Medications',
                          component: 'TouchableOpacity',
                          buttonComponent: 'faMinus',
                        });
                        const newSelectedTimes = [...selectedTimes];
                        newSelectedTimes.splice(index, 1);
                        setSelectedTimes(newSelectedTimes);
                      }}
                      style={tw`rounded-full`}>
                      <FontAwesomeIcon
                        icon={faMinusCircle}
                        size={20}
                        color="#dc2626"
                      />
                    </TouchableOpacity>
                    <View style={tw`flex flex-col`}>
                      <TouchableOpacity
                        onPress={() => {
                          setOpenDatePicker(true);
                          setTimeBeingEdited(index);
                          RNReactNativeHapticFeedback.trigger('impactLight');
                          posthog?.capture('Time button pressed', {
                            $screen_name: 'Medications',
                            component: 'TouchableOpacity',
                            buttonComponent: 'faClock',
                          });
                        }}>
                        <Text
                          style={tw`text-base font-bold text-gray-700 ml-4 mr-12 leading-5`}>
                          {dayjs(time).format('h:mm A')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              {openDatePicker && (
                <DatePicker
                  modal
                  mode="time"
                  open={openDatePicker}
                  date={selectedTimes[timeBeingEdited]}
                  onConfirm={confirmedTime => {
                    // re-set the state to be the new time
                    const newSelectedTimes = [...selectedTimes];
                    newSelectedTimes[timeBeingEdited] = confirmedTime;
                    setSelectedTimes(newSelectedTimes);
                    setOpenDatePicker(false);
                  }}
                  onCancel={() => {
                    setOpenDatePicker(false);
                  }}
                />
              )}

              {/* ADD A TIME BUTTON */}
              <TouchableOpacity
                onPress={() => {
                  RNReactNativeHapticFeedback.trigger('impactLight');
                  posthog?.capture('Add a time button pressed', {
                    $screen_name: 'Home',
                    component: 'TouchableOpacity',
                    buttonComponent: 'faPlus',
                  });
                  setSelectedTimes([
                    ...selectedTimes,
                    dayjs(selectedTimes[selectedTimes.length - 1])
                      .add(1, 'minute')
                      .toDate(),
                  ]);
                }}
                style={tw`flex flex-row justify-start items-center`}>
                <View
                  style={tw`rounded-full items-center justify-center h-12 w-12 bg-white`}>
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    color={'#065f46'}
                    size={20}
                  />
                </View>
                <Text
                  style={tw`text-base font-normal justify-center items-center text-gray-700`}>
                  Add a time
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* IF THE PLATFORM IS IOS, AND NOTIFICATIONS ARE NOT ENABLED */}
          {Platform.OS === 'ios' &&
            (!AuthorizationStatus.AUTHORIZED ||
              !AuthorizationStatus.PROVISIONAL) && (
              <View style={tw`mt-1`}>
                <InputText text="Enable notifications to be reminded to record this medication" />
              </View>
            )}
        </View>
        {/* CONTINUE AND SKIP BUTTON */}
        <View style={tw`mb-24`}>
          <View style={tw`pt-5 w-50 mx-auto`}>
            <DarkButton
              onPress={() => {
                posthog?.capture('Continue button pressed', {
                  $screen_name: 'Medications',
                  component: 'DarkButton',
                  buttonText: 'Continue',
                });

                navigation.navigate('NewMedicationConfirm', {
                  medication,
                  type,
                  unit,
                  strength,
                  frequency,
                  intervals,
                  selectedDays,
                  selectedTimes,
                });
              }}
              text={'Continue'}
              opacity={100}
              disabled={false}
            />
          </View>
          <View style={tw`pt-5 w-50 mx-auto`}>
            <LightButton
              onPress={() => {
                posthog?.capture('Skip button pressed', {
                  $screen_name: 'Medications',
                  component: 'LightButton',
                  buttonText: 'Skip',
                });

                navigation.navigate('NewMedicationConfirm', {
                  medication,
                  type,
                  unit,
                  strength,
                  frequency,
                  intervals,
                  selectedDays,
                  selectedTimes: null,
                });
              }}
              text={'Skip'}
            />
          </View>
          {error && (
            <View style={tw`flex items-center justify-between pt-4`}>
              <View style={tw`text-sm`}>
                <Text style={tw`font-medium text-red-400`}>{error}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </AppBodyLayout>
  );
};

export default NewMedicationTimes;
