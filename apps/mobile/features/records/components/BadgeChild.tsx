import React from 'react';
import {StyleProp, View, ViewStyle} from 'react-native';
import tw from 'twrnc';
import {Badge} from '@pathize/mobile-ui';
import {getCircular, getPriorityFromNumber} from '../../../utils';
import {UserActivity, UserMedication, UserSymptom} from '@pathize/db';

type TrackerItem = UserActivity | UserSymptom | UserMedication;

// Type guards
const isUserActivity = (item: TrackerItem): item is UserActivity =>
  'activityId' in item;
const isUserSymptom = (item: TrackerItem): item is UserSymptom =>
  'symptomId' in item;
const isUserMedication = (item: TrackerItem): item is UserMedication =>
  'medicationId' in item;

interface BadgeChildProps {
  item: TrackerItem;
  paddingTop?: boolean;
  style?: StyleProp<ViewStyle>;
}

const BadgeChild: React.FC<BadgeChildProps> = ({
  item,
  paddingTop = true,
  style = {},
}) => {
  return (
    <View
      style={[
        tw`flex flex-row flex-wrap items-center w-[100%]`,
        paddingTop && tw`mt-1`,
        style,
      ]}>
      {isUserActivity(item) && item.activityPriority !== null && (
        <Badge
          style={tw`mr-1`}
          text={getPriorityFromNumber(item.activityPriority)}
          rounded="large"
          textColor="text-zinc-800"
          badgeBackgroundColor="bg-lime-200"
          textStyle={[
            tw`text-zinc-900 text-sm font-medium`,
            getCircular('Book'),
          ]}
        />
      )}

      {isUserMedication(item) && String(item.strength) && (
        <Badge
          style={tw`mr-1`}
          text={`${String(item.strength)} ${String(item.unit)}`}
          rounded="large"
          textColor="text-zinc-800"
          badgeBackgroundColor="bg-lime-200"
          textStyle={[
            tw`text-zinc-900 text-sm font-medium`,
            getCircular('Book'),
          ]}
        />
      )}

      {item.notes && (
        <Badge
          style={tw`mr-1`}
          text="Notes"
          rounded="large"
          textColor="text-zinc-900"
          badgeBackgroundColor="bg-blue-100"
          textStyle={[
            tw`text-zinc-900 text-sm font-medium`,
            getCircular('Book'),
          ]}
        />
      )}

      {(!isUserSymptom(item) || !item.symptomId) &&
        (!isUserMedication(item) || !item.medicationId) &&
        (!isUserActivity(item) || !item.activityId) && (
          <Badge
            style={tw`mr-1`}
            text="Custom"
            rounded="large"
            textColor="text-zinc-900"
            badgeBackgroundColor="bg-red-100"
            textStyle={[
              tw`text-zinc-900 text-sm font-medium`,
              getCircular('Book'),
            ]}
          />
        )}
    </View>
  );
};

export default BadgeChild;
