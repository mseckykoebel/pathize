import type {Meta, StoryObj} from '@storybook/react';
import {Divider} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Layout/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LayoutDivider: Story = {
  args: {},
};
