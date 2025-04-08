import React from 'react';
import {Text} from 'react-native';
import type {Meta, StoryObj} from '@storybook/react';
import {ListBox, CheckBox} from '@pathize/mobile-ui';
import tw from 'twrnc';

const LeftTextChild: React.FC = () => {
  return (
    <Text style={tw`h-6 text-black text-opacity-80 text-base leading-tight`}>
      Notifications
    </Text>
  );
};

const meta = {
  title: 'Pathize UI/Lists/List Box',
  component: ListBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    border: {control: 'boolean'},
  },
} satisfies Meta<typeof ListBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H2: Story = {
  args: {
    border: true,
    textChild: <LeftTextChild />,
    rightChild: <CheckBox checked={true} onValueChange={() => {}} />,
  },
};
