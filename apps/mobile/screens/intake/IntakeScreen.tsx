import React, {useState, useEffect, Dispatch, SetStateAction} from 'react';
import {StackScreenProps} from '@react-navigation/stack';
import tw from 'twrnc';

import {OnboardingAndPaymentsStackScreenParamList} from '../../CoreNav';
import {AppBodyLayout, MainAppLayout} from '../../components/layouts';
import {
  InputFieldCheckboxSecondary,
  PrimaryButton,
  Subheader,
} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';
import {useAnalytics} from '../../hooks';
import {IllnessList, illnesses} from '../../data/illnesses';
import {Illness} from '@pathize/db';

interface ConditionListProps {
  selectedIllnesses: IllnessList[];
  setSelectedIllnesses: Dispatch<SetStateAction<IllnessList[]>>;
}

const ConditionList: React.FC<ConditionListProps> = ({
  selectedIllnesses,
  setSelectedIllnesses,
}) => {
  // return an array of list boxes
  return illnesses.map(illness => {
    return (
      <InputFieldCheckboxSecondary
        key={illness.id}
        padding={true}
        itemText={illness.displayName}
        selected={selectedIllnesses.includes(illness)}
        onValueChange={() => {
          if (illness.name === 'None/Prefer not to say') {
            setSelectedIllnesses([illness]);
          } else {
            if (
              selectedIllnesses.some(i => i.name === 'None/Prefer not to say')
            ) {
              setSelectedIllnesses([illness]);
            } else {
              if (selectedIllnesses.includes(illness)) {
                setSelectedIllnesses(
                  selectedIllnesses.filter(i => i !== illness),
                );
              } else {
                setSelectedIllnesses([...selectedIllnesses, illness]);
              }
            }
          }
        }}
        textStyle={[getCircular('Medium')]}
      />
    );
  });
};

type Props = StackScreenProps<
  OnboardingAndPaymentsStackScreenParamList,
  'Intake'
>;

const IntakeScreen: React.FC<Props> = ({route, navigation}) => {
  const {interactionEvent, interfaceEvent} = useAnalytics();
  const [selectedIllnesses, setSelectedIllnesses] = useState<IllnessList[]>([]);

  useEffect(() => {
    interfaceEvent('Loaded', {$screen_name: 'Intake'});
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
            padding={true}
            disabled={selectedIllnesses.length === 0 ? true : false}
            onPress={() => {
              interactionEvent('Button', 'Pressed', {
                $screen_name: 'Intake',
                value: 'Continue',
              });

              // if contains ONLY "None/Prefer not to say" navigate to NiceToMeetYou, else, navigate to IntakeDateSelect
              if (
                selectedIllnesses.length === 1 &&
                selectedIllnesses[0].name === 'None/Prefer not to say'
              ) {
                navigation.navigate('Register', {
                  user: {
                    ...route.params.user,
                    illness: selectedIllnesses.map(i => ({
                      name: i.name as Illness,
                      dateOfOnset: null,
                    })),
                  },
                });
              } else {
                navigation.navigate('IntakeDateSelect', {
                  user: {
                    ...route.params.user,
                    illness: selectedIllnesses.map(i => ({
                      name: i.name as Illness,
                      dateOfOnset: null,
                    })),
                  },
                });
              }
            }}
            textStyle={[getCircular('Bold'), tw``]}
          />
        }>
        {/* TOP HEADER SECTION */}
        <Subheader
          style={[getCircular('Book'), tw`mb-[32px]`]}
          padding={true}
          text="We built Pathize for people with energy-limiting conditions, such as Long COVID, ME/CFS, and POTS. Even if you do not have one of these conditions you can still use Pathize to track energy levels and symptoms."
        />
        {/* SELECT CONDITIONS */}
        <Subheader
          style={[getCircular('Book'), tw``]}
          textColor="black"
          textType="medium"
          padding={false}
          text="Select your condition(s)"
        />
        {/* CONDITION AREA */}
        <ConditionList
          selectedIllnesses={selectedIllnesses}
          setSelectedIllnesses={setSelectedIllnesses}
        />
      </AppBodyLayout>
    </MainAppLayout>
  );
};

export default IntakeScreen;
