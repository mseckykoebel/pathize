import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {View} from 'react-native';
import tw from 'twrnc';

import {Header1} from '@pathize/mobile-ui';
import {getCircular, getCooper} from '../../utils';

const ComposedHeader: React.FC = () => {
  // view that wraps three headers, all in-line, and makes them centered
  return (
    <View style={tw`flex flex-col items-center`}>
      <View style={tw`flex flex-row flex-wrap`}>
        <Header1 text="The " padding={false} style={[getCooper()]} />
        <Header1
          text="co-pilot "
          padding={false}
          style={[getCircular('Medium'), tw`-mt-0.5 -ml-1`]}
        />
        <Header1 text="for your " padding={false} style={getCooper()} />
      </View>
      <View style={tw`flex flex-row flex-wrap`}>
        <Header1
          text="energy-limiting"
          padding={false}
          style={[getCircular('Medium'), tw`-mt-0.5`]}
        />
      </View>
      <Header1 text="condition" padding={false} style={getCooper()} />
    </View>
  );
};

const meta = {
  title: 'Pathize UI/Text/Composed Header1',
  component: ComposedHeader,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ComposedHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1Composed: Story = {
  args: {},
};
