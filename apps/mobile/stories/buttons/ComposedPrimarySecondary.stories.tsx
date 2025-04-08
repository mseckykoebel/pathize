import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {View} from 'react-native';
import tw from 'twrnc';
import {PrimaryButton, SecondaryButton} from '@pathize/mobile-ui';

const ComposedButtons = () => {
  return (
    <View style={tw`p-10 bg-sky-200 rounded-xl w-100`}>
      <View style={tw`flex flex-row flex-wrap`}>
        <PrimaryButton text="Get started" onPress={() => {}} />
        <SecondaryButton
          text="I already have an account"
          onPress={() => {}}
          padding={false}
        />
      </View>
    </View>
  );
};

const meta = {
  title: 'Pathize UI/Buttons/Composed Primary and Secondary',
  component: ComposedButtons,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ComposedButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComposedPrimarySecondary: Story = {
  args: {},
};
