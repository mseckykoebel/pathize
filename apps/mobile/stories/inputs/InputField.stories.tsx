import type {Meta, StoryObj} from '@storybook/react';
import {InputField} from '@pathize/mobile-ui';
import {getCircular} from '../../utils';

const meta = {
  title: 'Pathize UI/Inputs/Input Field',
  component: InputField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof InputField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Input: Story = {
  args: {
    value: 'Default value',
    headerText: 'Header text',
    inputBackgroundColor: 'bg-white',
    onChangeText: () => {},
    style: [getCircular('Medium')],
  },
};
