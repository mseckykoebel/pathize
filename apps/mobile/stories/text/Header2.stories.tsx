import type {Meta, StoryObj} from '@storybook/react';
import {Header2} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Text/H2',
  component: Header2,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Header2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H2: Story = {
  args: {
    text: 'Lorem ipsum dolor sit amet',
  },
};
