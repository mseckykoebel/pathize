import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {
  ChevronDown,
  InputFieldReadOnly,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';
import {useOverlayContext} from '../../contexts';
import {ItemWithId, PickerOverlaySheet} from '../../components/sheets';
import {years, months} from '../../data';

const FormGroup: React.FC<{
  selectedMonth: ItemWithId<{
    id: string;
    month: string;
  }> | null;
  setSelectedMonth: Dispatch<
    SetStateAction<ItemWithId<{
      id: string;
      month: string;
    }> | null>
  >;
  selectedYear: ItemWithId<{
    id: string;
    year: string;
  }> | null;
  setSelectedYear: Dispatch<
    SetStateAction<ItemWithId<{
      id: string;
      year: string;
    }> | null>
  >;
}> = ({selectedMonth, setSelectedMonth, selectedYear, setSelectedYear}) => {
  const {pickerVisible, setPickerVisible} = useOverlayContext();
  const {interactionEvent} = useAnalytics();

  const [monthPickerVisible, setMonthPickerVisible] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  useEffect(() => {
    if (!pickerVisible) {
      setMonthPickerVisible(false);
      setYearPickerVisible(false);
    }
  }, [pickerVisible]);

  return (
    <View style={tw`mt-3 flex flex-row justify-between`}>
      <View
        style={tw`w-1/2 pr-1`}
        onTouchStart={() => {
          interactionEvent('Picker', 'Focused', {
            $screen_name: 'IntakeDateSelect',
            value: selectedMonth?.month ?? '',
          });
          setPickerVisible(true);
          setMonthPickerVisible(true);
        }}>
        {/* MONTH */}
        <InputFieldReadOnly
          borderAlways={true}
          inputBackgroundColor="bg-gray-100"
          padding={true}
          placeholderText="Month"
          value={selectedMonth?.month ?? ''}
          rightComponent={<ChevronDown size={16} color="#61646B" />}
        />
      </View>
      <View
        style={tw`w-1/2 pl-1`}
        onTouchStart={() => {
          interactionEvent('Picker', 'Focused', {
            $screen_name: 'IntakeDateSelect',
            value: selectedMonth?.month ?? '',
          });
          setPickerVisible(true);
          setYearPickerVisible(true);
        }}>
        {/* YEAR */}
        <InputFieldReadOnly
          borderAlways={true}
          inputBackgroundColor="bg-gray-100"
          padding={true}
          placeholderText="Year"
          value={selectedYear?.year ?? ''}
          rightComponent={<ChevronDown size={16} color="#61646B" />}
        />
      </View>
      {/* MONTH PICKER OVERLAY */}
      {pickerVisible && monthPickerVisible && (
        <PickerOverlaySheet
          items={months}
          selectedItem={selectedMonth}
          setSelectedItem={setSelectedMonth}
          labelKey={'month'}
        />
      )}
      {/* YEAR PICKER OVERLAY */}
      {pickerVisible && yearPickerVisible && (
        <PickerOverlaySheet
          items={years}
          selectedItem={selectedYear}
          setSelectedItem={setSelectedYear}
          labelKey={'year'}
        />
      )}
    </View>
  );
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'IntakeDateSelect'
>;

const IntakeDateSelectScreen: React.FC<Props> = ({route, navigation}) => {
  // set illness to be the first illness in route.params.user.illness where dateOfOnset is null
  const illnessBeingModified = route.params.user.illness!.find(
    illness => illness.dateOfOnset === null,
  );

  const {interactionEvent, interfaceEvent} = useAnalytics();
  const [selectedMonth, setSelectedMonth] = useState<ItemWithId<{
    id: string;
    month: string;
  }> | null>(null);
  const [selectedYear, setSelectedYear] = useState<ItemWithId<{
    id: string;
    year: string;
  }> | null>(null);

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'IntakeDateSelect'});
  }, [interfaceEvent]);
  return (
    <MainAppLayout backgroundColor="bg-gray-100">
      <AppBodyLayout
        avoidKeyboard={false}
        dismissKeyboardOnTouch={false}
        scrollable={true}
        absoluteBottomChild={
          <PrimaryButton
            style={tw`mx-10 mb-10 mt-3 w-auto`}
            text="Continue"
            padding={false}
            disabled={!selectedMonth || !selectedYear ? true : false}
            textStyle={[getCircular('Bold'), tw``]}
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Intake',
                value: 'Continue',
              });

              // update route.params.user.illness where dateOfOnset is null and name is illness.name
              const updatedIllness = route.params.user.illness!.map(illness => {
                if (illness.name === illnessBeingModified?.name) {
                  return {
                    ...illness,
                    dateOfOnset: `${selectedMonth?.month} ${selectedYear?.year}`,
                  };
                } else {
                  return illness;
                }
              });

              // const anotherIllness should be true if there is another illness in route.params.user.illness where dateOfOnset is null
              const anotherIllness = updatedIllness.find(
                illness => illness.dateOfOnset === null,
              );

              navigation.push(
                anotherIllness ? 'IntakeDateSelect' : 'Register',
                {
                  user: {
                    ...route.params.user,
                    illness: updatedIllness,
                  },
                },
              );
            }}
          />
        }>
        {/* TOP TEXT */}
        <View style={tw`flex flex-row flex-wrap`}>
          <Subheader
            style={[getCircular('Book'), tw``]}
            textColor="black"
            textType="base"
            padding={false}
            text="When did you first develop "
          />
          <Subheader
            style={[getCircular('Book'), tw``]}
            textColor="black"
            textType="medium"
            padding={false}
            text={`${illnessBeingModified?.name} `}
          />
          <Subheader
            style={[getCircular('Book'), tw``]}
            textColor="black"
            textType="base"
            padding={false}
            text="symptoms?"
          />
        </View>
        {/* FORM AREA */}
        <FormGroup
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
        />
        <Subheader
          style={[getCircular('Book'), tw``]}
          padding={false}
          text="If you're unsure, a ballpark estimate is OK."
        />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default IntakeDateSelectScreen;
