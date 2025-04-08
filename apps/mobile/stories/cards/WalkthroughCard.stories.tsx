import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {WalkthroughCard, PrimaryButton} from '@pathize/mobile-ui';
import {Text} from 'react-native';
import tw from 'twrnc';

const AlertChild = () => {
  return (
    <Text style={tw`text-center text-zinc-900 text-xs font-medium`}>1</Text>
  );
};

const TextChild = () => {
  return (
    <Text style={tw`text-black text-sm`}>
      We need to ask you a few questions about your health
      <Text style={tw`text-black text-sm font-bold`}> as of today</Text>. It
      should take less than 1 minute to complete.
    </Text>
  );
};

const meta = {
  title: 'Pathize UI/Walkthrough/Walkthrough Card',
  component: WalkthroughCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof WalkthroughCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Walkthrough: Story = {
  args: {
    headerText: 'Establish Baseline',
    alertChild: <AlertChild />,
    textChild: <TextChild />,
    bottomChild: (
      <PrimaryButton
        text={'Complete health assessment'}
        onPress={() => {}}
        rounded="small"
      />
    ),
  },
};
