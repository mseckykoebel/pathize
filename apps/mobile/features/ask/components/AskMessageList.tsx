import React, {useRef, useEffect} from 'react';
import {View, FlatList, Text} from 'react-native';
import tw from 'twrnc';

import {getCircular} from '../../../utils';
import {Body1, FadeIn, FadeInFadeOut, Loading} from '@pathize/mobile-ui';

const ItemSeparator = () => <View style={tw`mt-3`} />;

interface MessageLoadingProps {
  loading: boolean;
  isUsingFunctions: boolean;
}

const MessageLoading: React.FC<MessageLoadingProps> = ({
  loading,
  isUsingFunctions,
}) => {
  return (
    <View style={[tw`mb-3 items-start ml-3 max-w-8/15`]}>
      {/* REGULAR BOX */}
      <View
        style={tw`bg-white border border-zinc-300 rounded-lg p-3 flex flex-row items-center justify-start`}>
        <Text
          style={[
            tw`text-slate-900 text-base font-medium`,
            getCircular('Book'),
          ]}>
          Generating response...
        </Text>
        <Loading loading={loading} padding={false} style={tw`ml-2`} />
      </View>
      {/* SHOW USING FUNCTIONS TEXT */}
      <FadeInFadeOut duration={250} watchValue={isUsingFunctions}>
        <Body1
          text="Using your health data to answer this question..."
          textStyle={[tw`mt-2 text-xs`, getCircular('Book')]}
        />
      </FadeInFadeOut>
    </View>
  );
};

const Message = ({
  messageText,
  index,
}: {
  messageText: string;
  index: number;
}) => {
  const textAlignment = index % 2 === 0 ? 'text-right' : 'text-left';
  const backgroundStyle =
    index % 2 === 0 ? 'bg-slate-900' : 'bg-white border border-zinc-300';
  const textColors = index % 2 === 0 ? 'text-white' : 'text-slate-900';
  return (
    <View style={tw`rounded-lg p-3 max-w-3/4 ${backgroundStyle}`}>
      <Text
        style={[
          tw`${textAlignment} ${textColors} text-base font-medium`,
          getCircular('Book'),
        ]}>
        {messageText}
      </Text>
    </View>
  );
};

type Props = {
  messages: string[];
  loading: boolean;
  isUsingFunctions: boolean;
};

export const AskMessageList: React.FC<Props> = ({
  messages,
  loading,
  isUsingFunctions,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  const renderItem = ({item, index}: {item: string; index: number}) => {
    const topItemAlignment = index === 0 ? 'mt-3' : 'mt-0';
    const bottomItemAlignment = index === messages.length - 1 ? 'mb-3' : 'mb-0';
    const alignment = index % 2 === 0 ? 'items-end mr-3' : 'items-start ml-3';

    return (
      <FadeIn duration={250}>
        <View
          style={tw`${alignment} ${topItemAlignment} ${bottomItemAlignment}`}>
          <Message messageText={item} index={index} />
        </View>
        {loading && index === messages.length - 1 ? (
          <MessageLoading
            loading={loading}
            isUsingFunctions={isUsingFunctions}
          />
        ) : null}
      </FadeIn>
    );
  };

  return (
    <FlatList
      style={tw`flex-1 flex flex-col`}
      ref={flatListRef}
      data={messages}
      scrollEnabled={true}
      keyExtractor={(item, index) => item + index}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
};
