import React, {useState} from 'react';
import {FlatList, StyleProp, TouchableOpacity, ViewStyle} from 'react-native';
import {trigger} from 'react-native-haptic-feedback';
import tw from 'twrnc';

import InfoSheet from '../../../components/sheets/InfoSheet';
import {useAnalytics} from '../../../hooks';
import {getCircular} from '../../../utils';
import {SolidColorCard} from '@pathize/mobile-ui';

type Faq = {
  id: string;
  question: string;
  answer: string;
};

const faq = [
  {
    id: '0',
    question: 'What are the main benefits of Pathize?',
    answer:
      'Along with being an activity, symptom, and medication tracker, Pathize uses heart rate, HRV, and other data to help you find a comfortable balance between activity and rest.',
  },
  {
    id: '1',
    question: 'Why do you charge for Pathize?',
    answer:
      'In addition to our set of features, we charge for Pathize so we can work full-time and improve Pathize as fast as we can. But, we understand Pathize might not be accessible to everyone. In the future, we will be offering extended free periods and discounts. If you have any questions about this, please reach out!',
  },
  {
    id: '2',
    question: 'What makes Pathize different?',
    answer:
      "We've worked hard to build the first Apple-Watch-based activity tracker that alerts you, in real time, when you exert yourself too much. We're quickly building more exciting features, such as intelligent exertion guidance based on when you've crashed in the past, and exportable reports.",
  },
  {
    id: '3',
    question: 'What kinds of things can I track with Pathize?',
    answer:
      "Pathize lets you track Crashes/Post-exertional malaise (PEM) and its severity. It also tracks activities, symptoms, medications, and supplements. We're working hard to add additional factors you can track.",
  },
  {
    id: '4',
    question: 'How does Pathize use my health data?',
    answer:
      "Because we integrate purely with Apple Health, we do not access any health data you don't authorize us to. If authorized, we utilize a wide range of illness-specific data, like HRV, blood oxygen, time above limit, and time spent standing.",
  },
];

const Item: React.FC<{item: Faq; onPress: () => void}> = ({item, onPress}) => {
  const isLastItem = item.id === '4';
  return (
    <TouchableOpacity onPress={onPress} key={item.id} style={tw``}>
      <SolidColorCard
        text={item.question}
        backgroundColor={'bg-gray-100'}
        textStyle={[tw``, getCircular('Book')]}
        cardStyle={[tw`mr-3`, isLastItem && tw`mr-20`]}
      />
    </TouchableOpacity>
  );
};

interface RenderItemProps {
  item: Faq;
}

type Props = {
  style?: StyleProp<ViewStyle>;
};

export const Faq: React.FC<Props> = ({style = {}}) => {
  const {interactionEvent} = useAnalytics();
  const [shownFaq, setShownFaq] = useState<Faq | null>(null);

  const renderItem = ({item}: RenderItemProps) => {
    return (
      <Item
        item={item}
        onPress={() => {
          trigger('impactLight');
          interactionEvent('Button', 'Pressed', {
            $screen_name: 'Payments',
            value: item.question,
          });
          setShownFaq(item);
        }}
      />
    );
  };

  return (
    <>
      <FlatList
        scrollEnabled={true}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        numColumns={1}
        data={faq}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={[tw`z-100`, style]}
      />
      {shownFaq ? (
        <InfoSheet
          portalIdentifier={`faq-${shownFaq.id}`}
          headerText={shownFaq.question}
          text={shownFaq.answer}
          startingIndex={0}
          onClose={() => setShownFaq(null)}
        />
      ) : null}
    </>
  );
};
