import type {Meta, StoryObj} from '@storybook/react';
import {Badge} from '@pathize/mobile-ui';

const meta = {
  title: 'Pathize UI/Badges/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    border: {control: 'boolean'},
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BadgeStory: Story = {
  args: {
    text: 'Coming soon',
    border: true,
    rounded: 'small',
  },
};
