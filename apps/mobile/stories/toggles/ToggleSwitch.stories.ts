import type {Meta, StoryObj} from '@storybook/react';
import {ToggleSwitch} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Toggles/Toggle Switch',
  component: ToggleSwitch,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onValueChange: {action: 'onPress'},
    isEnabled: {control: 'boolean'},
  },
} satisfies Meta<typeof ToggleSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    isEnabled: false,
    onValueChange: () => console.log('Button pressed'),
  },
};
