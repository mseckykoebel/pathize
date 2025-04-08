import React, {memo} from 'react';
import {StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';

import {SetupBody} from './SetupBody';
import {SetupLayout} from './SetupLayout';
import {getCircular} from '../../../utils';

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const FirstTimeSetup: React.FC<Props> = memo(({style = {}}) => {
  return (
    <SetupLayout style={style}>
      <SetupBody
        horizontalPadding={true}
        headerStyle={[
          tw`text-xl font-semibold text-slate-950 mb-3`,
          getCircular('Bold'),
        ]}
        bodyStyle={[tw`text-sm text-gray-500`, getCircular('Book')]}
      />
    </SetupLayout>
  );
});

FirstTimeSetup.displayName = 'FirstTimeSetup';
