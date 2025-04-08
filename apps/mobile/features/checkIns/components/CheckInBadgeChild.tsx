import React from 'react';
import {View, StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';

import {CheckInComplete} from '@pathize/db';
import {Badge, Body1} from '@pathize/mobile-ui';
import {getCircular} from '../../../utils';
import dayjs from 'dayjs';

type BadgeChildProps = {
  item: CheckInComplete;
  numberOfMedications: number;
  numberOfSymptoms: number;
  style?: StyleProp<ViewStyle>;
};

export const CheckInBadgeChild: React.FC<BadgeChildProps> = ({
  item,
  numberOfMedications,
  numberOfSymptoms,
  style = {},
}) => {
  const medicationText =
    numberOfMedications === 0
      ? 'no medications'
      : numberOfMedications > 1
        ? `${numberOfMedications} medications`
        : `${numberOfMedications} medication`;
  const symptomText =
    numberOfSymptoms === 0
      ? 'no symptoms'
      : numberOfSymptoms > 1
        ? `${numberOfSymptoms} symptoms`
        : `${numberOfSymptoms} symptom`;

  const description = `This check-in has ${medicationText} and ${symptomText}.`;

  return (
    <>
      <Body1
        text={description}
        textStyle={[tw`mb-4`, getCircular('Book')]}
        padding={true}
      />
      <View style={[tw`flex flex-row flex-wrap items-center w-[100%]`, style]}>
        {/* TIME */}
        <Badge
          style={tw`mr-1`}
          text={dayjs(item.time).format('h:mm A')}
          rounded="large"
          textColor="text-zinc-800"
          badgeBackgroundColor="bg-lime-200"
          textStyle={[
            tw`text-zinc-900 text-sm font-medium`,
            getCircular('Book'),
          ]}
        />
        {/* ENABLED/DISABLED */}
        <Badge
          style={tw`mr-1`}
          text={item.notificationsEnabled ? 'enabled' : 'disabled'}
          rounded="large"
          textColor="text-zinc-800"
          badgeBackgroundColor={
            item.notificationsEnabled ? 'bg-green-200' : 'bg-red-200'
          }
          textStyle={[
            tw`text-zinc-900 text-sm font-medium`,
            getCircular('Book'),
          ]}
        />
      </View>
    </>
  );
};
