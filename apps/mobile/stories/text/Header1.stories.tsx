import type {Meta, StoryObj} from '@storybook/react';
import {Header1} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Text/H1',
  component: Header1,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Header1>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    text: 'Lorem ipsum dolor sit amet',
  },
};
