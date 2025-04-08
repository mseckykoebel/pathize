import React from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {InputFieldCheckboxSecondary} from '@pathize/mobile-ui';
import tw from 'twrnc';
import {View} from 'react-native';
import {getCircular} from '../../utils';

const InputFieldCheckboxSecondaryStory: React.FC = () => {
  return (
    <View style={tw`flex flex-col items-center bg-slate-100 p-10 w-100`}>
      <InputFieldCheckboxSecondary
        padding={true}
        itemText="ME/CFS"
        selected={false}
        onValueChange={() => {}}
        textStyle={[getCircular('Medium')]}
      />
      <InputFieldCheckboxSecondary
        padding={true}
        itemText="Long COVID"
        selected={false}
        onValueChange={() => {}}
        textStyle={[getCircular('Medium')]}
      />
      <InputFieldCheckboxSecondary
        padding={true}
        itemText="POTS"
        selected={false}
        onValueChange={() => {}}
        textStyle={[getCircular('Medium')]}
      />
      <InputFieldCheckboxSecondary
        padding={true}
        itemText="None/Prefer not to say"
        selected={false}
        onValueChange={() => {}}
        textStyle={[getCircular('Medium')]}
      />
    </View>
  );
};

const meta = {
  title: 'Pathize UI/Inputs/Input Field Checkbox',
  component: InputFieldCheckboxSecondaryStory,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    selected: {control: 'boolean'},
    onValueChange: {action: 'onChangeText'},
  },
} satisfies Meta<typeof InputFieldCheckboxSecondaryStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InputChecked: Story = {
  args: {
    itemText: 'ME/CFS',
    selected: false,
    onValueChange: () => {},
  },
};
