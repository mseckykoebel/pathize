import type {Meta, StoryObj} from '@storybook/react';
import {PrimaryButton} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Buttons/Primary Button',
  component: PrimaryButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onPress: {action: 'onPress'},
    disabled: {control: 'boolean'},
    rounded: {
      control: 'text',
    },
  },
} satisfies Meta<typeof PrimaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    onPress: () => console.log('Button pressed'),
    text: 'Get started',
  },
};
