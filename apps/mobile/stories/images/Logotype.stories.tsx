import type {Meta, StoryObj} from '@storybook/react';
import {View, Image} from 'react-native';
import tw from 'twrnc';

const Logotype = () => {
  return (
    <View style={tw`p-10 bg-sky-200 rounded-xl`}>
      <Image
        source={{
          uri: 'https://jupiter-dx.github.io/assets/pathize_logotype.png',
          cache: 'force-cache',
        }}
        style={tw`w-120 h-12`}
        resizeMode="cover"
        alt="Checkbox input with black background if checked, and white background if unchecked"
      />
    </View>
  );
};

const meta = {
  title: 'Pathize UI/Text/Logotype',
  component: Logotype,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Logotype>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Logo: Story = {
  args: {},
};
