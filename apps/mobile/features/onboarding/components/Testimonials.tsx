import React, {memo} from 'react';
import {FlatList, StyleProp, ViewStyle} from 'react-native';
import tw from 'twrnc';

import {Badge, SolidColorCard} from '@pathize/mobile-ui';
import {getCircular} from '../../../utils';

const testimonials: {
  id: string;
  backgroundColor: string;
  text: string;
  name: string;
}[] = [
  {
    id: '0',
    backgroundColor: 'bg-purple-100',
    text: "It provides me with a data point for budgeting my energy while I'm sick with Long COVID/ME/CFS.",
    name: 'Diane',
  },
  {
    id: '1',
    backgroundColor: 'bg-pink-100',
    text: 'Currently a front runner of new tools focusing on chronic conditions.',
    name: 'John',
  },
  {
    id: '2',
    backgroundColor: 'bg-green-100',
    text: "It has given me more insight on how many hours I've been above my baseline...seemed to correlate with my crashes.",
    name: 'Sujana',
  },
  {
    id: '3',
    backgroundColor: 'bg-yellow-100',
    text: 'Pathize has been a critical tool in helping me see how long and how often I exceed my daily recommended heart rate limit.',
    name: 'Lindsay',
  },
  {
    id: '4',
    backgroundColor: 'bg-blue-100',
    text: 'The notifications for heart rate are much nicer than the Apple Watch ones.',
    name: 'Angela',
  },
  {
    id: '5',
    backgroundColor: 'bg-red-100',
    text: "I believe Pathize can play a vital role in addressing patients' unique health needs.",
    name: 'Elise',
  },
];

const Item = memo(
  ({backgroundColor, text, name, id}: Record<string, string>) => {
    const isLastItem = id === '5';
    return (
      <SolidColorCard
        text={text}
        backgroundColor={backgroundColor}
        bottomChild={
          <Badge
            text={name}
            textStyle={[tw`text-black`, getCircular('Book')]}
            badgeBackgroundColor="bg-white"
            badgeBorder={false}
            style={[tw`mt-3`]}
          />
        }
        textStyle={[tw``, getCircular('Book')]}
        cardStyle={[tw`mr-3 w-75`, isLastItem && tw`mr-20`]}
      />
    );
  },
);

interface RenderItemProps {
  item: Record<string, string>;
  index: number;
}

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const Testimonials: React.FC<Props> = ({style = {}}) => {
  const renderItem = ({item}: RenderItemProps) => {
    return <Item {...item} />;
  };

  return (
    <FlatList
      scrollEnabled={true}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      numColumns={1}
      data={testimonials}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      style={[tw`z-100`, style]}
    />
  );
};
