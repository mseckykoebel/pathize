import type {Meta, StoryObj} from '@storybook/react';
import {View} from 'react-native';
import tw from 'twrnc';
import {PrimaryButton, SecondaryButton} from '@pathize/mobile-ui';

const ComposedButtonsOneDisabled = () => {
  return (
    <View style={tw`p-10 bg-gray-200 rounded-xl w-100`}>
      <View style={tw`flex flex-row flex-wrap`}>
        <PrimaryButton text="Get started" onPress={() => {}} />
        <SecondaryButton
          disabled={true}
          text="Something went wrong!"
          onPress={() => {}}
          padding={false}
        />
      </View>
    </View>
  );
};

const meta = {
  title: 'Pathize UI/Buttons/Composed Primary Secondary One Disabled',
  component: ComposedButtonsOneDisabled,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ComposedButtonsOneDisabled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ComposedPrimarySecondaryOneDisabled: Story = {
  args: {},
};
