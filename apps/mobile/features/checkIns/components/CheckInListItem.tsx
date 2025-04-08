import React from 'react';
import {faListCheck} from '@fortawesome/free-solid-svg-icons';
import tw from 'twrnc';

import {CheckInComplete} from '@pathize/db';
import {ListItem, PathizeIcon} from '@pathize/mobile-ui';
import {CheckInBadgeChild} from './CheckInBadgeChild';
import {getCircular} from '../../../utils';

type Props = {
  item: CheckInComplete;
  onPress: () => void;
  disabled?: boolean;
};

export const CheckInListItem: React.FC<Props> = ({item, onPress, disabled}) => {
  const numberOfMedications = item.medications.length;
  const numberOfSymptoms = item.symptoms.length;
  return (
    <>
      <ListItem
        padding={true}
        disabled={disabled}
        itemIcon={<PathizeIcon icon={faListCheck} size={24} />}
        onPress={() => onPress()}
        title={item.name}
        badgeChild={
          <CheckInBadgeChild
            item={item}
            numberOfMedications={numberOfMedications}
            numberOfSymptoms={numberOfSymptoms}
          />
        }
        titleStyle={[tw`text-xl`, getCircular('Bold')]}
        buttonStyle={[tw``]}
      />
    </>
  );
};
