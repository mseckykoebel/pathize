import React, {useCallback, useEffect, useState} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  TouchableOpacity,
  TextInput,
  View,
  Dimensions,
  Text,
  Alert,
} from 'react-native';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {trigger} from 'react-native-haptic-feedback';
import tw from 'twrnc';

import {
  Body1,
  FadeIn,
  FadeInFadeOut,
  Header1,
  ListBox,
  Loading,
  PressableCard,
  PrimaryButton,
} from '@pathize/mobile-ui';
import {AskMessageList} from '../../features';
import {useAnalytics} from '../../hooks';
import {useAskContext} from '../../contexts';
import {AppBodyLayout, MainAppLayout} from '../../components';
import {getCircular} from '../../utils';
import {TabbedNavigatorParamList} from '../home/HomeNavigator';

// adjust the multiplier as needed
function calculateOffset() {
  return Dimensions.get('window').height * 0.13;
}

const WelcomeMessage = () => {
  return (
    <View style={tw`mt-10 mx-10 flex flex-col items-center justify-center`}>
      <Header1
        paddingBottom={true}
        text="Welcome to Pathize Ask!"
        style={[tw`text-slate-900 text-center font-bold`, getCircular('Bold')]}
      />
      <Body1
        text="Pathize Ask can try to answer questions you have about your health data and trends. Ask can make mistakes, so be sure to confirm important information before making decisions. Ask is also in beta, so some capabilities might not be available. Finally, more complex questions may take longer to answer."
        textStyle={[
          tw`mt-1 text-center text-sm text-neutral-500`,
          getCircular('Book'),
        ]}
        padding={true}
      />
    </View>
  );
};

const suggestedQueries = [
  {
    id: '0',
    text: 'When I crash, how long do I usually spend above my limit?',
  },
  {
    id: '1',
    text: 'What is my HRV over the past week? Format the data, day by day, in a table.',
  },
  {
    id: '2',
    text: 'What can you do?',
  },
];

type SuggestedQueryProps = {
  setMessageFromSuggestedPress: (message: string) => void;
};

