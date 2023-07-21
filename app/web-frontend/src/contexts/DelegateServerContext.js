import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import { DELEGATE_SERVER_URL } from 'config';

const WebSocketContext = createContext();

// const juryKeys = [
//   'd480224a7fa30131804dacffa0322d9256092800bd2f3828fb9a77cf',
//   'f19e75abc98140c647ae962b7a903c6a2c65520a87467841d435819a',
//   '8be4e12dd88a085bcdfbb07763d1dcf8a2a4aaa6646edafe6476e6ac',
// ];

// const makeTestTerms = (hydraHeadId) => ({
//   claimFor: 'test',
//   claimer: juryKeys[0],
//   hydraHeadId,
//   jury: juryKeys,
//   voteDurationMinutes: 1,
//   debugCheckSignatures: false,
// });

function DelegateServerProvider({ children }) {
  const [data, setData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(DELEGATE_SERVER_URL);

    console.log('Connecting to websocket server');

    ws.addEventListener('open', () => {
      setIsConnected(true);
      console.log('Connected to websocket server');
    });

    ws.addEventListener('message', (event) => {
      setData(event.data);
      console.log('Received:', event.data);

      // const response = JSON.parse(event.data);
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    ws.addEventListener('close', () => {
      console.log('Disconnected from the WebSocket server');
      setIsConnected(false);
    });

    setSocket(ws);

    // return () => {
    //   ws.close();
    // };
  }, []);

  const queryState = () => {
    const query = {
      tag: 'QueryCurrentDelegateState',
    };

    socket.send(JSON.stringify(query));
  };

  const createDispute = ({
    claimFor,
    claimer,
    hydraHeadId,
    jury,
    voteDurationMinutes,
    debugCheckSignatures = false,
  }) => {
    const dateNow = new Date();
    const voteStart = dateNow.getTime();
    const voteEnd = voteStart + voteDurationMinutes * 60_000;
    const voteInterval = [voteStart, voteEnd];

    const terms = {
      claimFor,
      claimer,
      hydraHeadId,
      jury,
      voteInterval,
      debugCheckSignatures,
    };

    const commit = {
      contents: [terms, ''],
      tag: 'SubmitCommit',
    };

    socket.send(JSON.stringify(commit));
  };

  const castVote = ({ juryMember, vote }) => {
    const voting = {
      contents: {
        contents: [juryMember, '', vote],
        tag: 'Vote',
      },
      tag: 'SubmitTx',
    };

    socket.send(JSON.stringify(voting));
  };

  const settle = () => {
    const settling = {
      contents: {
        contents: 'AllVotesCasted',
        tag: 'Settle',
      },
      tag: 'SubmitTx',
    };

    socket.send(JSON.stringify(settling));
  };

  const context = useMemo(
    () => ({
      isConnected,
      data,
      queryState,
      createDispute,
      castVote,
      settle,
    }),
    [isConnected, data],
  );

  return <WebSocketContext.Provider value={context}>{children}</WebSocketContext.Provider>;
}

const UseDelegateServer = () => useContext(WebSocketContext);

export { DelegateServerProvider, UseDelegateServer };
