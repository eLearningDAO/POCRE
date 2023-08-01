import React, {
  createContext, useState, useEffect, useContext, useMemo,
} from 'react';
import { DELEGATE_SERVER_URL } from 'config';

const WebSocketContext = createContext();

export const serverStates = {
  disconnected: 'Disconnected',
  connected: 'Connected',
  awaitingCommits: 'AwaitingCommits',
  bidCommitted: 'BidCommitted',
  votingOpen: 'VotingOpen',
  votingClosed: 'VotingClosed',
  unknown: 'Unknown',
};

// TODO: make keys configurable
const juryKeys = [
  'd480224a7fa30131804dacffa0322d9256092800bd2f3828fb9a77cf',
  'f19e75abc98140c647ae962b7a903c6a2c65520a87467841d435819a',
  '8be4e12dd88a085bcdfbb07763d1dcf8a2a4aaa6646edafe6476e6ac',
];

export const makeTestTerms = (hydraHeadId) => ({
  claimFor: '54657374',
  claimer: juryKeys[0],
  hydraHeadId,
  jury: juryKeys,
  voteDurationMinutes: 1,
  debugCheckSignatures: false,
});

function DelegateServerProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [serverState, setServerState] = useState(serverStates.disconnected);
  const [headId, setHeadId] = useState(null);

  const queryState = () => {
    const query = {
      tag: 'QueryCurrentDelegateState',
    };

    socket?.send(JSON.stringify(query));
  };

  useEffect(() => {
    const ws = new WebSocket(DELEGATE_SERVER_URL);

    console.log('Connecting to websocket server');

    ws.addEventListener('open', () => {
      setServerState(serverStates.connected);
      console.log('Connected to websocket server');
    });

    ws.addEventListener('message', (event) => {
      console.log('Received message', event.data);

      if (typeof event.data !== 'string') return;

      const message = JSON.parse(event.data);

      console.log('Parsed Message:', message);

      if (message.tag === 'CurrentDelegateState') {
        const [contentType, contents] = message.contents;

        if (
          (contentType === 'WasQueried' || contentType === 'Updated')
            && contents.tag === 'Initialized'
        ) {
          const newHeadId = contents.contents[0];
          const { stangingBidWasCommited, tag } = contents.contents[1];

          setHeadId(newHeadId);

          switch (tag) {
            case 'AwaitingCommits':
              setServerState(stangingBidWasCommited
                ? serverStates.bidCommitted
                : serverStates.awaitingCommits);
              break;
            case 'Open':
              setServerState(serverStates.votingOpen);
              break;
            case 'Closed':
              setServerState(serverStates.votingClosed);
              break;
            default:
              setServerState(serverStates.unknown);
          }
        }
      }
    });

    ws.addEventListener('error', (error) => {
      console.error('WebSocket Error:', error);
    });

    ws.addEventListener('close', () => {
      console.log('Disconnected from the WebSocket server');
      setServerState(serverStates.disconnected);
    });

    setSocket(ws);

    // return () => {
    //   ws.close();
    // };
  }, []);

  useEffect(() => {
    if (socket && serverState === serverStates.connected) queryState();
  }, [socket, serverState]);

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

    socket?.send(JSON.stringify(commit));
  };

  const castVote = ({ juryMember, vote }) => {
    const voting = {
      contents: {
        contents: [juryMember, '', vote],
        tag: 'Vote',
      },
      tag: 'SubmitTx',
    };

    socket?.send(JSON.stringify(voting));
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
      state: serverState,
      headId,
      createDispute,
      castVote,
      settle,
    }),
    [serverState, headId],
  );

  return <WebSocketContext.Provider value={context}>{children}</WebSocketContext.Provider>;
}

const UseDelegateServer = () => useContext(WebSocketContext);

export { DelegateServerProvider, UseDelegateServer };