const SuggestedQueries: React.FC<SuggestedQueryProps> = ({
  setMessageFromSuggestedPress,
}) => {
  return (
    <FadeIn duration={250} style={[tw`items-end mr-3 mb-3 z-100`]}>
      <>
        <Body1
          text="Try asking:"
          textStyle={[tw`text-sm text-neutral-500`, getCircular('Book')]}
        />
        {suggestedQueries.map(query => {
          return (
            <TouchableOpacity
              key={query.id}
              onPress={() => {
                trigger('impactLight');
                setMessageFromSuggestedPress(query.text);
              }}
              style={tw`rounded-lg p-3 max-w-3/4 bg-white border border-zinc-300 mt-3`}>
              <Text
                style={[
                  tw`text-right text-neutral-500 text-base font-medium`,
                  getCircular('Book'),
                ]}>
                {query.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </>
    </FadeIn>
  );
};

type MessageInputProps = {
  disabled: boolean;
  message: string;
  setMessage: (message: string) => void;
  sendMessage: () => void;
};

const MessageInput: React.FC<MessageInputProps> = ({
  disabled,
  message,
  setMessage,
  sendMessage,
}) => {
  return (
    <ListBox
      rounded={false}
      border={false}
      style={[tw`border-t border-zinc-300 h-17`]}
      textChild={
        <TextInput
          value={message}
          maxLength={100}
          onChangeText={setMessage}
          placeholder="Message Pathize Ask..."
          style={[
            tw`text-base font-medium text-slate-900 h-50`,
            getCircular('Book'),
          ]}
        />
      }
      rightChild={
        <PrimaryButton
          onPress={sendMessage}
          text="Send"
          width="half"
          padding={true}
          style={[tw`w-20 h-12`]}
          rounded={'small'}
          disabled={disabled}
          textStyle={[tw``, getCircular('Book')]}
        />
      }
    />
  );
};

type Props = BottomTabScreenProps<TabbedNavigatorParamList, 'AskScreen'>;

const AskScreen: React.FC<Props> = () => {
  const {interfaceEvent, interactionEvent} = useAnalytics();
  const {state, dispatch, sendWSMessage, initializeWebSocket} = useAskContext();

  // TODO: it might make sense to, one day, put these hooks into the state reducer
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [messageFromSuggestedPress, setMessageFromSuggestedPress] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messageLoading, setMessageLoading] = useState<boolean>(false);
  const [isUsingFunctions, setIsUsingFunctions] = useState<boolean>(false);
  const [retryButtonEnabled, setRetryButtonEnabled] = useState<boolean>(false);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [retryLoading, setRetryLoading] = useState<boolean>(false);
  const [welcomeMessageVisible, setWelcomeMessageVisible] =
    useState<boolean>(true);

  // re-init connection if in RESET or ERROR state
  const resetConnection = useCallback(() => {
    dispatch({type: 'RESET', payload: {}});
    setRetryLoading(true);
    initializeWebSocket();
    setTimeout(() => setRetryLoading(false), 1000);
  }, [dispatch, initializeWebSocket]);

  const showErrorMessage = useCallback(
    (errMessage: string) => {
      Alert.alert(
        'There was an issue',
        `${errMessage}. Press OK to re-load the session and try again.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setError(null);
              resetConnection();
            },
          },
        ],
        {
          cancelable: false,
        },
      );
    },
    [resetConnection],
  );

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', () => {
      // if keyboard is visible, set welcome message to false
      setWelcomeMessageVisible(false);
    });
    Keyboard.addListener('keyboardWillHide', () => {
      // if keyboard is not visible, set welcome message to true
      setWelcomeMessageVisible(true);
    });

    // if loading for the first time
    if (initialLoad) {
      interfaceEvent('Loaded', {
        $screen_name: 'AskScreen',
      });
      setInitialLoad(false);
    }

    // if message from selected press present
    if (messageFromSuggestedPress && state.wsConnection) {
      setMessage(messageFromSuggestedPress);
      sendWSMessage(state.wsConnection, messageFromSuggestedPress);
      setMessageFromSuggestedPress(null);
      return;
    }

    // if there is an error, show the error message and return early
    if (error) {
      showErrorMessage(error);
      return;
    }

    // how to change the chat UI based on the webhook reducer
    const handleNewState = () => {
      if (state.currentState === 'INITIALIZING') {
        setModelLoading(true);
        setRetryButtonEnabled(false);
        setRetryLoading(false);
      } else if (state.currentState === 'READY') {
        setModelLoading(false);
      } else if (state.currentState === 'ERROR') {
        setRetryButtonEnabled(true);
        setError(
          state.errorMessage ?? 'There was an error with the connection',
        );
      } else if (state.currentState === 'MESSAGE_PENDING') {
        setMessage('');
        setMessageLoading(true);
      } else if (state.currentState === 'MESSAGE_PENDING_WITH_FUNCTIONS') {
        setIsUsingFunctions(true);
      } else if (state.currentState === 'MESSAGE_RECEIVED') {
        setMessageLoading(false);
        setIsUsingFunctions(false);
      } else if (state.currentState === 'RESET') {
        setRetryButtonEnabled(true);
      }
    };

    handleNewState();
  }, [
    showErrorMessage,
    sendWSMessage,
    interfaceEvent,
    initialLoad,
    state,
    messageFromSuggestedPress,
    error,
  ]);

  const sendDisabled =
    state.currentState === 'INITIALIZING' ||
    state.currentState === 'MESSAGE_PENDING' ||
    state.currentState === 'MESSAGE_PENDING_WITH_FUNCTIONS' ||
    state.currentState === 'ERROR';

  return (
    <MainAppLayout statusBarStyle="light-content">
      <KeyboardAvoidingView
        behavior={'padding'}
        keyboardVerticalOffset={calculateOffset()}
        style={tw`flex-1`}>
        <AppBodyLayout
          dismissKeyboardOnTouch={false}
          padding={false}
          paddingTop={false}
          avoidKeyboard={false}
          scrollable={false}>
          <>
            {/* IF IN  READY STATE, SHOW WELCOME MESSAGE */}
            {state.currentState === 'READY' && welcomeMessageVisible && (
              <FadeInFadeOut watchValue={welcomeMessageVisible}>
                <WelcomeMessage />
              </FadeInFadeOut>
            )}
            {/* PRESS TO RE-CONNECT TO SERVER */}
            {retryButtonEnabled && (
              <PressableCard
                onPress={() => {
                  interactionEvent('Button', 'Pressed', {
                    $screen_name: 'AskScreen',
                    value: 'Re-connect',
                  });

                  resetConnection();
                }}
                headerText="Re-connect"
                textChild="You were disconnected from Pathize Ask. Press to re-connect."
                alertChild={'!'}
                padding={false}
                headerTextStyle={[tw``, getCircular('Bold')]}
                bodyTextStyle={[tw``, getCircular('Book')]}
                style={[tw`m-10`]}
              />
            )}
            {/* GENERAL LOADING FOR THE MODEL - RETRY OR FIRST TIME */}
            {(retryLoading || modelLoading) && (
              <Loading loading={retryLoading || modelLoading} />
            )}

            {/* MESSAGE LIST */}
            <AskMessageList
              messages={state.messages ?? []}
              loading={messageLoading}
              isUsingFunctions={isUsingFunctions}
            />
          </>
        </AppBodyLayout>
        {/* IF IN READY STATE, SHOW SUGGESTED MESSAGES */}
        {state.currentState === 'READY' && (
          <SuggestedQueries
            setMessageFromSuggestedPress={setMessageFromSuggestedPress}
          />
        )}
        {/* IF THERE IS NO RETRY BUTTON ENABLED, SHOW THE MESSAGE INPUT */}
        {!retryButtonEnabled && (
          <View style={tw``}>
            <MessageInput
              disabled={sendDisabled}
              message={message}
              setMessage={setMessage}
              sendMessage={() => {
                // if there is no current connection
                if (!state.wsConnection) return;
                sendWSMessage(state.wsConnection, message);
              }}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </MainAppLayout>
  );
};

export default AskScreen;
