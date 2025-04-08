import type {Meta, StoryObj} from '@storybook/react';
import {CheckBox as Foo} from '@pathize/mobile-ui';

let enabled = true;

const meta = {
  title: 'Pathize UI/CheckBox/Check Box',
  component: Foo,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {control: 'boolean'},
  },
} satisfies Meta<typeof Foo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H2: Story = {
  args: {
    checked: enabled ? false : true,
    onValueChange: () => console.log('Something'),
  },
};
