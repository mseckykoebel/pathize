import React, {SetStateAction, Dispatch} from 'react';
import {TextInput, Switch, View} from 'react-native';
import {usePostHog} from 'posthog-react-native';
import tw from 'twrnc';

import {InputText, LightExplainerText} from '../../../components/elements';
import {useAnalytics} from '../../../hooks';

interface HeartRateSectionProps {
  editable: boolean;
  hrValue: number | null;
  setHrValue: Dispatch<SetStateAction<number | null>>;
  setHrValueToggle: Dispatch<SetStateAction<boolean>>;
  hrValueToggle: boolean;
  inputText: string;
  explainerText: string;
  posthogEventName: string;
  placeholder?: string;
}

export const HeartRateSection: React.FC<HeartRateSectionProps> = ({
  editable,
  hrValue,
  setHrValue,
  hrValueToggle,
  setHrValueToggle,
  inputText,
  explainerText,
  posthogEventName,
  placeholder = 'Not set',
}) => {
  const {interactionEvent} = useAnalytics();
  const posthog = usePostHog();

  const toggleSwitch = (setToggleState: Dispatch<SetStateAction<boolean>>) => {
    setToggleState(prev => !prev);
    if (posthog) {
      posthog.capture(posthogEventName, {
        $screen_name: 'Notifications',
        component: 'Switch',
        value: !hrValueToggle,
      });
    }
  };

  return (
    <View style={tw`mt-4`}>
      <InputText text={inputText} />
      <View style={tw`flex-row flex justify-between items-center mt-1 mb-1`}>
        <TextInput
          editable={editable}
          defaultValue={hrValue ? String(hrValue) : ''}
          onChangeText={val => setHrValue(Number(val))}
          placeholder={placeholder}
          style={tw`w-30 rounded-md border border-gray-300 px-3 py-2`}
          onFocus={() => {
            interactionEvent('Input', 'Focused', {
              $screen_name: 'Notifications',
              value: String(hrValue),
            });
          }}
        />
        <Switch
          trackColor={{false: '#767577', true: '#059669'}}
          thumbColor={hrValueToggle ? '#f4f3f4' : '#f4f3f4'}
          ios_backgroundColor="#F0F0F0"
          onValueChange={() => {
            interactionEvent('Switch', 'Toggled', {
              $screen_name: 'Notifications',
              value: hrValueToggle,
            });

            toggleSwitch(setHrValueToggle);
          }}
          disabled={!editable}
          value={hrValueToggle}
        />
      </View>
      <View style={tw`mt-1`}>
        <LightExplainerText text={explainerText} size="text-xs" />
      </View>
    </View>
  );
};
