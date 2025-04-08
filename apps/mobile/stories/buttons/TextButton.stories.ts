import type {Meta, StoryObj} from '@storybook/react';
import {TextButton} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Buttons/Text Button',
  component: TextButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    textColor: {control: 'color'},
    onPress: {action: 'onPress'},
  },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: {
    onPress: () => console.log('Button pressed'),
    text: 'Primary Button',
  },
};
