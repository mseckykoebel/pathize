import React, {
  Dispatch,
  MutableRefObject,
  ReactNode,
  useEffect,
  useReducer,
  useContext,
  createContext,
  useRef,
  useCallback,
} from 'react';

import type {
  WebsocketMessageType,
  WSInit,
  WSMessage,
  WSDisconnect,
  WSPing,
  WSError,
} from '@pathize/api';
import {BASE_URL} from '../utils';
import {useAuth} from '../CoreNav';
import {useAnalytics} from '../hooks';

/**
 * HELPER FUNCTIONS
 */

// initialize the websocket connection
function handleWSInit(ws: MutableRefObject<WebSocket | null>, userId: string) {
  return ws.current?.send(
    JSON.stringify({
      type: 'init',
      payload: {
        userId: userId,
      },
    }),
  );
}

// handler for incoming message
function handleIncomingWSMessage(
  message: WSMessageFromServer,
  dispatch: Dispatch<Action>,
  ws: MutableRefObject<WebSocket | null>,
) {
  if (message.type === 'init') {
    dispatch({
      type: 'READY',
      payload: {
        wsConnection: ws?.current,
      },
    });
  } else if (message.type === 'error') {
    console.log('error: ', message.payload);
    dispatch({
      type: 'ERROR',
      payload: {
        errorMessage: (message.payload as WSError)?.message,
      },
    });
  } else if (message.type === 'message') {
    if (
      (message.payload as WSMessage).message.toLowerCase().includes('function')
    ) {
      dispatch({
        type: 'MESSAGE_PENDING_WITH_FUNCTIONS',
        payload: {},
      });
    } else {
      dispatch({
        type: 'MESSAGE_RECEIVED',
        payload: {
          messages: [(message.payload as WSMessage).message],
        },
      });
    }
  }
}

// disconnect from the websocket/remove from the pool
function handleWSDisconnect(
  ws: MutableRefObject<WebSocket | null>,
  userId: string,
) {
  return ws.current?.send(
    JSON.stringify({
      type: 'disconnect',
      payload: {
        userId: userId,
      },
    }),
  );
}

/**
 * CONTEXT
 */

type WSMessageFromServer = {
  type: WebsocketMessageType;
  payload: WSInit | WSMessage | WSDisconnect | WSPing | WSError;
};

type AskDispatchPayload =
  | 'INITIALIZING'
  | 'READY'
  | 'MESSAGE_PENDING'
  | 'MESSAGE_PENDING_WITH_FUNCTIONS'
  | 'MESSAGE_RECEIVED'
  | 'ERROR'
  | 'RESET';

type State = {
  currentState: AskDispatchPayload;
  messages?: string[];
  errorMessage?: string;
  wsConnection?: WebSocket | null;
};

type Action = {
  type: AskDispatchPayload;
  payload: {
    messages?: string[];
    errorMessage?: string;
    wsConnection?: WebSocket | null;
  };
};

const initialState: State = {
  currentState: 'RESET',
  messages: [],
  errorMessage: undefined,
  wsConnection: undefined,
};

const reducer = (prevState: State, action: Action): State => {
  switch (action.type) {
    case 'INITIALIZING':
      return {
        ...prevState,
        currentState: action.type,
        errorMessage: undefined,
      };
    case 'READY':
      return {
        ...prevState,
        currentState: action.type,
        messages: action.payload.messages, // if any messages are received on initialization
        errorMessage: undefined,
        wsConnection: action.payload.wsConnection,
      };
    case 'MESSAGE_PENDING':
      return {
        ...prevState,
        currentState: action.type,
        messages: [
          ...(prevState.messages || []),
          ...(action.payload.messages || []),
        ],
        errorMessage: undefined,
      };
    case 'MESSAGE_PENDING_WITH_FUNCTIONS':
      return {
        ...prevState,
        currentState: action.type,
      };
    case 'MESSAGE_RECEIVED':
      return {
        ...prevState,
        currentState: action.type,
        messages: [
          ...(prevState.messages || []),
          ...(action.payload.messages || []),
        ],
        errorMessage: undefined,
      };
    case 'ERROR':
      return {
        ...prevState,
        currentState: action.type,
        errorMessage: action.payload.errorMessage,
      };
    case 'RESET':
      return {
        ...prevState,
        currentState: action.type,
        messages: [],
        errorMessage: undefined,
        wsConnection: undefined,
      };
    default:
      return prevState;
  }
};

export type AskContext = {
  state: State;
  dispatch: Dispatch<Action>;
  // helper functions
  sendWSMessage: (ws: WebSocket, message: string) => void;
  initializeWebSocket: () => void;
};

const AskContext = createContext<AskContext | undefined>(undefined);

export const useAskContext = () => {
  const context = useContext(AskContext);
  if (context === undefined) {
    throw new Error('useAskContext must be used within a AskProvider');
  }
  return context;
};

export const AskProvider = ({children}: {children: ReactNode}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const {interactionEvent} = useAnalytics();
  const {userId, accessToken} = useAuth();
  const ws = useRef<WebSocket | null>(null);

  // send a websocket message
  const sendWSMessage = useCallback(
    (websocket: WebSocket, message: string) => {
      dispatch({
        type: 'MESSAGE_PENDING',
        payload: {
          messages: [message],
        },
      });
      interactionEvent('Message', 'Sent', {
        $screen_name: 'AskScreen',
        value: message,
      });
      return websocket.send(
        JSON.stringify({
          type: 'message',
          payload: {
            userId: userId,
            message: message,
          },
        }),
      );
    },
    [userId, interactionEvent],
  );

  // set up a websocket connection
  const initializeWebSocket = useCallback(() => {
    ws.current = new WebSocket(`${BASE_URL}/api/v1/ask`, undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // when opened
    ws.current.onopen = () => {
      dispatch({
        type: 'INITIALIZING',
        payload: {},
      });
      handleWSInit(ws, userId);
    };

    // when we get a message back from the server
    ws.current.onmessage = e => {
      const message = JSON.parse(e.data) as WSMessageFromServer;
      interactionEvent('Message', 'Received', {
        $screen_name: 'AskScreen',
        value: JSON.stringify(message.payload),
      });
      handleIncomingWSMessage(message, dispatch, ws);
    };

    // when it is closed for some reason
    ws.current.onclose = () => {
      interactionEvent('Connection', 'Closed', {
        $screen_name: 'AskScreen',
      });

      dispatch({
        type: 'RESET',
        payload: {},
      });
      handleWSDisconnect(ws, userId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, userId]);

  useEffect(() => {
    initializeWebSocket();

    return () => {
      dispatch({
        type: 'RESET',
        payload: {},
      });
      handleWSDisconnect(ws, userId);
      ws.current?.close();
    };
  }, [userId, accessToken, initializeWebSocket]);

  const value = {
    state,
    dispatch,
    sendWSMessage,
    initializeWebSocket,
  };

  return <AskContext.Provider value={value}>{children}</AskContext.Provider>;
};
