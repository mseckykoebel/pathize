import React, {useEffect, useState} from 'react';
import {View, ScrollView} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {PrimaryButton, Subheader, ZeroTenScaleSlider} from '@pathize/mobile-ui';
import {useAnalytics} from '../../hooks';
import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {getCircular} from '../../utils';

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'HealthAssessment'
>;

const HealthAssessment: React.FC<Props> = ({route, navigation}) => {
  console.log('this is the initial params: ', route.params.healthAssessment);
  const {interfaceEvent, interactionEvent} = useAnalytics();
  const [firstSliderValue, setFirstSliderValue] = useState(0);
  const [secondSliderValue, setSecondSliderValue] = useState(0);
  const [thirdSliderValue, setThirdSliderValue] = useState(0);
  const [fourthSliderValue, setFourthSliderValue] = useState(0);
  const [fifthSliderValue, setFifthSliderValue] = useState(0);
  const [sixthSliderValue, setSixthSliderValue] = useState(0);

  const validateSliders = (): boolean => {
    return ![
      firstSliderValue,
      secondSliderValue,
      thirdSliderValue,
      fourthSliderValue,
      fifthSliderValue,
      sixthSliderValue,
    ].every(value => value === 0);
  };

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'HealthAssessment'});
  }, [interfaceEvent]);
  return (
    <MainAppLayout>
      <AppBodyLayout avoidKeyboard={false} dismissKeyboardOnTouch={false}>
        <ScrollView style={tw`flex-1`} showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <Subheader
            style={[getCircular('Book'), tw``]}
            padding={false}
            text="The questions below are based on the SIQ-R health assessment. This will help us identify key problem areas as of today, establish your baseline, and help us track your progress over time."
          />
          {/* FIRST SLIDER */}
          <ZeroTenScaleSlider
            headerText="My medical problems have prevented me from accomplishing goals"
            sliderStartText={'Never'}
            sliderEndText="Always"
            setValue={setFirstSliderValue}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
            initialValue={
              route.params.healthAssessment
                ?.medicalProblemsHavePreventedMeFromAccomplishingGoals
            }
          />
          {/* SECOND SLIDER */}
          <ZeroTenScaleSlider
            headerText="I am completely overwhelmed by my medical problems"
            sliderStartText={'Never'}
            sliderEndText="Always"
            setValue={setSecondSliderValue}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
            initialValue={
              route.params.healthAssessment
                ?.completelyOverwhelmedByMedicalProblems
            }
          />
          {/* THIRD SLIDER */}
          <ZeroTenScaleSlider
            headerText="Please rate your level of pain"
            sliderStartText={'No pain'}
            sliderEndText="Unbearable pain"
            setValue={setThirdSliderValue}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
            initialValue={route.params.healthAssessment?.levelOfPain}
          />
          {/* FOURTH SLIDER */}
          <ZeroTenScaleSlider
            headerText="Please rate your level of energy"
            sliderStartText={'Lots of energy'}
            sliderEndText="No energy"
            setValue={setFourthSliderValue}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
            initialValue={route.params.healthAssessment?.levelOfEnergy}
          />
          {/* FIFTH SLIDER */}
          <ZeroTenScaleSlider
            headerText="Please rate the quality of your sleep"
            sliderStartText={'Awake rested'}
            sliderEndText="Awake very tired"
            setValue={setFifthSliderValue}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
            initialValue={route.params.healthAssessment?.qualityOfSleep}
          />
          {/* SIXTH SLIDER */}
          <ZeroTenScaleSlider
            headerText="Please rate your level of memory problems"
            sliderStartText={'Good memory'}
            sliderEndText="Very poor memory"
            setValue={setSixthSliderValue}
            headerTextStyle={[getCircular('Book'), tw``]}
            sliderTextStyle={[getCircular('Book'), tw``]}
            initialValue={route.params.healthAssessment?.levelOfMemoryProblems}
          />
        </ScrollView>
        <View style={tw`justify-end`}>
          <PrimaryButton
            text="Continue"
            padding={false}
            paddingTop={true}
            disabled={!validateSliders()}
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'HealthAssessment',
                value: 'Continue',
              });

              navigation.navigate('HowItWorks', {
                healthAssessment: {
                  medicalProblemsHavePreventedMeFromAccomplishingGoals:
                    firstSliderValue,
                  completelyOverwhelmedByMedicalProblems: secondSliderValue,
                  levelOfPain: thirdSliderValue,
                  levelOfEnergy: fourthSliderValue,
                  qualityOfSleep: fifthSliderValue,
                  levelOfMemoryProblems: sixthSliderValue,
                },
              });
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        </View>
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default HealthAssessment;
