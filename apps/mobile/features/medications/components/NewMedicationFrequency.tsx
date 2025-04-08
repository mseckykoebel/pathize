import React, {useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import {Picker} from '@react-native-picker/picker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faCheck, faChevronLeft} from '@fortawesome/free-solid-svg-icons';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {AppBodyLayout, FadeInView} from '../../../components/layouts';
import SmallHeaderTextLayout from '../../../components/layouts/SmallHeaderTextLayout';
import {DarkButton, InputText} from '../../../components/elements';
import {getIcon} from '../../../utils';

const frequencies = [
  {
    option: 'regular',
    displayName: 'At regular intervals',
  },
  {
    option: 'specific',
    displayName: 'Only on specific days',
  },
  {
    option: 'asNeeded',
    displayName: 'Only as needed',
  },
];

const days = [
  {
    option: 'Mon',
  },
  {
    option: 'Tue',
  },
  {
    option: 'Wed',
  },
  {
    option: 'Thu',
  },
  {
    option: 'Fri',
  },
  {
    option: 'Sat',
  },
  {
    option: 'Sun',
  },
];

// TODO: if we ever do frequency again...
const NewMedicationFrequency: React.FC<any> = ({navigation, route}) => {
  const [error] = useState('');
  //   the selected frequency
  const [selectedFrequency, setSelectedFrequency] = useState<null | string>(
    null,
  );
  //   if done on regular intervals
  const [intervals, setIntervals] = useState<null | string>(null);
  //   if done on specific days
  const [selectedDays, setSelectedDays] = useState<null | string[]>(null);
  //   get all params
  const {medication, type, unit, strength} = route.params;
  const posthog = usePostHog();

  return (
    <AppBodyLayout dismissKeyboardOnTouch={true}>
      <View style={tw`absolute -top-2 left-0 ml-2 z-1`}>
        <TouchableOpacity
          onPress={() => {
            trigger('impactLight');
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
            headerText="How often will you be taking this medication?"
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
            </View>
          </View>
          {/* INTERVALS SECTION */}
          <View style={tw`mt-1`}>
            <InputText text="How frequently will you be taking this medication?" />
            <View
              style={tw`mt-1 rounded-md border border-gray-300 h-auto bg-white`}>
              {frequencies.map((frequency, id) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => {
                    posthog?.capture('Frequency button pressed', {
                      $screen_name: 'UserMedications',
                      component: 'TouchableOpacity',
                      value: frequency,
                    });
                    if (selectedFrequency === frequency.option) {
                      setIntervals(null);
                      setSelectedFrequency(null);
                    } else {
                      setSelectedFrequency(frequency.option);
                    }
                  }}
                  style={tw`flex flex-row justify-between items-center p-3 border-gray-300 ${
                    id !== frequencies.length - 1 ? 'border-b' : ''
                  } ${
                    selectedFrequency === frequency.option ? 'bg-gray-100' : ''
                  }`}>
                  <Text style={tw`text-sm font-medium text-gray-700 ml-2`}>
                    {frequency.displayName}
                  </Text>
                  {selectedFrequency &&
                    selectedFrequency === frequency.option && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        size={20}
                        color="#065f46"
                      />
                    )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* PROGRAMMATICALLY SHOW REGULAR INTERVALS, SPECIFIC DAYS, OR NOTHING FOR AS NEEDED */}
          {selectedFrequency === 'regular' && (
            <FadeInView duration={200}>
              <View style={tw`mt-1`}>
                <InputText text="How often will you be taking this medication?" />
                <View
                  style={tw`mt-1 rounded-md border border-gray-300 h-auto bg-white`}>
                  <Picker
                    selectedValue={intervals}
                    onValueChange={itemValue => {
                      console.log('changed');
                      setIntervals(itemValue);
                    }}>
                    {/* FOR 99 DAYS, CREATE A MAP OF PICKER ITEMS */}
                    {Array.from(Array(30).keys()).map((item, id) => (
                      <Picker.Item
                        key={id}
                        label={`Every ${item + 1} ${item < 1 ? 'day' : 'days'}`}
                        value={`${item + 1}`}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </FadeInView>
          )}
          {selectedFrequency === 'specific' && (
            <FadeInView duration={200}>
              <View style={tw`mt-1`}>
                <InputText text="How often will you be taking this medication?" />
                <View style={tw`mt-1`}>
                  {/* SHOW Mon, Tues, Wed, Thurs, F, Sat, Sun as a horizontal picker list, width of screen*/}
                  <View
                    style={tw`mt-1 rounded-md border border-gray-300 h-auto bg-white`}>
                    {days.map((day, id) => (
                      <TouchableOpacity
                        key={id}
                        onPress={() => {
                          posthog?.capture('Specific day button pressed', {
                            $screen_name: 'UserMedications',
                            component: 'TouchableOpacity',
                            value: day,
                          });
                          if (
                            selectedDays &&
                            selectedDays.includes(day.option)
                          ) {
                            setSelectedDays(
                              selectedDays.filter(item => item !== day.option),
                            );
                          } else {
                            if (selectedDays) {
                              setSelectedDays([...selectedDays, day.option]);
                            } else {
                              setSelectedDays([day.option]);
                            }
                          }
                        }}
                        style={tw`flex flex-row justify-between items-center p-3 border-gray-300 ${
                          id !== days.length - 1 ? 'border-b' : ''
                        } ${
                          selectedDays && selectedDays.includes(day.option)
                            ? 'bg-gray-100'
                            : ''
                        }`}>
                        <Text
                          style={tw`text-sm font-medium text-gray-700 ml-2`}>
                          {day.option}
                        </Text>
                        {selectedDays && selectedDays.includes(day.option) && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            size={20}
                            color="#065f46"
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </FadeInView>
          )}
          {/* CONTINUE AND SKIP BUTTON */}
          <View style={tw`mb-24`}>
            <View style={tw`pt-5 w-50 mx-auto`}>
              <DarkButton
                onPress={() => {
                  posthog?.capture('Continue button pressed', {
                    $screen_name: 'UserMedications',
                    component: 'DarkButton',
                    buttonText: 'Continue',
                  });

                  navigation.navigate('NewMedicationTimes', {
                    medication,
                    type,
                    unit,
                    strength,
                    frequency: selectedFrequency as string,
                    intervals,
                    selectedDays,
                  });
                }}
                text={'Continue'}
                opacity={
                  !selectedFrequency ||
                  (selectedFrequency === 'specific' &&
                    selectedDays?.length === 0)
                    ? 50
                    : 100
                }
                disabled={!selectedFrequency}
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
        </View>
      </ScrollView>
    </AppBodyLayout>
  );
};

export default NewMedicationFrequency;
