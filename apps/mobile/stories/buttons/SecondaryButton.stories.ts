import type {Meta, StoryObj} from '@storybook/react';
import {SecondaryButton} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Buttons/Secondary Button',
  component: SecondaryButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onPress: {action: 'onPress'},
    disabled: {control: 'boolean'},
  },
} satisfies Meta<typeof SecondaryButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {
  args: {
    onPress: () => console.log('Button pressed'),
    text: 'Primary Button',
    style: {fontFamily: 'Montserrat-SemiBold'} as any,
  },
};
